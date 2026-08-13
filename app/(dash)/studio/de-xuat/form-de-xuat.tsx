'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { deXuatAction, type TrangThaiDeXuat } from './actions';

const BAN_DAU: TrangThaiDeXuat = { yTuong: [], loi: null, canhBao: [] };

function NutDeXuat() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--primary" type="submit" disabled={pending}>
      {pending ? 'Dang suy nghi...' : 'De xuat 10 y tuong'}
    </button>
  );
}

export function FormDeXuat() {
  const [trangThai, action] = useActionState(deXuatAction, BAN_DAU);

  return (
    <>
      <form className="studio-bo-loc" action={action}>
        <label className="studio-field">
          <span>Be mat</span>
          <select name="beMat" defaultValue="fanpage">
            <option value="fanpage">Facebook fanpage</option>
            <option value="ho_so_ca_nhan">Ho so ca nhan</option>
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
        <section className="de-xuat-luoi" aria-label="Y tuong de xuat">
          {trangThai.yTuong.map((y, i) => (
            <article className="y-tuong-the" key={`${y.tieuDe}-${i}`}>
              <div className="y-tuong-the__meta">
                <span>{y.truCot}</span>
                <span>{y.chanDung}</span>
                {y.khamPha ? <span className="y-tuong-the__kham-pha">Kham pha</span> : null}
              </div>
              <h2>{y.tieuDe}</h2>
              {y.gocTiepCan ? <p><strong>Goc:</strong> {y.gocTiepCan}</p> : null}
              {y.cauMoDau ? <blockquote>{y.cauMoDau}</blockquote> : null}
              {y.lyDoDeXuat ? <p className="y-tuong-the__ly-do">{y.lyDoDeXuat}</p> : null}
            </article>
          ))}
        </section>
      ) : (
        <div className="studio-rong">
          <strong>Chua co y tuong hom nay.</strong>
          <p>May se doc ho so, bai da dang va cong thuc tu cac kenh ban follow truoc khi de xuat.</p>
        </div>
      )}
    </>
  );
}
