import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Tokens stay on Express; this endpoint returns public metadata only.
export default function SeoMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const controller = new AbortController();
    function apply(data) {
      document.title = data.title;
      for (const [selector, tag, attribute, value] of [
        ['meta[name="description"]', 'meta', 'name', data.description],
        ['link[rel="canonical"]', 'link', 'rel', data.canonical],
      ]) {
        document.querySelectorAll(selector).forEach(node => node.remove());
        if (value) {
          const node = document.createElement(tag);
          node.setAttribute(attribute, tag === 'meta' ? 'description' : 'canonical');
          node.setAttribute(tag === 'meta' ? 'content' : 'href', value);
          document.head.appendChild(node);
        }
      }
    }
    // Clear the previous route's metadata immediately during client navigation.
    apply({title:'Manofox — Digital Marketing Agency',description:'Manofox — Award-winning digital marketing agency in New Delhi.',canonical:window.location.origin+pathname});
    fetch('/api/seo-metadata?path='+encodeURIComponent(pathname), {signal:controller.signal})
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data && !controller.signal.aborted) apply(data); })
      .catch(() => {});
    return () => controller.abort();
  }, [pathname]);
  return null;
}
