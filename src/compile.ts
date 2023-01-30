import {
  Compiler,
  Component,
  EachBlockComponent,
  extractFragment,
  extractScripts,
  getProgram,
  parseCode,
  parseHtml,
} from 'albio/compiler';
import { Entry } from './interfaces';
import path from 'path';
import fs from 'fs';
import { normalizePath } from 'vite';
import { transformSync } from 'esbuild';
import { EachBlock } from 'albio/types/compiler/interfaces';

export const entry_points: Entry[] = [];

export const recordEntry = (code: string, ctx: string, root: string) => {
  const body = extractFragment(code);
  let { source, linkedModules } = parseCode(body.script);
  const { nodes, listeners } = parseHtml(body.tags);
  const relativePath = normalizePath(path.relative(root, ctx));
  const blocks: Component[] = [];
  body.blocks.forEach((b) => {
    if (b.nodeType === 'each') blocks.push(new EachBlockComponent(b as EachBlock));
  });

  const newEntry: Entry = {
    path: ctx,
    relativePath,
    script: source,
    modules: linkedModules,
    blocks,
    compiler: new Compiler({ nodes, listeners, blocks }),
  };

  entry_points.push(newEntry);
};

export const parseModule = (code: string, id: string) => {
  entry_points.forEach((entry) => {
    entry.modules.forEach((module) => {
      let i = Object.keys(module.attribs).findIndex((attr) => attr === 'src');
      if (
        i > -1 &&
        normalizePath(path.relative(path.dirname(entry.path), id)) ===
          normalizePath(module.attribs['src'])
      ) {
        entry.script += code;
      }
    });
  });
};

export const generateBase = (outDir: string, root: string, pkgData: Buffer) => {
  entry_points.forEach((entry) => {
    let { props, reactives, residuals } = extractScripts(getProgram(entry.script));
    entry.compiler.props = props;
    entry.compiler.reactives = reactives;
    entry.compiler.residuals = residuals;
    entry.compiler.generate();
    const finalCode = entry.compiler.astToString();
    fs.writeFileSync(
      path.join(root, outDir, entry.relativePath.replace('.html', '.js')),
      transformSync(finalCode, { minify: true }).code,
    );
  });
  const assetsDir = path.join(root, outDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
  fs.writeFileSync(path.join(assetsDir, 'albio_internal.js'), pkgData);
};
