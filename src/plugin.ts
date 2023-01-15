import { Plugin, ResolvedConfig } from 'vite';
import { AlbioOptions } from './interfaces';
import { generate_base, parse_module, record_entry } from './compile';
import { basename, extname } from 'path';

let viteConfig: ResolvedConfig;

export const albio = (opts: AlbioOptions = null): Plugin[] => [
  {
    name: 'vite:albio-preprocess',
    enforce: 'pre',
    configResolved: (resolvedConfig) => {
      viteConfig = resolvedConfig;
    },
    transform: (code: string, id: string): void => {
      if (id.endsWith('.html')) {
        record_entry(code, id, viteConfig.root);
      } else if (id.endsWith('.js')) {
        parse_module(code, id);
      }
    },
    transformIndexHtml: (html, ctx): string => {
      const head = html.match(/<head[^>]*>[\s\S]*<\/head>/gi);
      const scripts: string[] = [
        `<script src="${basename(ctx.path, extname(ctx.path))}.js" type="module"></script>`,
        `<script>import { registerComponent, mountComponent } from "${basename(
          ctx.path,
          extname(ctx.path),
        )}";\nregisterComponent()\nmountComponent()</script>`,
      ];
      return `<!DOCTYPE html><html>${head}<body>${scripts.join('')}</body></html>`;
    },
  },
  {
    name: 'vite:albio-postprocess',
    enforce: 'post',
    closeBundle: (): void => {
      generate_base(viteConfig.build.outDir ? viteConfig.build.outDir : 'dist', viteConfig.root);
    },
  },
];
