'use server';
import { redirect } from 'next/navigation';
import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { bienSoanBai } from '@/lib/studio/bien-soan';

function denTrang(params: Record<string, string>): never {
  redirect(`/studio/bien-soan?${new URLSearchParams(params).toString()}`);
}

export async function taoBanNhapAction(form: FormData) {
  const ideaId = form.get('ideaId');
  if (typeof ideaId !== 'string' || ideaId.trim() === '') denTrang({ loi: 'Hay chon mot y tuong truoc.' });
  const ketQua = await bienSoanBai({ workspaceId: await workspaceHienTai(), ideaId: ideaId.trim() });
  if (!ketQua.ok) denTrang({ loi: ketQua.loi });
  denTrang({ content: ketQua.duLieu.contentId });
}

export async function luuBanNhapAction(form: FormData) {
  const contentId = form.get('contentId');
  const noiDung = form.get('noiDung');
  if (typeof contentId !== 'string' || contentId.trim() === '') denTrang({ loi: 'Thieu ma ban nhap.' });
  if (typeof noiDung !== 'string' || noiDung.trim() === '') denTrang({ content: contentId, loi: 'Noi dung khong duoc de trong.' });
  const repo = createRepo(await workspaceHienTai());
  const hienTai = await repo.contents.layTheoId(contentId);
  if (!hienTai || hienTai.trangThai !== 'ban_nhap') denTrang({ loi: 'Chi ban nhap trong workspace hien tai moi duoc chinh sua.' });
  const daLuu = await repo.contents.sua(contentId, { noiDung: noiDung.trim() });
  if (!daLuu) denTrang({ loi: 'Khong the luu ban nhap.' });
  denTrang({ content: contentId, daLuu: '1' });
}
