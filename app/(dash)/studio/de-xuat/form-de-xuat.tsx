'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { deXuatAction, type TrangThaiDeXuat } from './actions';

const BAN_DAU: TrangThaiDeXuat = { yTuong: [], nguonThamKhao: [], loi: null, canhBao: [] };

function NutDeXuat() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--primary" type="submit" disabled={pending}>
      {pending ? 'Đang suy nghĩ...' : 'Đề xuất 10 ý tưởng'}
    </button>
  );
}

export function FormDeXuat() {
  const [trangThai, action] = useActionState(deXuatAction, BAN_DAU);

  return (
    <>
      <form className="studio-bo-loc" action={action}>
        <label className="studio-field">
          <span>Bề mặt</span>
          <select name="beMat" defaultValue="fanpage">
            <option value="fanpage">Facebook fanpage</option>
            <option value="ho_so_ca_nhan">Hồ sơ cá nhân</option>
            <option value="tiktok">TikTok</option>
            <option value="zalo">Zalo</option>
          </select>
        </label>
        <input type="hidden" name="soLuong" value="10" />
        <NutDeXuat />
      </form>

      {trangThai.loi ? <p className="studio-thong-bao studio-thong-bao--loi">{trangThai.loi}</p> : null}
      {trangThai.canhBao.map((canhBao) => (
        <p className="studio-thong-bao" key={canhBao}>{canhBao}</p>
      ))}

      {trangThai.yTuong.length > 0 ? (
        <section className="de-xuat-luoi" aria-label="Ý tưởng đề xuất">
          {trangThai.yTuong.map((y, i) => {
            const nguon = trangThai.nguonThamKhao.find((n) => n.viTri === i);
            return (
              <article className="y-tuong-the" key={`${y.tieuDe}-${i}`}>
                <div className="y-tuong-the__meta">
                  <span>{y.truCot}</span>
                  <span>{y.chanDung}</span>
                  {y.khamPha ? <span className="y-tuong-the__kham-pha">Khám phá</span> : null}
                </div>
                <h2>{y.tieuDe}</h2>
                {y.gocTiepCan ? <p><strong>Góc:</strong> {y.gocTiepCan}</p> : null}
                {y.cauMoDau ? <blockquote>{y.cauMoDau}</blockquote> : null}
                {y.lyDoDeXuat ? <p className="y-tuong-the__ly-do">{y.lyDoDeXuat}</p> : null}
                {nguon?.lienKet ? (
                  <a href={nguon.lienKet} target="_blank" rel="noreferrer">Xem bài tham khảo ↗</a>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : (
        <div className="studio-rong">
          <strong>Chưa có ý tưởng hôm nay.</strong>
          <p>Máy sẽ đọc hồ sơ, bài đã đăng và công thức từ các kênh bạn follow trước khi đề xuất.</p>
        </div>
      )}
    </>
  );
}
