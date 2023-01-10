import {
  parseFile,
  extractFragment,
  parseCode,
  getProgram,
  extractScripts,
  parseHtml,
  Compiler,
} from 'albio/compiler';

const entries = [];
const modules = [];

export const record_entry = (html, ctx) => {
  const body = extractFragment(parseFile(html));
  let { source, linkedModules } = parseCode(body.script);
  const { nodes, listeners } = parseHtml(body.tags);

  const newEntry = {
    path: ctx.path,
    fileName: ctx.fileName,
    source,
    linkedModules,
    compiler: new Compiler(nodes, listeners),
  };
  entries.push(newEntry);
};

export const parse_module = (code, id) => {
  modules.push({ id, code });
};

export const find_matches = () => {
  entries.forEach((entry) => {
    modules.forEach((module) => {
      if (entry.linkedModules.some((m) => m.src === module.id)) {
        entry.source += module.code;
      }
    });
    const { props, reactives, residuals } = extractScripts(getProgram(entry.source));
    entry.compiler.props = props;
    entry.compiler.reactives = reactives;
    entry.compiler.residuals = residuals;

    entry.compiler.generate();
  });
};
