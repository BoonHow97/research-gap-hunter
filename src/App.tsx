import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ResultsView } from './components/ResultsView';
import { FileData, AnalysisResult } from './types/type';
import { synthesizeResearch } from './services/geminiServer';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [abstracts, setAbstracts] = useState('');
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSynthesize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // The service now returns the parsed JSON object directly
      const data = await synthesizeResearch(topic, abstracts, files);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      
      <Sidebar 
        topic={topic}
        setTopic={setTopic}
        abstracts={abstracts}
        setAbstracts={setAbstracts}
        files={files}
        setFiles={setFiles}
        onSynthesize={handleSynthesize}
        isLoading={isLoading}
      />

      <div className="flex-1 relative">
        {error && (
            <div className="absolute top-6 left-6 right-6 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
              <button onClick={() => setError(null)} className="ml-auto text-sm hover:underline">Dismiss</button>
            </div>
        )}
        
        <ResultsView result={result} />
      </div>
    </div>
  );
};

export default App;