const {test} = require('node:test');
const assert = require('node:assert/strict');
const {asHtml,asText,createRepository,metadataClient,injectMetadata,mountContent,mountRendering}=require('./seo-hub');
const express=require('express');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');

test('plain text round-trips without interpreting HTML or entities',()=>{
  const text='A & B <script>alert(1)</script> "quote"\nsecond line &lt;';
  assert.equal(asText(asHtml(text)),text);
  for(const html of ['<p><img src=x onerror=alert(1)></p>','<p onclick="x">hello</p>','<p>a</p><p>b</p>','<p>&#60;script></p>']) assert.throws(()=>asText(html));
});
test('metadata replaces duplicate tags and escapes injected values',()=>{
  const html='<head><title>old</title><meta name="description" content="old"><link rel="canonical" href="old"></head>';
  const result=injectMetadata(html,{title:'</title><script>x</script>',description:'" onload="x',canonical:'https://manofox.com/about'});
  assert.equal((result.match(/<title>/g)||[]).length,1);
  assert.ok(!result.includes('<script>'));
  assert.ok(result.includes('&quot; onload=&quot;x'));
  assert.ok(!injectMetadata(html,{title:'',description:'',canonical:''}).includes('name="description"'));
});
test('metadata fallback, empty rollback fields, timeout and redirect protection',async()=>{
  const env={SEO_HUB_URL:'https://hub.example',SEO_SITE_ID:'one',SEO_READ_TOKEN:'read-only'};
  const read=metadataClient(env,async(url,options)=>{
    assert.equal(url.pathname,'/feed/one'); assert.equal(url.searchParams.get('path'),'/about');
    assert.equal(options.headers.Authorization,'Bearer read-only'); assert.equal(options.redirect,'error');
    return {ok:true,json:async()=>({title:'New',description:'',canonical:''})};
  });
  assert.deepEqual(await read('/about'),{title:'New',description:'',canonical:''});
  const fallback=await metadataClient(env,async()=>{throw Error('offline');})('/about');
  assert.equal(fallback.canonical,'https://manofox.com/about');
});

function fakePool() {
  let blog={id:1,title:'Original',content:'Original copy',slug:'example',status:'published'};
  let stored={hero_title:'Hello',hero_subtitle:'World',contact_phone:'unchanged'};
  const revisions=new Map(); const queries=[];
  const db={
    async beginTransaction(){queries.push('BEGIN');},async commit(){queries.push('COMMIT');},async rollback(){queries.push('ROLLBACK');},release(){},
    async query(sql,args=[]){
      queries.push(sql);
      if(sql.startsWith('CREATE TABLE')||sql.startsWith('INSERT IGNORE'))return [{}];
      if(sql.startsWith('SELECT id FROM blogs'))return [[{id:1}]];
      if(sql.startsWith('SELECT * FROM blogs'))return [[{...blog}]];
      if(sql.startsWith('SELECT values_json'))return [[{values_json:{...stored}}]];
      if(sql.startsWith('SELECT request_hash'))return [revisions.has(args[0])?[revisions.get(args[0])]:[]];
      if(sql.startsWith('UPDATE blogs')){blog.title=args[0];blog.content=args[1];return [{affectedRows:1}];}
      if(sql.startsWith('UPDATE site_content')){stored=JSON.parse(args[0]);return [{affectedRows:1}];}
      if(sql.startsWith('INSERT INTO seo_hub_revisions')){revisions.set(args[0],{request_hash:args[2],after_json:args[4]});return [{}];}
      throw Error('Unexpected SQL: '+sql);
    },
  };
  return {pool:{query:db.query,getConnection:async()=>db},queries,revisions,edit:()=>{blog.content='Admin edit';},stored:()=>stored};
}
test('repository rejects stale content and reconciles a committed retry',async()=>{
  const fake=fakePool(), repo=createRepository(fake.pool,{},'https://manofox.com');
  const before=await repo.get('blog-1');
  const input={title:'Reviewed',body_html:asHtml('Reviewed copy'),expected_version:before.version,idempotency_key:'a'.repeat(20)};
  const first=await repo.write('blog-1',input);
  assert.equal(first.item.title,'Reviewed'); assert.notEqual(first.item.version,before.version);
  assert.ok(fake.queries.some(sql=>sql.endsWith('FOR UPDATE')));
  assert.equal((await repo.write('blog-1',input)).item.version,first.item.version);
  assert.equal(fake.revisions.size,1);
  assert.equal((await repo.write('blog-1',{...input,idempotency_key:'b'.repeat(20)})).status,409);
  fake.edit();
  assert.equal((await repo.write('blog-1',input)).status,409);
});
test('home updates preserve unrelated contact fields',async()=>{
  const fake=fakePool(),repo=createRepository(fake.pool,{},'https://manofox.com');
  const before=await repo.get('home');
  await repo.write('home',{title:'New hero',body_html:asHtml('New subtitle'),expected_version:before.version,idempotency_key:'c'.repeat(20)});
  assert.equal(fake.stored().contact_phone,'unchanged'); assert.equal(fake.stored().hero_title,'New hero');
  assert.equal(await repo.get('users'),undefined);
});
async function serve(app,fn){
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  try {await fn('http://127.0.0.1:'+server.address().port);} finally {await new Promise(resolve=>server.close(resolve));}
}
test('content routes require dedicated token and reject rich HTML',async()=>{
  const app=express(),fake=fakePool(),token='x'.repeat(40);app.use(express.json());
  mountContent(app,express,fake.pool,{}, {SEO_CONTENT_TOKEN:token});
  await serve(app,async base=>{
    assert.equal((await fetch(base+'/api/seo-control/v1/content')).status,401);
    const headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
    const response=await fetch(base+'/api/seo-control/v1/content',{headers});assert.equal(response.status,200);
    assert.equal((await response.json()).items.length,3);
    const write=await fetch(base+'/api/seo-control/v1/content/blog-1',{method:'POST',headers,body:JSON.stringify({title:'Title',body_html:'<p><script>x</script></p>',expected_version:'stale',idempotency_key:'a'.repeat(20)})});
    assert.equal(write.status,422);
  });
});
test('Express serves SEO HTML for root/deep links and public metadata excludes secrets',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'manofox-seo-'));
  await fs.writeFile(path.join(dir,'index.html'),'<html><head><title>old</title></head><body><div id="root"></div></body></html>');
  const app=express();mountRendering(app,express,dir,{});
  try {await serve(app,async base=>{
    for(const route of ['/','/about']){const html=await (await fetch(base+route)).text(); assert.ok(html.includes('https://manofox.com'+route));}
    assert.equal((await fetch(base+'/api/missing')).status,404);
    assert.equal((await fetch(base+'/api/seo-metadata?path=//evil.test')).status,400);
    const response=await (await fetch(base+'/api/seo-metadata?path=/about')).json(); assert.deepEqual(Object.keys(response).sort(),['canonical','description','title']);
  });} finally {await fs.rm(dir,{recursive:true,force:true});}
});
