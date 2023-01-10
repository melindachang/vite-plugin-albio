import { parse_module, record_entry } from './compile';

export const albio = () => {
  return {
    name: 'vite-plugin-albio',
    enforce: 'pre',
    transformIndexHtml: (html, ctx) => {
      record_entry(html, ctx);
      const head = html.match(/<head[^>]*>[\s\S]*<\/head>/gi);
      const scripts = [
        `<script src="./${ctx.fileName.replace('.html', '')}.js" type="module"></script>`,
        '<script>registerComponent()\nmountComponent()</script>',
      ];
      return `<!DOCTYPE html><html>${head}<body>${scripts.join('')}</body></html>`;
    },
    transform: (code, id) => {
      parse_module(code, id);
    },
  };
};
