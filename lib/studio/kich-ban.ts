import { createRepo, trongGiaoDich } from '@/lib/data-access';
import type { TruCot } from '@/lib/data-access/content-pillars';
import type { Insight } from '@/lib/data-access/insights';
import type { ChanDung } from '@/lib/data-access/personas';
import type { SanPham } from '@/lib/data-access/products';
import { chayNhiemVu } from '@/lib/model-runner';
import type { BeMat, KetQuaStudio } from './kieu';

export type PhanCanhKichBan = {
  thoiLuongGiay: number;
  hinhAnh: string;
  loiThoai: string;
};

export type KichBanQuay = {
  contentId: string;
  tieuDe: string;
  phanCanh: PhanCanhKichBan[];
  tongThoiLuongGiay: number;
  beMat: BeMat;
};

export type ThamSoKichBan = {
  workspaceId: string;
  ideaId: string;
};

export type KichBanDaLuu = {
  tieuDe: string;
  phanCanh: PhanCanhKichBan[];
};

function chuoi(tho: unknown): string | null {
  return typeof tho === 'string' && tho.trim() !== '' ? tho.trim() : null;
}

/**
 * Model output phai la script co cau truc that su, khong phai mot doan van gia
 * dang JSON. Rang buoc do dai o day la deterministic: prompt goi y, code moi la
 * cua cuoi cung truoc khi persist.
 */
export function donKetQuaKichBan(tho: unknown): KichBanDaLuu | null {
  if (!tho || typeof tho !== 'object') return null;
  const raw = tho as Record<string, unknown>;
  const tieuDe = chuoi(raw.tieuDe);
  if (!tieuDe || !Array.isArray(raw.phanCanh)) return null;
  if (raw.phanCanh.length < 3 || raw.phanCanh.length > 8) return null;

  const phanCanh: PhanCanhKichBan[] = [];
  for (const muc of raw.phanCanh) {
    if (!muc || typeof muc !== 'object') return null;
    const canh = muc as Record<string, unknown>;
    const hinhAnh = chuoi(canh.hinhAnh);
    const loiThoai = chuoi(canh.loiThoai);
    const thoiLuongTho = Number(canh.thoiLuongGiay);
    if (!hinhAnh || !loiThoai || !Number.isFinite(thoiLuongTho)) return null;
    const thoiLuongGiay = Math.round(thoiLuongTho);
    if (thoiLuongGiay < 1 || thoiLuongGiay > 30) return null;
    phanCanh.push({ thoiLuongGiay, hinhAnh, loiThoai });
  }

  const tong = phanCanh.reduce((sum, canh) => sum + canh.thoiLuongGiay, 0);
  if (tong < 10 || tong > 120) return null;
  return { tieuDe, phanCanh };
}

export function tongThoiLuongKichBan(kichBan: Pick<KichBanDaLuu, 'phanCanh'>): number {
  return kichBan.phanCanh.reduce((sum, canh) => sum + canh.thoiLuongGiay, 0);
}

export function dongGoiKichBan(kichBan: KichBanDaLuu): string {
  return JSON.stringify({ phienBan: 1, tieuDe: kichBan.tieuDe, phanCanh: kichBan.phanCanh }, null, 2);
}

export function docKichBanDaLuu(noiDung: string | null): KichBanDaLuu | null {
  if (!noiDung) return null;
  try {
    return donKetQuaKichBan(JSON.parse(noiDung));
  } catch {
    return null;
  }
}

