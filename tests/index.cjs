'use strict';

/**
 * `node --test tests/` treats `tests/` as a module entry on current Node
 * versions instead of recursively discovering files. Keep the brief's exact
 * command working, but delegate the real suite to a CHILD `node --test`
 * process so Node preserves its normal per-file isolation. Requiring every
 * test in this process makes shared resources (notably the PostgreSQL pool)
 * collide during cleanup.
 */

const { spawnSync } = require('node:child_process');
const { readdirSync } = require('node:fs');
const path = require('node:path');

const tepKiemThu = readdirSync(__dirname)
  .filter((ten) => /\.test\.(?:cjs|js|mjs)$/.test(ten))
  .sort()
  .map((ten) => path.join(__dirname, ten));

const ketQua = spawnSync(process.execPath, ['--test', ...tepKiemThu], {
  cwd: path.join(__dirname, '..'),
  env: process.env,
  stdio: 'inherit',
});

if (ketQua.error) throw ketQua.error;
if (ketQua.status !== 0) {
  throw new Error(`Bo kiem thu con thoat voi ma ${ketQua.status ?? 'khong ro'}.`);
}
