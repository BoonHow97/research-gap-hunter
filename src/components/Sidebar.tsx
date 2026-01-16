import React, { useRef } from 'react';
import { FileData } from '../types';
import { UploadCloud, FileText, X, Sparkles, BookOpen } from 'lucide-react';

interface SidebarProps {
  topic: string;
  setTopic: (t: string) => void;
  abstracts: string;
  setAbstracts: (a: string) => void;
  files: FileData[];
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
  onSynthesize: () => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  topic,
  setTopic,
  abstracts,
  setAbstracts,
  files,
  setFiles,
  onSynthesize,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileData[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        
        const filePromise = new Promise<FileData>((resolve) => {
          reader.onload = (readEvent) => {
            resolve({
              file: file,
              base64: readEvent.target?.result as string,
              mimeType: file.type
            });
          };
          reader.readAsDataURL(file);
        });

        newFiles.push(await filePromise);
      }
      
      setFiles(prev => [...prev, ...newFiles]);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 overflow-y-auto shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Gap Hunter</h1>
        </div>
        <p className="text-sm text-slate-500">Upload papers, find the missing link.</p>
      </div>

      <div className="p-6 flex-1 space-y-8">
        {/* Research Area */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Research Area / Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Generative AI in Healthcare"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        {/* Drop Zone / File Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Upload Papers (PDF)
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-colors group"
          >
            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
            <p className="text-sm text-slate-600 font-medium">Click to upload PDFs</p>
            <p className="text-xs text-slate-400 mt-1">or plain text files</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt"
              multiple
              className="hidden" 
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 mt-2">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-100 group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="text-xs text-indigo-900 truncate font-medium max-w-[180px]">
                      {f.file.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:bg-indigo-200 rounded-md transition-colors text-indigo-400 hover:text-indigo-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Abstracts Text Area */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Paste Abstracts (Optional)
          </label>
          <textarea
            value={abstracts}
            onChange={(e) => setAbstracts(e.target.value)}
            placeholder="Paste text abstracts here for quick context..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm h-32 resize-none"
          />
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 border-t border-slate-100 bg-white z-10">
        <button
          onClick={onSynthesize}
          disabled={isLoading || (!files.length && !abstracts && !topic)}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all shadow-lg shadow-indigo-200 ${
            isLoading || (!files.length && !abstracts && !topic)
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Synthesize & Hunt Gaps</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};