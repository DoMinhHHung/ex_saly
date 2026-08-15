'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { deXuatAction, type TrangThaiDeXuat } from './actions';

const BAN_DAU: TrangThaiDeXuat = { yTuong: [], nguonThamKhao: [], loi: null, canhBao: [] };

function NutDeXuat() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--primary de-xuat-toolbar__nut" type="submit" disabled={pending}>
      {pending ? 'Đang suy nghĩ...' : 'Đề xuất 10 ý tưởng'}
    </button>
  );
}

export function FormDeXuat() {
  const [trangThai, action] = useActionState(deXuatAction, BAN_DAU);
  const soKhamPha = trangThai.yTuong.filter((y) => y.khamPha).length;
  const soThamKhao = trangThai.nguonThamKhao.length;

  return (
    <>
      <section className="de-xuat-dieu-khien" aria-label="Thiết lập đề xuất">
        <div className="de-xuat-dieu-khien__mo-ta">
          <span className="de-xuat-nhan">Thiết lập lần sinh</span>
          <strong>Chọn nơi đăng, AI sẽ cân lại trụ cột và chân dung theo dữ liệu thật.</strong>
          <span>10 ý tưởng mỗi lượt · khoảng 20% hướng khám phá · không chép bài tham khảo.</span>
        </div>

        <form className="studio-bo-loc de-xuat-toolbar" action={action}>
          <label className="studio-field de-xuat-toolbar__field">
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
      </section>

      {trangThai.loi ? <p className="studio-thong-bao studio-thong-bao--loi">{trangThai.loi}</p> : null}
      {trangThai.canhBao.map((canhBao) => (
        <p className="studio-thong-bao" key={canhBao}>{canhBao}</p>
      ))}

      {trangThai.yTuong.length > 0 ? (
        <section className="de-xuat-ket-qua" aria-label="Ý tưởng đề xuất">
          <div className="de-xuat-ket-qua__dau">
            <div>
              <span className="de-xuat-nhan">Kết quả mới nhất</span>
              <h2>{trangThai.yTuong.length} ý tưởng hợp lệ</h2>
              <p>Đã chuẩn hóa lại trụ cột và chân dung theo dữ liệu canonical của workspace.</p>
            </div>
            <div className="de-xuat-thong-ke" aria-label="Tóm tắt kết quả">
              <div>
                <strong>{trangThai.yTuong.length}</strong>
                <span>Tổng ý tưởng</span>
              </div>
              <div>
                <strong>{soKhamPha}</strong>
                <span>Khám phá</span>
              </div>
              <div>
                <strong>{soThamKhao}</strong>
                <span>Có tham khảo</span>
              </div>
            </div>
          </div>

          <div className="de-xuat-bang-wrap">
            <table className="de-xuat-bang">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Ý tưởng</th>
                  <th scope="col">Định vị</th>
                  <th scope="col">Lý do đề xuất</th>
                </tr>
              </thead>
              <tbody>
                {trangThai.yTuong.map((y, i) => {
                  const nguon = trangThai.nguonThamKhao.find((n) => n.viTri === i);
                  return (
                    <tr key={`${y.tieuDe}-${i}`}>
                      <td className="de-xuat-bang__stt">{String(i + 1).padStart(2, '0')}</td>
                      <td className="de-xuat-bang__y-tuong">
                        <div className="de-xuat-bang__tieu-de">
                          <strong>{y.tieuDe}</strong>
                          {y.khamPha ? <span className="de-xuat-chip de-xuat-chip--kham-pha">Khám phá</span> : null}
                        </div>
                        {y.cauMoDau ? <blockquote>{y.cauMoDau}</blockquote> : null}
                      </td>
                      <td className="de-xuat-bang__dinh-vi">
                        <div className="de-xuat-chip-row">
                          <span className="de-xuat-chip">{y.truCot}</span>
                          <span className="de-xuat-chip de-xuat-chip--muted">{y.chanDung}</span>
                        </div>
                        {y.gocTiepCan ? (
                          <p><span>Góc tiếp cận</span>{y.gocTiepCan}</p>
                        ) : null}
                      </td>
                      <td className="de-xuat-bang__ly-do">
                        {y.lyDoDeXuat ? <p>{y.lyDoDeXuat}</p> : <span className="de-xuat-bang__trong">Chưa có lý do.</span>}
                        {nguon?.lienKet ? (
                          <a href={nguon.lienKet} target="_blank" rel="noreferrer">Mở bài tham khảo ↗</a>
                        ) : (
                          <span className="de-xuat-bang__nguon">Nguồn: dữ liệu workspace</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="studio-rong de-xuat-rong">
          <span className="de-xuat-rong__so">10</span>
          <div>
            <strong>Chưa có ý tưởng trong lượt này.</strong>
            <p>Chọn bề mặt rồi bấm đề xuất. Máy sẽ đọc hồ sơ, lịch sử bài đăng và công thức từ các kênh bạn follow trước khi sinh.</p>
          </div>
        </div>
      )}
    </>
  );
}
