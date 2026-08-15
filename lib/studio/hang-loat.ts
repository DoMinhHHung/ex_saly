import { createRepo } from '@/lib/data-access';
import type { Idea } from '@/lib/data-access/ideas';
import { bienSoanBai } from './bien-soan';
import { deXuatYTuong } from './de-xuat';
import type { BeMat, KetQuaStudio } from './kieu';

export const SO_BAI_HANG_LOAT_MAC_DINH = 10;
export const SO_BAI_HANG_LOAT_TOI_DA = 10;

export type KetQuaMotBaiHangLoat = {
  ideaId: string;
  tieuDe: string;
  ok: boolean;
  contentId: string | null;
  loi: string | null;
  soLanThu: number;
};

export type KetQuaHangLoat = {
  beMat: BeMat;
  soLuongYeuCau: number;
  soYTuongBoSung: number;
  daTao: number;
  thatBai: number;
  bai: KetQuaMotBaiHangLoat[];
};

export type ThamSoHangLoat = {
  workspaceId: string;
  beMat: BeMat;
  soLuong?: number;
};

export function chuanHoaSoLuongHangLoat(soLuong: unknown): number {
  const n = Number(soLuong);
  if (!Number.isFinite(n)) return SO_BAI_HANG_LOAT_MAC_DINH;
  return Math.max(1, Math.min(SO_BAI_HANG_LOAT_TOI_DA, Math.floor(n)));
}

/**
 * M4 chi dung idea chua tung duoc bien thanh content va dung be mat user chon.
 * Repo list da sort moi -> cu, nen batch uu tien y tuong moi nhat.
 */
export function chonYTuongHangLoat(
  ideas: Pick<Idea, 'id' | 'beMat' | 'daDung' | 'tieuDe' | 'gocTiepCan'>[],
  beMat: BeMat,
  soLuong: number,
) {
  const gioiHan = chuanHoaSoLuongHangLoat(soLuong);
  return ideas
    .filter((idea) => idea.beMat === beMat && idea.daDung === false)
    .slice(0, gioiHan);
}

function tenIdea(idea: Pick<Idea, 'id' | 'tieuDe' | 'gocTiepCan'>): string {
  return idea.tieuDe ?? idea.gocTiepCan ?? `Ý tưởng ${idea.id.slice(0, 8)}`;
}

function laLoiNoiDungCoTheThuLai(loi: string): boolean {
  return (
    loi.startsWith('Bai viet co ') ||
    loi === 'Ket qua bai viet khong dung dinh dang.'
  );
}

async function bienSoanMotIdea(
  workspaceId: string,
  idea: Pick<Idea, 'id' | 'tieuDe' | 'gocTiepCan'>,
): Promise<KetQuaMotBaiHangLoat> {
  let loiCuoi: string | null = null;

  // Retry dung mot lan CHI cho loi semantic do output model: sai JSON/word range.
  // Loi provider/queue/timeout de hang doi tu xu ly, khong lap tuc nhan doi request.
  for (let lan = 1; lan <= 2; lan += 1) {
    try {
      const ketQua = await bienSoanBai({ workspaceId, ideaId: idea.id });
      if (ketQua.ok) {
        return {
          ideaId: idea.id,
          tieuDe: tenIdea(idea),
          ok: true,
          contentId: ketQua.duLieu.contentId,
          loi: null,
          soLanThu: lan,
        };
      }

      loiCuoi = ketQua.loi;
      if (!laLoiNoiDungCoTheThuLai(ketQua.loi)) break;
    } catch (error) {
      loiCuoi = error instanceof Error ? error.message : 'Lỗi không xác định khi sinh bài.';
      break;
    }
  }

  return {
    ideaId: idea.id,
    tieuDe: tenIdea(idea),
    ok: false,
    contentId: null,
    loi: loiCuoi ?? 'Không sinh được bài.',
    soLanThu: 2,
  };
}

/**
 * Mốc 4 = orchestration của M1 + M2, không tạo thêm một batch prompt riêng.
 *
 * - ưu tiên idea chưa dùng đã có;
 * - thiếu thì top-up bằng chính deXuatYTuong();
 * - enqueue các bài đồng thời; worker-model đã có concurrency cap nên nơi này
 *   không nhân đôi cơ chế điều tiết provider;
 * - mỗi bài vẫn đi qua bienSoanBai(), do đó giữ nguyên fact-safety, word range,
 *   workspace isolation và persistence contract của M2;
 * - partial success được giữ lại thay vì rollback 9 bài tốt chỉ vì bài thứ 10 lỗi.
 */
export async function sinhHangLoatBai(
  thamSo: ThamSoHangLoat,
): Promise<KetQuaStudio<KetQuaHangLoat>> {
  const soLuong = chuanHoaSoLuongHangLoat(thamSo.soLuong);
  const repo = createRepo(thamSo.workspaceId);
  const canhBao: string[] = [];

  let ideas = await repo.yTuong.list(200);
  let daChon = chonYTuongHangLoat(ideas, thamSo.beMat, soLuong);
  let soYTuongBoSung = 0;

  if (daChon.length < soLuong) {
    const thieu = soLuong - daChon.length;
    const boSung = await deXuatYTuong({
      workspaceId: thamSo.workspaceId,
      beMat: thamSo.beMat,
      soLuong: thieu,
    });

    canhBao.push(...boSung.canhBao);
    if (!boSung.ok) {
      canhBao.push(`Không tự bổ sung được ${thieu} ý tưởng: ${boSung.loi}`);
    } else {
      soYTuongBoSung = boSung.duLieu.length;
    }

    ideas = await repo.yTuong.list(200);
    daChon = chonYTuongHangLoat(ideas, thamSo.beMat, soLuong);
  }

  if (daChon.length === 0) {
    return {
      ok: false,
      loi: 'Không có ý tưởng chưa dùng phù hợp để sinh hàng loạt.',
      canhBao,
    };
  }

  if (daChon.length < soLuong) {
    canhBao.push(`Chỉ có ${daChon.length}/${soLuong} ý tưởng hợp lệ để chạy batch này.`);
  }

  // Promise.all chi enqueue/wait song song. Gioi han thuc thi model van nam o
  // worker-model (mac dinh 2), nen UI khong phai tu che mot concurrency layer nua.
  const bai = await Promise.all(
    daChon.map((idea) => bienSoanMotIdea(thamSo.workspaceId, idea)),
  );

  const daTao = bai.filter((item) => item.ok).length;
  const thatBai = bai.length - daTao;
  if (thatBai > 0) {
    canhBao.push(`${thatBai} bài không vượt qua validation/provider; các bài thành công vẫn được giữ.`);
  }

  if (daTao === 0) {
    return {
      ok: false,
      loi: 'Batch không tạo được bản nháp nào. Kiểm tra worker/provider rồi chạy lại.',
      canhBao,
    };
  }

  return {
    ok: true,
    duLieu: {
      beMat: thamSo.beMat,
      soLuongYeuCau: soLuong,
      soYTuongBoSung,
      daTao,
      thatBai,
      bai,
    },
    canhBao,
  };
}
