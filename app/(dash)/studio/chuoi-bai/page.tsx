import type { Metadata } from 'next';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { sinhChuoiBaiAction } from './actions';
import { NutSinhChuoi } from './nut-sinh';
import '../../brand/brand.css';
import '../studio.css';
import './chuoi-bai.css';

export const metadata: Metadata = {
  title: 'Chuỗi bài — AI Content',
  description: 'Từ một ý tưởng tạo chuỗi bài nối mạch, mỗi bài kế tiếp biết bài trước để tránh lặp ý.',
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ chuoi?: string; loi?: string }>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TEN_BE_MAT = {
  fanpage: 'Facebook fanpage',
  ho_so_ca_nhan: 'Hồ sơ cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
} as const;

function tieuDeTuNoiDung(noiDung: string | null): string {
  return noiDung?.split(/\n+/)[0]?.trim() || 'Bản nháp';
}

function tomTat(noiDung: string | null): string {
  if (!noiDung) return 'Chưa có nội dung.';
  const dong = noiDung.split(/\n+/).slice(1).join(' ').replace(/\s+/g, ' ').trim();
  const sach = dong || noiDung.replace(/\s+/g, ' ').trim();
  return sach.length > 280 ? `${sach.slice(0, 277)}...` : sach;
}

export default async function TrangChuoiBai({ searchParams }: Props) {
  const params = await searchParams;
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);
  const ideas = await repo.yTuong.list(200);
  const chuoiId = params.chuoi && UUID.test(params.chuoi) ? params.chuoi : null;
  const chuoi = chuoiId ? await repo.contents.listTheoChuoi(chuoiId) : [];
  const ideaId = chuoi[0]?.ideaId ?? null;

  return (
    <>
      <div className="page-head chuoi-bai-head">
        <div className="page-head__text">
          <span className="eyebrow">Studio · Full scope</span>
          <h1 className="page-title">Chuỗi bài nối mạch</h1>
          <p className="page-sub">
            Máy viết tuần tự: bài sau nhận tóm tắt các bài trước để tiếp tục cùng một mạch,
            không lặp hook và không biến các bài trong chuỗi thành bản sao của nhau.
          </p>
        </div>
        <div className="chuoi-bai-badge">2–5 bài / chuỗi</div>
      </div>

      {params.loi ? <div className="chan chan--chan"><strong>{params.loi}</strong></div> : null}

      <div className="chuoi-bai-grid">
        <section className="chuoi-bai-panel">
          <div className="chuoi-bai-panel__head">
            <span className="eyebrow">Thiết lập</span>
            <h2>Chọn một idea làm trục</h2>
            <p>Một chuỗi được sinh xong toàn bộ rồi mới persist, tránh để lại chuỗi cụt nếu bài giữa fail validation.</p>
          </div>
          <form action={sinhChuoiBaiAction} className="chuoi-bai-form">
            <label className="field">
              <span>Ý tưởng đã lưu</span>
              <select name="ideaId" defaultValue={ideaId ?? ''} required>
                <option value="" disabled>Chọn một ý tưởng</option>
                {ideas.map((idea) => (
                  <option value={idea.id} key={idea.id}>
                    {idea.tieuDe ?? idea.gocTiepCan ?? `Ý tưởng ${idea.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Số bài trong chuỗi</span>
              <select name="soLuong" defaultValue="3">
                <option value="2">2 bài</option>
                <option value="3">3 bài</option>
                <option value="4">4 bài</option>
                <option value="5">5 bài</option>
              </select>
            </label>

            <NutSinhChuoi />
            <p className="chuoi-bai-note">Các model call chạy tuần tự có chủ ý để bài N biết bài 1…N-1 đã nói gì.</p>
          </form>
        </section>

        <section className="chuoi-bai-panel">
          <div className="chuoi-bai-panel__head">
            <span className="eyebrow">Kết quả</span>
            <h2>{chuoi.length > 0 ? `${chuoi.length} bài đã nối thành một mạch` : 'Chưa có chuỗi trong phiên này'}</h2>
            <p>Mỗi bài là một draft riêng, cùng `chuoi_id` nhưng không dùng `parent_content_id`, nên không làm sai ngữ nghĩa cross-surface.</p>
          </div>

          <div className="chuoi-bai-panel__body">
            {chuoi.length > 0 ? (
              <div className="chuoi-bai-timeline">
                {chuoi.map((content, index) => (
                  <article className="chuoi-bai-item" key={content.id}>
                    <div className="chuoi-bai-item__so">{String(index + 1).padStart(2, '0')}</div>
                    <div className="chuoi-bai-item__noi-dung">
                      <div className="chuoi-bai-item__meta">
                        <span>{TEN_BE_MAT[content.beMat]}</span>
                        <span>{content.soKyTu ?? 0} ký tự</span>
                      </div>
                      <h3>{tieuDeTuNoiDung(content.noiDung)}</h3>
                      <p>{tomTat(content.noiDung)}</p>
                    </div>
                    <a className="btn btn--ghost btn--sm" href={`/studio/bien-soan?content=${content.id}`}>Mở chỉnh sửa</a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="chuoi-bai-empty">
                <strong>Chưa có chuỗi để hiển thị.</strong>
                <p>Chọn một idea ở bên trái. Ba bài là mức demo hợp lý: đủ thấy mạch nối nhưng không tốn quá nhiều quota.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
