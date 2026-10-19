import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Sun,
  ShieldCheck,
  Volume2,
  Play,
  RotateCcw,
  Copy,
  Check,
  Activity,
  Smile,
  Mic,
  MicOff,
  Tv,
  Grid,
  Camera,
  User,
  CircleDot,
  Upload,
  Cpu,
  Layers
} from 'lucide-react';
import RealisticAvatarViewer from './components/RealisticAvatarViewer';

interface VoicePreset {
  id: string;
  label: string;
  description: string;
  semitones: number;
  formant?: number;
  ring_hz?: number;
  drive?: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'avatar' | 'tracking' | 'voice' | 'diffusion' | 'licenses'>('avatar');
  const [monitorMode, setMonitorMode] = useState<'photoreal' | 'body' | 'vrm'>('photoreal');
  const [perfProfile, setPerfProfile] = useState<'eco' | 'balanced' | 'ultra'>('balanced');
  const [realisticGender, setRealisticGender] = useState<'female' | 'male'>('female');
  const [lightingPreset, setLightingPreset] = useState<'broadcast' | 'cinematic' | 'golden' | 'cyber'>('broadcast');
  const [studioBackground, setStudioBackground] = useState<'broadcast' | 'penthouse' | 'transparent' | 'blur'>('broadcast');
  const [sssIntensity, setSssIntensity] = useState<number>(0.75);
  const [skinSheen, setSkinSheen] = useState<number>(0.4);
  const [avatarModel, setAvatarModel] = useState<string>('pip.vrm');
  const [viewFraming, setViewFraming] = useState<'full' | 'desk'>('desk');
  const [guidesOn, setGuidesOn] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [selectedVoice, setSelectedVoice] = useState<string>('pip');
  const [semitones, setSemitones] = useState<number>(5);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [latency, setLatency] = useState<number>(11);
  const [activeEmote, setActiveEmote] = useState<string | null>(null);
  const [copiedObs, setCopiedObs] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vrmInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const voicePresets: VoicePreset[] = [
    { id: 'pip', label: 'Pip (Clair)', description: 'Chaleureux et dynamique, adapté aux présentations vives.', semitones: 5.0, formant: 1.2 },
    { id: 'bear', label: 'Ours (Grave)', description: 'Timbre profond avec résonance de poitrine naturelle.', semitones: -5.0, formant: 0.84 },
    { id: 'imp', label: 'Lutin (Vif)', description: 'Aigu et expressif avec saturation douce.', semitones: 8.0, formant: 0.95, drive: 1.6 },
    { id: 'robot', label: 'Robot (Modulé)', description: 'Modulation en anneau métallique (70 Hz).', semitones: -2.0, formant: 1.0, ring_hz: 70.0 },
    { id: 'radio', label: 'Radio Broadcast', description: 'Grain analogique vintage avec compression dynamique.', semitones: 0, drive: 2.5 },
  ];

  const emotes = [
    { id: 'wave', label: 'Saluer', icon: '👋' },
    { id: 'nod', label: 'Acquiescer', icon: '🙂' },
    { id: 'cheer', label: 'Applaudir', icon: '🎉' },
    { id: 'think', label: 'Réfléchir', icon: '🤔' },
    { id: 'smile', label: 'Sourire', icon: '✨' },
  ];

  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const stream = canvas.captureStream(60);
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `realX-enregistrement-${new Date().toISOString().slice(0, 19)}.webm`;
        a.click();
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  const triggerEmote = (name: string) => {
    setActiveEmote(name);
    setTimeout(() => setActiveEmote(null), 2500);
  };

