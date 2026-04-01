#!/usr/bin/env node
"use strict";

// Inject a pointer into the project's root AGENTS.md so AI coding assistants
// can discover the ShrouDB SDK documentation automatically.

const fs = require("fs");
const path = require("path");

const MARKER = "@shroudb/sdk/AGENTS.md";
const SECTION = `

## ShrouDB SDK

See [node_modules/@shroudb/sdk/AGENTS.md](node_modules/@shroudb/sdk/AGENTS.md) for ShrouDB SDK commands, types, and usage examples.
`;

// Walk up from node_modules/@shroudb/sdk/ to find the project root.
let dir = path.resolve(__dirname, "..", "..");
const root = path.parse(dir).root;

while (dir !== root) {
  const pkg = path.join(dir, "package.json");
  if (fs.existsSync(pkg)) {
    const agents = path.join(dir, "AGENTS.md");
    if (fs.existsSync(agents)) {
      const content = fs.readFileSync(agents, "utf-8");
      if (!content.includes(MARKER)) {
        fs.appendFileSync(agents, SECTION);
      }
    } else {
      fs.writeFileSync(agents, SECTION.trimStart());
    }
    break;
  }
  dir = path.dirname(dir);
}
