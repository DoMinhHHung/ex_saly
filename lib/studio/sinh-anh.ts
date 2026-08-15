import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { duongDanAnToan } from '@/lib/keo-bai/kho-anh';

const MO_HINH_ANH_MAC_DINH = 'gemini-3.1-flash-image';
const TRAN_PROMPT = 2_400;
const TRAN_ANH = 8 * 1024 * 1024;

const DUOI_THEO_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type AnhInline = { data: string; mimeType: string };

type KhoiNoiDung = {
  type?: unknown;
  data?: unknown;
  mime_type?: unknown;
};

type BuocPhanHoi = {
  type?: unknown;
  content?: unknown;
};

/**
 * Interactions REST tra media trong `steps[].content[]`. Chi doc model_output de
 * khong vo tinh lay lai anh dau vao neu sau nay flow co them reference image.
 */
export function timAnhTrongPhanHoi(tho: unknown): AnhInline | null {
  if (!tho || typeof tho !== 'object') return null;
  const steps = (tho as { steps?: unknown }).steps;
  if (!Array.isArray(steps)) return null;

  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const step = steps[i] as BuocPhanHoi;
    if (step?.type !== 'model_output' || !Array.isArray(step.content)) continue;
    for (const muc of step.content as KhoiNoiDung[]) {
      if (muc?.type !== 'image' || typeof muc.data !== 'string') continue;
      const mimeType = typeof muc.mime_type === 'string' ? muc.mime_type : 'image/jpeg';
      if (!DUOI_THEO_MIME[mimeType]) continue;
      return { data: muc.data, mimeType };
    }
  }
  return null;
}

export type KetQuaSinhAnh =
  | { ok: true; url: string; moHinh: string }
  | { ok: false; loi: string };

function loiApi(status: number, than: string): string {
  const sach = than.replace(/\s+/g, ' ').trim().slice(0, 360);
  if (status === 429) return 'Gemini hết quota tạo ảnh hoặc đang bị giới hạn tốc độ. Thử lại sau.';
  if (status === 401 || status === 403) return 'Gemini từ chối khoá API khi tạo ảnh. Kiểm tra GEMINI_API_KEY.';
  return `Gemini tạo ảnh trả về ${status}${sach ? `: ${sach}` : ''}`;
}

export async function sinhAnhMinhHoa(workspaceId: string, promptTho: string): Promise<KetQuaSinhAnh> {
  const khoa = process.env.GEMINI_API_KEY?.trim();
  if (!khoa) return { ok: false, loi: 'Chưa có GEMINI_API_KEY để tạo ảnh minh hoạ.' };

  const prompt = promptTho.trim();
  if (prompt.length < 40) return { ok: false, loi: 'Gợi ý hình ảnh quá ngắn; hãy sinh lại content brief.' };
  if (prompt.length > TRAN_PROMPT) return { ok: false, loi: 'Gợi ý hình ảnh quá dài để gửi sang model.' };

  const moHinh = process.env.GEMINI_IMAGE_MODEL?.trim() || MO_HINH_ANH_MAC_DINH;
  const chiDan = [
    'Tạo một ảnh minh hoạ marketing 16:9 cho content brief sau.',
    'Ảnh phải có một chủ thể rõ, bố cục dùng được làm thumbnail social media, ánh sáng tự nhiên và cảm giác đáng tin.',
    'Không chèn chữ, logo, watermark giả, giao diện phần mềm, phần trăm, số liệu hay bằng chứng kinh doanh vào ảnh.',
    'Không biến gợi ý thành một case study hoặc kết quả thực tế chưa được cung cấp.',
    '',
    prompt,
  ].join('\n');

  let phanHoi: Response;
  try {
    phanHoi = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': khoa,
      },
      body: JSON.stringify({
        model: moHinh,
        input: [{ type: 'text', text: chiDan }],
        response_format: {
          type: 'image',
          mime_type: 'image/jpeg',
          aspect_ratio: '16:9',
          image_size: '1K',
        },
      }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch (loi) {
    return { ok: false, loi: `Không gọi được Gemini tạo ảnh: ${(loi as Error).message}` };
  }

  if (!phanHoi.ok) {
    const than = await phanHoi.text().catch(() => '');
    return { ok: false, loi: loiApi(phanHoi.status, than) };
  }

  let tho: unknown;
  try {
    tho = await phanHoi.json();
  } catch {
    return { ok: false, loi: 'Gemini trả về phản hồi tạo ảnh không đọc được.' };
  }

  const anh = timAnhTrongPhanHoi(tho);
  if (!anh) return { ok: false, loi: 'Gemini hoàn tất nhưng không trả về ảnh.' };

  const du = Buffer.from(anh.data, 'base64');
  if (du.byteLength === 0 || du.byteLength > TRAN_ANH) {
    return { ok: false, loi: 'Ảnh Gemini trả về rỗng hoặc vượt giới hạn 8MB.' };
  }

  const duoi = DUOI_THEO_MIME[anh.mimeType];
  const tuongDoi = path.join(workspaceId, 'studio-generated', `${randomUUID()}.${duoi}`);
  const dayDu = duongDanAnToan(tuongDoi);
  if (!dayDu) return { ok: false, loi: 'Không tạo được đường dẫn lưu ảnh an toàn.' };

  await mkdir(path.dirname(dayDu), { recursive: true });
  await writeFile(dayDu, du);

  const url = `/api/media/${tuongDoi.split(path.sep).map(encodeURIComponent).join('/')}`;
  return { ok: true, url, moHinh };
}
