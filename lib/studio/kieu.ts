export type BeMat = 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo';

export const BE_MAT_HOP_LE: readonly BeMat[] = [
  'fanpage',
  'ho_so_ca_nhan',
  'tiktok',
  'zalo',
];

export type GoiYHinhAnh = {
  moTa: string | null;
  boCuc: string | null;
  phongCach: string | null;
  prompt: string | null;
};

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
  /** Brief de nguoi viet cam len trien khai, khong phai bai dang hoan chinh. */
  briefChiTiet: string | null;
  /** Art direction + prompt cho nut sinh anh minh hoa theo yeu cau. */
  hinhAnh: GoiYHinhAnh | null;
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
