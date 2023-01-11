import { Plugin, IndexHtmlTransformContext } from 'vite';
import { parse_module, record_entry } from './compile';
import path from 'path';

export const albio = (): Plugin => {
  return {
    name: 'vite-plugin-albio',
    enforce: 'pre',
    transform: (code: string, id: string) => {
      if (id.endsWith('.html')) {
        record_entry(code, id);
      } else if (id.endsWith('.js')) {
        parse_module(code, id);
      }
    },
    transformIndexHtml: (html: string, ctx: IndexHtmlTransformContext): string => {
      const head = html.match(/<head[^>]*>[\s\S]*<\/head>/gi);
      const scripts: string[] = [
        `<script src="${path
          .basename(ctx.path, path.extname(ctx.path))}.js" type="module"></script>`,
        '<script>registerComponent()\nmountComponent()</script>',
      ];
      return `<!DOCTYPE html><html>${head}<body>${scripts.join('')}</body></html>`;
    },
  };
};
