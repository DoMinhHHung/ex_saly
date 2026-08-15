'use strict';

/**
 * `node --test tests/` treats `tests/` as a module entry on current Node
 * versions instead of recursively discovering files. Keep the brief's exact
 * command working by making the directory a tiny test entry that loads every
 * top-level test file. Helper files and fixtures are intentionally ignored.
 */

const { readdirSync } = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const tepKiemThu = readdirSync(__dirname)
  .filter((ten) => /\.test\.(?:cjs|js|mjs)$/.test(ten))
  .sort();

for (const ten of tepKiemThu) {
  const dayDu = path.join(__dirname, ten);
  if (ten.endsWith('.mjs')) {
    void import(pathToFileURL(dayDu).href);
  } else {
    require(dayDu);
  }
}
