import { Element, BlockComponent, Fragment } from 'albio/compiler';

export interface Entry {
  path: string;
  relativePath: string;
  script: string;
  modules: Element[];
  blocks: BlockComponent[];
  fragment: Fragment;
}

export type AlbioOptions = null | {};
