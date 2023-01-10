import {
  parseFile,
  extractFragment,
  parseCode,
  getProgram,
  extractScripts,
  parseHtml,
  Compiler,
} from 'albio/compiler';
import { IndexHtmlTransformContext } from 'vite';

export const record_entry = (html: string, ctx: IndexHtmlTransformContext) => {
  const body = extractFragment(parseFile(html));
  let { source, linkedModules } = parseCode(body.script);
  const { nodes, listeners } = parseHtml(body.tags);
};

export const parse_module = (code: string, id: string) => {};

export const find_matches = () => {};
