import { Search, Info, ShieldCheck, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Rx</div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            RxRadar
          </span>
        </Link>
        
        <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-500">
          <Link to="/analyze" className="text-blue-600 border-b-2 border-blue-600 h-14 flex items-center">Intelligence Dashboard</Link>
          <a href="#features" className="hover:text-slate-800 h-14 flex items-center transition-colors">Price History</a>
          <a href="#how-it-works" className="hover:text-slate-800 h-14 flex items-center transition-colors">Savings Reports</a>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full">
          <span className="text-[10px] font-bold text-emerald-700 tracking-wider">SAVING 64% TODAY</span>
        </div>
        <div className="w-8 h-8 bg-slate-200 rounded-full border border-slate-300"></div>
      </div>
    </nav>
  );
}
