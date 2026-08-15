'use server';

import { redirect } from 'next/navigation';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import {
  donKetQuaKichBan,
  dongGoiKichBan,
  sinhKichBanQuay,
} from '@/lib/studio/kich-ban';

function denTrang(params: Record<string, string>): never {
  redirect(`/studio/kich-ban?${new URLSearchParams(params).toString()}`);
}

export async function taoKichBanAction(form: FormData) {
  const ideaId = form.get('ideaId');
  if (typeof ideaId !== 'string' || ideaId.trim() === '') {
    denTrang({ loi: 'Hãy chọn một ý tưởng trước.' });
  }

  const ketQua = await sinhKichBanQuay({
    workspaceId: await workspaceHienTai(),
    ideaId: ideaId.trim(),
  });
  if (!ketQua.ok) denTrang({ loi: ketQua.loi });
  denTrang({ content: ketQua.duLieu.contentId });
}

export async function luuKichBanAction(form: FormData) {
  const contentId = form.get('contentId');
  const tieuDe = form.get('tieuDe');
  const soCanhTho = Number(form.get('soCanh'));
  if (typeof contentId !== 'string' || contentId.trim() === '') {
    denTrang({ loi: 'Thiếu mã kịch bản.' });
  }
  if (typeof tieuDe !== 'string' || tieuDe.trim() === '') {
    denTrang({ content: contentId, loi: 'Tiêu đề kịch bản không được để trống.' });
  }
  if (!Number.isInteger(soCanhTho) || soCanhTho < 3 || soCanhTho > 8) {
    denTrang({ content: contentId, loi: 'Kịch bản phải có từ 3 đến 8 phân cảnh.' });
  }

  const phanCanh = Array.from({ length: soCanhTho }, (_, i) => ({
    thoiLuongGiay: Number(form.get(`canh-${i}-thoi-luong`)),
    hinhAnh: form.get(`canh-${i}-hinh-anh`),
    loiThoai: form.get(`canh-${i}-loi-thoai`),
  }));
  const kichBan = donKetQuaKichBan({ tieuDe, phanCanh });
  if (!kichBan) {
    denTrang({
      content: contentId,
      loi: 'Phân cảnh chưa hợp lệ: kiểm tra thời lượng, mô tả hình ảnh và lời thoại.',
    });
  }

  const repo = createRepo(await workspaceHienTai());
  const hienTai = await repo.contents.layTheoId(contentId);
  if (!hienTai || hienTai.trangThai !== 'ban_nhap' || hienTai.dangBai !== 'kich_ban_quay') {
    denTrang({ loi: 'Chỉ kịch bản nháp trong workspace hiện tại mới được chỉnh sửa.' });
  }

  const daLuu = await repo.contents.sua(contentId, {
    noiDung: dongGoiKichBan(kichBan),
    cauMoDau: kichBan.phanCanh[0]?.loiThoai ?? hienTai.cauMoDau,
  });
  if (!daLuu) denTrang({ loi: 'Không thể lưu kịch bản.' });
  denTrang({ content: contentId, daLuu: '1' });
}
