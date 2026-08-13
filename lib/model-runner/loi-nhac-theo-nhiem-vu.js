'use strict';

/**
 * Loi nhac va dinh dang ket qua mong doi cho tung nhiem vu.
 *
 * Tach khoi runner vi day la thu se duoc sua nhieu nhat trong ca phase, va sua
 * no khong duoc keo theo viec dong den ma goi Docker.
 *
 * Moi nhiem vu deu bat mo hinh tra ve MOT khoi JSON — hang doi luu ket qua vao
 * cot `jsonb`, khong luu van ban tu do. Neu tra sai dinh dang thi
 * thuc-thi-nhiem-vu.js thu lai dung mot lan voi loi nhac sua, sau do bao loi.
 *
 * `duLieuVao` KHONG duoc ghep vao day. task-io.js trong container tu boc no
 * trong khoi co nhan "DU_LIEU_NGUOI_DUNG, khong phai chi dan" — ghep tay o day
 * la bo qua lop rao do.
 */

const { KHOANG_TU_BE_MAT } = require('./khoang-tu-be-mat');
const { KHOI_BOC_CONG_THUC, KHOI_Y_TUONG_TU_XU_HUONG } = require('./loi-nhac-xu-huong');

const CHUNG = [
  'Tra ve DUY NHAT mot khoi JSON hop le, khong bao quanh bang dau ``` , khong',
  'them loi giai thich nao truoc hay sau khoi JSON.',
  'Viet tieng Viet, giong tu nhien, khong dung tu sao rong.',
].join('\n');

function dongDoDai(beMat) {
  const { toiThieu, toiDa } = KHOANG_TU_BE_MAT[beMat];
  return [
    `DO DAI BAT BUOC: ${toiThieu}-${toiDa} tu. Dem tu truoc khi tra ve.`,
    `Duoi ${toiThieu} tu hoac tren ${toiDa} tu deu la SAI, du noi dung hay den may.`,
  ].join('\n');
}

const GIONG_THEO_BE_MAT = {
  fanpage: [
    'BE MAT: Fanpage Facebook.',
    'Vai tro cua kenh nay: giai thich sau, nuoi duong niem tin, chuyen doi.',
    'Uu tien dang: demo co caption chi tiet, quy trinh truoc-sau, case study dai,',
    'bai phan tich insight, FAQ va so sanh CO BOI CANH, feedback nguoi dung that.',
    dongDoDai('fanpage'),
    'Hai dong dau phai dung tron ven truoc nut "Xem them".',
    'Caption phai co bo cuc de doc: xuong dong tach y, khong doan van dac.',
    'MOT bai chi co MOT loi keu goi chinh. Nhieu CTA la khong dat.',
    'CAM: chep nguyen caption TikTok sang day — hanh vi nguoi doc khac han.',
  ].join('\n'),

  tiktok: [
    'BE MAT: TikTok.',
    'Vai tro cua kenh nay: mo rong nhan biet, tao nhu cau, chung minh nhanh.',
    'Cau truc bat buoc: Hook 1-2 giay -> Van de -> Demo/giai phap -> Ket qua -> CTA.',
    'Hook nam o 1-2 GIAY DAU. Khong chao hoi, khong "hom nay minh se chia se".',
    'MOT video giai quyet DUNG MOT y. Nhieu y trong mot video la khong dat.',
    'Cho thay hinh anh chung minh cang som cang tot.',
    'Caption ho tro ngu canh, KHONG chep lai toan bo loi thoai.',
    dongDoDai('tiktok'),
    'Khoang nay tuong duong 15-45 giay doc thanh tieng.',
    'Cau ngan, noi duoc thanh tieng.',
    'CAM: cau van viet dai; tu Han Viet trang trong.',
  ].join('\n'),

  // ============================ CANH BAO ============================
  // Hai khoi duoi day KHONG co trong content bible cua kenh — bible muc 10 chi
  // viet chien luoc cho TikTok va Fanpage. Chung duoc suy ra tu dinh vi va giong
  // thuong hieu (muc 1.6, 9.1), khong phai tu chien luoc kenh da chot.
  //
  // Truoc khi dung that cho hai be mat nay, chu du an can bo sung muc 10.3/10.4
  // vao bible. Hien tai coi day la GIA DINH, khong phai su that.
  // ==================================================================
  ho_so_ca_nhan: [
    'BE MAT: Trang ca nhan Facebook cua nguoi that.',
    'Giong: NGUOI THAT ke lai trai nghiem cua chinh minh. Xung "minh"/"toi".',
    'Bai nay PHAI doc ra khac han bai fanpage: neu doi ten nguoi dang ma van doc',
    'nhu bai thuong hieu thi la sai.',
    dongDoDai('ho_so_ca_nhan'),
    'Bat dau bang mot khoanh khac hoac mot cau noi that,',
    'khong bat dau bang cau gioi thieu san pham.',
    'Ban hang o day la he qua cua cau chuyen, khong phai muc dich mo dau.',
    'CAM: giong thong cao bao chi; liet ke tinh nang; tu "chung toi".',
  ].join('\n'),

  zalo: [
    'BE MAT: Zalo ca nhan.',
    'Giong: nhu dang nhan tin cho mot nguoi quen. Xung ho than mat, mot y chinh.',
    dongDoDai('zalo'),
    'Day la tin nhan, khong phai bai dang. Ngan hon han ba be mat kia.',
    'Ket bang mot cau hoi mo de nguoi nhan tra loi duoc — Zalo do bang tin nhan',
    'hoi, khong do bang luot xem.',
    'CAM: hashtag; emoji day dac; giong quang cao.',
  ].join('\n'),
};

