import { Plugin, ResolvedConfig, optimizeDeps } from 'vite';
import { AlbioOptions } from './interfaces';
import fs from 'fs';
import { generateBase, parseModule, recordEntry } from './compile';
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
        recordEntry(code, id, viteConfig.root);
      } else if (id.endsWith('.js')) {
        parseModule(code, id);
      }
    },
    transformIndexHtml: (html, ctx): string => {
      const head = html.match(/<head[^>]*>[\s\S]*<\/head>/gi);
      const scripts: string[] = [
        `<script src="${basename(ctx.path, extname(ctx.path))}.js" type="module"></script>`,
        `<script type="module">import { registerComponent, mountComponent } from "./${basename(
          ctx.path,
          extname(ctx.path),
        )}.js";\nregisterComponent()\nmountComponent(document.body)</script>`,
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
          generateBase(
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
