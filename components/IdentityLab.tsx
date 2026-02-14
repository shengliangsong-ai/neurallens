
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Camera, Upload, ShieldCheck, ShieldAlert, Loader2, User, Check, X, FileText, Info, Fingerprint, Zap, Sparkles, Activity, Target, HardDrive, RefreshCw, Download, ZoomIn, ZoomOut, RotateCw, Move, Maximize, Scissors, AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { auth, db } from '../services/firebaseConfig';
import { uploadFileToStorage, deductCoins, AI_COSTS, getUserProfile } from '../services/firestoreService';
import { generateSecureId } from '../utils/idUtils';
import { resizeImage } from '../utils/imageUtils';
import { UserProfile, BiometricShard } from '../types';
import { NeuralRetinaGraph } from './NeuralRetinaGraph';
import { MarkdownView } from './MarkdownView';

interface IdentityLabProps {
  onBack: () => void;
  userProfile: UserProfile | null;
  onOpenManual?: () => void;
}

interface CropState {
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

export const IdentityLab: React.FC<IdentityLabProps> = ({ onBack, userProfile, onOpenManual }) => {
  const [step, setStep] = useState<'upload' | 'adjust_id' | 'capture' | 'verify' | 'result'>('upload');
  const [idImage, setIdImage] = useState<string | null>(null);
  const [trimmedIdPhoto, setTrimmedIdPhoto] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [shard, setShard] = useState<BiometricShard | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Adjustment State
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatchLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' | 'trace' = 'info', meta?: any) => {
      window.dispatchEvent(new CustomEvent('neural-log', { 
          detail: { 
              text: `[Biometric] ${text}`, 
              type, 
              meta 
          } 
      }));
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 480, facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError("Camera access refused.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const b64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
        setSelfieImage(b64);
        stopCamera();
        setStep('verify');
      }
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      dispatchLog(`Ingesting document: ${e.target.files[0].name}`, 'info');
      const b64 = await resizeImage(e.target.files[0], 1200, 0.85);
      setIdImage(b64);
      setStep('adjust_id');
      autoDetectFace(b64);
    }
  };

  /**
   * Neural Auto-Adjustment:
   * Uses Gemini 3 Flash to detect the face and calculate optimal crop parameters.
   */
  const autoDetectFace = async (b64: string) => {
      setIsProcessing(true);
      setProcessStatus("Auto-locating ID photo...");
      dispatchLog("Phase 1: Dispatching image for spatial detection.", "info", { mass_kb: Math.round(b64.length / 1024) });
      
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: {
                  parts: [
                      { inlineData: { data: b64.split(',')[1], mimeType: 'image/jpeg' } },
                      { text: "Detect the main person's face in this identity document. Ignore backgrounds. Focus only on the headshot. Return the bounding box as JSON: { ymin: number, xmin: number, ymax: number, xmax: number }. Values should be integers 0-1000 representing normalized percentage of image dimensions." }
                  ]
              },
              config: { responseMimeType: 'application/json' }
          });
          
          const rawText = response.text || '{}';
          dispatchLog("Phase 2: Neural response received.", "trace", { raw: rawText });
          
          const box = JSON.parse(rawText);
          if (box.ymin !== undefined && box.xmin !== undefined) {
              dispatchLog(`Phase 3: Bounding box parsed. x:[${box.xmin}-${box.xmax}] y:[${box.ymin}-${box.ymax}]`, "success", box);
              
              // Target: Center the face in our 320px UI circle
              const centerX = (box.xmin + box.xmax) / 2;
              const centerY = (box.ymin + box.ymax) / 2;
              
              // Calculate width of face in normalized units
              const faceWidthNorm = box.xmax - box.xmin;
              
              // scale logic: we want the face width to be roughly 140-160px within a 320px frame
              // Normalized width of 1000 maps to display width of 320.
              // So, scale = TargetWidthPx / (FaceWidthNorm * (320 / 1000))
              const targetFaceWidthPx = 150;
              const scale = Math.max(1, targetFaceWidthPx / (faceWidthNorm * (320 / 1000)));

              // Offset logic:
              // Normalized center of 500 should map to UI center (0 offset)
              // (500 - normalizedActual) * (pixelsPerUnit) * scale
              const calculatedX = (500 - centerX) * (320 / 1000) * scale;
              const calculatedY = (500 - centerY) * (320 / 1000) * scale;

              const newState = {
                  x: calculatedX,
                  y: calculatedY,
                  scale: scale,
                  rotation: 0
              };

              setCrop(newState);
              dispatchLog("Phase 4: Adjustment matrix synchronized.", "success", newState);
          } else {
              throw new Error("Handshake successful but no valid bounding box located.");
          }
      } catch (e: any) {
          dispatchLog(`Spatial detection fault: ${e.message}`, "error", { error: e });
          setCrop({ x: 0, y: 0, scale: 1, rotation: 0 });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleFinalizeTrim = () => {
    const canvas = canvasRef.current;
    if (!canvas || !idImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Output is standardized to 512x512 for the Pro audit
    canvas.width = 512;
    canvas.height = 512;

    const img = new Image();
    img.onload = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 512, 512);

        // Map UI crop state to canvas space
        const uiScaleFactor = 512 / 320;

        ctx.save();
        ctx.translate(256, 256);
        ctx.rotate((crop.rotation * Math.PI) / 180);
        ctx.scale(crop.scale * uiScaleFactor, crop.scale * uiScaleFactor);
        
        // Final Bake Transform
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
        ctx.translate(256, 256);
        ctx.rotate((crop.rotation * Math.PI) / 180);
        ctx.scale(crop.scale * uiScaleFactor, crop.scale * uiScaleFactor);
        
        // Draw image relative to its own center
        ctx.drawImage(img, -img.width / 2 + (crop.x * (img.width/320) / crop.scale), -img.height / 2 + (crop.y * (img.height/320) / crop.scale));
        
        ctx.restore();

        const trimmed = canvas.toDataURL('image/jpeg', 0.9);
        setTrimmedIdPhoto(trimmed);
        setStep('capture');
        startCamera();
    };
    img.src = idImage;
  };

  const runBiometricAudit = async () => {
    if (!trimmedIdPhoto || !selfieImage || !userProfile) return;
    setIsProcessing(true);
    setError(null);
    setProcessStatus("Initializing Biometric Handshake...");
    dispatchLog("Starting high-fidelity parity audit.", "info");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentDate = new Date().toISOString().split('T')[0];

      // Phase 1: Metadata Extraction and Identity Validation (Flash)
      setProcessStatus("Phase 1: Ingesting ID Metadata & Validation...");
      const flashResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: idImage!.split(',')[1], mimeType: 'image/jpeg' } },
            { text: `Extract Name and Expiry Date from this ID. 
              Also compare the extracted name with the profile name: "${userProfile.displayName}". 
              The current date is ${currentDate}.
              
              Return ONLY JSON: 
              { 
                "name": string, 
                "expiry": string, 
                "documentType": string, 
                "nameMatch": boolean, 
                "isExpired": boolean 
              }` 
            }
          ]
        },
        config: { responseMimeType: 'application/json' }
      });
      const idDetails = JSON.parse(flashResponse.text || '{}');
      dispatchLog(`Linguistic Check: Name Match: ${idDetails.nameMatch ? 'PASS' : 'FAIL'}, Valid: ${idDetails.isExpired ? 'EXPIRED' : 'PASS'}`, idDetails.nameMatch && !idDetails.isExpired ? 'success' : 'warn', idDetails);

      // Phase 2: Head-to-Head Biometric Comparison (Pro)
      setProcessStatus("Phase 2: Executing Retina Mesh Audit...");
      const proResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { text: "Trimmed Passport/ID Face Shard:" },
            { inlineData: { data: trimmedIdPhoto.split(',')[1], mimeType: 'image/jpeg' } },
            { text: "Live Biometric Selfie:" },
            { inlineData: { data: selfieImage.split(',')[1], mimeType: 'image/jpeg' } },
            { text: `Act as a Biometric Identity Auditor. Compare the Trimmed ID shard against the Live Selfie. 
              Analyze inter-pupillary distance, jawline structure, and nasal bridges. 
              Since these are both cropped headshots, perform a granular pixel-parity audit.
              Return ONLY JSON:
              {
                "score": number,
                "verdict": "PASS" | "FAIL" | "SUSPICIOUS",
                "analysis": "detailed markdown string",
                "graph": {
                   "nodes": [{"id": "n1", "label": "Iris Alignment", "type": "verification"}, ...],
                   "links": [{"source": "n1", "target": "n2", "label": "Verified"}]
                }
              }`
            }
          ]
        },
        config: { 
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 8000 }
        }
      });

      const auditResult = JSON.parse(proResponse.text || '{}');
      const shardId = generateSecureId();
      
      // Override verdict if document is invalid
      let finalVerdict = auditResult.verdict;
      if (idDetails.isExpired || !idDetails.nameMatch) {
          finalVerdict = 'FAIL';
          dispatchLog("ID Status Overridden: Security policy violation (Name mismatch or Expiry).", "error");
      }

      const newShard: BiometricShard = {
        id: shardId,
        userId: userProfile.uid,
        timestamp: Date.now(),
        similarityScore: auditResult.score,
        verdict: finalVerdict,
        idDetails: idDetails,
        analysis: auditResult.analysis,
        idImage: trimmedIdPhoto,
        selfieImage: selfieImage,
        audit: {
            graph: auditResult.graph,
            probes: [],
            coherenceScore: auditResult.score,
            StructuralCoherenceScore: auditResult.score,
            LogicalDriftRisk: 'Low',
            AdversarialRobustness: 'High',
            driftRisk: 'Low',
            robustness: 'High',
            timestamp: Date.now()
        }
      };

      setShard(newShard);
      setStep('result');
      
      if (auth.currentUser) {
          await deductCoins(auth.currentUser.uid, AI_COSTS.TECHNICAL_EVALUATION);
      }
      
      dispatchLog(`Verification Complete. Verdict: ${finalVerdict}`, finalVerdict === 'PASS' ? 'success' : 'warn');
    } catch (e: any) {
      let friendlyError = e.message || "Neural Handshake Refused.";
      try {
          if (friendlyError.includes('{"error"')) {
              const startIdx = friendlyError.indexOf('{');
              const jsonPart = friendlyError.substring(startIdx);
              const parsed = JSON.parse(jsonPart);
              friendlyError = parsed.error?.message || friendlyError;
          }
      } catch (parseErr) {}
      setError(friendlyError);
      dispatchLog(`Audit Failure: ${friendlyError}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - crop.x, y: e.clientY - crop.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setCrop(prev => ({
          ...prev,
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
      }));
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><ArrowLeft size={20} /></button>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tighter italic">
                    <Fingerprint className="text-indigo-400" /> Identity Lab
                </h1>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Biometric Attestation v2.0</p>
              </div>
          </div>
          {onOpenManual && <button onClick={onOpenManual} className="p-2 text-slate-400 hover:text-white" title="Identity Manual"><Info size={18}/></button>}
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide relative">
          <div className="max-w-5xl mx-auto w-full">
            
            {step === 'upload' && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-fade-in-up">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-900/30 border border-indigo-500/30 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={14}/> Sovereign Identity Audit
                        </div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Step 1: ID Ingestion</h2>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto">Upload a clear photo of your Passport or Driver's License.</p>
                    </div>

                    <label className="w-full max-w-md py-20 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500/50 transition-all bg-slate-900/20 group">
                        <input type="file" className="hidden" accept="image/*" onChange={handleIdUpload} ref={fileInputRef}/>
                        <div className="p-6 bg-slate-900 rounded-full group-hover:bg-indigo-900/30 transition-colors">
                            <Upload className="text-indigo-400" size={40}/>
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">Select Document File</span>
                    </label>
                </div>
            )}

            {step === 'adjust_id' && idImage && (
                <div className="flex flex-col items-center space-y-8 animate-fade-in">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Refractive Tuning</h2>
                        <p className="text-slate-400 text-sm">Center and rotate the face from your ID for the neural comparison.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10 items-center">
                        <div className="space-y-6 bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 w-full lg:w-64">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2"><Maximize size={12}/> Zoom</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setCrop({...crop, scale: Math.max(0.5, crop.scale - 0.1)})} className="p-2 bg-slate-800 rounded-lg"><ZoomOut size={14}/></button>
                                    <input type="range" min="0.5" max="5" step="0.1" value={crop.scale} onChange={e => setCrop({...crop, scale: parseFloat(e.target.value)})} className="flex-1 h-1 bg-slate-700 accent-indigo-500 rounded-full appearance-none" />
                                    <button onClick={() => setCrop({...crop, scale: Math.min(5, crop.scale + 0.1)})} className="p-2 bg-slate-800 rounded-lg"><ZoomIn size={14}/></button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2"><RotateCw size={12}/> Rotation</label>
                                <input type="range" min="-180" max="180" step="1" value={crop.rotation} onChange={e => setCrop({...crop, rotation: parseInt(e.target.value)})} className="w-full h-1 bg-slate-700 accent-indigo-500 rounded-full appearance-none" />
                                <div className="flex justify-between text-[8px] font-mono text-slate-600"><span>-180°</span><span>{crop.rotation}°</span><span>180°</span></div>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <Move size={14}/>
                                    <span className="text-[9px] font-black uppercase">Drag to reposition</span>
                                </div>
                            </div>
                        </div>

                        <div 
                            className="w-80 h-80 rounded-full border-4 border-indigo-500/50 overflow-hidden bg-black relative shadow-2xl cursor-move touch-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img 
                                src={idImage} 
                                className="absolute pointer-events-none select-none max-w-none" 
                                style={{ 
                                    transform: `translate(${crop.x}px, ${crop.y}px) rotate(${crop.rotation}deg) scale(${crop.scale})`,
                                    transformOrigin: 'center'
                                }} 
                                draggable={false}
                            />
                            {/* Target Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-[1px] border-indigo-500/30 rounded-full shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-indigo-500/50 rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={handleFinalizeTrim} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 active:scale-95 transition-all">
                            <Scissors size={20}/> Confirm Trim
                        </button>
                        <button onClick={() => { setStep('upload'); setIdImage(null); }} className="p-5 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all"><X size={24}/></button>
                    </div>

                    {isProcessing && (
                        <div className="flex items-center gap-3 text-indigo-400 animate-pulse">
                            <Loader2 size={16} className="animate-spin"/>
                            <span className="text-xs font-black uppercase tracking-widest">{processStatus}</span>
                        </div>
                    )}
                </div>
            )}

            {step === 'capture' && (
                <div className="flex flex-col items-center space-y-10 animate-fade-in">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Step 2: Biometric Attestation</h2>
                        <p className="text-slate-400 text-sm">Position your face within the neural portal for a live similarity check.</p>
                    </div>

                    <div className="w-80 h-80 rounded-full border-8 border-slate-900 overflow-hidden relative shadow-2xl bg-black">
                        {isCameraActive ? (
                            <video ref={videoRef} className="w-full h-full object-cover scale-125" autoPlay playsInline muted />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-800"><Camera size={48} className="animate-pulse" /></div>
                        )}
                        <div className="absolute inset-0 pointer-events-none border-[20px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-indigo-500/10"></div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={captureSelfie} className="px-12 py-4 bg-indigo-600 hover:bg-indigo-50 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                            <Camera size={20}/> Capture
                        </button>
                        <button onClick={() => { stopCamera(); setStep('adjust_id'); }} className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-red-600 transition-all"><X size={24}/></button>
                    </div>
                </div>
            )}

            {step === 'verify' && (
                <div className="max-w-2xl mx-auto space-y-10 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-8">
                        <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 overflow-hidden shadow-xl"><img src={trimmedIdPhoto!} className="w-full h-full object-cover" /></div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-full"><Sparkles className="text-indigo-400" /></div>
                        <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 overflow-hidden shadow-xl"><img src={selfieImage!} className="w-full h-full object-cover" /></div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl text-center space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Ready for Refraction</h2>
                            <p className="text-slate-400 text-sm">Gemini 3 Pro will now execute a high-fidelity parity audit.</p>
                        </div>

                        {isProcessing ? (
                            <div className="space-y-6 animate-pulse">
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center"><Activity size={32} className="text-indigo-400" /></div>
                                </div>
                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{processStatus}</p>
                            </div>
                        ) : (
                            <button onClick={runBiometricAudit} className="w-full py-5 bg-indigo-600 hover:bg-indigo-50 text-white rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-900/40 transition-all active:scale-95">Execute Neural Audit</button>
                        )}
                        
                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-2xl text-red-200 text-xs font-bold flex items-center gap-2">
                                <ShieldAlert size={16}/> {error}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 'result' && shard && (
                <div className="space-y-12 animate-fade-in pb-32">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-800 pb-10">
                        <div className="flex items-center gap-6">
                            <div className={`p-6 rounded-[2.5rem] border-4 shadow-2xl ${shard.verdict === 'PASS' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
                                {shard.verdict === 'PASS' ? <ShieldCheck size={48}/> : <ShieldAlert size={48}/>}
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Identity: {shard.verdict}</h2>
                                <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mt-3">Refracted Score: {shard.similarityScore}% Parity</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('upload')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">New Audit</button>
                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"><Download size={14}/> Trust Shard</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-xl space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2 px-2">
                                    <FileText size={16} className="text-indigo-400"/> Refracted Metadata
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-600 uppercase">Document Name</p>
                                        <p className="text-sm font-bold text-white truncate">{shard.idDetails.name || '---'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-600 uppercase">Expiry Node</p>
                                        <p className="text-sm font-bold text-white">{shard.idDetails.expiry || '---'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[9px] font-black text-slate-500 uppercase px-2">Integrity Checks</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${shard.idDetails.nameMatch ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'}`}>
                                            <div className="flex items-center gap-3">
                                                <User size={16}/>
                                                <span className="text-[10px] font-black uppercase">Name Match against Profile</span>
                                            </div>
                                            {shard.idDetails.nameMatch ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                                        </div>
                                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${!shard.idDetails.isExpired ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'}`}>
                                            <div className="flex items-center gap-3">
                                                <Calendar size={16}/>
                                                <span className="text-[10px] font-black uppercase">Document Expiry Check</span>
                                            </div>
                                            {!shard.idDetails.isExpired ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase mb-3">Verification Narrative</p>
                                    <div className="text-xs text-slate-400 leading-relaxed max-h-40 overflow-y-auto scrollbar-hide">
                                        <MarkdownView content={shard.analysis} compact />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {shard.audit?.graph && (
                            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-xl">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2 px-2">
                                    <Target size={16}/> Biometric Retina Mesh
                                </h3>
                                <div className="h-[450px]">
                                    <NeuralRetinaGraph data={{
                                        audit_id: shard.id,
                                        timestamp: new Date(shard.timestamp).toISOString(),
                                        nodes: shard.audit.graph.nodes.map((n:any) => ({ ...n, status: shard.verdict as any })),
                                        edges: shard.audit.graph.links
                                    }} className="h-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
      </main>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default IdentityLab;
