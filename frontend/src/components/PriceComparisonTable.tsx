import { MedicinePrice } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Store, Clock, Star, ArrowUpRight } from 'lucide-react';

interface PriceComparisonTableProps {
  prices: MedicinePrice[];
}

export default function PriceComparisonTable({ prices }: PriceComparisonTableProps) {
  const sortedPrices = [...prices].sort((a, b) => a.pricePerUnit - b.pricePerUnit);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 tracking-wider">Network Price Intelligence</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-slate-400 border-b border-slate-100">
              <th className="pb-2 font-black uppercase tracking-widest">Pharmacy Provider</th>
              <th className="pb-2 font-black uppercase tracking-widest text-center">Status</th>
              <th className="pb-2 font-black uppercase tracking-widest text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedPrices.map((p, idx) => (
              <tr key={p.pharmacy} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                    {p.pharmacy.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{p.pharmacy}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{p.distanceKm}km away</div>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
                    idx === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {idx === 0 ? "CHEAPEST" : p.availability === 'In Stock' ? "IN STOCK" : "LIMITED"}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className={cn(
                    "text-sm font-bold",
                    idx === 0 ? "text-emerald-600 font-black" : "text-slate-800"
                  )}>
                    {formatCurrency(p.pricePerUnit)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(' ');
}
