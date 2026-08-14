'use strict';
require('tsx/cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { demTu, kiemTraDoDai, layKhoangTu } = require('../lib/studio/cong-dem-tu.ts');

function taoVanBan(soTu) {
  return new Array(soTu).fill('tu').join(' ');
}

test('demTu dem theo khoang trang', () => {
  assert.equal(demTu('  mot   hai\nba  '), 3);
  assert.equal(demTu(''), 0);
});

test('kiemTraDoDai dung cung khoang theo be mat', () => {
  assert.deepEqual(layKhoangTu('fanpage'), { toiThieu: 150, toiDa: 300 });
  assert.equal(kiemTraDoDai(taoVanBan(150), 'fanpage').hopLe, true);
  assert.equal(kiemTraDoDai(taoVanBan(149), 'fanpage').hopLe, false);
  assert.equal(kiemTraDoDai(taoVanBan(301), 'fanpage').hopLe, false);
  assert.equal(kiemTraDoDai(taoVanBan(60), 'tiktok').hopLe, true);
  assert.equal(kiemTraDoDai(taoVanBan(121), 'tiktok').hopLe, false);
  assert.equal(kiemTraDoDai(taoVanBan(40), 'zalo').hopLe, true);
  assert.equal(kiemTraDoDai(taoVanBan(101), 'zalo').hopLe, false);
});
