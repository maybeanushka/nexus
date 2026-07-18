'use client';

import { useActionState, useState } from 'react';
import { submitApplication } from '@/lib/actions';

type SubmitFormProps = {
  mode: "new" | "resubmit";
};

export default function SubmitForm({ mode }: SubmitFormProps) {
  const isResubmission = mode === "resubmit";
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
    <div className="max-w-4xl mx-auto aether-card rounded-2xl px-8 pb-8 py-5 mb-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
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
      
      <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">info</span>
          <h3 className="font-bold text-slate-900">Before You Submit</h3>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
            <span>Upload clear, readable documents.</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
            <span>Accepted formats: PDF, JPG and PNG.</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
            <span>Maximum file size: 2 MB per document.</span>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        
        {state?.error && (
          <div className="p-4 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm border border-rose-100 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {state.error}
          </div>
        )}
        
        {[
          {name:'idCard',label:'College ID Card',icon:'badge'},
          {name:'libraryReceipt',label:'Library Clearance Receipt',icon:'library_books'},
          {name:'labRecords',label:'Laboratory Record',icon:'science'}
        ].map((field) => (
          <div key={field.name} className="space-y-2 group rounded-2xl p-1 transition hover:bg-slate-50">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-xl">
                  {field.icon}
                </span>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {field.label}
                </p>

                <p className="text-xs text-slate-500">
                  PDF, JPG or PNG • Maximum size 2 MB
                </p>
              </div>
            </div>
            <input 
              type="file" 
              name={field.name} 
              required={mode ==="new"} 
              accept=".pdf,image/jpeg,image/png" 
              onChange={handleFileChange}
              className={`w-full rounded-2xl border-2 border-dashed py-3 px-4 bg-slate-50 text-sm text-slate-900 cursor-pointer transition-all duration-200 outline-none
              file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-700
              ${
                errors[field.name]
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-300 hover:border-primary hover:bg-primary/5'
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

        <div className="mt-6 pt-2 border-t border-slate-100">
          <button disabled={isPending || isFormInvalid} className="w-full py-3 px-6 bg-primary text-white font-black text-[14px] uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95" type="submit">
            {isPending ? 'Submitting application...' : isResubmission ? 'Resubmit for Review' : 'Submit Documents'}
            <span className="material-symbols-outlined text-lg">{isResubmission ? 'refresh' : 'cloud_upload'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
