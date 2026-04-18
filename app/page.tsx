'use client';
import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('resume');
  const [status, setStatus] = useState('Awaiting input...');
  
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // The function you already built
  const handleIngest = async () => {
    setStatus('Ingesting... translating to math...');
    const response = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source }),
    });

    if (response.ok) {
      setStatus('Success: Data burned into the neural core.');
      setText('');
    } else {
      setStatus('Error: Failed to ingest data.');
    }
  };

  // The NEW function to trigger the AI analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis('Connecting to Gemini... querying the vector vault... generating brutal feedback...');
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription: jobDesc }),
    });

    if (response.ok) {
      const data = await response.json();
      setAnalysis(data.analysis);
    } else {
      setAnalysis('Critical Error: Failed to generate analysis.');
    }
    setIsAnalyzing(false);
  };

  return (
    <main className="min-h-screen bg-black text-white p-10 flex flex-col md:flex-row gap-10 font-mono">
      
      {/* LEFT PANEL: The Memory Ingestion (You already built this) */}
      <div className="flex-1 space-y-6 border border-gray-800 p-6 rounded-lg bg-gray-950">
        <h1 className="text-2xl font-bold text-green-400">1. Feed the Core</h1>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white outline-none">
          <option value="resume">My Resume Skill</option>
        </select>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-40 bg-gray-900 border border-gray-700 p-4 rounded text-white outline-none resize-none" placeholder="I built a Next.js RAG application..." />
        <button onClick={handleIngest} className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-4 rounded transition-colors">
          Vectorize & Store
        </button>
        <div className="text-sm text-gray-500">Status: <span className="text-white">{status}</span></div>
      </div>

      {/* RIGHT PANEL: The Brain / Analysis */}
      <div className="flex-1 space-y-6 border border-gray-800 p-6 rounded-lg bg-gray-950 flex flex-col">
        <h1 className="text-2xl font-bold text-purple-400">2. Interrogate the AI</h1>
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} className="w-full h-40 bg-gray-900 border border-gray-700 p-4 rounded text-white outline-none resize-none" placeholder="Paste a MAANG Job Description here..." />
        <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-gray-700">
          {isAnalyzing ? 'Analyzing...' : 'Generate Brutal Feedback'}
        </button>
        
        {/* The Output Screen */}
        <div className="flex-1 bg-black border border-gray-800 p-4 rounded overflow-y-auto min-h-[250px] whitespace-pre-wrap">
          {analysis || <span className="text-gray-600">AI output will appear here...</span>}
        </div>
      </div>

    </main>
  );
}