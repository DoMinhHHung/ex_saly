import type { Metadata } from 'next';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { chuanHoaSoLuongHangLoat } from '@/lib/studio/hang-loat';
import type { BeMat } from '@/lib/studio/kieu';
import { sinhHangLoatAction } from './actions';
import { NutSinhHangLoat } from './nut-sinh';
import '../../brand/brand.css';
import '../studio.css';
import './hang-loat.css';

export const metadata: Metadata = {
  title: 'Sinh hàng loạt — AI Content',
  description: 'Biến các ý tưởng chưa dùng thành nhiều bản nháp trong một lượt, phục vụ mục tiêu 10 bài mỗi ngày.',
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    beMat?: string;
    soLuong?: string;
    daTao?: string;
    thatBai?: string;
    boSung?: string;
    ids?: string;
    canhBao?: string;
    loi?: string;
  }>;
};

const TEN_BE_MAT: Record<BeMat, string> = {
  fanpage: 'Facebook fanpage',
  ho_so_ca_nhan: 'Hồ sơ cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function tachContentIds(raw: string | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(',').map((id) => id.trim()).filter((id) => UUID.test(id)))].slice(0, 10);
}

function soKhongAm(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function tomTat(noiDung: string | null): string {
  if (!noiDung) return 'Bản nháp chưa có nội dung.';
  const sach = noiDung.replace(/\s+/g, ' ').trim();
  return sach.length > 240 ? `${sach.slice(0, 237)}...` : sach;
}

export default async function TrangHangLoat({ searchParams }: Props) {
  const params = await searchParams;
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);
  const ideas = await repo.yTuong.list(200);

  const beMat: BeMat = params.beMat === 'ho_so_ca_nhan' || params.beMat === 'tiktok' || params.beMat === 'zalo'
    ? params.beMat
    : 'fanpage';
  const soLuong = chuanHoaSoLuongHangLoat(params.soLuong);

  const conLaiTheoBeMat: Record<BeMat, number> = {
    fanpage: 0,
    ho_so_ca_nhan: 0,
    tiktok: 0,
    zalo: 0,
  };
  for (const idea of ideas) {
    if (!idea.daDung) conLaiTheoBeMat[idea.beMat] += 1;
  }

  const contentIds = tachContentIds(params.ids);
  const ketQuaTho = await Promise.all(contentIds.map((id) => repo.contents.layTheoId(id)));
  const banNhap = ketQuaTho.flatMap((content) => (
    content && content.trangThai === 'ban_nhap' && content.dangBai === 'chu' ? [content] : []
  ));

  const daTao = soKhongAm(params.daTao);
  const thatBai = soKhongAm(params.thatBai);
  const boSung = soKhongAm(params.boSung);
  const coKetQua = params.daTao !== undefined || params.thatBai !== undefined;

  return (
    <>
      <div className="page-head hang-loat-head">
        <div className="page-head__text">
          <span className="eyebrow">Studio · Mốc 4</span>
          <h1 className="page-title">Sinh hàng loạt 10 bài/ngày</h1>
          <p className="page-sub">
            Dùng lại pipeline đã kiểm của Mốc 1–2: lấy ý tưởng chưa dùng, tự bổ sung nếu thiếu,
            rồi đưa từng bài qua queue, fact-safety và kiểm tra độ dài trước khi lưu draft.
          </p>
        </div>
        <div className="hang-loat-muc-tieu" aria-label="Mục tiêu mỗi ngày">
          <strong>10</strong>
          <span>bài / ngày</span>
        </div>
      </div>

      {params.loi ? (
        <div className="chan chan--chan"><strong>{params.loi}</strong></div>
      ) : null}

      <div className="hang-loat-grid">
        <section className="hang-loat-panel">
          <div className="hang-loat-panel__head">
            <span className="eyebrow">Thiết lập lượt chạy</span>
            <h2>Tạo một batch bản nháp</h2>
            <p>
              Nếu chưa đủ idea chưa dùng, hệ thống gọi lại máy đề xuất để bù phần thiếu.
              Worker hiện có vẫn là nơi giới hạn số model call chạy đồng thời.
            </p>
          </div>

          <form action={sinhHangLoatAction} className="hang-loat-form">
            <label className="field">
              <span>Bề mặt</span>
              <select name="beMat" defaultValue={beMat}>
                {(Object.entries(TEN_BE_MAT) as [BeMat, string][]).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Số bài cần tạo</span>
              <input name="soLuong" type="number" min={1} max={10} defaultValue={soLuong} />
            </label>

            <div className="hang-loat-ton-kho">
              <span>Idea chưa dùng trên {TEN_BE_MAT[beMat]}</span>
              <strong>{conLaiTheoBeMat[beMat]}</strong>
              <small>Thiếu sẽ tự sinh thêm trước khi bắt đầu viết.</small>
            </div>

            <NutSinhHangLoat />
            <p className="hang-loat-note">
              Một batch có thể mất vài phút vì mỗi bài vẫn chạy qua model riêng. Không refresh khi nút đang chạy.
            </p>
          </form>
        </section>

        <section className="hang-loat-panel">
          <div className="hang-loat-panel__head">
            <span className="eyebrow">Kết quả lượt gần nhất</span>
            <h2>{coKetQua ? `${daTao} bản nháp đã sẵn sàng` : 'Chưa chạy batch trong phiên này'}</h2>
            <p>
              Partial success được giữ lại: một bài lỗi không làm rollback những bài đã sinh và validate thành công.
            </p>
          </div>

          <div className="hang-loat-panel__body">
            <div className="hang-loat-stats">
              <div><strong>{daTao}</strong><span>Thành công</span></div>
              <div><strong>{thatBai}</strong><span>Chưa đạt</span></div>
              <div><strong>{boSung}</strong><span>Idea tự bù</span></div>
            </div>

            {params.canhBao === '1' ? (
              <div className="hang-loat-warning">
                Có cảnh báo trong batch. Bài lỗi không được persist; chạy lại sẽ ưu tiên các idea vẫn chưa dùng.
              </div>
            ) : null}

            {banNhap.length > 0 ? (
              <div className="hang-loat-list">
                {banNhap.map((content, index) => (
                  <article className="hang-loat-item" key={content.id}>
                    <div className="hang-loat-item__so">{String(index + 1).padStart(2, '0')}</div>
                    <div className="hang-loat-item__noi-dung">
                      <div className="hang-loat-item__meta">
                        <span>{TEN_BE_MAT[content.beMat]}</span>
                        <span>{content.soKyTu ?? 0} ký tự</span>
                      </div>
                      <strong>{content.noiDung?.split('\n')[0] || 'Bản nháp'}</strong>
                      <p>{tomTat(content.noiDung)}</p>
                    </div>
                    <a className="btn btn--ghost btn--sm" href={`/studio/bien-soan?content=${content.id}`}>
                      Mở chỉnh sửa
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="hang-loat-empty">
                <strong>Chưa có kết quả batch để hiển thị.</strong>
                <p>Chọn số lượng ở bên trái và bắt đầu bằng 10 bài Facebook nếu muốn demo đúng mục tiêu đề bài.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
