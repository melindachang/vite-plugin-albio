import { parse, Compiler } from 'albio/compiler';

export const albio = () => {
  return {
    name: 'vite-plugin-albio',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'post',
      handler: (html, ctx) => {
        const head = html.match(/<head[^>]*>[\s\S]*<\/head>/gi);
        let scripts = [
          `<script src="./${ctx.fileName.replace('.html', '')}.js"></script>`,
          '<script>registerComponent()\nmountComponent()</script>',
        ];

        return `<!DOCTYPE html><html>${head}<body>${scripts.join('\n')}</body></html>`;
      },
    },
  };
};