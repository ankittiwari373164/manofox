const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const asHtml = text => '<p>' + escape(text).replace(/\n/g, '<br>') + '</p>';
// The existing React components render plain text. Only accept its exact HTML
// representation, so rich markup cannot be silently dropped or stored as script.
function asText(html) {
  if (typeof html !== 'string' || !html.startsWith('<p>') || !html.endsWith('</p>')) throw Error('Use a single paragraph with <br> line breaks');
  const text = html.slice(3, -4).replace(/<br>/g, '\n').replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'"}[e]));
  if (asHtml(text) !== html) throw Error('Only escaped plain text and <br> line breaks are supported');
  return text;
}
const sections = {home: ['hero_title', 'hero_subtitle', '/'], about: ['about_heading', 'about_text', '/about']};
function createRepository(pool, defaults, origin) {
  const record = (id, title, text, url, source) => ({id, title, body_html:asHtml(text || ''), url, version:hash(source), editable:true});
  async function get(db, id, lock = false) {
    if (sections[id]) {
      const [rows] = await db.query("SELECT values_json FROM site_content WHERE content_key='site'" + (lock ? ' FOR UPDATE' : ''));
      const stored = rows.length ? (typeof rows[0].values_json === 'string' ? JSON.parse(rows[0].values_json) : rows[0].values_json) : {};
      const values = {...defaults, ...stored};
      const [title, body, route] = sections[id];
      return {item:record(id, values[title], values[body], origin + route, stored), stored};
    }
    if (!/^blog-[1-9][0-9]*$/.test(id)) return null;
    const [rows] = await db.query("SELECT * FROM blogs WHERE id=? AND status='published'" + (lock ? ' FOR UPDATE' : ''), [id.slice(5)]);
    if (!rows.length) return null;
    const b = rows[0];
    return {item:record(id,b.title,b.content,origin+'/blog/'+encodeURIComponent(b.slug),[b.title,b.content,b.slug,b.status])};
  }
  return {
    async init() {
      await pool.query(`CREATE TABLE IF NOT EXISTS seo_hub_revisions (
        change_id CHAR(20) PRIMARY KEY, record_id VARCHAR(100) NOT NULL,
        request_hash CHAR(64) NOT NULL, before_json LONGTEXT NOT NULL,
        after_json LONGTEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    },
    async list(page, perPage) {
      const [rows] = await pool.query("SELECT id FROM blogs WHERE status='published' ORDER BY id LIMIT 501");
      const ids = ['home','about',...rows.map(b=>'blog-'+b.id)];
      const selected = ids.slice((page-1)*perPage,page*perPage);
      const items = (await Promise.all(selected.map(id=>get(pool,id)))).filter(Boolean).map(x=>x.item);
      return {items,has_more:page*perPage<ids.length};
    },
    async get(id) { return (await get(pool,id))?.item; },
    async write(id, input) {
      const text = asText(input.body_html);
      const max = sections[id] ? 2000 : 65535;
      if (Buffer.byteLength(text,'utf8') > max || input.title.length > (sections[id] ? 300 : 255)) throw Error('Content exceeds the existing database field limit');
      const db = await pool.getConnection();
      try {
        await db.beginTransaction();
        if (sections[id]) await db.query("INSERT IGNORE INTO site_content (content_key,values_json) VALUES ('site','{}')");
        const source = await get(db,id,true);
        if (!source) { await db.rollback(); return {status:404}; }
        const requestHash = hash([id,input.title,input.body_html,input.expected_version]);
        const [prior] = await db.query('SELECT request_hash,after_json FROM seo_hub_revisions WHERE change_id=?',[input.idempotency_key]);
        if (prior.length) {
          const after = JSON.parse(prior[0].after_json);
          await db.rollback();
          return prior[0].request_hash === requestHash && source.item.version === after.version ? {item:source.item} : {status:409};
        }
        if (source.item.version !== input.expected_version) { await db.rollback(); return {status:409}; }
        if (sections[id]) {
          const [title,body] = sections[id];
          await db.query("UPDATE site_content SET values_json=? WHERE content_key='site'",[JSON.stringify({...source.stored,[title]:input.title,[body]:text})]);
        } else await db.query('UPDATE blogs SET title=?,content=? WHERE id=?',[input.title,text,id.slice(5)]);
        const after = (await get(db,id)).item;
        await db.query('INSERT INTO seo_hub_revisions (change_id,record_id,request_hash,before_json,after_json) VALUES (?,?,?,?,?)',[input.idempotency_key,id,requestHash,JSON.stringify(source.item),JSON.stringify(after)]);
        await db.commit();
        return {item:after};
      } catch(e) { await db.rollback(); throw e; } finally { db.release(); }
    }
  };
}

function mountContent(app, express, pool, defaults, env=process.env) {
  const token = env.SEO_CONTENT_TOKEN;
  if (!token) return; // Opt-in; existing deployment remains functional without secrets.
  if (token.length < 32) throw Error('SEO_CONTENT_TOKEN must contain at least 32 characters');
  const origin = new URL(env.SEO_SITE_ORIGIN || 'https://manofox.com').origin;
  const repository = createRepository(pool,defaults,origin);
  let ready=false;
  repository.init().then(()=>{ready=true;}).catch(()=>console.error('SEO content integration database initialization failed'));
  const router = express.Router();
  router.use((req,res,next)=>{
    const actual=Buffer.from(req.headers.authorization || ''), expected=Buffer.from('Bearer '+token);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual,expected)) return res.status(401).json({error:'Unauthorized'});
    res.set('Cache-Control','no-store');
    if (!ready) return res.status(503).json({error:'SEO integration database not ready'});
    next();
  });
  const run = fn => (req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
  router.get('/content',run(async(req,res)=>res.json(await repository.list(Math.max(1,parseInt(req.query.page,10)||1),Math.min(25,Math.max(1,parseInt(req.query.per_page,10)||25))))));
  router.get('/content/:id',run(async(req,res)=>{
    const item=await repository.get(req.params.id);
    res.status(item?200:404).json(item || {error:'Not found'});
  }));
  router.post('/content/:id',run(async(req,res)=>{
    const input=req.body || {};
    if (!['title','body_html','expected_version','idempotency_key'].every(k=>typeof input[k]==='string' && input[k].length) || input.title.length>300 || input.body_html.length>200000 || input.expected_version.length>200 || !/^[a-f0-9]{20}$/.test(input.idempotency_key)) return res.status(400).json({error:'Invalid content request'});
    try { asText(input.body_html); } catch(e) { return res.status(422).json({error:e.message}); }
    const result=await repository.write(req.params.id,input);
    res.status(result.status || 200).json(result.item || {error:result.status===404?'Not found':'Source changed; import again before editing'});
  }));
  app.use('/api/seo-control/v1',router);
}

function metadataClient(env=process.env, fetcher=fetch) {
  const origin = new URL(env.SEO_SITE_ORIGIN || 'https://manofox.com').origin;
  return async route => {
    const fallback={title:'Manofox — Digital Marketing Agency',description:'Manofox — Award-winning digital marketing agency in New Delhi.',canonical:origin+route};
    if (!env.SEO_HUB_URL || !env.SEO_SITE_ID || !env.SEO_READ_TOKEN) return fallback;
    try {
      const base = new URL(env.SEO_HUB_URL);
      if (base.protocol !== 'https:') return fallback;
      const url=new URL('/feed/'+encodeURIComponent(env.SEO_SITE_ID),base);
      url.searchParams.set('path',route);
      const response=await fetcher(url,{headers:{Authorization:'Bearer '+env.SEO_READ_TOKEN},signal:AbortSignal.timeout(2500),redirect:'error'});
      if (!response.ok) return fallback;
      const data=await response.json();
      return Object.fromEntries(Object.entries(fallback).map(([key,value])=>[key,typeof data[key]==='string'?data[key]:value]));
    } catch { return fallback; }
  };
}
function injectMetadata(html, data) {
  return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'')
    .replace(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>/gi,'')
    .replace(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/gi,'')
    .replace('</head>',`<title>${escape(data.title)}</title>${data.description?`<meta name="description" content="${escape(data.description)}">`:''}${data.canonical?`<link rel="canonical" href="${escape(data.canonical)}">`:''}</head>`);
}
function mountRendering(app, express, buildPath, env=process.env) {
  const metadata=metadataClient(env);
  app.get('/api/seo-metadata',async(req,res)=>{
    const route=req.query.path;
    if(typeof route!=='string' || !route.startsWith('/') || route.startsWith('//') || /[?#\r\n]/.test(route) || route.length>2000) return res.status(400).json({error:'Invalid path'});
    res.set('Cache-Control','no-store').json(await metadata(route));
  });
  app.use(express.static(buildPath,{index:false}));
  app.get('*',async(req,res,next)=>{
    if(req.path.startsWith('/api/')) return res.status(404).json({error:'Not found'});
    try {
      const html=await fs.readFile(path.join(buildPath,'index.html'),'utf8');
      res.set('Cache-Control','no-cache').type('html').send(injectMetadata(html,await metadata(req.path)));
    } catch(e) { next(e); }
  });
}
module.exports={asHtml,asText,createRepository,mountContent,metadataClient,injectMetadata,mountRendering};
