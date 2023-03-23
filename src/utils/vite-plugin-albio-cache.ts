import { CompileData, Entry } from '../interfaces';

export class VitePluginAlbioCache {
  private _js = new Map<string, string>();
  public update = (entry_point: Entry, compiled: CompileData) => {
    this._js.set(entry_point.relativePath, compiled.code);
  };
  public getJS = (): Map<string, string> => {
    return this._js;
  };
}
