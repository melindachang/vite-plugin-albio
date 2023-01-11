import {
  Compiler,
  extractFragment,
  extractScripts,
  getProgram,
  parseCode,
  parseHtml,
} from 'albio/compiler';
import { Entry } from './interfaces';
import { normalize, relative } from 'path';

export const entry_points: Entry[] = [];

export const record_entry = (html: string, ctx: string) => {
  const body = extractFragment(html);
  let { source, linkedModules } = parseCode(body.script);
  const { nodes, listeners } = parseHtml(body.tags);

  const newEntry: Entry = {
    path: ctx,
    script: source,
    modules: linkedModules,
    compiler: new Compiler({ nodes, listeners }),
  };

  entry_points.push(newEntry);
};

export const parse_module = (code: string, id: string) => {
  entry_points.forEach((entry) => {
    entry.modules.forEach((module) => {
      let i = module.attrs.findIndex((attr) => attr.name === 'src');
      if (i > -1 && normalize(relative(entry.path, id)) === normalize(module.attrs[i].value)) {
        entry.script += code;
        let { props, reactives, residuals } = extractScripts(getProgram(entry.script));
        entry.compiler.props = props;
        entry.compiler.reactives = reactives;
        entry.compiler.residuals = residuals;
      }
    });
  });
};

export const generate_base = () => {
  entry_points.forEach((entry) => {
    entry.compiler.generate();
    const finalCode = entry.compiler.astToString();
  });
};
