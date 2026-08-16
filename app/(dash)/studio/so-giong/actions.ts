'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { soGiongBonBeMat, type BienTheSoGiong } from '@/lib/studio/so-giong';

export type TrangThaiSoGiong = {
  ideaId: string | null;
  bienThe: BienTheSoGiong[];
  loi: string | null;
  canhBao: string[];
};

export async function soGiongAction(
  _trangThai: TrangThaiSoGiong,
  form: FormData,
): Promise<TrangThaiSoGiong> {
  const ideaId = form.get('ideaId');
  if (typeof ideaId !== 'string' || ideaId.trim() === '') {
    return { ideaId: null, bienThe: [], loi: 'Hãy chọn một ý tưởng trước.', canhBao: [] };
  }

  try {
    const ketQua = await soGiongBonBeMat(await workspaceHienTai(), ideaId.trim());
    if (!ketQua.ok) {
      return { ideaId: ideaId.trim(), bienThe: [], loi: ketQua.loi, canhBao: ketQua.canhBao };
    }
    return {
      ideaId: ketQua.duLieu.ideaId,
      bienThe: ketQua.duLieu.bienThe,
      loi: null,
      canhBao: ketQua.canhBao,
    };
  } catch {
    return {
      ideaId: ideaId.trim(),
      bienThe: [],
      loi: 'Không thể so bốn giọng lúc này. Kiểm tra worker và provider.',
      canhBao: [],
    };
  }
}
