import { Element, Compiler } from 'albio/compiler';

export interface Entry {
  path: string;
  relativePath: string;
  script: string;
  modules: Element[];
  compiler: Compiler;
}

export type AlbioOptions = null | {
};
