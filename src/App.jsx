import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Image as ImageIcon, Video, Upload, X, Filter, 
  Loader2, Globe, Download, Play, Pause, ExternalLink, 
  Coffee, Music, Volume2, Music4 
} from 'lucide-react';

export default function App() {
  const [searchMode, setSearchMode] = useState('image'); // 'image', 'video', or 'audio'
  const [query, setQuery] = useState('');
  const [refImage, setRefImage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [takingLong, setTakingLong] = useState(false);
  const [results, setResults] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(new Audio());

  // Handle Audio Playback
  const toggleAudio = (url) => {
    if (playingAudio === url) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingAudio(url);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnd = () => setPlayingAudio(null);
    audio.addEventListener('ended', handleEnd);
    return () => audio.removeEventListener('ended', handleEnd);
  }, []);

  const downloadMedia = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || `visionfetch-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const performSearch = async () => {
    if (!query && !refImage) return;
    setIsSearching(true);
    setTakingLong(false);
    setResults([]);

    const timer = setTimeout(() => setTakingLong(true), 8000);

    try {
      const params = new URLSearchParams({ query, mode: searchMode });
      const formData = new FormData();
      if (fileInputRef.current?.files[0]) {
        formData.append('ref_image', fileInputRef.current.files[0]);
      }

      const response = await fetch(`https://back-zm11.onrender.com/search?${params.toString()}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      clearTimeout(timer);
      setIsSearching(false);
      setTakingLong(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Vision<span className="text-blue-500 font-black italic">FETCH</span></span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 tracking-tight">
            Universal Media AI
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-light">
            Find specific images, videos, and sound effects using deep-search intelligence.
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-slate-900/40 border border-white/10 p-2 rounded-[3rem] shadow-2xl backdrop-blur-md mb-12 border-t-white/20">
          <div className="flex p-1 mb-4 gap-2">
            {[
              { id: 'image', icon: ImageIcon, label: 'Images' },
              { id: 'video', icon: Video, label: 'Videos' },
              { id: 'audio', icon: Music4, label: 'Audio/SFX' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setSearchMode(tab.id)}
                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${searchMode === tab.id ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="px-4 pb-4 space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search for ${searchMode === 'audio' ? 'cinematic swoosh, lo-fi beats, or industrial sounds...' : 'specific details, mechanisms, or scenes...'}`}
                className="w-full bg-slate-950/60 border border-white/5 rounded-[2rem] py-6 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg min-h-[140px] placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                {!refImage ? (
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-[88px] flex items-center justify-center gap-3 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                  >
                    <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                    <span className="font-medium text-lg">Visual Context (Optional)</span>
                  </button>
                ) : (
                  <div className="w-full h-[88px] bg-blue-500/10 border border-blue-500/30 rounded-3xl flex items-center px-6 gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <img src={refImage} alt="Ref" className="w-14 h-14 object-cover rounded-xl shadow-lg ring-1 ring-white/20" />
                    <div className="flex-1">
                      <p className="text-blue-400 font-black uppercase text-[10px] tracking-widest">AI Context Locked</p>
                      <p className="text-slate-400 text-xs truncate max-w-[150px]">Reference uploaded</p>
                    </div>
                    <button onClick={() => {setRefImage(null); fileInputRef.current.value = "";}} className="p-2 text-slate-500 hover:text-red-400 hover:rotate-90 transition-all">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={performSearch}
                disabled={isSearching || (!query && !refImage)}
                className="h-[88px] w-full bg-gradient-to-br from-blue-500 to-indigo-700 hover:from-blue-400 hover:to-indigo-600 disabled:from-slate-800 text-white font-black text-xl rounded-3xl transition-all shadow-2xl shadow-blue-900/20 flex flex-col items-center justify-center overflow-hidden relative"
              >
                {isSearching ? (
                  <div className="flex flex-col items-center animate-in fade-in">
                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    {takingLong && (
                      <span className="text-[9px] uppercase tracking-tighter flex items-center gap-1 opacity-80">
                        <Coffee className="w-3 h-3" /> Waking Server
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="flex items-center gap-2">Fetch <Filter className="w-5 h-5" /></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-10">
          {!results.length && !isSearching ? (
            <div className="text-center py-40 border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-slate-500 font-medium">Ready to discover media assets...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((item, idx) => (
                <div key={idx} className="group bg-[#0f172a]/50 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                  <div className="relative aspect-video overflow-hidden bg-slate-950">
                    {searchMode === 'video' ? (
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover"
                        poster={item.thumbnail}
                        onMouseOver={e => e.target.play()}
                        onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}}
                        muted loop playsInline
                      />
                    ) : searchMode === 'audio' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black p-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${playingAudio === item.url ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/40' : 'bg-white/5'}`}>
                          <Music className={`w-8 h-8 ${playingAudio === item.url ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        {playingAudio === item.url && (
                          <div className="flex gap-1 mt-4">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="w-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 20 + 10}px` }} />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <img src={item.url} alt="Result" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                    
                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-black/60 backdrop-blur-xl text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10 tracking-widest uppercase">
                        {item.type || searchMode}
                      </span>
                    </div>

                    {/* Interaction Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6 gap-3 translate-y-4 group-hover:translate-y-0">
                      {searchMode === 'audio' ? (
                        <button 
                          onClick={() => toggleAudio(item.url)}
                          className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-all active:scale-95"
                        >
                          {playingAudio === item.url ? <><Pause className="w-5 h-5 fill-current" /> Stop</> : <><Play className="w-5 h-5 fill-current" /> Preview</>}
                        </button>
                      ) : (
                        <button 
                          onClick={() => downloadMedia(item.url)}
                          className="flex-1 bg-white text-black font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-400 transition-all active:scale-95"
                        >
                          <Download className="w-5 h-5" /> Download
                        </button>
                      )}
                      <button 
                        onClick={() => window.open(item.url, '_blank')}
                        className="p-3.5 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/10 hover:bg-white/20 transition-all"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-200 text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {item.title || 'Discovered Media Asset'}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            Verified Source • {item.duration || 'HQ'}
                          </p>
                        </div>
                      </div>
                      {searchMode === 'audio' && (
                        <button 
                          onClick={() => downloadMedia(item.url)}
                          className="p-3 bg-white/5 rounded-xl hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 text-center text-slate-600 text-sm">
        <p className="font-medium tracking-widest uppercase text-[10px]">Powered by VisionFetch AI Engine • 2026</p>
      </footer>
    </div>
  );
}
