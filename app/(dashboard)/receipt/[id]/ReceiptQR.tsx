'use client';

import { QRCodeSVG } from 'qrcode.react';

export default function ReceiptQR({ value }: { value: string }) {
  return (
    <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm inline-block">
      <QRCodeSVG 
        value={value} 
        size={140} 
        level="H"
        includeMargin={true}
        className="rounded-lg"
      />
    </div>
  );
}
