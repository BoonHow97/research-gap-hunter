import React, { useEffect, useRef, useState } from 'react';
import { AnalysisResult } from '../types';
import { AlertCircle, Lightbulb, PenTool, Layers } from 'lucide-react';
import mermaid from 'mermaid';

interface ResultsViewProps {
  result: AnalysisResult | null;
}

// Initialize mermaid configuration
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif'
});

const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!code) return;

    const renderDiagram = async () => {
      // 1. Clean up code logic
      let cleanCode = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
      // Sanitation: Wrap unquoted node labels in quotes
      cleanCode = cleanCode.replace(/\[([^"\]]+)\]/g, '["$1"]');

      // 2. Wait for next frame to ensure DOM is ready and avoid race conditions
      await new Promise(resolve => requestAnimationFrame(resolve));

      if (!isMounted.current) return;

      try {
        setError(false);
        // 3. Unique ID to prevent collisions in Mermaid's temporary DOM elements
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // 4. Render the SVG
        const { svg: renderedSvg } = await mermaid.render(id, cleanCode);
        
        if (isMounted.current) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        if (isMounted.current) {
          setError(true);
        }
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-mono whitespace-pre-wrap overflow-auto max-w-full">
        <p className="font-bold mb-2">Diagram Syntax Error</p>
        {code}
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center p-6 bg-white rounded-lg overflow-x-auto min-h-[200px]"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-screen bg-slate-50 p-8 text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
          <Layers className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Ready to Hunt</h2>
        <p className="text-slate-500 max-w-md">
          Enter a research topic and upload papers on the left to begin your gap analysis.
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-slate-50 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section 1: Gap Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="bg-orange-50/50 px-8 py-4 border-b border-orange-100 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-orange-900">The Gap Analysis</h2>
          </div>
          <div className="p-8">
            <p className="text-lg text-slate-700 leading-relaxed font-medium">
              {result.gapAnalysis}
            </p>
          </div>
        </div>

        {/* Section 2: Proposal */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-50/50 px-8 py-4 border-b border-emerald-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-emerald-900">Research Proposal</h2>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Title</h3>
              <h1 className="text-2xl font-bold text-slate-900">{result.proposal.title}</h1>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Abstract</h3>
              <p className="text-slate-600 leading-relaxed">{result.proposal.abstract}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Methodology</h3>
              <div className="prose prose-sm max-w-none text-slate-600">
                {result.proposal.methodology.split('\n').map((line, i) => (
                   <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Visual Concept */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
          <div className="bg-indigo-50/50 px-8 py-4 border-b border-indigo-100 flex items-center gap-3">
             <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <PenTool className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-indigo-900">Visual Concept</h2>
          </div>
          <div className="p-8">
             {result.mermaidCode ? (
               <div className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                  <MermaidDiagram code={result.mermaidCode} />
               </div>
             ) : (
                <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center text-center">
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">No Diagram Generated</span>
                  <p className="text-slate-500 italic">"The model did not return a valid flowchart for this run."</p>
                </div>
             )}
          </div>
        </div>

      </div>
    </main>
  );
};