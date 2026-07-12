'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payAllDuesAction } from '@/lib/actions';

export default function PayAllButton({
  totalPayable,
}: {
  totalPayable: number;
}) {

  const router = useRouter();
  const [loading,setLoading] = useState(false);

  async function handleClick(){

    setLoading(true);

    const res = await payAllDuesAction();

    if(res.success){
      router.push(`/receipt/${res.transactionId}`);
    }

    setLoading(false);
  }

  return(
    <button
    onClick={handleClick}
    disabled={loading || totalPayable === 0}
    className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
    {loading
        ? "Processing..."
        : totalPayable > 0
        ? "Proceed to Payment"
        : "No Pending Dues"}
    </button>
  );
}