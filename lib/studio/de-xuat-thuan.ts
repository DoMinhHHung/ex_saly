import type { BeMat, YTuongDeXuat } from './kieu';

export type TruCotMucTieu = { ten: string; tiLeMucTieu: number | null };

type MucTho = Record<string, unknown>;

function chuoi(tho: unknown): string | null {
  return typeof tho === 'string' && tho.trim() !== '' ? tho.trim() : null;
}

/**
 * Ten entity trong seed duoc luu khong dau, trong khi model co the tra ve cung
 * ten do voi dau tieng Viet. Chuan hoa CHI de doi chieu ten canonical; khong
 * fuzzy/semantic match de tranh bien ten model bia ra thanh entity that.
 */
function khoaTen(ten: string): string {
  return ten
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase('vi')
    .replace(/\s+/g, ' ')
    .trim();
}

function tenThat(tho: unknown, danhSach: string[]): string | null {
  const ten = chuoi(tho);
  if (!ten) return null;
  const khoa = khoaTen(ten);
  return danhSach.find((muc) => khoaTen(muc) === khoa) ?? null;
}

/**
 * Chi giu nhan model tra ve neu no van la DUNG entity canonical sau khi bo dau.
 * Nhan nay chi phuc vu UI; persistence van dung `tenThat()` o tren.
 */
function tenHienThi(tho: unknown, canonical: string | null): string | null {
  const ten = chuoi(tho);
  if (!ten || !canonical) return null;
  return khoaTen(ten) === khoaTen(canonical) ? ten : canonical;
}

export function donKetQuaDeXuat(
  tho: unknown,
  truCotHopLe: string[] = [],
  chanDungHopLe: string[] = [],
  beMatMacDinh: BeMat = 'fanpage',
): YTuongDeXuat[] {
  const mang = (tho as { yTuong?: unknown })?.yTuong;
  if (!Array.isArray(mang)) return [];

  return mang.flatMap((muc): YTuongDeXuat[] => {
    if (!muc || typeof muc !== 'object') return [];
    const m = muc as MucTho;
    const tieuDe = chuoi(m.tieuDe);
    if (!tieuDe) return [];
    const truCot = tenThat(m.truCot, truCotHopLe);
    const chanDung = tenThat(m.chanDung, chanDungHopLe);
    return [{
      tieuDe,
      truCot,
      chanDung,
      truCotHienThi: tenHienThi(m.truCot, truCot),
      chanDungHienThi: tenHienThi(m.chanDung, chanDung),
      gocTiepCan: chuoi(m.gocTiepCan),
      cauMoDau: chuoi(m.cauMoDau),
      lyDoDeXuat: chuoi(m.lyDoDeXuat),
      // Be mat la tham so server da chot. Khong cho output model doi dich den.
      beMat: beMatMacDinh,
      khamPha: m.kham_pha === true || m.khamPha === true,
    }];
  });
}

export function raiTheoTruCot(
  yTuongTho: YTuongDeXuat[],
  truCotMucTieu: TruCotMucTieu[],
  soLuong: number,
): YTuongDeXuat[] {
  const n = Math.max(0, Math.min(Math.floor(soLuong), yTuongTho.length));
  if (n === 0) return [];
  const mucTieu = truCotMucTieu
    .map((t) => ({ ...t, tiLe: Number(t.tiLeMucTieu) }))
    .filter((t) => Number.isFinite(t.tiLe) && t.tiLe > 0);
  if (mucTieu.length === 0) return yTuongTho.slice(0, n);

  const tong = mucTieu.reduce((s, t) => s + t.tiLe, 0);
  const quota = mucTieu.map((t) => {
    const chinhXac = (n * t.tiLe) / tong;
    return { ten: t.ten, so: Math.floor(chinhXac), le: chinhXac - Math.floor(chinhXac) };
  });
  let con = n - quota.reduce((s, q) => s + q.so, 0);
  for (const q of [...quota].sort((a, b) => b.le - a.le)) {
    if (con <= 0) break;
    q.so += 1;
    con -= 1;
  }

  const daChon = new Set<YTuongDeXuat>();
  const ketQua: YTuongDeXuat[] = [];
  for (const q of quota) {
    for (const y of yTuongTho) {
      if (q.so === 0) break;
      if (!daChon.has(y) && y.truCot === q.ten) {
        daChon.add(y);
        ketQua.push(y);
        q.so -= 1;
      }
    }
  }
  for (const y of yTuongTho) {
    if (ketQua.length >= n) break;
    if (!daChon.has(y)) ketQua.push(y);
  }
  return ketQua;
}

/**
 * Can ti le kham pha bang cach doi cho TRONG CUNG tru cot. Nhu vay quota tru
 * cot chi duoc tinh mot lan, khong bi sai so lam tron khi tach hai nhom.
 */
export function canBangKhamPha(
  yTuong: YTuongDeXuat[],
  truCot: TruCotMucTieu[],
  soLuong: number,
  tiLeKhamPha: number,
): YTuongDeXuat[] {
  const ketQua = raiTheoTruCot(yTuong, truCot, soLuong);
  const mucTieu = Math.min(
    Math.round(soLuong * tiLeKhamPha),
    yTuong.filter((y) => y.khamPha).length,
  );
  const daChon = new Set(ketQua);
  let hienTai = ketQua.filter((y) => y.khamPha).length;

  if (hienTai > mucTieu) {
    for (let i = ketQua.length - 1; i >= 0 && hienTai > mucTieu; i -= 1) {
      const dangCo = ketQua[i];
      if (!dangCo.khamPha) continue;
      const thay = yTuong.find((y) =>
        !daChon.has(y) && !y.khamPha && y.truCot === dangCo.truCot,
      );
      daChon.delete(dangCo);
      if (thay) {
        ketQua[i] = thay;
        daChon.add(thay);
      } else {
        ketQua.splice(i, 1);
      }
      hienTai -= 1;
    }
  } else if (hienTai < mucTieu) {
    for (let i = 0; i < ketQua.length && hienTai < mucTieu; i += 1) {
      const dangCo = ketQua[i];
      if (dangCo.khamPha) continue;
      const thay = yTuong.find((y) =>
        !daChon.has(y) && y.khamPha && y.truCot === dangCo.truCot,
      );
      if (!thay) continue;
      daChon.delete(dangCo);
      daChon.add(thay);
      ketQua[i] = thay;
      hienTai += 1;
    }
  }

  return ketQua.slice(0, soLuong);
}
