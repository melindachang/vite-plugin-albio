import { Element, Component, Fragment } from 'albio/compiler';

export interface Entry {
  path: string;
  relativePath: string;
  script: string;
  modules: Element[];
  blocks: Component[];
  fragment: Fragment;
}

export type AlbioOptions = null | {};
