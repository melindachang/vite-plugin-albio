import {
  BlockComponent,
  EachBlockComponent,
  extract_fragment,
  extract_scripts,
  Fragment,
  get_program,
  parse_code,
  parse_html,
  Renderer,
  EachBlock,
} from 'albio/compiler';
import { CompileData, Entry } from './interfaces';
import path from 'path';
import fs from 'fs';
import { normalizePath } from 'vite';
import { transformSync } from 'esbuild';
import * as code_red from 'code-red';
import { Program, Node } from 'estree';

export const record_entry = (entry_points: Entry[], code: string, ctx: string, root: string) => {
  const body = extract_fragment(code);
  let { source, linkedModules } = parse_code(body.script);
  const { nodes, listeners, references } = parse_html(body.tags);
  const relativePath = normalizePath(path.relative(root, ctx));
  const blocks: BlockComponent[] = [];
  body.blocks.forEach((b) => {
    if (b.nodeType === 'each') blocks.push(new EachBlockComponent(b as EachBlock));
  });

  const entry: Entry = {
    path: ctx,
    relativePath,
    script: [{ assoc: 'source', code: source }],
    modules: linkedModules,
    blocks,
    fragment: new Fragment({ nodes, listeners, references }),
  };

  populate_paths(entry);

  entry_points.push(entry);
};

export const parse_module = (entry_points: Entry[], code: string, id: string) => {
  entry_points.forEach((entry) => {
    entry.module_paths?.forEach((entry_path) => {
      if (normalizePath(path.relative(path.dirname(entry.path), id)) === entry_path) {
        entry.script.push({ assoc: entry_path, code });
      }
    });
  });
};

export const populate_paths = (entry_point: Entry) => {
  entry_point.module_paths = entry_point.modules
    .filter((m) => Object.keys(m.attribs).find((attr) => attr === 'src'))
    .map((m) => normalizePath(m.attribs['src']));
};

export const get_declarations = (data: Buffer): Node[] => {
  const program = code_red.parse(data.toString(), {
    sourceType: 'module',
    ecmaVersion: 12,
    locations: true,
  }) as any as Program;

  const declarations: Node[] = [];

  program.body.forEach((node) => {
    if (node.type === 'FunctionDeclaration' || node.type === 'VariableDeclaration') {
      declarations.push(node);
    }
  });

  return declarations;
};

export const generate_final_code = (entry: Entry, pkgData: Buffer): CompileData => {
  let { props, reactives, residuals } = extract_scripts(
    get_program(entry.script.map((script) => script.code).join('\n')),
  );
  entry.fragment.props = props;
  entry.fragment.reactives = reactives;
  entry.fragment.residuals = residuals;

  const renderer = new Renderer(entry.fragment, entry.blocks);
  renderer.render_instance();
  const declarations = get_declarations(pkgData);

  const finalCode = code_red.print(declarations as any).code + renderer.ast_to_string();
  return { code: finalCode, assoc: entry.relativePath.replace('.html', '.js') };
};

export const generate_base = (
  entry_points: Entry[],
  outDir: string,
  root: string,
  pkgData: Buffer,
) => {
  entry_points.forEach((entry) => {
    const finalCode = generate_final_code(entry, pkgData);
    fs.writeFileSync(
      path.join(root, outDir, finalCode.assoc),
      transformSync(finalCode.code, { minify: true }).code,
    );
  });
};