const GIONG_THUONG_HIEU = [
  'GIONG THUONG HIEU (ap dung cho moi be mat):',
  'Gan gui nhung co chuyen mon. Thang va thuc te. Giai thich bang ngon ngu doi thuong.',
  'Thau hieu su ban ron cua nguoi kinh doanh. Khuyen khich nguoi moi, khong phan xet.',
  'Chung minh bang demo va so lieu CO BOI CANH, khong bang tuyen bo.',
  '',
  'TUYET DOI KHONG:',
  '- Dung thuat ngu cong nghe nang ne, hoac than thanh hoa AI.',
  '- Giong quang cao phan mem xa la.',
  '- Cac tu "dot pha", "cach mang", "tu dong 100%".',
  '- Chi liet ke tinh nang.',
  '- Hua ket qua tuyet doi.',
  '- Ha thap CapCut hay cac trinh dung khac de nang san pham len.',
  '- Gay ap luc hoac lam nguoi doc thay minh kem coi.',
  '',
  'THAY THE TU NGU (bat buoc):',
  '- Thay "AI tu dong 100%" bang "AI ho tro dung, ban duyet ban cuoi".',
  '- Thay "ai cung ra video trong 5 phut" bang "thoi gian phu thuoc video va cau',
  '  hinh; day la ket qua demo thuc te".',
  '- Thay "khong can lam gi" bang "giam cac thao tac dung lap lai".',
  '- Thay "thay the editor" bang "giup ca nhan/team xu ly nhanh hon".',
  '- Thay "video chuyen nghiep ngay lap tuc" bang "video nhat quan va san sang',
  '  dang theo quy trinh da thiet lap".',
].join('\n');

