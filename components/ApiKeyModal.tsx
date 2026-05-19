import React, { useState } from 'react';
import { Key, Save, X, Info } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
    const [keyInput, setKeyInput] = useState(localStorage.getItem('GEMINI_API_KEY') || '');

    if (!isOpen) return null;

    const handleSave = () => {
        if (keyInput.trim()) {
            localStorage.setItem('GEMINI_API_KEY', keyInput.trim());
            window.location.reload(); // Reload to pick up the key globally
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center p-4 border-b border-white/5">
                    <h2 className="text-white font-bold flex items-center gap-2">
                        <Key size={18} className="text-indigo-400" /> API Configuration
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-400">
                        <X size={18} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 p-3 rounded-lg flex items-start gap-3 text-sm">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <p>This action requires a Gemini API Key to continue. Your key is stored locally in your browser and never sent to our servers.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gemini API Key</label>
                        <input
                            type="password"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!keyInput.trim()}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition"
                    >
                        <Save size={18} /> Save API Key
                    </button>
                </div>
            </div>
        </div>
    );
};
