import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Cpu, Pill, Store, DollarSign } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: Upload,
    title: "1. Provide Your Prescription",
    description: "Upload an image of your physical prescription or type in the medicine names directly.",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Cpu,
    title: "2. AI Analysis & Parsing",
    description: "Our advanced intelligence engine analyzes the input to extract active salts, dosage, and frequency.",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    icon: Pill,
    title: "3. Generic Discovery",
    description: "We instantly find FDA-validated, bioequivalent generic alternatives that are medically identical to expensive brands.",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Store,
    title: "4. Pharmacy Intelligence",
    description: "RxRadar scans local and online pharmacies in real-time to find you the absolute lowest prices available.",
    color: "bg-pink-100 text-pink-600"
  },
  {
    icon: DollarSign,
    title: "5. Smart Savings",
    description: "Review your options, get smart buy decisions, and save up to 80% on your healthcare costs.",
    color: "bg-green-100 text-green-600"
  }
];

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">How RxRadar Works</h2>
                <p className="text-sm text-gray-500 mt-1">Your journey to smarter healthcare savings</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-6 relative">
                    {/* Connecting Line */}
                    {index !== steps.length - 1 && (
                      <div className="absolute left-[1.6rem] top-14 bottom-[-2rem] w-0.5 bg-gray-200" />
                    )}
                    
                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${step.color} shadow-sm z-10`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="pt-2 pb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button 
                  onClick={onClose}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
               >
                  Got it, let's start
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
