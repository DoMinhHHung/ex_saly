'use server';

import { redirect } from 'next/navigation';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { sinhHangLoatBai } from '@/lib/studio/hang-loat';
import { BE_MAT_HOP_LE, type BeMat } from '@/lib/studio/kieu';

function denTrang(params: Record<string, string>): never {
  redirect(`/studio/hang-loat?${new URLSearchParams(params).toString()}`);
}

export async function sinhHangLoatAction(form: FormData) {
  const beMatTho = form.get('beMat');
  const soLuongTho = form.get('soLuong');

  if (typeof beMatTho !== 'string' || !BE_MAT_HOP_LE.includes(beMatTho as BeMat)) {
    denTrang({ loi: 'Bề mặt không hợp lệ.' });
  }

  const ketQua = await sinhHangLoatBai({
    workspaceId: await workspaceHienTai(),
    beMat: beMatTho as BeMat,
    soLuong: soLuongTho,
  });

  if (!ketQua.ok) {
    denTrang({
      loi: ketQua.loi,
      beMat: beMatTho,
      soLuong: String(soLuongTho ?? 10),
    });
  }

  const ids = ketQua.duLieu.bai
    .flatMap((bai) => (bai.ok && bai.contentId ? [bai.contentId] : []))
    .join(',');

  denTrang({
    beMat: ketQua.duLieu.beMat,
    soLuong: String(ketQua.duLieu.soLuongYeuCau),
    daTao: String(ketQua.duLieu.daTao),
    thatBai: String(ketQua.duLieu.thatBai),
    boSung: String(ketQua.duLieu.soYTuongBoSung),
    ids,
    canhBao: ketQua.canhBao.length > 0 ? '1' : '0',
  });
}
