'use strict';

/**
 * Hai khoi loi nhac cho luong THEO DOI KENH NGOAI.
 *
 * TEP RIENG chu khong viet thang vao `loi-nhac-theo-nhiem-vu.js`: tep do da 279
 * dong, qua nguong 200 dong cua quy uoc du an. Hai khoi duoi day duoc ghep vao
 * loi nhac goc cua hai nhiem vu da co, khong tao nhiem vu moi va khong them gia
 * tri enum nao.
 */

/**
 * Ghep vao `cham-diem-lien-quan`.
 *
 * Mot luot goi lam HAI viec cho moi bai kenh ngoai: cham diem lien quan (do vao
 * cot `diem_lien_quan` da co san tu Phase 3) va boc cong thuc ke (vao
 * `cong_thuc`). Gop lai vi ca hai deu can doc het bai — tach ra la tra tien doc
 * hai lan cho cung mot noi dung.
 *
 * `kieuHook` la KHOA dong, khong phai van ban tu do: mo hinh chon mot trong tam
 * gia tri. Van ban tu do thi moi lan chay ra mot ten khac va khong bao gio gom
 * nhom duoc de thay "cach ke nao dang an".
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
 * Phan de xuat chi nhan CHU DE + CONG THUC KE da boc, khong nhan nguyen van
 * bai kenh ngoai. Rang buoc nay duoc ep them o `lib/studio/de-xuat.ts` bang
 * viec map whitelist truoc khi goi model-runner.
 */
const KHOI_Y_TUONG_TU_XU_HUONG = [
  '',
  'QUY TAC DE XUAT Y TUONG:',
  '- Moi y tuong phai dung DUNG ten mot tru cot va DUNG ten mot chan dung co trong duLieuVao.',
  '- Rieng truCot/chanDung: duoc them DAU TIENG VIET de de doc, nhung TUYET DOI khong them, bot, doi thu tu hay thay tu. Sau khi bo dau phai khop dung ten canonical trong duLieuVao.',
  '- Ngoai cac truong trong Cau truc goc, MOI object yTuong BAT BUOC co `briefChiTiet`: string va `hinhAnh`: {"moTa": string, "boCuc": string, "phongCach": string, "prompt": string}. Khong bo hai truong nay.',
  '- tieuDe, gocTiepCan, cauMoDau, lyDoDeXuat, briefChiTiet va hinhAnh PHAI viet tieng Viet co dau day du. Khong tra noi dung hien thi kieu Viet khong dau.',
  '- tieuDe: cu the, tu nhien, 10-18 tu; phai cho nguoi doc hinh dung duoc van de hoac ket qua se ban, khong viet nhu nhan noi bo hay ten danh muc.',
  '- cauMoDau: 2-3 cau, khoang 35-65 tu. Cau dau phai tao luc keo, cau sau mo ro tinh huong hoac loi ich de nguoi dung co the dung gan nhu hook that cua bai.',
  '- gocTiepCan: 8-18 tu, noi ro cach ke/chieu khai thac va doi tuong se nhan duoc gia tri gi; khong chi lap lai tieuDe.',
  '- lyDoDeXuat: 3 cau, khoang 55-90 tu. Cau 1 chi ro du lieu nao trong hoSo/sanPham/insight/baiDaDangGanDay lam neo. Cau 2 noi vi sao goc nay hop chan dung va tru cot. Cau 3 goi y cach trien khai bai o muc y tuong, nhung KHONG bia them su kien hay so lieu.',
  '- briefChiTiet: khoang 900-1100 KY TU, KHONG phai 900-1100 tu. Viet nhu ban giao viec cho content writer, CHUA viet thanh bai hoan chinh. Chia 4 doan ngan bang ky tu \\n\\n: (1) boi canh + noi dau/mong muon cua chan dung; (2) mach trien khai 3-4 beat cu the; (3) du lieu/bang chung that se dung va dieu tuyet doi khong duoc phong dai; (4) CTA/cach ket bai va hanh dong mong muon cua nguoi doc.',
  '- briefChiTiet phai co du chi tiet de mot writer khac co the viet bai ma khong can hoi lai "noi gi tiep", nhung khong duoc lap nguyen cauMoDau hoac lyDoDeXuat cho du ky tu.',
  '- hinhAnh.moTa: 40-80 tu mo ta concept minh hoa phu hop voi y tuong, khong bia so lieu/case study/logo/nhan vat that.',
  '- hinhAnh.boCuc: 1-2 cau noi ro chu the chinh, hau canh va diem nhin; uu tien khung 16:9 dung lam thumbnail/content cover.',
  '- hinhAnh.phongCach: 1 cau ngan ve anh sang, chat lieu, mau sac va cam giac; phu hop giong thuong hieu.',
  '- hinhAnh.prompt: 250-500 ky tu, la prompt TU DU de gui thang cho model sinh anh. Khong yeu cau chen text, logo, ty le %, so lieu hay bang chung khong co that vao anh.',
  '- Khoang tiLeKhamPha cua danh sach la huong kham pha: goc moi nhung van phai neo vao tru cot va chan dung that.',
  '- Tranh lap lai gocTiepCan/cauMoDau trong baiDaDangGanDay.',
  '- hoSo, sanPham, insight va baiDaDangGanDay la su that duy nhat duoc phep khang dinh.',
  '- TUYET DOI khong bia gia, ty le %, so don, thoi gian trung binh, case study, feedback, ket qua hay tinh nang khong co trong duLieuVao.',
  '- Neu bangChung chi noi "cao hon ro ret" thi khong duoc doi thanh mot con so cu the nhu 40%. Neu khong co so lieu thi viet theo huong/quan sat, khong gan so.',
  '- thamKhaoXuHuong chi chua maThamKhao, kieuHook, chuDe, soChu, coCTA. Day la CACH KE, khong phai noi dung bai nguoi khac.',
  '- Neu mot y tuong THUC SU dung mot thamKhaoXuHuong, bat dau lyDoDeXuat bang [tham-khao:<maThamKhao>] roi moi giai thich.',
  '- Neu khong dung tham khao nao thi khong gan marker. Khong tu bia maThamKhao.',
  '- Khong viet lai, suy dien hay co gang phuc dung nguyen van bai nguoi khac tu cong thuc.',
].join('\n');

module.exports = { KIEU_HOOK, KHOI_BOC_CONG_THUC, KHOI_Y_TUONG_TU_XU_HUONG };
