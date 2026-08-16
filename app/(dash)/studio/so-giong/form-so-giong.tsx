'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { soGiongAction, type TrangThaiSoGiong } from './actions';

const BAN_DAU: TrangThaiSoGiong = { ideaId: null, bienThe: [], loi: null, canhBao: [] };

const TEN_BE_MAT = {
  fanpage: 'Facebook fanpage',
  ho_so_ca_nhan: 'Hồ sơ cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
} as const;

const VAI_TRO = {
  fanpage: 'Giải thích sâu · nuôi tin · chuyển đổi',
  ho_so_ca_nhan: 'Người thật kể trải nghiệm',
  tiktok: 'Hook nhanh · chứng minh nhanh',
  zalo: 'Như nhắn cho một người quen',
} as const;

function NutSoGiong() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--primary so-giong-nut" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Đang viết 4 biến thể...' : 'So 4 giọng'}
    </button>
  );
}

export type IdeaChon = { id: string; tieuDe: string | null; gocTiepCan: string | null };

export function FormSoGiong({ ideas }: { ideas: IdeaChon[] }) {
  const [trangThai, action] = useActionState(soGiongAction, BAN_DAU);

  return (
    <>
      <section className="so-giong-toolbar">
        <div>
          <span className="eyebrow">Cùng facts, khác cách nói</span>
          <strong>Chọn một idea, giữ nguyên nội dung cốt lõi rồi thay system voice + word range.</strong>
        </div>
        <form action={action}>
          <label className="field">
            <span>Ý tưởng đã lưu</span>
            <select name="ideaId" defaultValue={trangThai.ideaId ?? ''} required>
              <option value="" disabled>Chọn một ý tưởng</option>
              {ideas.map((idea) => (
                <option value={idea.id} key={idea.id}>
                  {idea.tieuDe ?? idea.gocTiepCan ?? `Ý tưởng ${idea.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </label>
          <NutSoGiong />
        </form>
      </section>

      {trangThai.loi ? <p className="studio-thong-bao studio-thong-bao--loi">{trangThai.loi}</p> : null}
      {trangThai.canhBao.map((canhBao) => <p className="studio-thong-bao" key={canhBao}>{canhBao}</p>)}

      {trangThai.bienThe.length > 0 ? (
        <section className="so-giong-grid" aria-label="Bốn biến thể giọng">
          {trangThai.bienThe.map((item) => (
            <article className={`so-giong-card ${item.ok ? '' : 'so-giong-card--loi'}`} key={item.beMat}>
              <header>
                <div>
                  <span className="eyebrow">{TEN_BE_MAT[item.beMat]}</span>
                  <h2>{VAI_TRO[item.beMat]}</h2>
                </div>
                <span className="so-giong-so-tu">{item.ok ? `${item.soTu} từ` : 'Lỗi'}</span>
              </header>

              {item.ok ? (
                <>
                  <h3>{item.tieuDe}</h3>
                  <div className="so-giong-noi-dung">{item.noiDung}</div>
                  {item.hashtag.length > 0 ? (
                    <div className="so-giong-hashtag">{item.hashtag.join(' ')}</div>
                  ) : null}
                </>
              ) : (
                <div className="so-giong-loi">{item.loi}</div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <div className="studio-rong so-giong-empty">
          <span className="so-giong-empty__so">4</span>
          <div>
            <strong>Chưa có lượt so sánh.</strong>
            <p>Giữ một idea cố định giúp nhìn ra sự khác nhau do bề mặt, không phải do model đổi chủ đề.</p>
          </div>
        </div>
      )}
    </>
  );
}
