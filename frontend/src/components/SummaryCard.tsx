import { motion } from 'motion/react';
import { TrendingDown, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface SummaryCardProps {
  totalCurrent: number;
  totalOptimized: number;
  totalSavings: number;
}

export default function SummaryCard({ totalCurrent, totalOptimized, totalSavings }: SummaryCardProps) {
  const savingsPercent = Math.round((totalSavings / totalCurrent) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-900 rounded-2xl shadow-xl p-6 text-white overflow-hidden relative"
    >
      <div className="relative z-10">
        <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Total Savings Opportunity</p>
        <h3 className="text-4xl font-bold mt-1 tracking-tight">
          {formatCurrency(totalSavings).replace('₹', '')}
          <span className="text-lg font-normal opacity-80 decoration-currency-symbol">₹</span>
        </h3>
        
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="opacity-60 font-medium">Standard Cost</span>
            <span className="line-through opacity-60">{formatCurrency(totalCurrent)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="opacity-60 font-medium">Optimized Cost</span>
            <span className="text-lg font-semibold text-emerald-400">{formatCurrency(totalOptimized)}</span>
          </div>
          <div className="h-px bg-blue-800 my-2"></div>
          <div className="flex items-center text-emerald-400 text-sm font-bold">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            {savingsPercent}% Reduction Achieved
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-800 rounded-full opacity-50 blur-2xl" />
    </motion.div>
  );
}
