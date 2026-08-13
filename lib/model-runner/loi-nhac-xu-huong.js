'use strict';

/**
 * Hai khoi loi nhac cho luong THEO DOI KENH NGOAI.
 *
 * TEP RIENG chu khong viet thang vao `loi-nhac-theo-nhiem-vu.js`: tep do da 279
 * dong, qua nguong 200 dong cua quy uoc du an. Hai khoi duoi day duoc ghep vao
 * loi nhac goc cua hai nhiem vu da co, khong tao nhiem vu moi va khong them gia
 * tri enum nao.
 */

const KIEU_HOOK = [
  'cau-hoi-nguoc',
  'con-so-gay-soc',
  'chuyen-ca-nhan',
  'sai-lam-thuong-gap',
  'truoc-sau',
  'canh-bao',
  'huong-dan-tung-buoc',
  'khoe-ket-qua',
];

const KHOI_BOC_CONG_THUC = [
  '',
  'Ngoai diem lien quan, voi MOI bai con phai boc ra CACH KE cua no:',
  `- "kieuHook": chon DUNG MOT trong: ${KIEU_HOOK.join(', ')}.`,
  '- "chuDe": 2 den 4 tu khoa ngan noi bai nay noi ve chuyen gi. Danh tu, khong',
  '  phai cau. Vi du ["gia von", "mo quan an"].',
  'Cau truc day du:',
  '{"diemLienQuan": [{"id": string, "diem": number, "lyDo": string,' +
    ' "kieuHook": string, "chuDe": [string]}]}',
].join('\n');

/**
 * Khoi nay chi noi ve DU LIEU DA BOC cua kenh follow. Tang Studio chi truyen
 * `maThamKhao` + cong thuc/chu de; ham nay khong co truong nao de nhan nguyen
 * van bai goc, nen viec khong sao chep duoc ep o ca tang ma, khong chi bang chu.
 */
const KHOI_Y_TUONG_TU_XU_HUONG = [
  '',
  'QUY TAC DE XUAT Y TUONG:',
  '- Moi y tuong phai dung DUNG ten mot tru cot va DUNG ten mot chan dung co trong duLieuVao.',
  '- Khoang tiLeKhamPha cua danh sach la huong kham pha: goc moi nhung van phai neo vao tru cot va chan dung that.',
  '- Tranh lap lai gocTiepCan/cauMoDau trong baiDaDangGanDay.',
  '- thamKhaoXuHuong chi chua maThamKhao, kieuHook, chuDe, soChu, coCTA. Day la CACH KE, khong phai noi dung bai nguoi khac.',
  '- Neu mot y tuong THUC SU dung mot thamKhaoXuHuong, bat dau lyDoDeXuat bang [tham-khao:<maThamKhao>] roi moi giai thich.',
  '- Neu khong dung tham khao nao thi khong gan marker. Khong tu bia maThamKhao.',
  '- Khong viet lai, suy dien hay co gang phuc dung nguyen van bai nguoi khac tu cong thuc.',
].join('\n');

module.exports = { KIEU_HOOK, KHOI_BOC_CONG_THUC, KHOI_Y_TUONG_TU_XU_HUONG };
