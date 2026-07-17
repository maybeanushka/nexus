'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from "next/script";

export default function PayAllButton({
  totalPayable,
}: {
  totalPayable: number;
}) {

  const router = useRouter();
  const [loading,setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        setLoading(false);
        alert(error.error || "Failed to create payment order.");
        return;
      }

      const order = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,
        name: "Nexus Clearance Portal",
        description: "Clearance Fee Payment",

        order_id: order.id,
        modal: {
          ondismiss: function () {
            setLoading(false);
            alert("Payment cancelled.");
          },
        },

        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          setLoading(false);
          alert("Payment verification failed.");
          return;
        }

        setLoading(false);
        router.push(`/receipt/${verifyData.transactionId}`);
        },

        theme: {
          color: "#4f46e5",
        },
      };

      const razor = new (window as any).Razorpay(options);

      razor.on("payment.failed", function (response: any) {
        console.error(response.error);

        setLoading(false);

        alert("Payment failed.");
      });

      razor.open();
    } 
    catch (err) {
      console.error(err);
      setLoading(false);
      alert("Unable to initiate payment.");
    }
  }

  return(
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
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
    </>
  );
}