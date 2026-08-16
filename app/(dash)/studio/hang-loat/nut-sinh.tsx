'use client';

import { useFormStatus } from 'react-dom';

export function NutSinhHangLoat() {
  const { pending } = useFormStatus();

  return (
    <button
      className="btn btn--primary hang-loat-nut"
      type="submit"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? 'Đang tạo batch, đừng đóng trang...' : 'Sinh hàng loạt'}
    </button>
  );
}
