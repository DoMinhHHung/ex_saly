'use client';

import { useFormStatus } from 'react-dom';

export function NutSinhKichBan() {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn btn--primary kich-ban-nut-sinh"
      type="submit"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? 'Đang dựng phân cảnh...' : 'Sinh kịch bản phân cảnh'}
    </button>
  );
}
