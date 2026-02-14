
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Loader2, AlertCircle, Maximize2, RefreshCw, ZoomIn, ZoomOut, Download, Activity } from 'lucide-react';

export interface AuditNode {
  id: string;
  type: 'document' | 'claim' | 'verification' | 'evidence' | string;
  label: string;
  status: 'PASS' | 'FAIL' | 'WARN' | string;
}

export interface AuditEdge {
  source: string;
  target: string;
  label?: string;
}

export interface AuditData {
  audit_id: string;
  timestamp: string;
  nodes: AuditNode[];
  edges: AuditEdge[];
}

interface NeuralRetinaGraphProps {
  data: AuditData;
  className?: string;
}

/**
 * Neural Retina Graph:
 * A high-fidelity observability component that refracts structured JSON 
 * into verifiable logic meshes using Mermaid.js.
 * Hardened for v12.9.6 to prevent "Logic Structure Breach" parsing errors.
 */
export const NeuralRetinaGraph: React.FC<NeuralRetinaGraphProps> = ({ data, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [zoom, setZoom] = useState(1);

  // --- Programmatic Logic Refraction ---
  const jsonToMermaid = (audit: AuditData): string => {
    // ROBUST SANITIZATION: IDs must be strictly alphanumeric or underscores.
    const sanitizeId = (id: any) => {
        const str = (id === null || id === undefined) ? 'unknown' : String(id);
        return 'n_' + str.replace(/[^a-zA-Z0-9]/g, '_');
    };

    // LABELS: Wrap in double quotes and escape any characters that break Mermaid syntax.
    const escapeLabel = (label: any) => {
        const str = (label === null || label === undefined) ? 'Unlabeled' : String(label);
        // Remove brackets, parentheses, and other control characters that interfere with Mermaid parsing even inside quotes.
        return str.replace(/[\[\]\(\)\{\}\<\>]/g, '').replace(/"/g, "'").trim();
    };

    // CLASSES: Must be single words.
    const sanitizeClass = (cls: any) => {
        const str = (cls === null || cls === undefined) ? 'default' : String(cls);
        return str.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    };

    let lines = ['graph TD'];

    // 1. Node Definitions
    if (Array.isArray(audit.nodes)) {
        audit.nodes.forEach(node => {
            const id = sanitizeId(node.id);
            const label = escapeLabel(node.label);
            const typeClass = sanitizeClass(node.type);
            const statusClass = node.status ? `status_${sanitizeClass(node.status)}` : '';
            
            // Choose shape based on type
            let open = '[', close = ']';
            if (node.type === 'claim') { open = '{{'; close = '}}'; }
            else if (node.type === 'verification') { open = '{'; close = '}'; }
            else if (node.type === 'evidence') { open = '[('; close = ')]'; }

            lines.push(`  ${id}${open}"${label}"${close}`);
            
            // Apply classes
            if (typeClass) lines.push(`  class ${id} ${typeClass}`);
            if (statusClass) lines.push(`  class ${id} ${statusClass}`);
        });
    }

    // 2. Edge Definitions
    if (Array.isArray(audit.edges)) {
        audit.edges.forEach(edge => {
            const src = sanitizeId(edge.source);
            const tgt = sanitizeId(edge.target);
            // CRITICAL FIX: Added closing pipe | for labeled edges in Mermaid
            const label = edge.label ? `|"${escapeLabel(edge.label)}"|` : '';
            lines.push(`  ${src} -->${label} ${tgt}`);
        });
    }

    // 3. Style Matrix Definitions
    lines.push('  classDef document fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b');
    lines.push('  classDef claim fill:#fff9c4,stroke:#fbc02d,stroke-width:2px,color:#7b5e00');
    lines.push('  classDef evidence fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c');
    lines.push('  classDef verification fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a237e');
    
    // Status Overrides (High Contrast)
    lines.push('  classDef status_pass fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px,color:#1b5e20');
    lines.push('  classDef status_fail fill:#ffebee,stroke:#c62828,stroke-width:3px,color:#b71c1c');
    lines.push('  classDef status_warn fill:#fff3e0,stroke:#ef6c00,stroke-width:3px,color:#e65100');

    return lines.join('\n');
  };

  const mermaidCode = useMemo(() => jsonToMermaid(data), [data]);

  useEffect(() => {
    const renderDiagram = async () => {
      const mermaid = (window as any).mermaid;
      if (!mermaid) return;

      setIsRendering(true);
      setError(null);

      try {
        // Re-init with explicit clear state
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'basis' }
        });

        const id = `retina-graph-${(Math.random() * 10000).toFixed(0)}`;
        // Clear previous output before rendering
        if (containerRef.current) containerRef.current.innerHTML = '';
        
        const { svg } = await mermaid.render(id, mermaidCode);
        setSvg(svg);
      } catch (err: any) {
        console.error("[RetinaGraph] Refraction Fault:", err);
        setError(err.message || "Logic synthesis breach.");
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  const handleDownloadSVG = () => {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NeuralAudit_${(data.audit_id || 'trace').substring(0, 8)}.svg`;
      a.click();
      URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className={`p-8 bg-red-950/20 border border-red-500/30 rounded-[2.5rem] flex flex-col items-center gap-4 text-center ${className}`}>
        <AlertCircle className="text-red-500" size={48} />
        <div>
            <h3 className="text-lg font-black text-white uppercase italic">Logic Structure Breach</h3>
            <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">The AI produced a graph with invalid syntax. Resetting handshake...</p>
            <p className="text-[10px] text-slate-700 font-mono mt-4 break-all opacity-50">{error}</p>
        </div>
        <div className="w-full bg-black/40 rounded-2xl p-4 overflow-x-auto text-left shadow-inner">
            <pre className="text-[9px] font-mono text-indigo-300 leading-tight">{mermaidCode}</pre>
        </div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Hard Reset Node</button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl transition-all ${className}`}>
      {/* Header UI */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Activity size={18}/>
              </div>
              <div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Neural Retina Graph</h4>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Shard: {(data.audit_id || '---').substring(0, 16)}...</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 text-slate-500 hover:text-white transition-colors" title="Zoom Out"><ZoomOut size={16}/></button>
              <span className="text-[9px] font-mono font-bold text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-2 text-slate-500 hover:text-white transition-colors" title="Zoom In"><ZoomIn size={16}/></button>
              <div className="w-px h-4 bg-slate-800 mx-1"></div>
              <button onClick={handleDownloadSVG} className="p-2 text-slate-400 hover:text-indigo-400 transition-all" title="Download SVG Artifact"><Download size={16}/></button>
              <button onClick={() => setZoom(1)} className="p-2 text-slate-400 hover:text-white transition-all" title="Reset Zoom"><RefreshCw size={16}/></button>
          </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-white/5 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center p-8">
          {isRendering ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Rasterizing Logic Mesh...</span>
              </div>
          ) : (
              <div 
                className="transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing transform-gpu"
                style={{ transform: `scale(${zoom})` }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
          )}
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap gap-y-2 justify-between items-center shrink-0 px-6">
          <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-sky-400 opacity-60"></div><span className="text-[8px] font-black uppercase text-slate-500">Document</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-yellow-400 opacity-60"></div><span className="text-[8px] font-black uppercase text-slate-500">Claim</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-indigo-400 opacity-60"></div><span className="text-[8px] font-black uppercase text-slate-500">Verification</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-purple-400 opacity-60"></div><span className="text-[8px] font-black uppercase text-slate-500">Evidence</span></div>
              <div className="w-px h-3 bg-slate-800"></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[8px] font-black uppercase text-emerald-600">PASS</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[8px] font-black uppercase text-red-600">FAIL</span></div>
          </div>
          <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">Sovereignty Verified // {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '---'}</p>
      </div>
    </div>
  );
};

export default NeuralRetinaGraph;
