'use client';

import { useFormStatus } from 'react-dom';

export function NutSinhChuoi() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--primary chuoi-bai-nut" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Đang nối mạch từng bài...' : 'Sinh chuỗi bài'}
    </button>
  );
}
