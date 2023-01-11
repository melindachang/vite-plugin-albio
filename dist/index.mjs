// src/compile.ts
import {
  Compiler,
  extractFragment,
  extractScripts,
  getProgram,
  parseCode,
  parseHtml
} from "albio/compiler";
import path from "path";
import {writeFileSync} from "fs";
import {normalizePath} from "vite";
var entry_points = [];
var record_entry = (html, ctx) => {
  const body = extractFragment(html);
  let {source, linkedModules} = parseCode(body.script);
  const {nodes, listeners} = parseHtml(body.tags);
  const relativePath = normalizePath(path.relative(__dirname, ctx));
  const newEntry = {
    path: ctx,
    relativePath,
    script: source,
    modules: linkedModules,
    compiler: new Compiler({nodes, listeners})
  };
  entry_points.push(newEntry);
};
var parse_module = (code, id) => {
  entry_points.forEach((entry) => {
    entry.modules.forEach((module) => {
      let i = module.attrs.findIndex((attr) => attr.name === "src");
      if (i > -1 && normalizePath(path.relative(entry.path, id)) === normalizePath(module.attrs[i].value)) {
        entry.script += code;
        let {props, reactives, residuals} = extractScripts(getProgram(entry.script));
        entry.compiler.props = props;
        entry.compiler.reactives = reactives;
        entry.compiler.residuals = residuals;
      }
    });
  });
};
var generate_base = (outDir) => {
  entry_points.forEach((entry) => {
    entry.compiler.generate();
    const finalCode = entry.compiler.astToString();
    writeFileSync(path.join(outDir, entry.relativePath.replace(".html", ".js")), finalCode);
  });
};

// src/plugin.ts
import {basename, extname} from "path";
var albio = (opts = null) => {
  let viteConfig;
  return {
    name: "vite-plugin-albio",
    enforce: "pre",
    configResolved: (resolvedConfig) => {
      viteConfig = resolvedConfig;
    },
    transform: (code, id) => {
      if (id.endsWith(".html")) {
        record_entry(code, id);
      } else if (id.endsWith(".js")) {
        parse_module(code, id);
      }
    },
    transformIndexHtml: (html, ctx) => {
      const head = html.match(/<head[^>]*>[\s\S]*<\/head>/gi);
      const scripts = [
        `<script src="${basename(ctx.path, extname(ctx.path))}.js" type="module"></script>`,
        "<script>registerComponent()\nmountComponent()</script>"
      ];
      return `<!DOCTYPE html><html>${head}<body>${scripts.join("")}</body></html>`;
    },
    closeBundle: () => {
      generate_base(viteConfig.build.outDir ? viteConfig.build.outDir : "dist");
    }
  };
};
export {
  albio
};
