import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Image as ImageIcon, Video, Upload, X, Filter, 
  Loader2, Globe, Download, Play, Pause, ExternalLink, 
  Coffee, Music, Music4, Sparkles, Code2, Zap, PlayCircle,
  Volume2, FastForward, RotateCcw
} from 'lucide-react';

// API Configuration - Environment provides this
const apiKey = ""; 

export default function App() {
  const [searchMode, setSearchMode] = useState('image'); // 'image', 'video', 'audio', or 'gen'
  const [query, setQuery] = useState('');
  const [refImage, setRefImage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [takingLong, setTakingLong] = useState(false);
  const [results, setResults] = useState([]);
  const [aiAnimation, setAiAnimation] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  
  const audioRef = useRef(new Audio());
  const fileInputRef = useRef(null);

  // --- AUDIO LOGIC ---
  const toggleAudio = (url) => {
    if (playingAudio === url) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play().catch(e => console.error("Playback failed", e));
      setPlayingAudio(url);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      if (audio.duration) setAudioProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => {
      setPlayingAudio(null);
      setAudioProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  // --- DOWNLOAD LOGIC ---
  const downloadMedia = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || `VisionFetch_${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  // --- AI GENERATION ENGINE ---
  const generateAIVideo = async (prompt) => {
    setIsSearching(true);
    setAiAnimation(null);
    try {
      const systemPrompt = `You are an elite motion graphics engineer. 
      Generate a sophisticated, highly detailed, and cinematic SVG animation based on the description.
      Use complex <animate>, <animateTransform>, and CSS @keyframes within the SVG.
      Ensure the colors are vibrant (gradients) and the movement is smooth.
      Respond ONLY with the SVG code.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      const data = await response.json();
      const rawSvg = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawSvg) {
        setAiAnimation(rawSvg.replace(/```svg|```html|```/g, '').trim());
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // --- GLOBAL SEARCH ENGINE ---
  const performSearch = async () => {
    if (searchMode === 'gen') return generateAIVideo(query);
    
    setIsSearching(true);
    setResults([]);
    const timer = setTimeout(() => setTakingLong(true), 6000);

    try {
      // Force search into professional stock domains
      const stockFilter = "site:pexels.com OR site:pixabay.com OR site:unsplash.com OR site:mixkit.co";
      const fullQuery = `${query} ${stockFilter}`;
      
      const response = await fetch(`https://back-zm11.onrender.com/search?query=${encodeURIComponent(fullQuery)}&mode=${searchMode}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      clearTimeout(timer);
      setIsSearching(false);
      setTakingLong(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Cinematic Background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full" />
      </div>

      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Vision<span className="text-blue-500 italic">ULTRA</span></span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-bold text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Stock Library</span>
            <span className="hover:text-white cursor-pointer transition-colors">AI Lab</span>
            <span className="hover:text-white cursor-pointer transition-colors">History</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" /> Next-Gen Assets
          </div>
          <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 tracking-tighter leading-[0.9]">
            {searchMode === 'gen' ? "Animate with AI" : "Find Your Vision"}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-light">
            Professional stock media & real-time AI animation generation.
          </p>
        </header>

        {/* Unified Search Control */}
        <div className="bg-slate-900/40 border border-white/10 p-2 rounded-[3.5rem] shadow-2xl backdrop-blur-md mb-12 border-t-white/20">
          <div className="flex p-1 mb-4 gap-2">
            {[
              { id: 'image', icon: ImageIcon, label: 'Images' },
              { id: 'video', icon: Video, label: 'Videos' },
              { id: 'audio', icon: Music4, label: 'SFX/Music' },
              { id: 'gen', icon: Sparkles, label: 'AI Gen' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setSearchMode(tab.id)}
                className={`flex-1 py-4 rounded-[1.8rem] flex items-center justify-center gap-2 font-bold transition-all ${searchMode === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="px-4 pb-4 space-y-4">
            <div className="relative group">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === 'gen' ? "Describe your animation (e.g., 'A golden clock ticking fast with glowing gears')" :
                  searchMode === 'audio' ? "Search SFX like 'Cinema transition', 'Rain', or 'Tech UI Beep'..." :
                  "Nature 4K drone shots, abstract backgrounds, tech blueprints..."
                }
                className="w-full bg-slate-950/60 border border-white/5 rounded-[2.5rem] py-8 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-xl min-h-[160px] placeholder:text-slate-700 resize-none"
              />
              <button 
                onClick={performSearch}
                disabled={isSearching || !query}
                className="absolute bottom-6 right-6 h-16 px-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-900/40 flex items-center gap-3 disabled:grayscale disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5" /> Fetch</>}
              </button>
            </div>
          </div>
        </div>

        {/* AI GEN RESULT */}
        {searchMode === 'gen' && aiAnimation && (
          <section className="animate-in fade-in zoom-in duration-700">
            <div className="bg-black rounded-[4rem] border border-blue-500/20 overflow-hidden aspect-video flex items-center justify-center p-12 relative group shadow-2xl">
              <div 
                dangerouslySetInnerHTML={{ __html: aiAnimation }} 
                className="w-full h-full max-w-2xl drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" 
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-4">
                <button 
                  onClick={() => downloadMedia(`data:image/svg+xml;base64,${btoa(aiAnimation)}`, 'ai-motion.svg')}
                  className="bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-400 transition-colors"
                >
                  <Download className="w-5 h-5" /> Export SVG Motion
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STOCK RESULTS */}
        {searchMode !== 'gen' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((item, idx) => (
              <div key={idx} className="group bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all duration-500 shadow-xl flex flex-col">
                <div className="aspect-video relative bg-black overflow-hidden">
                  {searchMode === 'video' ? (
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover" 
                      onMouseOver={e => e.target.play()} 
                      onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}}
                      muted loop playsInline
                    />
                  ) : searchMode === 'audio' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-black">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${playingAudio === item.url ? 'bg-blue-600 scale-110' : 'bg-white/5'}`}>
                        <Music className="w-10 h-10" />
                      </div>
                      {playingAudio === item.url && (
                         <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{width: `${audioProgress}%`}} />
                      )}
                    </div>
                  ) : (
                    <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  )}

                  {/* Hover Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 p-6">
                    {searchMode === 'audio' ? (
                      <button onClick={() => toggleAudio(item.url)} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        {playingAudio === item.url ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                      </button>
                    ) : (
                      <button onClick={() => downloadMedia(item.url)} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-400">
                        <Download className="w-5 h-5" /> Download
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-7">
                   <h3 className="font-bold text-lg text-slate-200 truncate group-hover:text-blue-400 transition-colors">{item.title}</h3>
                   <div className="flex items-center gap-3 mt-3">
                     <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 px-2 py-1 rounded-md bg-white/5">
                       {item.source || 'Stock Asset'}
                     </span>
                     <span className="text-[10px] font-black uppercase tracking-tighter text-blue-500">
                       {item.duration || 'HQ'}
                     </span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSearching && !results.length && (
          <div className="text-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <p className="text-slate-500 animate-pulse">Scanning Global Repositories...</p>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          VisionFetch Engine v4.0.2 • Powered by Gemini Ultra
        </p>
      </footer>
    </div>
  );
}
