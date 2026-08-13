import { nguoiDungHienTai } from '@/lib/auth/nguoi-dung-tu-phien';
import { NGUONG_CHAN_DE_XUAT } from '@/lib/brand/do-day-du';
import { createRepo, trongGiaoDich } from '@/lib/data-access';
import { chayNhiemVu } from '@/lib/model-runner';

import { bocCongThucChoBaiMoi, daBocXong, type CongThuc } from './boc-cong-thuc';
import { donKetQuaDeXuat, raiTheoTruCot, type TruCotMucTieu } from './de-xuat-thuan';
import type { BeMat, KetQuaStudio, YTuongDeXuat } from './kieu';

export { donKetQuaDeXuat, raiTheoTruCot } from './de-xuat-thuan';
export type { TruCotMucTieu } from './de-xuat-thuan';

export const TI_LE_KHAM_PHA = 0.2;

export type ThamSoDeXuat = {
  workspaceId: string;
  beMat: BeMat;
  soLuong: number;
};

const MA_THAM_KHAO = /^\[tham-khao:([0-9a-f-]{36})\]\s*/i;

function tachThamKhao(lyDo: string | null, hopLe: Set<string>) {
  if (!lyDo) return { trendSignalId: null, lyDo: null };
  const khop = lyDo.match(MA_THAM_KHAO);
  if (!khop) return { trendSignalId: null, lyDo };
  return {
    trendSignalId: hopLe.has(khop[1]) ? khop[1] : null,
    lyDo: lyDo.replace(MA_THAM_KHAO, '').trim() || null,
  };
}

function canKhamPha(yTuong: YTuongDeXuat[], truCot: TruCotMucTieu[], soLuong: number) {
  const toiDa = Math.round(soLuong * TI_LE_KHAM_PHA);
  const soKhamPha = Math.min(toiDa, yTuong.filter((y) => y.khamPha).length);
  const thuong = raiTheoTruCot(yTuong.filter((y) => !y.khamPha), truCot, soLuong - soKhamPha);
  const khamPha = raiTheoTruCot(yTuong.filter((y) => y.khamPha), truCot, soKhamPha);
  const daChon = new Set([...thuong, ...khamPha]);
  return [...thuong, ...khamPha, ...yTuong.filter((y) => !daChon.has(y))].slice(0, soLuong);
}

