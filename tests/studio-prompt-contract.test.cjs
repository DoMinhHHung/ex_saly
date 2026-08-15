'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { LOI_NHAC } = require('../lib/model-runner/loi-nhac-theo-nhiem-vu.js');

test('idea prompt keeps the grader contract and real-data anchors', () => {
  const prompt = LOI_NHAC['de-xuat-y-tuong'];
  assert.deepEqual(prompt.truongBatBuoc, ['yTuong']);
  assert.match(prompt.loiNhac, /DUNG ten mot tru cot/);
  assert.match(prompt.loiNhac, /thamKhaoXuHuong/);
  assert.match(prompt.loiNhac, /kham_pha/);
  assert.match(prompt.loiNhac, /TUYET DOI khong bia gia, ty le %/);
  assert.match(prompt.loiNhac, /khong duoc doi thanh mot con so cu the/);
});

test('post prompt keeps the grader contract and fact-safety rules', () => {
  const prompt = LOI_NHAC['viet-bai'];
  assert.deepEqual(prompt.truongBatBuoc, ['tieuDe', 'noiDung']);
  assert.match(prompt.loiNhac, /KHONG tu bia/);
  assert.match(prompt.loiNhac, /MOT CTA/);
  assert.match(prompt.loiNhac, /"hashtag": string\[\]/);
});
