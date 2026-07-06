'use client';

import { useActionState, useState } from 'react';
import { submitApplication } from '@/lib/actions';

export default function SubmitForm({ isResubmission }: { isResubmission?: boolean }) {
  const [state, formAction, isPending] = useActionState(submitApplication, null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateFile = (file: File, name: string) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [name]: 'Invalid format. Use PDF, JPG, or PNG.' }));
      return false;
    }
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [name]: 'File size exceeds 2MB limit.' }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateFile(file, e.target.name);
  };

  const isFormInvalid = Object.keys(errors).length > 0;

  return (
    <div className="max-w-2xl mx-auto aether-card rounded-2xl p-8 mb-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          {isResubmission ? 'Protocol Revision' : 'Protocol Initiation'}
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          {isResubmission ? 'Update Documentation' : 'Clearance Application'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {isResubmission 
            ? 'Correct the previously flagged documents and resubmit to resume review.' 
            : 'Upload your official documents to begin the clearance protocol.'}
        </p>
      </div>
      
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="isResubmission" value={isResubmission ? 'true' : 'false'} />
        
        {state?.error && (
          <div className="p-4 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm border border-rose-100 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {state.error}
          </div>
        )}

        {[
          { name: 'idCard', label: 'Institutional ID Card' },
          { name: 'libraryReceipt', label: 'Library No-Dues Receipt' },
          { name: 'labRecords', label: 'Lab Equipment Records' }
        ].map((field) => (
          <div key={field.name} className="space-y-2 group">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">{field.label} (PDF/JPG/PNG)</label>
            <input 
              type="file" 
              name={field.name} 
              required={!isResubmission} 
              accept=".pdf,image/jpeg,image/png" 
              onChange={handleFileChange}
              className={`block w-full p-3 bg-slate-50 border rounded-xl text-slate-900 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-indigo-700 cursor-pointer outline-none transition-all group-hover:border-primary/30 ${
                errors[field.name] ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
              }`} 
            />
            {errors[field.name] && (
              <p className="text-[10px] font-bold text-rose-500 px-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">warning</span>
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button disabled={isPending || isFormInvalid} className="w-full py-4 px-6 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95" type="submit">
            {isPending ? 'Syncing with Secure Vault...' : isResubmission ? 'Resubmit for Review' : 'Submit Documents'}
            <span className="material-symbols-outlined text-lg">{isResubmission ? 'refresh' : 'cloud_upload'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