export async function deXuatYTuong(
  thamSo: ThamSoDeXuat,
): Promise<KetQuaStudio<YTuongDeXuat[]>> {
  const soLuong = Math.max(1, Math.min(20, Math.floor(thamSo.soLuong)));
  const repo = createRepo(thamSo.workspaceId);
  const [hoSo, truCot, chanDung, insight, sanPham, baiDaDang] = await Promise.all([
    repo.hoSo.lay(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.insight.list(30),
    repo.sanPham.list(20),
    repo.contents.list({ beMat: thamSo.beMat, trangThai: 'da_dang', gioiHan: 30 }),
  ]);

  if (!hoSo || hoSo.doDayDu < NGUONG_CHAN_DE_XUAT) {
    return { ok: false, loi: `Ho so can dat ${NGUONG_CHAN_DE_XUAT}% truoc khi de xuat.`, canhBao: [] };
  }
  if (truCot.length === 0 || chanDung.length === 0) {
    return { ok: false, loi: 'Can it nhat mot tru cot va mot chan dung khach hang.', canhBao: [] };
  }

  const canhBao: string[] = [];
  try {
    const boc = await bocCongThucChoBaiMoi(thamSo.workspaceId, 20);
    canhBao.push(...boc.canhBao);
  } catch {
    canhBao.push('Chua boc duoc cong thuc cua mot so bai tham khao; van de xuat tu du lieu con lai.');
  }

  const nguoi = await nguoiDungHienTai();
  const tinHieu = await repo.tinHieuXuHuong.theoNguoiDung(nguoi, 20);
  const thamKhao = tinHieu.flatMap((t) => {
    if (!daBocXong(t.congThuc)) return [];
    const c = t.congThuc as CongThuc;
    return [{
      maThamKhao: t.id,
      kieuHook: c.kieuHook,
      chuDe: c.chuDe,
      soChu: c.soChu,
      coCTA: c.coCTA,
    }];
  });

  const ketQua = await chayNhiemVu({
    nhiemVu: 'de-xuat-y-tuong',
    khongGianLamViec: thamSo.workspaceId,
    duLieuVao: {
      soLuong: Math.max(soLuong * 2, soLuong + 6),
      beMat: thamSo.beMat,
      tiLeKhamPha: TI_LE_KHAM_PHA,
      hoSo: { moTa: hoSo.moTa, giongDieu: hoSo.giongDieu, dieuCamKy: hoSo.dieuCamKy },
      truCot: truCot.map((t) => ({ ten: t.ten, mucDich: t.mucDich, tiLeMucTieu: t.tiLeMucTieu })),
      chanDung: chanDung.map((c) => ({
        ten: c.ten,
        noiDau: c.noiDau,
        mongMuon: c.mongMuon,
        cauNoiThuongDung: c.cauNoiThuongDung,
      })),
      insight: insight.map((i) => ({ noiDung: i.noiDung, bangChung: i.bangChung })),
      sanPham: sanPham.map((s) => ({
        ten: s.ten,
        loiIch: s.loiIch,
        phanDoiThuongGap: s.phanDoiThuongGap,
      })),
      baiDaDangGanDay: baiDaDang.map((b) => ({
        gocTiepCan: b.gocTiepCan,
        cauMoDau: b.cauMoDau,
      })),
      thamKhaoXuHuong: thamKhao,
    },
  });
  if (ketQua.trangThai !== 'xong' || !ketQua.ketQua) {
    return { ok: false, loi: ketQua.loi ?? 'Mo hinh khong tra ve ket qua.', canhBao };
  }

  const tenTruCot = truCot.map((t) => t.ten);
  const tenChanDung = chanDung.map((c) => c.ten);
  const daDon = donKetQuaDeXuat(ketQua.ketQua, tenTruCot, tenChanDung, thamSo.beMat)
    .filter((y) => y.truCot !== null && y.chanDung !== null);
  const mucTieu: TruCotMucTieu[] = truCot.map((t) => ({
    ten: t.ten,
    tiLeMucTieu: t.tiLeMucTieu === null ? null : Number(t.tiLeMucTieu),
  }));
  const daChon = canKhamPha(daDon, mucTieu, soLuong);
  if (daChon.length < soLuong) {
    canhBao.push(`Chi co ${daChon.length}/${soLuong} y tuong qua duoc kiem tra ho so.`);
  }

  const idThamKhao = new Set(thamKhao.map((t) => t.maThamKhao));
  const sach = daChon.map((y) => ({ y, ...tachThamKhao(y.lyDoDeXuat, idThamKhao) }));
  await trongGiaoDich(thamSo.workspaceId, async (tx) => {
    const idDaDung: string[] = [];
    for (const { y, trendSignalId, lyDo } of sach) {
      const tc = truCot.find((t) => t.ten === y.truCot);
      const cd = chanDung.find((c) => c.ten === y.chanDung);
      await tx.yTuong.tao({
        beMat: y.beMat,
        pillarId: tc?.id ?? null,
        personaId: cd?.id ?? null,
        gocTiepCan: y.gocTiepCan,
        cauMoDau: y.cauMoDau,
        lyDoDeXuat: lyDo,
        nguonYTuong: trendSignalId ? 'xu-huong' : 'may-de-xuat',
        trendSignalId,
      });
      if (trendSignalId) idDaDung.push(trendSignalId);
    }
    await tx.tinHieuXuHuong.danhDauDaDung([...new Set(idDaDung)]);
  });

  return {
    ok: true,
    duLieu: sach.map(({ y, lyDo }) => ({ ...y, lyDoDeXuat: lyDo })),
    canhBao,
  };
}
