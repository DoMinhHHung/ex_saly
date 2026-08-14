import { createRepo, trongGiaoDich } from '@/lib/data-access';
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

type BaiVietTho = {
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

function ghepBai(tieuDe: string, noiDung: string, hashtag: string[]): string {
  const bai = `${tieuDe}\n\n${noiDung}`;
  if (hashtag.length === 0) return bai;
  return `${bai}\n\n${hashtag.join(' ')}`;
}

/** Mot y tuong da luu -> mot ban nhap co the sua, tat ca doc/ghi qua data-access. */
export async function bienSoanBai(
  thamSo: ThamSoBienSoan,
): Promise<KetQuaStudio<BaiVietHoanChinh>> {
  const repo = createRepo(thamSo.workspaceId);
  const idea = await repo.yTuong.layTheoId(thamSo.ideaId);
  if (!idea) return { ok: false, loi: 'Khong tim thay y tuong trong workspace hien tai.', canhBao: [] };

  const [hoSo, truCot, chanDung, sanPham, insight, baiGanDay] = await Promise.all([
    repo.hoSo.lay(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.sanPham.list(20),
    repo.insight.list(20),
    repo.contents.list({ beMat: idea.beMat, trangThai: 'da_dang', gioiHan: 12 }),
  ]);
  const pillar = truCot.find((t) => t.id === idea.pillarId) ?? null;
  const persona = chanDung.find((c) => c.id === idea.personaId) ?? null;
  const khoangTu = layKhoangTu(idea.beMat);

  const chay = await chayNhiemVu({
    nhiemVu: 'viet-bai',
    khongGianLamViec: thamSo.workspaceId,
    khoaChongTrung: null,
    duLieuVao: {
      bienThe: idea.beMat,
      epDoDai: khoangTu,
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
      sanPham: sanPham.map((p) => ({
        ten: p.ten,
        gia: p.gia,
        loiIch: p.loiIch,
        phanDoiThuongGap: p.phanDoiThuongGap,
        loiKeuGoi: p.loiKeuGoi,
        lienKet: p.lienKet,
      })),
      insight: insight.map((i) => ({ noiDung: i.noiDung, bangChung: i.bangChung })),
      baiGanDay: baiGanDay.map((b) => ({ cauMoDau: b.cauMoDau, gocTiepCan: b.gocTiepCan })),
    },
  });
  if (chay.trangThai !== 'xong' || !chay.ketQua) {
    return { ok: false, loi: chay.loi ?? 'Mo hinh khong tra ve bai viet.', canhBao: [] };
  }

  const bai = donKetQuaVietBai(chay.ketQua);
  if (!bai) return { ok: false, loi: 'Ket qua bai viet khong dung dinh dang.', canhBao: [] };

  const doDai = kiemTraDoDai(bai.noiDung, idea.beMat);
  if (!doDai.hopLe) {
    return {
      ok: false,
      loi: `Bai viet co ${doDai.soTu} tu; ${idea.beMat} bat buoc ${doDai.toiThieu}-${doDai.toiDa} tu. Hay sinh lai.`,
      canhBao: ['Ket qua vuot rang buoc do dai nen khong duoc luu.'],
    };
  }

  const hashtag = idea.beMat === 'zalo' ? [] : bai.hashtag;
  // Facebook khong co cot title rieng. Dua headline vao chinh draft giup no
  // song qua redirect/reload va van sua duoc, thay vi them schema chi de giu UI state.
  const noiDungLuu = ghepBai(bai.tieuDe, bai.noiDung, hashtag);

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
      moHinhDaSinh: chay.moHinh,
      trangThai: 'ban_nhap',
    });
    await tx.yTuong.sua(idea.id, { daDung: true });
    return content.id;
  });

  return {
    ok: true,
    duLieu: { contentId, tieuDe: bai.tieuDe, noiDung: noiDungLuu, hashtag, beMat: idea.beMat },
    canhBao: [],
  };
}
