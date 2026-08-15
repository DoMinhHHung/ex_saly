'use strict';
require('tsx/cjs');

const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  docKichBanDaLuu,
  donKetQuaKichBan,
  dongGoiKichBan,
  tongThoiLuongKichBan,
} = require('../lib/studio/kich-ban.ts');
const { LOI_NHAC } = require('../lib/model-runner/loi-nhac-theo-nhiem-vu.js');

const HOP_LE = {
  tieuDe: 'Một ngày quay nội dung gọn hơn cho chủ shop',
  phanCanh: [
    { thoiLuongGiay: 4, hinhAnh: 'Cận cảnh điện thoại và nguyên liệu trên bàn.', loiThoai: 'Bạn không cần quay cả buổi để có đủ tư liệu.' },
    { thoiLuongGiay: 6, hinhAnh: 'Chủ shop gom ba góc quay sản phẩm liên tiếp.', loiThoai: 'Chỉ cần gom những cảnh ngắn theo đúng thứ tự mình sẽ dùng.' },
    { thoiLuongGiay: 7, hinhAnh: 'Màn hình chia ba cảnh trước khi dựng.', loiThoai: 'Khi cảnh đã có mục đích rõ, lúc dựng sẽ bớt phải tìm lại file.' },
    { thoiLuongGiay: 5, hinhAnh: 'Chủ shop đặt điện thoại xuống và quay lại bán hàng.', loiThoai: 'Thử bắt đầu bằng một block quay ngắn trong ngày của bạn.' },
  ],
};

test('donKetQuaKichBan keeps a structured scene script', () => {
  const out = donKetQuaKichBan(HOP_LE);
  assert.ok(out);
  assert.equal(out.tieuDe, HOP_LE.tieuDe);
  assert.equal(out.phanCanh.length, 4);
  assert.equal(out.phanCanh[0].thoiLuongGiay, 4);
  assert.equal(tongThoiLuongKichBan(out), 22);
});

test('donKetQuaKichBan rejects prose-like or unsafe scene shapes', () => {
  assert.equal(donKetQuaKichBan({ tieuDe: 'A', phanCanh: [] }), null);
  assert.equal(donKetQuaKichBan({ tieuDe: 'A', phanCanh: [
    { thoiLuongGiay: 3, hinhAnh: 'A', loiThoai: 'A' },
    { thoiLuongGiay: 3, hinhAnh: 'B', loiThoai: 'B' },
  ] }), null);
  assert.equal(donKetQuaKichBan({ ...HOP_LE, phanCanh: [
    ...HOP_LE.phanCanh.slice(0, 3),
    { thoiLuongGiay: 90, hinhAnh: 'Quá dài', loiThoai: 'Không hợp lệ' },
  ] }), null);
  assert.equal(donKetQuaKichBan({ ...HOP_LE, phanCanh: [
    ...HOP_LE.phanCanh.slice(0, 3),
    { thoiLuongGiay: 5, hinhAnh: '', loiThoai: 'Thiếu hình ảnh' },
  ] }), null);
});

test('stored video script round-trips through JSON without losing scenes', () => {
  const parsed = donKetQuaKichBan(HOP_LE);
  assert.ok(parsed);
  const saved = dongGoiKichBan(parsed);
  const read = docKichBanDaLuu(saved);
  assert.deepEqual(read, parsed);
  assert.equal(docKichBanDaLuu('not-json'), null);
});

test('video script prompt keeps the locked structured contract and fact safety', () => {
  const prompt = LOI_NHAC['viet-kich-ban'];
  assert.deepEqual(prompt.truongBatBuoc, ['tieuDe', 'phanCanh']);
  assert.match(prompt.loiNhac, /kich ban PHAN CANH/);
  assert.match(prompt.loiNhac, /4-7 canh/);
  assert.match(prompt.loiNhac, /20-60 giay/);
  assert.match(prompt.loiNhac, /TUYET DOI khong bia gia, ty le %/);
  assert.match(prompt.loiNhac, /MOT CTA cuoi/);
  assert.match(prompt.loiNhac, /"thoiLuongGiay": number/);
  assert.match(prompt.loiNhac, /"hinhAnh": string/);
  assert.match(prompt.loiNhac, /"loiThoai": string/);
});
