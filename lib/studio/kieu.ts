export type BeMat = 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo';

export const BE_MAT_HOP_LE: readonly BeMat[] = [
  'fanpage',
  'ho_so_ca_nhan',
  'tiktok',
  'zalo',
];

/** Hop dong du lieu cua mot y tuong do Studio de xuat. */
export type YTuongDeXuat = {
  tieuDe: string;
  truCot: string | null;
  chanDung: string | null;
  gocTiepCan: string | null;
  cauMoDau: string | null;
  lyDoDeXuat: string | null;
  beMat: BeMat;
  khamPha: boolean;
};

export type KetQuaStudio<T> =
  | { ok: true; duLieu: T; canhBao: string[] }
  | { ok: false; loi: string; canhBao: string[] };
