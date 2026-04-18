'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useState } from 'react';

interface Document {
  _id: string;
  doc_type: string;
  file_url: string;
}

export default function DownloadZipButton({ documents, studentName }: { documents: Document[], studentName: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadZip = async () => {
    setIsDownloading(true);
    const zip = new JSZip();
    const folderName = `${studentName.replace(/\s+/g, '_')}_Documents`;
    const folder = zip.folder(folderName);

    try {
      const downloadPromises = documents.map(async (doc) => {
        const response = await fetch(doc.file_url);
        const blob = await response.blob();
        const extension = doc.file_url.split('.').pop() || 'pdf';
        folder?.file(`${doc.doc_type}_${doc._id.substring(0, 5)}.${extension}`, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
    } catch (error) {
      console.error("Zip generation failed:", error);
      alert("Failed to generate zip. Some files might be inaccessible.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={downloadZip}
      disabled={isDownloading || documents.length === 0}
      className="mt-4 w-full py-3 px-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[18px]">
        {isDownloading ? 'sync' : 'download_for_offline'}
      </span>
      {isDownloading ? 'Assembling Vault...' : 'Download All as ZIP'}
    </button>
  );
}
