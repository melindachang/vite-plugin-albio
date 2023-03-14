import { Plugin, ResolvedConfig, optimizeDeps } from 'vite';
import { AlbioOptions } from './interfaces';
import fs from 'fs';
import { generate_base, parse_module, record_entry } from './compile';
import { basename, extname } from 'path';

let viteConfig: ResolvedConfig;

export const albio = (opts: AlbioOptions = null): Plugin[] => [
  {
    name: 'vite:albio-preprocess',
    enforce: 'pre',
    config: () => ({
      optimizeDeps: {
        include: ['albio/internal'],
      },
    }),
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
        `<script type="module">import { app } from "./${basename(
          ctx.path,
          extname(ctx.path),
        )}.js";\napp.c();\app.m(document.body)</script>`,
      ];
      return `<!DOCTYPE html><html>${head}<body>${scripts.join('')}</body></html>`;
    },
  },
  {
    name: 'vite:albio-postprocess',
    enforce: 'post',
    closeBundle: async (): Promise<void> => {
      const depMetadata = await optimizeDeps(viteConfig);
      fs.readFile(depMetadata.optimized['albio/internal'].file, (err, pkgData) => {
        try {
          generate_base(
            viteConfig.build.outDir ? viteConfig.build.outDir : 'dist',
            viteConfig.root,
            pkgData,
          );
        } catch {
          console.log(err);
        }
      });
    },
  },
];
