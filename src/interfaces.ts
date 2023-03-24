import { Element, BlockComponent, Fragment } from 'albio/compiler';

export interface Entry {
  path: string;
  relativePath: string;
  script: CompileData[];
  modules: Element[];
  blocks: BlockComponent[];
  fragment: Fragment;
  module_paths?: string[];
}

export type AlbioOptions = null | {
  hmrWatch?: string[];
};

export interface CompileData {
  assoc: string;
  code: string;
}