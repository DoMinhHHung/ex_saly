import type { Metadata } from 'next';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { luuBanNhapAction, taoBanNhapAction } from './actions';
import '../../brand/brand.css';
import '../studio.css';

export const metadata: Metadata = {
  title: 'Biên soạn — AI Content',
  description: 'Biến một ý tưởng đã lưu thành bài đăng hoàn chỉnh và chỉnh sửa bản nháp.',
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ content?: string; loi?: string; daLuu?: string }>;
};

export default async function TrangBienSoan({ searchParams }: Props) {
  const params = await searchParams;
  const repo = createRepo(await workspaceHienTai());
  const yTuong = await repo.yTuong.list(200);
  const banNhap = params.content ? await repo.contents.layTheoId(params.content) : null;
  const banNhapHopLe = banNhap?.trangThai === 'ban_nhap' ? banNhap : null;
  const yTuongCuaBan = banNhapHopLe?.ideaId
    ? await repo.yTuong.layTheoId(banNhapHopLe.ideaId)
    : null;

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">Studio · Mốc 2</span>
          <h1 className="page-title">Biên soạn bài đăng</h1>
          <p className="page-sub">
            Chọn một ý tưởng đã lưu. Máy viết bản nháp theo đúng hồ sơ, trụ cột,
            chân dung và bề mặt; bản nháp được lưu trước khi bạn chỉnh tay.
          </p>
        </div>
      </div>

      {params.loi ? <div className="chan chan--chan"><strong>{params.loi}</strong></div> : null}
      {params.daLuu === '1' ? <div className="chan chan--mo"><strong>Đã lưu bản nháp.</strong></div> : null}

      <section className="panel">
        <h2>1. Chọn ý tưởng</h2>
        {yTuong.length === 0 ? (
          <p>Chưa có ý tưởng. <a href="/studio/de-xuat">Tạo 10 ý tưởng trước →</a></p>
        ) : (
          <form action={taoBanNhapAction}>
            <label className="field">
              <span>Ý tưởng đã lưu</span>
              <select name="ideaId" defaultValue={yTuongCuaBan?.id ?? ''} required>
                <option value="" disabled>Chọn một ý tưởng</option>
                {yTuong.map((idea) => (
                  <option value={idea.id} key={idea.id}>
                    {idea.tieuDe ?? idea.gocTiepCan ?? `Ý tưởng ${idea.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn--primary" type="submit">Sinh bài đăng hoàn chỉnh</button>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>2. Chỉnh và lưu</h2>
        {banNhapHopLe ? (
          <form action={luuBanNhapAction} className="soan">
            <input type="hidden" name="contentId" value={banNhapHopLe.id} />
            <strong>{yTuongCuaBan?.tieuDe ?? 'Bản nháp'}</strong>
            <textarea
              className="soan__o"
              name="noiDung"
              defaultValue={banNhapHopLe.noiDung ?? ''}
              aria-label="Nội dung bài đăng"
              required
            />
            <div className="soan__do">
              <span>{banNhapHopLe.soKyTu ?? 0} ký tự</span>
              <span className="soan__lech">Có thể sửa trực tiếp trước khi lưu.</span>
            </div>
            <button className="btn btn--primary" type="submit">Lưu bản nháp</button>
          </form>
        ) : (
          <p>Chọn một ý tưởng ở trên để tạo bản nháp có thể chỉnh sửa.</p>
        )}
      </section>
    </>
  );
}
