'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Document {
  doc_type: string;
  file_url: string;
}

export default function DownloadDocsButton({ documents, studentName }: { documents: Document[], studentName: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAll = async () => {
    if (documents.length === 0) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(`${studentName.replace(/\s+/g, '_')}_clearance_docs`);

      const downloadPromises = documents.map(async (doc) => {
        try {
          const response = await fetch(doc.file_url);
          const blob = await response.blob();
          const extension = doc.file_url.split('.').pop() || 'pdf';
          folder?.file(`${doc.doc_type}.${extension}`, blob);
        } catch (err) {
          console.error(`Failed to download ${doc.doc_type}:`, err);
        }
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ 
        type: 'blob',
        mimeType: 'application/zip',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });
      
      const safeName = studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      saveAs(content, `${safeName}_clearance_docs.zip`);
    } catch (error) {
      console.error('ZIP generation failed:', error);
      alert('Failed to generate ZIP file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={downloadAll}
      disabled={isDownloading || documents.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-sm font-bold transition-all disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[20px]">
        {isDownloading ? 'sync' : 'folder_zip'}
      </span>
      {isDownloading ? 'Archiving...' : 'Download All Docs'}
    </button>
  );
}
