import { HmrContext, ModuleNode } from 'vite';
import { Entry } from './interfaces';
import { VitePluginAlbioCache } from './utils/vite-plugin-albio-cache';

export const handleHotReload = async (
  cache: VitePluginAlbioCache,
  entry_points: Entry[],
  ctx: HmrContext,
): Promise<ModuleNode[] | void> => {
  const { read } = ctx;
  const content = await read();
};
