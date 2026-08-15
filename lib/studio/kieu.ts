export type BeMat = 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo';

export const BE_MAT_HOP_LE: readonly BeMat[] = [
  'fanpage',
  'ho_so_ca_nhan',
  'tiktok',
  'zalo',
];

export type YTuongDeXuat = {
  tieuDe: string;
  truCot: string | null;
  chanDung: string | null;
  /**
   * Nhan chi de hien thi. Hai truong canonical phia tren van la source of truth
   * de validate/persist. Model chi duoc them dau tieng Viet, khong duoc doi tu.
   */
  truCotHienThi?: string | null;
  chanDungHienThi?: string | null;
  gocTiepCan: string | null;
  cauMoDau: string | null;
  lyDoDeXuat: string | null;
  beMat: BeMat;
  khamPha: boolean;
};

export type NguonThamKhao = {
  viTri: number;
  trendSignalId: string;
  lienKet: string | null;
};

export type KetQuaStudio<T> =
  | { ok: true; duLieu: T; canhBao: string[]; nguonThamKhao?: NguonThamKhao[] }
  | { ok: false; loi: string; canhBao: string[] };
