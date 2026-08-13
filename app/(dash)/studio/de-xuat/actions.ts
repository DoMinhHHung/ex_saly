'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { deXuatYTuong } from '@/lib/studio/de-xuat';
import { BE_MAT_HOP_LE, type BeMat, type YTuongDeXuat } from '@/lib/studio/kieu';

export type TrangThaiDeXuat = {
  yTuong: YTuongDeXuat[];
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
    if (!ketQua.ok) return { yTuong: [], loi: ketQua.loi, canhBao: ketQua.canhBao };
    return { yTuong: ketQua.duLieu, loi: null, canhBao: ketQua.canhBao };
  } catch {
    return {
      yTuong: [],
      loi: 'Khong the de xuat luc nay. Kiem tra worker va cau hinh mo hinh.',
      canhBao: [],
    };
  }
}
