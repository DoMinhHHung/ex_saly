'use strict';

/**
 * `node --test tests/` treats `tests/` as a package/module entry on current
 * Node versions instead of recursively discovering every test file.
 *
 * Keep the brief's exact command working while preserving the isolation that
 * Node normally gives separate test files. Running every file in one child
 * test-runner invocation can still let process-wide state (environment and
 * shared PostgreSQL pools loaded through TS/CJS bridges) interfere across
 * files on newer Node versions, so execute each file in its own process.
 *
 * The local `.env` intentionally contains the API provider used by the live
 * demo. Unit tests for model selection must not inherit that runtime choice;
 * otherwise `chonMoHinh()` correctly returns `api` and the PRD default-model
 * assertions become environment-dependent. Empty values also prevent dotenv
 * from re-populating these keys in child tests that load `.env`.
 */

const { spawnSync } = require('node:child_process');
const { readdirSync } = require('node:fs');
const path = require('node:path');

const tepKiemThu = readdirSync(__dirname)
  .filter((ten) => /\.test\.(?:cjs|js|mjs)$/.test(ten))
  .sort();

const envKiemThu = {
  ...process.env,
  AI_PROVIDER: '',
  AI_MODEL: '',
  GEMINI_API_KEY: '',
  OPENAI_API_KEY: '',
};

const thatBai = [];
for (const ten of tepKiemThu) {
  const duongDan = path.join(__dirname, ten);
  const ketQua = spawnSync(process.execPath, ['--test', duongDan], {
    cwd: path.join(__dirname, '..'),
    env: envKiemThu,
    stdio: 'inherit',
  });

  if (ketQua.error) throw ketQua.error;
  if (ketQua.status !== 0) thatBai.push(ten);
}

if (thatBai.length > 0) {
  throw new Error(`Bo kiem thu that bai: ${thatBai.join(', ')}`);
}
