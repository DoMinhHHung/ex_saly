'use strict';
require('tsx/cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  canBangKhamPha,
  donKetQuaDeXuat,
  raiTheoTruCot,
} = require('../lib/studio/de-xuat-thuan.ts');

test('donKetQuaDeXuat validates profile names and keeps the requested surface', () => {
  const out = donKetQuaDeXuat({ yTuong: [
    { tieuDe: 'A', truCot: 'XAY LONG TIN', chanDung: 'Chi Ha', beMat: 'tiktok' },
    { tieuDe: 'B', truCot: 'invented', chanDung: 'invented', beMat: 'zalo', kham_pha: true },
  ] }, ['Xay long tin'], ['Chi Ha'], 'fanpage');
  assert.equal(out[0].truCot, 'Xay long tin');
  assert.equal(out[0].chanDung, 'Chi Ha');
  assert.equal(out[0].beMat, 'fanpage');
  assert.equal(out[1].truCot, null);
  assert.equal(out[1].chanDung, null);
  assert.equal(out[1].beMat, 'fanpage');
  assert.equal(out[1].khamPha, true);
});

test('raiTheoTruCot respects target ratios', () => {
  const tao = (truCot, i) => ({ tieuDe: `${truCot}-${i}`, truCot, chanDung: 'Chi Ha', gocTiepCan: null, cauMoDau: null, lyDoDeXuat: null, beMat: 'fanpage', khamPha: false });
  const input = [...Array.from({ length: 10 }, (_, i) => tao('A', i)), ...Array.from({ length: 10 }, (_, i) => tao('B', i))];
  const out = raiTheoTruCot(input, [{ ten: 'A', tiLeMucTieu: 70 }, { ten: 'B', tiLeMucTieu: 30 }], 10);
  assert.equal(out.length, 10);
  assert.equal(out.filter((y) => y.truCot === 'A').length, 7);
  assert.equal(out.filter((y) => y.truCot === 'B').length, 3);
  assert.equal(new Set(out).size, 10);
});

test('exploration cap preserves one shared pillar quota', () => {
  const tao = (truCot, i, khamPha) => ({
    tieuDe: `${truCot}-${khamPha ? 'x' : 'r'}-${i}`,
    truCot,
    chanDung: 'Chi Ha',
    gocTiepCan: null,
    cauMoDau: null,
    lyDoDeXuat: null,
    beMat: 'fanpage',
    khamPha,
  });
  const input = ['A', 'B', 'C'].flatMap((pillar) => [
    ...Array.from({ length: 5 }, (_, i) => tao(pillar, i, true)),
    ...Array.from({ length: 5 }, (_, i) => tao(pillar, i, false)),
  ]);
  const out = canBangKhamPha(
    input,
    [
      { ten: 'A', tiLeMucTieu: 34 },
      { ten: 'B', tiLeMucTieu: 33 },
      { ten: 'C', tiLeMucTieu: 33 },
    ],
    10,
    0.2,
  );
  assert.equal(out.length, 10);
  assert.deepEqual(
    ['A', 'B', 'C'].map((p) => out.filter((y) => y.truCot === p).length),
    [4, 3, 3],
  );
  assert.equal(out.filter((y) => y.khamPha).length, 2);
});
