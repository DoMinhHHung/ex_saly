import { createRepo, trongGiaoDich } from '@/lib/data-access';
import type { TruCot } from '@/lib/data-access/content-pillars';
import type { Insight } from '@/lib/data-access/insights';
import type { ChanDung } from '@/lib/data-access/personas';
import type { SanPham } from '@/lib/data-access/products';
import { chayNhiemVu } from '@/lib/model-runner';
import { kiemTraDoDai, layKhoangTu } from './cong-dem-tu';
import type { BeMat, KetQuaStudio } from './kieu';

export type BaiVietHoanChinh = {
  contentId: string;
  tieuDe: string;
  noiDung: string;
  hashtag: string[];
  beMat: BeMat;
};

export type ThamSoBienSoan = {
  workspaceId: string;
  ideaId: string;
};

export type MachBai = {
  thuTu: number;
  tongBai: number;
  baiTruoc: Array<{ thuTu: number; tieuDe: string; tomTat: string }>;
};

export type ThamSoSinhBanViet = {
  workspaceId: string;
  ideaId: string;
  beMat?: BeMat;
  mach?: MachBai;
};

export type BanVietSinh = {
  tieuDe: string;
  noiDung: string;
  hashtag: string[];
  beMat: BeMat;
  moHinh: string;
};

export type BaiVietTho = {
  tieuDe: string;
  noiDung: string;
  hashtag: string[];
};

function chuoi(tho: unknown): string | null {
  return typeof tho === 'string' && tho.trim() !== '' ? tho.trim() : null;
}

export function donKetQuaVietBai(tho: unknown): BaiVietTho | null {
  if (!tho || typeof tho !== 'object') return null;
  const raw = tho as Record<string, unknown>;
  const tieuDe = chuoi(raw.tieuDe);
  const noiDung = chuoi(raw.noiDung);
  if (!tieuDe || !noiDung) return null;

  const hashtag = Array.isArray(raw.hashtag)
    ? raw.hashtag.flatMap((tag) => {
        const sach = chuoi(tag);
        if (!sach) return [];
        const khongKhoangTrang = sach.replace(/\s+/g, '');
        return [khongKhoangTrang.startsWith('#') ? khongKhoangTrang : `#${khongKhoangTrang}`];
      })
    : [];

  return { tieuDe, noiDung, hashtag: [...new Set(hashtag)].slice(0, 5) };
}

export function ghepBai(tieuDe: string, noiDung: string, hashtag: string[]): string {
  const bai = `${tieuDe}\n\n${noiDung}`;
  if (hashtag.length === 0) return bai;
  return `${bai}\n\n${hashtag.join(' ')}`;
}

/**
 * Sinh mot ban viet NHUNG CHUA persist. Day la core dung chung cho:
 * - M2: bien soan mot bai;
 * - chuoi bai: sinh tuan tu va dua bai truoc vao `mach`;
 * - so 4 giong: cung mot idea, bon bien the be mat.
 *
 * Moi duong van di qua chayNhiemVu(), dung cung fact-safety va cung cua kiem
 * word-range. Khong co route nao goi thang provider.
 */
