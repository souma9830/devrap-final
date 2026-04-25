import { Copy, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ScriptBoxProps {
  script: string;
}

export default function ScriptBox({ script }: ScriptBoxProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(script);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between border-l-4 border-emerald-500 shadow-lg mb-6">
      <div>
        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Copy for Pharmacist</p>
        <p className="text-white italic font-serif mt-1 text-sm sm:text-base leading-relaxed tracking-tight">
          "{script}"
        </p>
      </div>
      <button 
        onClick={handleCopy}
        className="shrink-0 flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors active:scale-95"
      >
        <Copy className="w-4 h-4 text-emerald-500" />
        <span className="hidden sm:inline">Copy Script</span>
      </button>
    </div>
  );
}
