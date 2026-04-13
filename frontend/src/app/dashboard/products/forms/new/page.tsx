'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductFormNewPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/products/forms/edit/new');
  }, [router]);

  return null;
}