export async function sinhBanVietTuIdea(
  thamSo: ThamSoSinhBanViet,
): Promise<KetQuaStudio<BanVietSinh>> {
  const repo = createRepo(thamSo.workspaceId);
  const idea = await repo.yTuong.layTheoId(thamSo.ideaId);
  if (!idea) return { ok: false, loi: 'Khong tim thay y tuong trong workspace hien tai.', canhBao: [] };

  const beMat = thamSo.beMat ?? idea.beMat;
  const [hoSo, truCot, chanDung, sanPham, insight, baiGanDay] = await Promise.all([
    repo.hoSo.lay(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.sanPham.list(20),
    repo.insight.list(20),
    repo.contents.list({ beMat, trangThai: 'da_dang', gioiHan: 12 }),
  ]);
  const pillar = truCot.find((t: TruCot) => t.id === idea.pillarId) ?? null;
  const persona = chanDung.find((c: ChanDung) => c.id === idea.personaId) ?? null;
  const khoangTu = layKhoangTu(beMat);

  const chay = await chayNhiemVu({
    nhiemVu: 'viet-bai',
    khongGianLamViec: thamSo.workspaceId,
    khoaChongTrung: null,
    duLieuVao: {
      bienThe: beMat,
      epDoDai: khoangTu,
      mach: thamSo.mach,
      yTuong: {
        tieuDe: idea.tieuDe,
        gocTiepCan: idea.gocTiepCan,
        cauMoDau: idea.cauMoDau,
        lyDoDeXuat: idea.lyDoDeXuat,
        khamPha: idea.khamPha,
      },
      hoSo: hoSo ? { moTa: hoSo.moTa, giongDieu: hoSo.giongDieu, dieuCamKy: hoSo.dieuCamKy } : null,
      truCot: pillar ? { ten: pillar.ten, mucDich: pillar.mucDich } : null,
      chanDung: persona
        ? { ten: persona.ten, noiDau: persona.noiDau, mongMuon: persona.mongMuon, cauNoiThuongDung: persona.cauNoiThuongDung }
        : null,
      sanPham: sanPham.map((p: SanPham) => ({
        ten: p.ten,
        gia: p.gia,
        loiIch: p.loiIch,
        phanDoiThuongGap: p.phanDoiThuongGap,
        loiKeuGoi: p.loiKeuGoi,
        lienKet: p.lienKet,
      })),
      insight: insight.map((i: Insight) => ({ noiDung: i.noiDung, bangChung: i.bangChung })),
      baiGanDay: baiGanDay.map((b) => ({ cauMoDau: b.cauMoDau, gocTiepCan: b.gocTiepCan })),
    },
  });
  if (chay.trangThai !== 'xong' || !chay.ketQua) {
    return { ok: false, loi: chay.loi ?? 'Mo hinh khong tra ve bai viet.', canhBao: [] };
  }

  const bai = donKetQuaVietBai(chay.ketQua);
  if (!bai) return { ok: false, loi: 'Ket qua bai viet khong dung dinh dang.', canhBao: [] };

  const doDai = kiemTraDoDai(bai.noiDung, beMat);
  if (!doDai.hopLe) {
    return {
      ok: false,
      loi: `Bai viet co ${doDai.soTu} tu; ${beMat} bat buoc ${doDai.toiThieu}-${doDai.toiDa} tu. Hay sinh lai.`,
      canhBao: ['Ket qua vuot rang buoc do dai nen khong duoc luu.'],
    };
  }

  const hashtag = beMat === 'zalo' ? [] : bai.hashtag;
  return {
    ok: true,
    duLieu: { tieuDe: bai.tieuDe, noiDung: bai.noiDung, hashtag, beMat, moHinh: chay.moHinh },
    canhBao: [],
  };
}

/** Mot y tuong da luu -> mot ban nhap co the sua, tat ca doc/ghi qua data-access. */
export async function bienSoanBai(
  thamSo: ThamSoBienSoan,
): Promise<KetQuaStudio<BaiVietHoanChinh>> {
  const sinh = await sinhBanVietTuIdea(thamSo);
  if (!sinh.ok) return sinh;

  const repo = createRepo(thamSo.workspaceId);
  const idea = await repo.yTuong.layTheoId(thamSo.ideaId);
  if (!idea) return { ok: false, loi: 'Khong tim thay y tuong trong workspace hien tai.', canhBao: [] };

  // Facebook khong co cot title rieng. Dua headline vao chinh draft giup no
  // song qua redirect/reload va van sua duoc, thay vi them schema chi de giu UI state.
  const noiDungLuu = ghepBai(sinh.duLieu.tieuDe, sinh.duLieu.noiDung, sinh.duLieu.hashtag);

  const contentId = await trongGiaoDich(thamSo.workspaceId, async (tx) => {
    const content = await tx.contents.tao({
      ideaId: idea.id,
      beMat: idea.beMat,
      pillarId: idea.pillarId,
      personaId: idea.personaId,
      productId: idea.productId,
      gocTiepCan: idea.gocTiepCan,
      dangBai: 'chu',
      nguonYTuong: idea.nguonYTuong,
      cauMoDau: idea.cauMoDau,
      noiDung: noiDungLuu,
      moHinhDaSinh: sinh.duLieu.moHinh,
      trangThai: 'ban_nhap',
    });
    await tx.yTuong.sua(idea.id, { daDung: true });
    return content.id;
  });

  return {
    ok: true,
    duLieu: {
      contentId,
      tieuDe: sinh.duLieu.tieuDe,
      noiDung: noiDungLuu,
      hashtag: sinh.duLieu.hashtag,
      beMat: idea.beMat,
    },
    canhBao: sinh.canhBao,
  };
}