  const playVoiceSample = async (presetId: string) => {
    const p = voicePresets.find((v) => v.id === presetId);
    if (!p) return;
    setAudioPlaying(true);
    try {
      const res = await fetch(`/api/voice?preset=${presetId}&semitones=${p.semitones}&demo=1`, { method: 'POST' });
      if (res.ok) {
        const blob = await res.blob();
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
          audioRef.current.play();
          audioRef.current.onended = () => setAudioPlaying(false);
        }
      } else { setAudioPlaying(false); }
    } catch { setAudioPlaying(false); }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const obsUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/avatar?token=realx-studio-token-preview-2026`;

  return (
    <div className="min-h-screen bg-[#070b0f] text-slate-100 flex flex-col font-sans">
      <audio ref={audioRef} className="hidden" />
      <input ref={vrmInputRef} type="file" accept=".vrm" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) { setAvatarModel(f.name); alert(`Avatar "${f.name}" importé !`); }
      }} />

      <header className="border-b border-slate-800 bg-[#0c131a] px-5 py-3 flex items-center justify-between flex-wrap gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center font-black text-xl text-white">
            rX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">RealX Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-700/60 uppercase">
                Studio Hybride Temps Réel
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Transformation visuelle en direct & diffusion visioconférence / OBS</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <button
            onClick={toggleRecording}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 border transition ${
              isRecording ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <CircleDot className={`w-3.5 h-3.5 ${isRecording ? 'text-white' : 'text-red-400'}`} />
            <span>{isRecording ? `REC ${formatTime(recordingSeconds)}` : 'Enregistrer Vidéo'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#05080c] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <select value={perfProfile} onChange={(e) => setPerfProfile(e.target.value as any)} className="bg-transparent font-semibold text-white border-none outline-none cursor-pointer">
              <option value="eco" className="bg-slate-900">Éco CPU (Laptop)</option>
              <option value="balanced" className="bg-slate-900">Équilibré 45-60 FPS</option>
              <option value="ultra" className="bg-slate-900">Studio Ultra</option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-[#05080c] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px]">
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>{fps} FPS</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <span>{latency}ms</span>
            <div className="w-px h-3 bg-slate-800" />
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conforme</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1560px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-[#05080b] border border-slate-800/90 rounded-2xl p-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-800/70 mb-3 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-[#0d141c] p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMonitorMode('photoreal')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    monitorMode === 'photoreal' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Avatar Photoréaliste</span>
                </button>
                <button
                  onClick={() => setMonitorMode('vrm')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    monitorMode === 'vrm' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Avatar VRM Expressif
                </button>
                <button
                  onClick={() => setMonitorMode('body')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    monitorMode === 'body' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Suivi Caméra Visage & Corps
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGuidesOn(!guidesOn)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                    guidesOn ? 'bg-amber-950/60 text-amber-300 border-amber-700' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Repères</span>
                </button>
                <button
                  onClick={() => {
                    const iframe = document.getElementById('studio-iframe') as HTMLIFrameElement;
                    if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: 'realx-recenter' }, '*');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-900/50 hover:bg-teal-800 text-teal-200 border border-teal-700/80 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-300" />
                  <span>Calibrer la Pose</span>
                </button>
              </div>
            </div>

            <div className="relative aspect-[16/10] w-full bg-[#020406] rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl flex items-center justify-center">
              {monitorMode === 'photoreal' ? (
                <RealisticAvatarViewer
                  gender={realisticGender}
                  lightingPreset={lightingPreset}
                  backgroundType={studioBackground}
                  sssIntensity={sssIntensity}
                  skinSheen={skinSheen}
                  isTracking={false}
                  activeEmote={activeEmote}
                  onStatsUpdate={(st) => { setFps(st.fps); setLatency(st.latency); }}
                />
              ) : monitorMode === 'body' ? (
                <iframe id="studio-iframe" src={`/avatar?track=1&publish=1&preview=1&frame=${viewFraming}`} className="w-full h-full border-0" allow="camera; microphone" title="realX Full Body Tracker" />
              ) : (
                <iframe id="studio-iframe" src={`/avatar?frame=${viewFraming}`} className="w-full h-full border-0" title="realX VRM Avatar" />
              )}

              {guidesOn && (
                <div className="absolute inset-[8%] border border-dashed border-amber-400/40 pointer-events-none rounded flex flex-col justify-between p-3 z-30">
                  <div className="flex justify-between text-[10px] text-amber-400/70 font-mono"><span>ACTION 90%</span><span>BROADCAST 1080p</span></div>
                  <div className="flex justify-center text-[10px] text-amber-400/70 font-mono"><span>CENTRE DU REGARD</span></div>
                  <div className="flex justify-between text-[10px] text-amber-400/70 font-mono"><span>TITRE 80%</span><span>16:9 NORMÉ</span></div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-teal-400" />
                Déclencheurs d'Expressions :
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {emotes.map((em) => (
                  <button
                    key={em.id}
                    onClick={() => triggerEmote(em.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#0d141c] hover:bg-teal-950/60 hover:text-teal-300 border border-slate-800 text-slate-200 transition font-medium flex items-center gap-1"
                  >
                    <span>{em.icon}</span>
                    <span>{em.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#0b1218] border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <Tv className="w-4 h-4 text-teal-400" />
                <span>Diffusion Caméra Virtuelle (Zoom, Meet, Teams, TikTok)</span>
              </div>
              <span className="text-[11px] text-teal-300 bg-teal-950/70 border border-teal-800 px-2 py-0.5 rounded font-mono">
                OBS Virtual Camera
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input type="text" readOnly value={obsUrl} className="flex-1 bg-[#05080b] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300" />
              <button onClick={() => { navigator.clipboard.writeText(obsUrl); setCopiedObs(true); setTimeout(() => setCopiedObs(false), 2000); }} className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition">
                {copiedObs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedObs ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="grid grid-cols-4 bg-[#0a1117] p-1 rounded-xl border border-slate-800 text-xs">
            <button onClick={() => setActiveTab('avatar')} className={`py-2 rounded-lg font-bold transition ${activeTab === 'avatar' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow' : 'text-slate-400'}`}>Avatars</button>
            <button onClick={() => setActiveTab('tracking')} className={`py-2 rounded-lg font-bold transition ${activeTab === 'tracking' ? 'bg-teal-600 text-white shadow' : 'text-slate-400'}`}>Matériel</button>
            <button onClick={() => setActiveTab('voice')} className={`py-2 rounded-lg font-bold transition ${activeTab === 'voice' ? 'bg-teal-600 text-white shadow' : 'text-slate-400'}`}>Voix</button>
            <button onClick={() => setActiveTab('licenses')} className={`py-2 rounded-lg font-bold transition ${activeTab === 'licenses' ? 'bg-teal-600 text-white shadow' : 'text-slate-400'}`}>Éthique</button>
          </div>

          {activeTab === 'avatar' && (
            <div className="bg-[#0c131a] border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" />
                  <span>Avatars & Personnalisation</span>
                </h3>
                <button onClick={() => vrmInputRef.current?.click()} className="px-2.5 py-1 rounded-lg bg-teal-950 text-teal-300 border border-teal-800 text-xs font-semibold flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Importer VRM</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button onClick={() => { setMonitorMode('photoreal'); setRealisticGender('female'); }} className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${realisticGender === 'female' && monitorMode === 'photoreal' ? 'border-teal-500 bg-teal-950/40 text-teal-200 font-bold' : 'border-slate-800 bg-[#070b0f] text-slate-400'}`}>
                  <div><div className="font-bold text-slate-100">Éléonore (3D)</div><div className="text-[10px] text-emerald-400">Photoréaliste PBR</div></div>
                </button>
                <button onClick={() => { setMonitorMode('photoreal'); setRealisticGender('male'); }} className={`p-3 rounded-xl border text-left flex items-center gap-2.5 ${realisticGender === 'male' && monitorMode === 'photoreal' ? 'border-teal-500 bg-teal-950/40 text-teal-200 font-bold' : 'border-slate-800 bg-[#070b0f] text-slate-400'}`}>
                  <div><div className="font-bold text-slate-100">Marc (3D)</div><div className="text-[10px] text-emerald-400">Photoréaliste PBR</div></div>
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-semibold">Cadrage Studio</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button onClick={() => setViewFraming('desk')} className={`py-2 px-3 rounded-lg border font-medium ${viewFraming === 'desk' ? 'border-teal-500 bg-teal-950/60 text-teal-200 font-bold' : 'border-slate-800 bg-[#070b0f] text-slate-400'}`}>Mode Bureau (Assis)</button>
                  <button onClick={() => setViewFraming('full')} className={`py-2 px-3 rounded-lg border font-medium ${viewFraming === 'full' ? 'border-teal-500 bg-teal-950/60 text-teal-200 font-bold' : 'border-slate-800 bg-[#070b0f] text-slate-400'}`}>Corps Entier (Debout)</button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-semibold">Éclairage Studio 3-Points</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {['broadcast', 'cinematic', 'golden', 'cyber'].map((lt) => (
                    <button key={lt} onClick={() => setLightingPreset(lt as any)} className={`py-2 px-2.5 rounded-lg border capitalize ${lightingPreset === lt ? 'border-teal-500 bg-teal-950/60 text-teal-200 font-bold' : 'border-slate-800 bg-[#070b0f] text-slate-400'}`}>
                      {lt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Diffusion Sous-Surfacique (SSS)</span>
                  <span className="font-mono text-emerald-400 font-bold">{Math.round(sssIntensity * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={sssIntensity} onChange={(e) => setSssIntensity(parseFloat(e.target.value))} className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer" />
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="bg-[#0c131a] border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2"><Volume2 className="w-4 h-4 text-teal-400" /><span>Studio Voix</span></h3>
                <button onClick={() => setMicMuted(!micMuted)} className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${micMuted ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                  {micMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{micMuted ? 'Coupé' : 'Actif'}</span>
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {voicePresets.map((vp) => (
                  <div key={vp.id} onClick={() => { setSelectedVoice(vp.id); setSemitones(vp.semitones); }} className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${selectedVoice === vp.id ? 'border-teal-500 bg-teal-950/40 text-teal-200' : 'border-slate-800 bg-[#070b0f]'}`}>
                    <div>
                      <div className="font-bold text-xs text-slate-100">{vp.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{vp.description}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); playVoiceSample(vp.id); }} className="px-2.5 py-1 rounded bg-teal-600 text-white text-xs flex items-center gap-1">
                      <Play className="w-3 h-3 fill-white" /><span>Écouter</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="bg-[#0c131a] border border-slate-800 rounded-xl p-5 flex flex-col gap-4 text-xs">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2"><Camera className="w-4 h-4 text-teal-400" /><span>Périphériques & Récupération</span></h3>
              <p className="text-slate-400">Gestion des pertes de suivi avec retour doux vers la posture de repos sans freeze.</p>
              <button onClick={() => { const iframe = document.getElementById('studio-iframe') as HTMLIFrameElement; if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: 'realx-recenter' }, '*'); }} className="w-full py-2 rounded-lg bg-slate-800 text-teal-300 border border-slate-700 font-semibold flex items-center justify-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /><span>Recentrer la Pose Neutre</span>
              </button>
            </div>
          )}

          {activeTab === 'licenses' && (
            <div className="bg-[#0c131a] border border-slate-800 rounded-xl p-5 flex flex-col gap-4 text-xs font-mono">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /><span>Licences & Éthique</span></h3>
              <div className="p-2.5 rounded bg-[#070b0f] border border-slate-800 flex justify-between"><span>Three.js PBR Engine</span><span className="text-teal-400">MIT (Commercial OK)</span></div>
              <div className="p-2.5 rounded bg-[#070b0f] border border-slate-800 flex justify-between"><span>MediaPipe Tasks</span><span className="text-teal-400">Apache-2.0</span></div>
              <div className="p-2.5 rounded bg-[#180a0c] border border-red-950 flex justify-between text-red-300"><span>Deepfake Non-Consenti</span><span className="text-red-400">BLOQUÉ</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
