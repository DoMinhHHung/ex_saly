/**
 * Nhom noi dung — Phu luc B muc 3.4 gop voi toan bo 7 nhom cot cua Phu luc A
 * muc 3. Phu luc B mo ta thieu 6 cot ma bang quan ly noi dung bat buoc phai co;
 * schema nay dong bang ca hai nguon de cac dot sau chi dung, khong sua.
 */

import { sql, type SQL } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { capNhat, idUuid, khoaWorkspace, ngayTao, users, type Jsonb } from './auth';
import { contentPillars, personas, products } from './brand';
import { modelRuns } from './ops';

export const beMat = pgEnum('be_mat', ['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo']);

export const trangThaiNoiDung = pgEnum('trang_thai_noi_dung', [
  'y_tuong', 'ban_nhap', 'da_cham', 'san_sang', 'da_dang', 'dang_theo_doi', 'da_chot_ket_qua', 'da_bo',
]);

export const trangThaiTheoDoi = pgEnum('trang_thai_theo_doi', [
  'chua_dang', 'dang_theo_doi', 'loi_lien_ket', 'da_chot',
]);

export const dangBai = pgEnum('dang_bai', ['chu', 'anh_chu', 'kich_ban_quay']);
export const nguonYTuong = pgEnum('nguon_y_tuong', ['may-de-xuat', 'xu-huong', 'nguoi-tu-nhap']);
export const lyDoBo = pgEnum('ly_do_bo', ['khong_dung_giong','sao_nhat','sai_chan_dung','trung_bai_da_dang','khong_hop_be_mat','thong_tin_sai']);
export const loaiAsset = pgEnum('loai_asset', ['anh', 'video', 'tep']);

export const kenhDang = pgTable('kenh_dang', {
  id: idUuid(), workspaceId: khoaWorkspace(), beMat: beMat('be_mat').notNull(),
  urlKenh: text('url_kenh').notNull(), tenHienThi: text('ten_hien_thi'),
  dangHoatDong: boolean('dang_hoat_dong').notNull().default(true), ngayTao: ngayTao(), capNhat: capNhat(),
}, (t) => [unique('kenh_dang_workspace_url_key').on(t.workspaceId, t.urlKenh)]);

export const kenhTheoDoi = pgTable('kenh_theo_doi', {
  id: idUuid(), workspaceId: khoaWorkspace(), beMat: beMat('be_mat').notNull(),
  urlKenh: text('url_kenh').notNull(), tenHienThi: text('ten_hien_thi'),
  dangHoatDong: boolean('dang_hoat_dong').notNull().default(true),
  lanKeoCuoi: timestamp('lan_keo_cuoi', { withTimezone: true }), ngayTao: ngayTao(), capNhat: capNhat(),
}, (t) => [unique('kenh_theo_doi_workspace_url_key').on(t.workspaceId, t.urlKenh)]);

