import { HmrContext, normalizePath } from 'vite';
import { CompileData, Entry } from './interfaces';
import { VitePluginAlbioCache } from './utils/vite-plugin-albio-cache';
import * as path from 'path';
import { generate_final_code } from './compile';

export const handleHotReload = async (
  cache: VitePluginAlbioCache,
  entry_points: Entry[],
  ctx: HmrContext,
  pkgData: Buffer,
): Promise<void> => {
  const { read, server } = ctx;
  console.log(server.moduleGraph);
  const content = await read();

  entry_points.forEach((entry) => {
    const ref_path = normalizePath(path.relative(path.dirname(entry.path), ctx.file));
    if (entry.module_paths?.find((p) => p === ref_path)) {
      const i = entry.script.findIndex((script) => script.assoc === ref_path);
      entry.script[i].code = content;
      const finalCode: CompileData = generate_final_code(entry, pkgData);
      cache.update(entry, finalCode);
    }
  });
};
