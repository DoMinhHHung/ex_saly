import { randomUUID } from 'node:crypto';

import { createRepo, trongGiaoDich } from '@/lib/data-access';
import { ghepBai, sinhBanVietTuIdea, type BanVietSinh } from './bien-soan';
import type { KetQuaStudio } from './kieu';

export const SO_BAI_CHUOI_MAC_DINH = 3;
export const SO_BAI_CHUOI_TOI_DA = 5;

export type BaiTrongChuoi = {
  contentId: string;
  thuTu: number;
  tieuDe: string;
};

export type KetQuaChuoiBai = {
  chuoiId: string;
  soLuong: number;
  bai: BaiTrongChuoi[];
};

export type ThamSoChuoiBai = {
  workspaceId: string;
  ideaId: string;
  soLuong?: number;
};

export function chuanHoaSoBaiChuoi(tho: unknown): number {
  const n = Number(tho);
  if (!Number.isFinite(n)) return SO_BAI_CHUOI_MAC_DINH;
  return Math.max(2, Math.min(SO_BAI_CHUOI_TOI_DA, Math.floor(n)));
}

function tomTatMach(noiDung: string): string {
  const sach = noiDung.replace(/\s+/g, ' ').trim();
  return sach.length > 520 ? `${sach.slice(0, 517)}...` : sach;
}

/**
 * Sinh tuan tu de bai sau THAY duoc mach cua bai truoc. Khong persist gi cho
 * den khi ca chuoi da qua parse + word-range, vi mot chuoi dut o bai 2/4 khong
 * co nghia nghiep vu ro rang va kho demo.
 */
export async function sinhChuoiBai(
  thamSo: ThamSoChuoiBai,
): Promise<KetQuaStudio<KetQuaChuoiBai>> {
  const soLuong = chuanHoaSoBaiChuoi(thamSo.soLuong);
  const repo = createRepo(thamSo.workspaceId);
  const idea = await repo.yTuong.layTheoId(thamSo.ideaId);
  if (!idea) {
    return { ok: false, loi: 'Không tìm thấy ý tưởng trong workspace hiện tại.', canhBao: [] };
  }

  const daSinh: BanVietSinh[] = [];
  for (let i = 0; i < soLuong; i += 1) {
    const ketQua = await sinhBanVietTuIdea({
      workspaceId: thamSo.workspaceId,
      ideaId: idea.id,
      mach: {
        thuTu: i + 1,
        tongBai: soLuong,
        baiTruoc: daSinh.map((bai, index) => ({
          thuTu: index + 1,
          tieuDe: bai.tieuDe,
          tomTat: tomTatMach(bai.noiDung),
        })),
      },
    });

    if (!ketQua.ok) {
      return {
        ok: false,
        loi: `Dừng ở bài ${i + 1}/${soLuong}: ${ketQua.loi}`,
        canhBao: ['Chuỗi chưa hoàn chỉnh nên chưa bài nào được persist.'],
      };
    }
    daSinh.push(ketQua.duLieu);
  }

  const chuoiId = randomUUID();
  const bai = await trongGiaoDich(thamSo.workspaceId, async (tx) => {
    const daLuu: BaiTrongChuoi[] = [];
    for (let i = 0; i < daSinh.length; i += 1) {
      const ban = daSinh[i];
      const content = await tx.contents.tao({
        ideaId: idea.id,
        beMat: idea.beMat,
        pillarId: idea.pillarId,
        personaId: idea.personaId,
        productId: idea.productId,
        gocTiepCan: idea.gocTiepCan,
        dangBai: 'chu',
        chuoiId,
        thuTuTrongChuoi: i + 1,
        nguonYTuong: idea.nguonYTuong,
        cauMoDau: ban.noiDung.split(/\n+/)[0]?.slice(0, 500) ?? idea.cauMoDau,
        noiDung: ghepBai(ban.tieuDe, ban.noiDung, ban.hashtag),
        moHinhDaSinh: ban.moHinh,
        trangThai: 'ban_nhap',
      });
      daLuu.push({ contentId: content.id, thuTu: i + 1, tieuDe: ban.tieuDe });
    }
    await tx.yTuong.sua(idea.id, { daDung: true });
    return daLuu;
  });

  return {
    ok: true,
    duLieu: { chuoiId, soLuong, bai },
    canhBao: [],
  };
}
