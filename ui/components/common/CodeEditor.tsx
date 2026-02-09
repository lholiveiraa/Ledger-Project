
import React from 'react';
import { Copy } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, language = 'yaml', readOnly = true }) => {
  const lines = code.split('\n');

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl group">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{language}</span>
          <button className="text-slate-500 hover:text-white transition-colors">
            <Copy size={14} />
          </button>
        </div>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto custom-scrollbar flex">
        <div className="text-slate-700 pr-4 select-none text-right border-r border-slate-900/50">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre className="pl-4 flex-1 text-indigo-100">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
