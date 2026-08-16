'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { deXuatYTuong } from '@/lib/studio/de-xuat';
import { BE_MAT_HOP_LE, type BeMat, type NguonThamKhao, type YTuongDeXuat } from '@/lib/studio/kieu';

export type TrangThaiDeXuat = {
  yTuong: YTuongDeXuat[];
  nguonThamKhao: NguonThamKhao[];
  loi: string | null;
  canhBao: string[];
};

export async function deXuatAction(
  _trangThai: TrangThaiDeXuat,
  form: FormData,
): Promise<TrangThaiDeXuat> {
  const beMatTho = form.get('beMat');
  const beMat = typeof beMatTho === 'string' && BE_MAT_HOP_LE.includes(beMatTho as BeMat)
    ? (beMatTho as BeMat)
    : 'fanpage';
  const soLuongTho = Number(form.get('soLuong'));
  const soLuong = Number.isFinite(soLuongTho) ? soLuongTho : 10;

  try {
    const ketQua = await deXuatYTuong({
      workspaceId: await workspaceHienTai(),
      beMat,
      soLuong,
    });
    if (!ketQua.ok) {
      return { yTuong: [], nguonThamKhao: [], loi: ketQua.loi, canhBao: ketQua.canhBao };
    }
    return {
      yTuong: ketQua.duLieu,
      nguonThamKhao: ketQua.nguonThamKhao ?? [],
      loi: null,
      canhBao: ketQua.canhBao,
    };
  } catch {
    return {
      yTuong: [],
      nguonThamKhao: [],
      loi: 'Không thể đề xuất lúc này. Kiểm tra worker và cấu hình mô hình.',
      canhBao: [],
    };
  }
}
