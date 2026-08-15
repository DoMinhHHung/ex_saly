import type { Metadata } from 'next';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { docKichBanDaLuu, tongThoiLuongKichBan } from '@/lib/studio/kich-ban';
import { luuKichBanAction, taoKichBanAction } from './actions';
import { NutSinhKichBan } from './nut-sinh';
import '../../brand/brand.css';
import '../studio.css';
import './kich-ban.css';

export const metadata: Metadata = {
  title: 'Kịch bản quay — AI Content',
  description: 'Biến một ý tưởng đã lưu thành kịch bản quay có cấu trúc phân cảnh và chỉnh sửa được.',
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ content?: string; loi?: string; daLuu?: string }>;
};

const TEN_BE_MAT = {
  fanpage: 'Facebook fanpage',
  ho_so_ca_nhan: 'Hồ sơ cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
} as const;

export default async function TrangKichBan({ searchParams }: Props) {
  const params = await searchParams;
  const repo = createRepo(await workspaceHienTai());
  const yTuong = await repo.yTuong.list(200);
  const content = params.content ? await repo.contents.layTheoId(params.content) : null;
  const banNhapHopLe = content?.trangThai === 'ban_nhap' && content.dangBai === 'kich_ban_quay'
    ? content
    : null;
  const kichBan = banNhapHopLe ? docKichBanDaLuu(banNhapHopLe.noiDung) : null;
  const yTuongCuaBan = banNhapHopLe?.ideaId
    ? await repo.yTuong.layTheoId(banNhapHopLe.ideaId)
    : null;
  const tongGiay = kichBan ? tongThoiLuongKichBan(kichBan) : 0;

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">Studio · Mốc 3</span>
          <h1 className="page-title">Kịch bản quay video</h1>
          <p className="page-sub">
            Chọn một ý tưởng đã lưu để tạo kịch bản theo từng phân cảnh. Mỗi cảnh có thời lượng,
            hướng hình ảnh và lời thoại riêng; bản sinh được lưu thành draft để chỉnh trước khi quay.
          </p>
        </div>
      </div>

      {params.loi ? <div className="chan chan--chan"><strong>{params.loi}</strong></div> : null}
      {params.daLuu === '1' ? <div className="chan chan--mo"><strong>Đã lưu kịch bản.</strong></div> : null}

      <div className="kich-ban-grid">
        <section className="kich-ban-panel">
          <div className="kich-ban-panel__dau">
            <span className="eyebrow">Bước 1</span>
            <h2>Chọn ý tưởng để quay</h2>
            <p>Máy dùng idea, persona, pillar, insight và sản phẩm có thật; không tự bịa bằng chứng.</p>
          </div>
          <div className="kich-ban-panel__body">
            {yTuong.length === 0 ? (
              <p>Chưa có ý tưởng. <a href="/studio/de-xuat">Tạo ý tưởng trước →</a></p>
            ) : (
              <form action={taoKichBanAction} className="kich-ban-chon">
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
                <NutSinhKichBan />
              </form>
            )}

            {kichBan && banNhapHopLe ? (
              <div className="kich-ban-tom-tat" aria-label="Tóm tắt kịch bản">
                <span className="kich-ban-chip">{kichBan.phanCanh.length} phân cảnh</span>
                <span className="kich-ban-chip">{tongGiay} giây</span>
                <span className="kich-ban-chip">{TEN_BE_MAT[banNhapHopLe.beMat]}</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="kich-ban-panel">
          <div className="kich-ban-panel__dau">
            <span className="eyebrow">Bước 2</span>
            <h2>Chỉnh từng phân cảnh</h2>
            <p>Giữ script ở dạng cấu trúc để người quay biết cảnh nào quay gì, trong bao lâu và nói câu nào.</p>
          </div>

          {kichBan && banNhapHopLe ? (
            <div className="kich-ban-panel__body">
              <form action={luuKichBanAction} className="kich-ban-soan">
                <input type="hidden" name="contentId" value={banNhapHopLe.id} />
                <input type="hidden" name="soCanh" value={kichBan.phanCanh.length} />

                <label className="kich-ban-tieu-de">
                  <span>Tiêu đề kịch bản</span>
                  <input name="tieuDe" defaultValue={kichBan.tieuDe} required />
                </label>

                <div className="kich-ban-timeline">
                  {kichBan.phanCanh.map((canh, i) => (
                    <article className="kich-ban-canh" key={`${i}-${canh.hinhAnh}`}>
                      <div className="kich-ban-canh__so">
                        <span className="kich-ban-canh__badge">{String(i + 1).padStart(2, '0')}</span>
                        <label className="kich-ban-canh__thoi-luong">
                          <input
                            type="number"
                            name={`canh-${i}-thoi-luong`}
                            defaultValue={canh.thoiLuongGiay}
                            min={1}
                            max={30}
                            required
                            aria-label={`Thời lượng cảnh ${i + 1}`}
                          />
                          giây
                        </label>
                      </div>

                      <div className="kich-ban-canh__noi-dung">
                        <label>
                          <span>Hình ảnh / hành động</span>
                          <textarea
                            name={`canh-${i}-hinh-anh`}
                            defaultValue={canh.hinhAnh}
                            required
                          />
                        </label>
                        <label>
                          <span>Lời thoại</span>
                          <textarea
                            name={`canh-${i}-loi-thoai`}
                            defaultValue={canh.loiThoai}
                            required
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="kich-ban-actions">
                  <button className="btn btn--primary" type="submit">Lưu kịch bản</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="kich-ban-empty">
              <strong>Chưa có kịch bản trong lượt này.</strong>
              <p>Chọn một ý tưởng ở bên trái để máy dựng timeline phân cảnh.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
