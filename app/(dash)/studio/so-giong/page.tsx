import type { Metadata } from 'next';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { FormSoGiong } from './form-so-giong';
import '../../brand/brand.css';
import '../studio.css';
import './so-giong.css';

export const metadata: Metadata = {
  title: 'So 4 giọng — AI Content',
  description: 'So cùng một ý tưởng trên Fanpage, hồ sơ cá nhân, TikTok và Zalo.',
};

export const dynamic = 'force-dynamic';

export default async function TrangSoGiong() {
  const repo = createRepo(await workspaceHienTai());
  const ideas = await repo.yTuong.list(200);

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">Studio · Full scope</span>
          <h1 className="page-title">So bốn giọng cạnh nhau</h1>
          <p className="page-sub">
            Cùng một idea, cùng facts và persona; chỉ đổi bề mặt. Mục tiêu là nhìn thấy rõ
            Fanpage, hồ sơ cá nhân, TikTok và Zalo phải khác nhau về nhịp, độ dài và cách CTA.
          </p>
        </div>
      </div>

      {ideas.length > 0 ? (
        <FormSoGiong ideas={ideas.map((idea) => ({
          id: idea.id,
          tieuDe: idea.tieuDe,
          gocTiepCan: idea.gocTiepCan,
        }))} />
      ) : (
        <div className="studio-rong">
          <strong>Chưa có ý tưởng để so giọng.</strong>
          <p><a href="/studio/de-xuat">Tạo ý tưởng trước →</a></p>
        </div>
      )}
    </>
  );
}
