import React, { useState } from 'react';
import { X, Key, Check } from 'lucide-react';
import { UserProfile, SubscriptionTier } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSuccess: (tier: SubscriptionTier) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-amber-500/20 rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors z-20">
          <X size={16} />
        </button>

        <div className="absolute top-0 right-0 p-32 bg-amber-600/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="p-8 pb-10 text-center relative z-10">
          <div className="w-20 h-20 bg-slate-950 rounded-3xl border border-amber-500/30 flex items-center justify-center mx-auto mb-6 shadow-inner text-amber-500">
            <Key size={40} />
          </div>

          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">Set API Key</h2>
          
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
            This application is now public and fully unlocked. However, since it requires the Gemini API, you must provide your own API Key to continue.
          </p>

          <button 
             onClick={() => {
                import('../utils/aiConfig').then(m => {
                   if (m.promptForGeminiKey()) {
                       window.location.reload();
                   }
                });
             }}
             className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 bg-amber-500 hover:bg-amber-400 text-slate-950"
          >
             Set Gemini Token
          </button>
        </div>
      </div>
    </div>
  );
};
