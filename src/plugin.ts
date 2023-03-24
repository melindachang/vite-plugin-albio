import { Plugin, ResolvedConfig, optimizeDeps, normalizePath } from 'vite';
import { AlbioOptions, Entry } from './interfaces';
import fs from 'fs';
import { generate_base, generate_final_code, parse_module, record_entry } from './compile';
import { basename, extname } from 'path';
import { handleHotReload } from './handle-hot-reload';
import { VitePluginAlbioCache } from './utils/vite-plugin-albio-cache';


export const albio = (opts: AlbioOptions = null): Plugin[] => {
  let viteConfig: ResolvedConfig;
  let pkgData: Buffer;
  const cache = new VitePluginAlbioCache();
  const entry_points: Entry[] = [];
  const plugins: Plugin[] = [
    {
      name: 'vite:albio-preprocess',
      enforce: 'pre',
      config: () => ({
        optimizeDeps: {
          include: ['albio/internal'],
        },
      }),
      configResolved: async (resolvedConfig) => {
        viteConfig = resolvedConfig;
        const depMetadata = await optimizeDeps(viteConfig);
        pkgData = fs.readFileSync(depMetadata.optimized['albio/internal'].file);
      },
      transform: (code: string, id: string): void => {
        if (id.endsWith('.html')) {
          record_entry(entry_points, code, id, viteConfig.root);
        } else if (id.endsWith('.js')) {
          parse_module(entry_points, code, id);
        }
      },
      transformIndexHtml: (html, ctx): string => {
        const head = html.match(/<head[^>]*>[\s\S]*<\/head>/gi);
        const scripts: string[] = [
          `<script src="${basename(ctx.path, extname(ctx.path))}.js" type="module"></script>`,
          `<script type="module">import {app} from "./${basename(
            ctx.path,
            extname(ctx.path),
          )}.js";\napp.c();\app.m(document.body)</script>`,
        ];
        return `<!DOCTYPE html><html>${head}<body>${scripts.join('')}</body></html>`;
      },
    },
    {
      name: 'vite:albio-postprocess',
      apply: 'build',
      enforce: 'post',
      closeBundle: async (): Promise<void> => {
        generate_base(
          entry_points,
          viteConfig.build.outDir || normalizePath('dist'),
          viteConfig.root,
          pkgData,
        );
      },
    },
    {
      name: 'vite:albio-dev-postprocess',
      apply: 'serve',
      closeBundle: async (): Promise<void> => {
        entry_points.forEach((entry) => {
          const finalCode = generate_final_code(entry, pkgData);
          cache.update(entry, finalCode);
        });
      },
      handleHotUpdate: async (ctx): Promise<void> => {
        handleHotReload(cache, entry_points, ctx, pkgData);
      },
    },
  ];

  return plugins;
};
