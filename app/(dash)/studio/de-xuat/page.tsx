import type { Metadata } from 'next';

import { FormDeXuat } from './form-de-xuat';
import './de-xuat.css';
import '../studio.css';

export const metadata: Metadata = {
  title: 'Đề xuất ý tưởng — AI Content',
  description: 'Đề xuất 10 ý tưởng nội dung từ hồ sơ kênh và dữ liệu đã có.',
};

export const dynamic = 'force-dynamic';

export default function TrangDeXuat() {
  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">Studio · Mốc 1</span>
          <h1 className="page-title">Đề xuất ý tưởng</h1>
          <p className="page-sub">
            Mỗi lượt lấy dữ liệu thật trong workspace, tránh lặp lịch sử của kênh và chỉ học
            công thức kể chuyện từ những kênh bạn đang theo dõi. Ý tưởng hợp lệ được lưu lại
            để dùng cho bước biên soạn.
          </p>
        </div>
      </div>
      <FormDeXuat />
    </>
  );
}
