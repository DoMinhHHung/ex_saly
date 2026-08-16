'use strict';
require('tsx/cjs');

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const {
  chuanHoaSoBaiChuoi,
  SO_BAI_CHUOI_MAC_DINH,
  SO_BAI_CHUOI_TOI_DA,
} = require('../lib/studio/chuoi-bai.ts');

function doc(duongDan) {
  return readFileSync(path.join(__dirname, '..', duongDan), 'utf8');
}

test('chuoi bai defaults sanely and caps the requested length', () => {
  assert.equal(SO_BAI_CHUOI_MAC_DINH, 3);
  assert.equal(SO_BAI_CHUOI_TOI_DA, 5);
  assert.equal(chuanHoaSoBaiChuoi(undefined), 3);
  assert.equal(chuanHoaSoBaiChuoi('abc'), 3);
  assert.equal(chuanHoaSoBaiChuoi(1), 2);
  assert.equal(chuanHoaSoBaiChuoi(4.9), 4);
  assert.equal(chuanHoaSoBaiChuoi(99), 5);
});

test('chuoi bai reuses the validated single-post core and persists only after generation', () => {
  const source = doc('lib/studio/chuoi-bai.ts');
  assert.match(source, /sinhBanVietTuIdea/);
  assert.match(source, /mach:/);
  assert.match(source, /baiTruoc:/);
  assert.match(source, /trongGiaoDich/);
  assert.match(source, /chuoiId/);
  assert.match(source, /thuTuTrongChuoi/);
  assert.doesNotMatch(source, /Promise\.all\(.*sinhBanVietTuIdea/s);
});

test('series data access always scopes by workspace and orders by series position', () => {
  const source = doc('lib/data-access/contents.ts');
  assert.match(source, /listTheoChuoi/);
  assert.match(source, /eq\(contents\.workspaceId, workspaceId\)/);
  assert.match(source, /eq\(contents\.chuoiId, chuoiId\)/);
  assert.match(source, /asc\(contents\.thuTuTrongChuoi\)/);
});

test('four-voice comparison reuses post core, covers four surfaces and does not persist', () => {
  const source = doc('lib/studio/so-giong.ts');
  assert.match(source, /BE_MAT_HOP_LE\.map/);
  assert.match(source, /sinhBanVietTuIdea/);
  assert.match(source, /beMat/);
  assert.doesNotMatch(source, /contents\.tao/);
  assert.doesNotMatch(source, /trongGiaoDich/);
  assert.doesNotMatch(source, /model-runner/);
});

test('final UI does not expose the unavailable image provider path', () => {
  const actions = doc('app/(dash)/studio/de-xuat/actions.ts');
  const form = doc('app/(dash)/studio/de-xuat/form-de-xuat.tsx');
  const env = doc('.env.example');
  assert.doesNotMatch(actions, /sinhAnhMinhHoa|taoAnhMinhHoaAction/);
  assert.doesNotMatch(form, /Tạo ảnh minh hoạ|Đang tạo ảnh/);
  assert.doesNotMatch(env, /GEMINI_IMAGE_MODEL/);
  assert.match(form, /Art direction/);
});
