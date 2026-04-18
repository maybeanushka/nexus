'use client';

export default function CopyLinkButton({ url }: { url: string }) {
  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Verification link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
        fallbackCopyTextToClipboard(url);
      });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure the textarea is off-screen
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Verification link copied to clipboard!');
      } else {
        alert('Unable to copy link. Please manually copy the ID.');
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
  };

  return (
    <button 
      onClick={copyToClipboard}
      className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1 mt-1"
    >
      <span className="material-symbols-outlined text-[12px]">content_copy</span>
      Copy Link for Verification
    </button>
  );
}
