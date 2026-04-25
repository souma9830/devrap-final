import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Analyzing prescription...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm border-dashed">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-12 h-12 text-blue-600" />
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 text-gray-500 font-medium animate-pulse"
      >
        {message}
      </motion.p>
    </div>
  );
}