/** Mot idea da luu -> mot draft kich ban phan canh, doc/ghi qua data-access. */
export async function sinhKichBanQuay(
  thamSo: ThamSoKichBan,
): Promise<KetQuaStudio<KichBanQuay>> {
  const repo = createRepo(thamSo.workspaceId);
  const idea = await repo.yTuong.layTheoId(thamSo.ideaId);
  if (!idea) {
    return { ok: false, loi: 'Không tìm thấy ý tưởng trong workspace hiện tại.', canhBao: [] };
  }

  const [hoSo, truCot, chanDung, sanPham, insight, baiGanDay] = await Promise.all([
    repo.hoSo.lay(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.sanPham.list(20),
    repo.insight.list(20),
    repo.contents.list({ beMat: idea.beMat, trangThai: 'da_dang', gioiHan: 12 }),
  ]);

  const pillar = truCot.find((t: TruCot) => t.id === idea.pillarId) ?? null;
  const persona = chanDung.find((c: ChanDung) => c.id === idea.personaId) ?? null;

  const chay = await chayNhiemVu({
    nhiemVu: 'viet-kich-ban',
    khongGianLamViec: thamSo.workspaceId,
    // Hanh dong tuong tac: user bam lai thi can mot candidate moi.
    khoaChongTrung: null,
    duLieuVao: {
      bienThe: idea.beMat,
      yTuong: {
        tieuDe: idea.tieuDe,
        gocTiepCan: idea.gocTiepCan,
        cauMoDau: idea.cauMoDau,
        lyDoDeXuat: idea.lyDoDeXuat,
        khamPha: idea.khamPha,
      },
      hoSo: hoSo
        ? { moTa: hoSo.moTa, giongDieu: hoSo.giongDieu, dieuCamKy: hoSo.dieuCamKy }
        : null,
      truCot: pillar ? { ten: pillar.ten, mucDich: pillar.mucDich } : null,
      chanDung: persona
        ? {
            ten: persona.ten,
            noiDau: persona.noiDau,
            mongMuon: persona.mongMuon,
            cauNoiThuongDung: persona.cauNoiThuongDung,
          }
        : null,
      sanPham: sanPham.map((p: SanPham) => ({
        ten: p.ten,
        gia: p.gia,
        loiIch: p.loiIch,
        phanDoiThuongGap: p.phanDoiThuongGap,
        loiKeuGoi: p.loiKeuGoi,
      })),
      insight: insight.map((i: Insight) => ({ noiDung: i.noiDung, bangChung: i.bangChung })),
      // Chi dua metadata/goc ke cua bai cu de tranh lap; khong can raw body.
      kichBanGanDay: baiGanDay
        .filter((b) => b.dangBai === 'kich_ban_quay')
        .map((b) => ({ cauMoDau: b.cauMoDau, gocTiepCan: b.gocTiepCan })),
    },
  });

  if (chay.trangThai !== 'xong' || !chay.ketQua) {
    return { ok: false, loi: chay.loi ?? 'Mô hình không trả về kịch bản.', canhBao: [] };
  }

  const kichBan = donKetQuaKichBan(chay.ketQua);
  if (!kichBan) {
    return {
      ok: false,
      loi: 'Kịch bản không đúng cấu trúc phân cảnh hoặc thời lượng hợp lệ.',
      canhBao: ['Kết quả sai cấu trúc nên không được lưu.'],
    };
  }

  const noiDung = dongGoiKichBan(kichBan);
  const contentId = await trongGiaoDich(thamSo.workspaceId, async (tx) => {
    const content = await tx.contents.tao({
      ideaId: idea.id,
      beMat: idea.beMat,
      pillarId: idea.pillarId,
      personaId: idea.personaId,
      productId: idea.productId,
      gocTiepCan: idea.gocTiepCan,
      dangBai: 'kich_ban_quay',
      nguonYTuong: idea.nguonYTuong,
      cauMoDau: kichBan.phanCanh[0]?.loiThoai ?? idea.cauMoDau,
      noiDung,
      moHinhDaSinh: chay.moHinh,
      trangThai: 'ban_nhap',
    });
    await tx.yTuong.sua(idea.id, { daDung: true });
    return content.id;
  });

  return {
    ok: true,
    duLieu: {
      contentId,
      tieuDe: kichBan.tieuDe,
      phanCanh: kichBan.phanCanh,
      tongThoiLuongGiay: tongThoiLuongKichBan(kichBan),
      beMat: idea.beMat,
    },
    canhBao: [],
  };
}