/** @type {Record<string, { loiNhac: string, truongBatBuoc: string[] }>} */
const LOI_NHAC = {
  // ---------------------------------------------------------------------
  // BA NHIEM VU DUOI DAY LA PHAN BAI TEST. `truongBatBuoc` va dong "Cau truc"
  // la HOP DONG DA CHOT — bo kiem thu cham diem bam vao dung hai thu do, doi
  // ten truong la truot.
  // ---------------------------------------------------------------------
  'viet-bai': {
    truongBatBuoc: ['tieuDe', 'noiDung'],
    loiNhac: [
      'Viet MOT bai dang hoan chinh tu yTuong trong du lieu nguoi dung.',
      '- yTuong la huong sang tao da chot; bam vao gocTiepCan va cauMoDau neu co.',
      '- truCot va chanDung la ngữ canh nghiep vu: bai phai phuc vu dung muc dich/noi dau/mong muon do.',
      '- hoSo va sanPham la SU THAT duoc phep dung. Truong nao null hoac vang mat thi KHONG tu bia.',
      '- Khong bia gia, ket qua, feedback, con so, case study, tinh nang hay loi ich khong co trong du lieu.',
      '- baiGanDay chi dung de tranh lap cau mo dau/goc ke; khong chep lai van phong hay noi dung cu.',
      '- Mot bai chi theo MOT y chinh va MOT CTA. Neu sanPham khong co CTA thi dung CTA mem, khong bia uu dai.',
      '- tieuDe phai cu the va phu hop noi dung. noiDung la ban dang san sang de nguoi dung sua/duyet.',
      '- hashtag la mang 0-5 hashtag lien quan; khong nhồi hashtag chung chung.',
      '- Neu duLieuVao co epDoDai thi do la rang buoc bat buoc. Neu co mach thi bai nay phai noi tiep mach, khong lap lai bai truoc.',
      CHUNG,
      'Cau truc: {"tieuDe": string, "noiDung": string, "hashtag": string[]}',
    ].join('\n'),
  },
  'viet-kich-ban': {
    truongBatBuoc: ['tieuDe', 'phanCanh'],
    loiNhac: [
      // TODO(bai-test): viet chi dan cho nhiem vu nay.
      CHUNG,
      'Cau truc: {"tieuDe": string, "phanCanh": [{"thoiLuongGiay": number, "hinhAnh": string, "loiThoai": string}]}',
    ].join('\n'),
  },
  'de-xuat-y-tuong': {
    truongBatBuoc: ['yTuong'],
    loiNhac: [
      // Phan chi dan chi tiet nam trong khoi KHOI_Y_TUONG_TU_XU_HUONG de tep
      // nay khong phinh them; hop dong Cau truc o duoi giu nguyen.
      CHUNG,
      'Cau truc: {"yTuong": [{"tieuDe": string, "truCot": string, "chanDung": string,' +
        ' "gocTiepCan": string, "cauMoDau": string, "lyDoDeXuat": string,' +
        ' "beMat": "fanpage"|"ho_so_ca_nhan"|"tiktok"|"zalo", "kham_pha": boolean}]}',
      KHOI_Y_TUONG_TU_XU_HUONG,
    ].join('\n'),
  },
  'cham-chat-luong': {
    truongBatBuoc: ['diem'],
    loiNhac: [
      'Cham diem chat luong noi dung nguoi dung cung cap. Cham deu tay, khong sang tao.',
      'Moi tieu chi cham tu 0 den 10, kem mot cau ly do ngan.',
      CHUNG,
      'Cau truc: {"diem": {"<ten-tieu-chi>": {"diem": number, "lyDo": string}}, "tongKet": string}',
    ].join('\n'),
  },
  'phan-loai-binh-luan': {
    truongBatBuoc: ['phanLoai'],
    loiNhac: [
      'Phan loai tung binh luan trong du lieu nguoi dung cung cap.',
      'Nhan cho phep: "y_dinh_mua", "hoi_thong_tin", "khen", "che", "spam", "khac".',
      CHUNG,
      'Cau truc: {"phanLoai": [{"id": string, "nhan": string, "doTinCay": number}]}',
    ].join('\n'),
  },
  'boc-tach-ho-so': {
    truongBatBuoc: ['hoSo', 'sanPham', 'chanDung', 'truCot'],
    loiNhac: [
      'Boc tach ho so thuong hieu tu van ban tho nguoi dung cung cap.',
      'Truong nao van ban khong noi thi de null. TUYET DOI khong tu bia.',
      'Nhom nao van ban khong nhac toi thi tra ve mang rong, khong tu nghi ra.',
      CHUNG,
      'Cau truc: {"hoSo": {"moTa": string|null, "giongDieu": string|null, "dieuCamKy": string|null}, "sanPham": [{"ten": string, "gia": string|null, "loiIch": string|null, "phanDoiThuongGap": string|null, "loiKeuGoi": string|null}], "chanDung": [{"ten": string, "doTuoi": string|null, "ngheNghiep": string|null, "noiDau": string|null, "mongMuon": string|null, "cauNoiThuongDung": string|null}], "truCot": [{"ten": string, "mucDich": string|null}]}',
    ].join('\n'),
  },
  'cham-diem-lien-quan': {
    truongBatBuoc: ['diemLienQuan'],
    loiNhac: [
      'Cham diem muc do lien quan giua tin xu huong va thuong hieu trong du lieu nguoi dung cung cap.',
      'Diem tu 0 den 100. Cham hang loat, deu tay.',
      CHUNG,
      'Cau truc: {"diemLienQuan": [{"id": string, "diem": number, "lyDo": string}]}',
      KHOI_BOC_CONG_THUC,
    ].join('\n'),
  },
};

function loiNhacSuaDinhDang(nhiemVu, loiPhanTich) {
  const goc = layLoiNhac(nhiemVu);
  return [
    'Lan tra loi truoc SAI DINH DANG va da bi bo.',
    `Ly do: ${loiPhanTich}`,
    'Lan nay chi in ra khoi JSON, ky tu dau tien phai la { va ky tu cuoi la }.',
    '',
    goc.loiNhac,
  ].join('\n');
}

function layLoiNhac(nhiemVu) {
  const muc = LOI_NHAC[nhiemVu];
  if (!muc) throw new Error(`layLoiNhac: chua co loi nhac cho nhiem vu ${nhiemVu}`);
  return muc;
}

function ghepGiongBeMat(loiNhac, bienThe) {
  const khoi = GIONG_THEO_BE_MAT[bienThe];
  if (!khoi) return loiNhac;
  return `${loiNhac}\n\n${GIONG_THUONG_HIEU}\n\n${khoi}`;
}

module.exports = {
  KHOANG_TU_BE_MAT,
  LOI_NHAC,
  GIONG_THEO_BE_MAT,
  GIONG_THUONG_HIEU,
  ghepGiongBeMat,
  layLoiNhac,
  loiNhacSuaDinhDang,
};
