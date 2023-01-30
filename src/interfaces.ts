import { Element, Compiler, Component } from 'albio/compiler';

export interface Entry {
  path: string;
  relativePath: string;
  script: string;
  modules: Element[];
  blocks: Component[];
  compiler: Compiler;
}

export type AlbioOptions = null | {};
