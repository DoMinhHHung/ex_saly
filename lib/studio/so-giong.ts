import { createRepo } from '@/lib/data-access';
import { sinhBanVietTuIdea } from './bien-soan';
import { demTu } from './cong-dem-tu';
import { BE_MAT_HOP_LE, type BeMat, type KetQuaStudio } from './kieu';

export type BienTheSoGiong = {
  beMat: BeMat;
  ok: boolean;
  tieuDe: string | null;
  noiDung: string | null;
  hashtag: string[];
  soTu: number;
  loi: string | null;
};

export type KetQuaSoGiong = {
  ideaId: string;
  bienThe: BienTheSoGiong[];
};

/**
 * Cung MOT idea va facts, chi doi system voice/word-range theo be mat. Khong
 * persist va khong danh dau idea da dung: day la man so sanh, khong phai hanh
 * dong tao draft.
 */
export async function soGiongBonBeMat(
  workspaceId: string,
  ideaId: string,
): Promise<KetQuaStudio<KetQuaSoGiong>> {
  const repo = createRepo(workspaceId);
  const idea = await repo.yTuong.layTheoId(ideaId);
  if (!idea) return { ok: false, loi: 'Không tìm thấy ý tưởng trong workspace hiện tại.', canhBao: [] };

  const bienThe = await Promise.all(
    BE_MAT_HOP_LE.map(async (beMat): Promise<BienTheSoGiong> => {
      const ketQua = await sinhBanVietTuIdea({ workspaceId, ideaId, beMat });
      if (!ketQua.ok) {
        return {
          beMat,
          ok: false,
          tieuDe: null,
          noiDung: null,
          hashtag: [],
          soTu: 0,
          loi: ketQua.loi,
        };
      }
      return {
        beMat,
        ok: true,
        tieuDe: ketQua.duLieu.tieuDe,
        noiDung: ketQua.duLieu.noiDung,
        hashtag: ketQua.duLieu.hashtag,
        soTu: demTu(ketQua.duLieu.noiDung),
        loi: null,
      };
    }),
  );

  const soThanhCong = bienThe.filter((item) => item.ok).length;
  if (soThanhCong === 0) {
    return {
      ok: false,
      loi: 'Cả bốn biến thể đều không sinh được. Kiểm tra worker/provider rồi thử lại.',
      canhBao: [],
    };
  }

  return {
    ok: true,
    duLieu: { ideaId, bienThe },
    canhBao: soThanhCong < 4 ? [`Chỉ ${soThanhCong}/4 bề mặt sinh được trong lượt này.`] : [],
  };
}
