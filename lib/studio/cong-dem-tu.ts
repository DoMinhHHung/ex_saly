import { KHOANG_TU_BE_MAT } from '../model-runner/khoang-tu-be-mat.js';
import type { BeMat } from './kieu';

type KhoangTu = { toiThieu: number; toiDa: number };

const KHOANG = KHOANG_TU_BE_MAT as Record<BeMat, KhoangTu>;

/** Dem tu theo cung quy uoc khoang trang ma model-runner dang dung. */
export function demTu(vanBan: string): number {
  const sach = vanBan.trim();
  return sach === '' ? 0 : sach.split(/\s+/).length;
}

export function layKhoangTu(beMat: BeMat): KhoangTu {
  return KHOANG[beMat];
}

/**
 * Prompt chi la rang buoc mem. Cua nay chan ket qua vuot/thiếu do dai truoc khi
 * ghi vao database, dung chung mot source of truth voi loi nhac theo be mat.
 */
export function kiemTraDoDai(vanBan: string, beMat: BeMat) {
  const { toiThieu, toiDa } = layKhoangTu(beMat);
  const soTu = demTu(vanBan);
  return {
    soTu,
    toiThieu,
    toiDa,
    hopLe: soTu >= toiThieu && soTu <= toiDa,
  };
}