export const theoDoiCuaToi = pgTable('theo_doi_cua_toi', {
  id: idUuid(), workspaceId: khoaWorkspace(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kenhTheoDoiId: uuid('kenh_theo_doi_id').notNull().references(() => kenhTheoDoi.id, { onDelete: 'cascade' }),
  ngayTao: ngayTao(),
}, (t) => [
  unique('theo_doi_cua_toi_ws_user_kenh_key').on(t.workspaceId, t.userId, t.kenhTheoDoiId),
  index('theo_doi_cua_toi_ws_user_idx').on(t.workspaceId, t.userId),
]);

export const trendSignals = pgTable('trend_signals', {
  id: idUuid(), workspaceId: khoaWorkspace(), nguon: text('nguon').notNull(), tieuDe: text('tieu_de').notNull(),
  lienKet: text('lien_ket'), thoiDiem: timestamp('thoi_diem', { withTimezone: true }), diemLienQuan: integer('diem_lien_quan'),
  daDung: boolean('da_dung').notNull().default(false), ngayTao: ngayTao(),
  kenhTheoDoiId: uuid('kenh_theo_doi_id').references(() => kenhTheoDoi.id, { onDelete: 'cascade' }),
  maBai: text('ma_bai'), noiDung: text('noi_dung'), dangBai: dangBai('dang_bai'), soThich: integer('so_thich'),
  soBinhLuan: integer('so_binh_luan'), soChiaSe: integer('so_chia_se'), thoiLuongVideoMs: integer('thoi_luong_video_ms'),
  congThuc: jsonb('cong_thuc').$type<Jsonb>(), tho: jsonb('tho').$type<Jsonb>(),
}, (t) => [
  index('trend_signals_workspace_thoi_diem_idx').on(t.workspaceId, t.thoiDiem),
  unique('trend_signals_kenh_ma_bai_key').on(t.kenhTheoDoiId, t.maBai),
  index('trend_signals_kenh_thoi_diem_idx').on(t.workspaceId, t.kenhTheoDoiId, t.thoiDiem),
  index('trend_signals_chua_boc_idx').on(t.workspaceId, t.thoiDiem).where(sql`${t.congThuc} is null`),
]);

export const ideas = pgTable('ideas', {
  id: idUuid(),
  workspaceId: khoaWorkspace(),
  tieuDe: text('tieu_de'),
  khamPha: boolean('kham_pha').notNull().default(false),
  beMat: beMat('be_mat').notNull(),
  gocTiepCan: text('goc_tiep_can'),
  pillarId: uuid('pillar_id').references(() => contentPillars.id, { onDelete: 'set null' }),
  personaId: uuid('persona_id').references(() => personas.id, { onDelete: 'set null' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  cauMoDau: text('cau_mo_dau'), lyDoDeXuat: text('ly_do_de_xuat'),
  nguonYTuong: nguonYTuong('nguon_y_tuong').notNull().default('may-de-xuat'),
  trendSignalId: uuid('trend_signal_id').references(() => trendSignals.id, { onDelete: 'set null' }),
  modelRunId: uuid('model_run_id').references(() => modelRuns.id, { onDelete: 'set null' }),
  daDung: boolean('da_dung').notNull().default(false), ngayTao: ngayTao(),
}, (t) => [index('ideas_workspace_ngay_tao_idx').on(t.workspaceId, t.ngayTao)]);

export const contents = pgTable('contents', {
  id: idUuid(), workspaceId: khoaWorkspace(), ideaId: uuid('idea_id').references(() => ideas.id, { onDelete: 'set null' }),
  parentContentId: uuid('parent_content_id').references((): AnyPgColumn => contents.id, { onDelete: 'set null' }),
  kenhDangId: uuid('kenh_dang_id').references(() => kenhDang.id, { onDelete: 'set null' }),
  beMat: beMat('be_mat').notNull(), pillarId: uuid('pillar_id').references(() => contentPillars.id, { onDelete: 'set null' }),
  personaId: uuid('persona_id').references(() => personas.id, { onDelete: 'set null' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }), gocTiepCan: text('goc_tiep_can'), dangBai: dangBai('dang_bai'),
  chuoiId: uuid('chuoi_id'), thuTuTrongChuoi: integer('thu_tu_trong_chuoi'), nguonYTuong: nguonYTuong('nguon_y_tuong').notNull().default('may-de-xuat'),
  cauMoDau: text('cau_mo_dau'), noiDung: text('noi_dung'),
  soKyTu: integer('so_ky_tu').generatedAlwaysAs((): SQL => sql`char_length(coalesce(noi_dung, ''))`),
  moHinhDaSinh: text('mo_hinh_da_sinh'), trangThai: trangThaiNoiDung('trang_thai').notNull().default('y_tuong'),
  nguoiTao: uuid('nguoi_tao').references(() => users.id, { onDelete: 'set null' }),
  ngayDuKienDang: timestamp('ngay_du_kien_dang', { withTimezone: true }), ngayDang: timestamp('ngay_dang', { withTimezone: true }),
  lienKetGoc: text('lien_ket_goc'), maBai: text('ma_bai'), trangThaiTheoDoi: trangThaiTheoDoi('trang_thai_theo_doi').notNull().default('chua_dang'),
  lanKeoGanNhat: timestamp('lan_keo_gan_nhat', { withTimezone: true }), noiDungLauDai: boolean('noi_dung_lau_dai').notNull().default(false),
  nhanBanMauNay: boolean('nhan_ban_mau_nay').notNull().default(false), lyDoBo: lyDoBo('ly_do_bo'), ghiChu: text('ghi_chu'), ngayTao: ngayTao(), capNhat: capNhat(),
}, (t) => [
  index('contents_workspace_be_mat_trang_thai_idx').on(t.workspaceId, t.beMat, t.trangThai),
  index('contents_workspace_ngay_dang_idx').on(t.workspaceId, t.ngayDang.desc()), index('contents_parent_content_id_idx').on(t.parentContentId),
  index('contents_theo_doi_idx').on(t.workspaceId, t.trangThaiTheoDoi), index('contents_noi_dung_trgm_idx').using('gin', sql`${t.noiDung} gin_trgm_ops`),
  unique('contents_workspace_id_be_mat_key').on(t.workspaceId, t.id, t.beMat),
  check('contents_chuoi_bai_di_theo_cap', sql`(${t.chuoiId} IS NULL) = (${t.thuTuTrongChuoi} IS NULL)`),
  unique('contents_chuoi_thu_tu_key').on(t.workspaceId, t.chuoiId, t.thuTuTrongChuoi),
]);

export const assets = pgTable('assets', {
  id: idUuid(), workspaceId: khoaWorkspace(), contentId: uuid('content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  loai: loaiAsset('loai').notNull().default('anh'), duongDan: text('duong_dan'), urlNgoai: text('url_ngoai'), phuDe: text('phu_de'),
  tiLe: text('ti_le'), kichThuocByte: integer('kich_thuoc_byte'), modelRunId: uuid('model_run_id').references(() => modelRuns.id, { onDelete: 'set null' }), ngayTao: ngayTao(),
}, (t) => [index('assets_content_id_idx').on(t.contentId), check('assets_phai_co_duong_dan_hoac_url', sql`${t.duongDan} IS NOT NULL OR ${t.urlNgoai} IS NOT NULL`)]);

export const baiKeoTho = pgTable('bai_keo_tho', {
  id: idUuid(), workspaceId: khoaWorkspace(), contentId: uuid('content_id').references((): AnyPgColumn => contents.id, { onDelete: 'cascade' }),
  kenhDangId: uuid('kenh_dang_id').references(() => kenhDang.id, { onDelete: 'set null' }), maBai: text('ma_bai').notNull(), nguon: text('nguon').notNull(),
  duLieu: jsonb('du_lieu').$type<Jsonb>().notNull(), soThich: integer('so_thich'), soBinhLuan: integer('so_binh_luan'), soChiaSe: integer('so_chia_se'),
  thoiLuongVideoMs: integer('thoi_luong_video_ms'), ngayKeo: ngayTao(),
}, (t) => [unique('bai_keo_tho_workspace_ma_bai_key').on(t.workspaceId, t.maBai), index('bai_keo_tho_content_id_idx').on(t.contentId)]);

export const qualityScores = pgTable('quality_scores', {
  id: idUuid(), workspaceId: khoaWorkspace(), contentId: uuid('content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  diemBamTruCot: integer('diem_bam_tru_cot'), diemDungGiong: integer('diem_dung_giong'), diemCauMoDau: integer('diem_cau_mo_dau'),
  diemRoHanhDong: integer('diem_ro_hanh_dong'), diemTinhXacThuc: integer('diem_tinh_xac_thuc'), diemDoMoi: integer('diem_do_moi'), diemTong: integer('diem_tong'),
  coXacThucDat: boolean('co_xac_thuc_dat').notNull().default(true), gopYSua: jsonb('gop_y_sua').$type<string[]>(), diemChamTay: integer('diem_cham_tay'),
  canhBaoTrungGoc: boolean('canh_bao_trung_goc').notNull().default(false), contentTrungId: uuid('content_trung_id').references((): AnyPgColumn => contents.id, { onDelete: 'set null' }),
  modelRunId: uuid('model_run_id').references(() => modelRuns.id, { onDelete: 'set null' }), phienBanBoTieuChi: integer('phien_ban_bo_tieu_chi').notNull().default(1), ngayTao: ngayTao(),
}, (t) => [index('quality_scores_content_id_idx').on(t.contentId)]);

export const cheDoXem = pgTable('che_do_xem', {
  id: idUuid(), workspaceId: khoaWorkspace(), userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ten: text('ten').notNull(), cotHien: jsonb('cot_hien').$type<string[]>().notNull(), boLoc: jsonb('bo_loc').$type<Jsonb>().notNull().default({}), ngayTao: ngayTao(), capNhat: capNhat(),
}, (t) => [unique('che_do_xem_workspace_user_ten_key').on(t.workspaceId, t.userId, t.ten)]);
