import type { BeMat } from './kieu';

export const SO_BAI_HANG_LOAT_MAC_DINH = 10;
export const SO_BAI_HANG_LOAT_TOI_DA = 10;

export type YTuongChoHangLoat = {
  id: string;
  beMat: BeMat;
  daDung: boolean;
  tieuDe: string | null;
  gocTiepCan: string | null;
};

export function chuanHoaSoLuongHangLoat(soLuong: unknown): number {
  const n = Number(soLuong);
  if (!Number.isFinite(n)) return SO_BAI_HANG_LOAT_MAC_DINH;
  return Math.max(1, Math.min(SO_BAI_HANG_LOAT_TOI_DA, Math.floor(n)));
}

/** Repo list da sort moi -> cu, nen batch uu tien y tuong moi nhat. */
export function chonYTuongHangLoat(
  ideas: YTuongChoHangLoat[],
  beMat: BeMat,
  soLuong: number,
): YTuongChoHangLoat[] {
  const gioiHan = chuanHoaSoLuongHangLoat(soLuong);
  return ideas
    .filter((idea) => idea.beMat === beMat && idea.daDung === false)
    .slice(0, gioiHan);
}
