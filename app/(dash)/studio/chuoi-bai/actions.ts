'use server';

import { redirect } from 'next/navigation';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { sinhChuoiBai } from '@/lib/studio/chuoi-bai';

function denTrang(params: Record<string, string>): never {
  redirect(`/studio/chuoi-bai?${new URLSearchParams(params).toString()}`);
}

export async function sinhChuoiBaiAction(form: FormData) {
  const ideaId = form.get('ideaId');
  if (typeof ideaId !== 'string' || ideaId.trim() === '') {
    denTrang({ loi: 'Hãy chọn một ý tưởng trước.' });
  }

  const soLuongTho = form.get('soLuong');
  const soLuong = typeof soLuongTho === 'string' ? Number(soLuongTho) : undefined;
  const ketQua = await sinhChuoiBai({
    workspaceId: await workspaceHienTai(),
    ideaId: ideaId.trim(),
    soLuong,
  });

  if (!ketQua.ok) denTrang({ loi: ketQua.loi });
  denTrang({ chuoi: ketQua.duLieu.chuoiId });
}
