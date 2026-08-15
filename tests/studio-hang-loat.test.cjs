'use strict';
require('tsx/cjs');

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const {
  chonYTuongHangLoat,
  chuanHoaSoLuongHangLoat,
  SO_BAI_HANG_LOAT_MAC_DINH,
  SO_BAI_HANG_LOAT_TOI_DA,
} = require('../lib/studio/hang-loat-thuan.ts');

test('batch defaults to 10 and never exceeds milestone limit', () => {
  assert.equal(SO_BAI_HANG_LOAT_MAC_DINH, 10);
  assert.equal(SO_BAI_HANG_LOAT_TOI_DA, 10);
  assert.equal(chuanHoaSoLuongHangLoat(undefined), 10);
  assert.equal(chuanHoaSoLuongHangLoat('abc'), 10);
  assert.equal(chuanHoaSoLuongHangLoat(0), 1);
  assert.equal(chuanHoaSoLuongHangLoat(4.9), 4);
  assert.equal(chuanHoaSoLuongHangLoat(99), 10);
});

test('batch only selects unused ideas on the requested surface and keeps repo order', () => {
  const ideas = [
    { id: 'new-fan', beMat: 'fanpage', daDung: false, tieuDe: 'Mới', gocTiepCan: null },
    { id: 'used-fan', beMat: 'fanpage', daDung: true, tieuDe: 'Đã dùng', gocTiepCan: null },
    { id: 'tik', beMat: 'tiktok', daDung: false, tieuDe: 'TikTok', gocTiepCan: null },
    { id: 'old-fan', beMat: 'fanpage', daDung: false, tieuDe: 'Cũ', gocTiepCan: null },
  ];

  const out = chonYTuongHangLoat(ideas, 'fanpage', 10);
  assert.deepEqual(out.map((idea) => idea.id), ['new-fan', 'old-fan']);
});

test('batch selection respects requested count after filtering', () => {
  const ideas = Array.from({ length: 12 }, (_, i) => ({
    id: `idea-${i}`,
    beMat: 'fanpage',
    daDung: false,
    tieuDe: `Idea ${i}`,
    gocTiepCan: null,
  }));

  assert.equal(chonYTuongHangLoat(ideas, 'fanpage', 3).length, 3);
  assert.equal(chonYTuongHangLoat(ideas, 'fanpage', 30).length, 10);
});

test('milestone 4 orchestrates existing M1/M2 paths instead of calling model runner directly', () => {
  const source = readFileSync(path.join(__dirname, '..', 'lib/studio/hang-loat.ts'), 'utf8');
  assert.match(source, /deXuatYTuong/);
  assert.match(source, /bienSoanBai/);
  assert.match(source, /Promise\.all/);
  assert.doesNotMatch(source, /model-runner/);
});
