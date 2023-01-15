import {
  Compiler,
  extractFragment,
  extractScripts,
  getProgram,
  parseCode,
  parseHtml,
} from 'albio/compiler';
import { Entry } from './interfaces';
import path from 'path';
import { writeFileSync } from 'fs';
import { normalizePath } from 'vite';

export const entry_points: Entry[] = [];

export const record_entry = (code: string, ctx: string, root: string) => {
  const body = extractFragment(code);
  let { source, linkedModules } = parseCode(body.script);
  const { nodes, listeners } = parseHtml(body.tags);
  const relativePath = normalizePath(path.relative(root, ctx));

  const newEntry: Entry = {
    path: ctx,
    relativePath,
    script: source,
    modules: linkedModules,
    compiler: new Compiler({ nodes, listeners }),
  };

  entry_points.push(newEntry);
};

export const parse_module = (code: string, id: string) => {
  entry_points.forEach((entry) => {
    entry.modules.forEach((module) => {
      let i = Object.keys(module.attribs).findIndex((attr) => attr === 'src');
      if (
        i > -1 &&
        normalizePath(path.relative(path.dirname(entry.path), id)) ===
          normalizePath(module.attribs['src'])
      ) {
        entry.script += code;
        let { props, reactives, residuals } = extractScripts(getProgram(entry.script));
        entry.compiler.props = props;
        entry.compiler.reactives = reactives;
        entry.compiler.residuals = residuals;
      }
    });
  });
};

export const generate_base = (outDir: string, root: string) => {
  entry_points.forEach((entry) => {
    entry.compiler.generate();
    const finalCode = entry.compiler.astToString();
    writeFileSync(path.join(root, outDir, entry.relativePath.replace('.html', '.js')), finalCode);
  });
};
