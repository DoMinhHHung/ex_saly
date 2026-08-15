'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  deXuatAction,
  taoAnhMinhHoaAction,
  type TrangThaiAnh,
  type TrangThaiDeXuat,
} from './actions';
import type { YTuongDeXuat } from '@/lib/studio/kieu';

const BAN_DAU: TrangThaiDeXuat = { yTuong: [], nguonThamKhao: [], loi: null, canhBao: [] };
const ANH_BAN_DAU: TrangThaiAnh = { url: null, moHinh: null, loi: null };

const TEN_BE_MAT = {
  fanpage: 'Facebook fanpage',
  ho_so_ca_nhan: 'Hồ sơ cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
} as const;

function NutDeXuat() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--primary de-xuat-toolbar__nut" type="submit" disabled={pending}>
      {pending ? 'Đang suy nghĩ...' : 'Đề xuất 10 ý tưởng'}
    </button>
  );
}

function NutTaoAnh({ daCoAnh }: { daCoAnh: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn de-xuat-anh__nut" type="submit" disabled={pending}>
      {pending ? 'Đang tạo ảnh...' : daCoAnh ? 'Tạo ảnh khác' : 'Tạo ảnh minh hoạ'}
    </button>
  );
}

function AnhMinhHoa({ yTuong, so, mau }: { yTuong: YTuongDeXuat; so: string; mau: number }) {
  const [trangThai, action] = useActionState(taoAnhMinhHoaAction, ANH_BAN_DAU);
  const prompt = yTuong.hinhAnh?.prompt;

  return (
    <div className="de-xuat-anh">
      <div className={`de-xuat-brief__visual de-xuat-brief__visual--${mau}`}>
        {trangThai.url ? (
          <img src={trangThai.url} alt={`Ảnh minh hoạ cho ${yTuong.tieuDe}`} />
        ) : (
          <>
            <span>Ý tưởng {so}</span>
            <strong>{TEN_BE_MAT[yTuong.beMat]}</strong>
            <div className="de-xuat-brief__shape de-xuat-brief__shape--a" aria-hidden="true" />
            <div className="de-xuat-brief__shape de-xuat-brief__shape--b" aria-hidden="true" />
            <em>Chưa tạo ảnh</em>
          </>
        )}
      </div>

      <div className="de-xuat-anh__toolbar">
        {prompt ? (
          <form action={action}>
            <input type="hidden" name="prompt" value={prompt} />
            <NutTaoAnh daCoAnh={Boolean(trangThai.url)} />
          </form>
        ) : (
          <span>Brief này chưa có prompt hình ảnh.</span>
        )}
        {trangThai.moHinh ? <small>{trangThai.moHinh}</small> : null}
      </div>
      {trangThai.loi ? <p className="de-xuat-anh__loi">{trangThai.loi}</p> : null}
    </div>
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
              <h2>{trangThai.yTuong.length} content brief sẵn để chọn</h2>
              <p>Mỗi ý có summary để quét nhanh, brief chi tiết khoảng 1.000 ký tự và nút tạo ảnh minh hoạ riêng khi cần.</p>
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

          <div className="de-xuat-brief-grid">
            {trangThai.yTuong.map((y, i) => {
              const nguon = trangThai.nguonThamKhao.find((n) => n.viTri === i);
              const so = String(i + 1).padStart(2, '0');
              return (
                <article className="de-xuat-brief" key={`${y.tieuDe}-${i}`}>
                  <AnhMinhHoa yTuong={y} so={so} mau={i % 4} />

                  <div className="de-xuat-brief__body">
                    <div className="de-xuat-brief__meta">
                      <span className="de-xuat-chip">{y.truCotHienThi ?? y.truCot}</span>
                      <span className="de-xuat-chip de-xuat-chip--muted">{y.chanDungHienThi ?? y.chanDung}</span>
                      {y.khamPha ? <span className="de-xuat-chip de-xuat-chip--kham-pha">Khám phá</span> : null}
                    </div>

                    <h3>{y.tieuDe}</h3>

                    {y.cauMoDau ? (
                      <div className="de-xuat-brief__hook">
                        <span>Hook đề xuất</span>
                        <blockquote>{y.cauMoDau}</blockquote>
                      </div>
                    ) : null}

                    {y.gocTiepCan ? (
                      <div className="de-xuat-brief__muc">
                        <span>Góc tiếp cận</span>
                        <p>{y.gocTiepCan}</p>
                      </div>
                    ) : null}

                    <div className="de-xuat-brief__muc de-xuat-brief__muc--ly-do">
                      <span>Vì sao nên làm</span>
                      <p>{y.lyDoDeXuat ?? 'Chưa có lý do đủ rõ; nên sinh lại ý tưởng này.'}</p>
                    </div>

                    <details className="de-xuat-brief__chi-tiet">
                      <summary>Xem brief đầy đủ</summary>
                      <div className="de-xuat-brief__chi-tiet-body">
                        <section>
                          <span>Content brief</span>
                          <p className="de-xuat-brief__van-ban">
                            {y.briefChiTiet ?? 'Model chưa trả về brief chi tiết cho ý tưởng này.'}
                          </p>
                        </section>

                        <section>
                          <span>Gợi ý hình ảnh</span>
                          <p>{y.hinhAnh?.moTa ?? 'Chưa có mô tả hình ảnh.'}</p>
                          {y.hinhAnh?.boCuc ? <p><strong>Bố cục:</strong> {y.hinhAnh.boCuc}</p> : null}
                          {y.hinhAnh?.phongCach ? <p><strong>Phong cách:</strong> {y.hinhAnh.phongCach}</p> : null}
                        </section>
                      </div>
                    </details>

                    <footer className="de-xuat-brief__footer">
                      {nguon?.lienKet ? (
                        <a href={nguon.lienKet} target="_blank" rel="noreferrer">Mở nguồn tham khảo ↗</a>
                      ) : (
                        <span>Nguồn: hồ sơ + dữ liệu workspace</span>
                      )}
                      <span>{TEN_BE_MAT[y.beMat]}</span>
                    </footer>
                  </div>
                </article>
              );
            })}
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
