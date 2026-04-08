import React, { useState, useRef } from 'react';
import { Search, Image as ImageIcon, Video, Upload, X, Filter, Loader2, Globe, Download, Play, ExternalLink, Coffee } from 'lucide-react';

export default function App() {
  const [searchMode, setSearchMode] = useState('image');
  const [query, setQuery] = useState('');
  const [refImage, setRefImage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [takingLong, setTakingLong] = useState(false);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  const downloadMedia = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'visionfetch-download';
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

    // Set a timer to show a "Waking up" message after 10 seconds
    const timer = setTimeout(() => setTakingLong(true), 10000);

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
      alert("The server is still waking up. Please wait a moment and try one more time!");
    } finally {
      clearTimeout(timer);
      setIsSearching(false);
      setTakingLong(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full" />
      </div>

      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Vision<span className="text-blue-500 font-extrabold italic">AI</span></span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
            Search with Intelligence
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Upload an image and type a description. We find the specific media you need.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-white/10 p-2 rounded-[2.5rem] shadow-2xl backdrop-blur-sm mb-12">
          <div className="flex p-1 mb-4 gap-2">
            <button 
              onClick={() => setSearchMode('image')}
              className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${searchMode === 'image' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ImageIcon className="w-5 h-5" /> Images
            </button>
            <button 
              onClick={() => setSearchMode('video')}
              className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${searchMode === 'video' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Video className="w-5 h-5" /> Videos
            </button>
          </div>

          <div className="px-4 pb-4 space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Describe what to find...`}
                className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-6 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg min-h-[140px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                {!refImage ? (
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-[88px] flex items-center justify-center gap-3 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 hover:bg-blue-500/5 transition-all"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="font-medium text-lg">Add Reference Image (Optional)</span>
                  </button>
                ) : (
                  <div className="w-full h-[88px] bg-blue-500/10 border border-blue-500/30 rounded-3xl flex items-center px-6 gap-4">
                    <img src={refImage} alt="Ref" className="w-14 h-14 object-cover rounded-xl border border-white/20" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-blue-400 font-bold uppercase text-xs">AI Context Locked</p>
                    </div>
                    <button onClick={() => {setRefImage(null); fileInputRef.current.value = "";}} className="p-2 text-slate-500 hover:text-red-400">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={performSearch}
                disabled={isSearching || (!query && !refImage)}
                className="h-[88px] w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-3xl transition-all shadow-2xl flex flex-col items-center justify-center"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {takingLong && <span className="text-[10px] mt-1 animate-pulse flex items-center gap-1 font-normal"><Coffee className="w-3 h-3" /> Waking up server...</span>}
                  </>
                ) : (
                  <span className="flex items-center gap-2"><Filter className="w-7 h-7" /> Fetch</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-2xl font-bold">Results</h2>
          </div>

          {!results.length && !isSearching && (
            <div className="text-center py-32 opacity-20">
              <Search className="w-24 h-24 mx-auto mb-6" />
              <p className="text-xl">Describe your target to see results</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((item, idx) => (
              <div key={idx} className="group relative bg-[#0f172a] border border-white/5 rounded-[2rem] overflow-hidden hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-2 shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      poster={item.thumbnail}
                      onMouseOver={e => e.target.play()}
                      onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}}
                      muted loop
                    />
                  ) : (
                    <img src={item.url} alt="Result" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                  
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10 uppercase">
                      {item.relevance || '98% Match'}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 gap-3">
                    <button 
                      onClick={() => downloadMedia(item.url, `visionfetch-${idx}`)}
                      className="flex-1 bg-white text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-400 transition-colors"
                    >
                      <Download className="w-5 h-5" /> Download
                    </button>
                    <button 
                      onClick={() => window.open(item.url, '_blank')}
                      className="p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/20"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-slate-200 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-2">Source: {item.source || 'AI Discovery'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 text-center text-slate-600 text-sm">
        <p>&copy; 2026 VisionFetch AI</p>
      </footer>
    </div>
  );
}
