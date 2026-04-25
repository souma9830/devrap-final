import { useState } from 'react';
import { FileText, ClipboardList, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface PrescriptionInputProps {
  onAnalyze: (text: string) => void;
}

const EXAMPLE_RX = `Crocin Advance (Paracetamol 500mg) - 2 times daily
Augmentin 625 Duo - after meals
Lipitor 10mg - once at night`;

export default function PrescriptionInput({ onAnalyze }: PrescriptionInputProps) {
  const [text, setText] = useState('');

  const handlePreFill = () => setText(EXAMPLE_RX);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Prescription Input</h2>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black">V2.4 ENGINE</span>
        </div>
        <button 
          onClick={handlePreFill}
          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter"
        >
          Use Example Rx
        </button>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter medicine names..."
          className="w-full h-32 p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-mono text-slate-700"
        />
        <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono">
          {text.length} chars
        </div>
      </div>

      <button
        onClick={() => onAnalyze(text)}
        disabled={!text.trim()}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:grayscale group active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        <span>Re-Analyze Plan</span>
      </button>

      <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 bg-amber-100 rounded flex items-center justify-center mt-0.5">
            <Info className="w-2.5 h-2.5 text-amber-600" />
          </div>
          <p className="text-[9px] text-slate-500 leading-tight font-medium">
            Clinical validation active. AI matches bio-equivalent salts across network pharmacies.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Info(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  );
}
