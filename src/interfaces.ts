import { Element, Compiler } from 'albio/compiler';

export interface Entry {
  path: string;
  script: string;
  modules: Element[];
  compiler: Compiler;
}
