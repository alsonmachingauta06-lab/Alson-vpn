/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Globe,
  Server,
  Zap,
  Activity,
  Cpu,
  Settings,
  Terminal,
  Wifi,
  WifiOff,
  ChevronRight,
  Search,
  Check,
  AlertTriangle,
  Gauge,
  Radio,
  MapPin,
  Sliders,
  Power,
  RefreshCw,
  Bot,
  Send,
  User,
  HardDrive,
  Download,
  Upload,
  ArrowUpRight,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';

const dataTransferHistory = [
  { day: 'Mon', download: 4.2, upload: 1.1 },
  { day: 'Tue', download: 8.5, upload: 2.3 },
  { day: 'Wed', download: 12.1, upload: 3.4 },
  { day: 'Thu', download: 6.8, upload: 1.9 },
  { day: 'Fri', download: 15.4, upload: 4.2 },
  { day: 'Sat', download: 22.1, upload: 6.5 },
  { day: 'Sun', download: 14.8, upload: 3.8 },
];

interface ServerLocation {
  id: string;
  country: string;
  city: string;
  code: string;
  ip: string;
  ping: number;
  load: number;
  speed: string;
  premium: boolean;
}

const SERVERS: ServerLocation[] = [
  { id: 'us-ny', country: 'United States', city: 'New York', code: 'US', ip: '198.51.100.24', ping: 14, load: 32, speed: '980 Mbps', premium: false },
  { id: 'us-sf', country: 'United States', city: 'San Francisco', code: 'US', ip: '198.51.100.89', ping: 28, load: 45, speed: '950 Mbps', premium: false },
  { id: 'uk-lon', country: 'United Kingdom', city: 'London', code: 'GB', ip: '185.199.108.15', ping: 22, load: 58, speed: '1.2 Gbps', premium: false },
  { id: 'de-fra', country: 'Germany', city: 'Frankfurt', code: 'DE', ip: '45.154.255.8', ping: 19, load: 24, speed: '1.0 Gbps', premium: false },
  { id: 'jp-tyo', country: 'Japan', city: 'Tokyo', code: 'JP', ip: '133.242.18.5', ping: 84, load: 61, speed: '850 Mbps', premium: true },
  { id: 'sg-sin', country: 'Singapore', city: 'Singapore', code: 'SG', ip: '103.253.14.9', ping: 72, load: 39, speed: '900 Mbps', premium: true },
  { id: 'ch-zrh', country: 'Switzerland', city: 'Zurich', code: 'CH', ip: '31.13.195.5', ping: 25, load: 18, speed: '1.4 Gbps', premium: true },
  { id: 'ca-tor', country: 'Canada', city: 'Toronto', code: 'CA', ip: '192.227.135.2', ping: 35, load: 42, speed: '880 Mbps', premium: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'servers' | 'speedtest' | 'isptunnel' | 'advisor' | 'settings' | 'system'>('dashboard');
  
  // VPN Connection State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [selectedServer, setSelectedServer] = useState<ServerLocation>(SERVERS[0]);
  const [protocol, setProtocol] = useState<'WireGuard' | 'OpenVPN' | 'IKEv2'>('WireGuard');
  const [connectionTime, setConnectionTime] = useState<number>(0);
  const [bytesUploaded, setBytesUploaded] = useState<number>(1.2);
  const [bytesDownloaded, setBytesDownloaded] = useState<number>(14.8);

  // ISP Tunnel & Free Data State
  const [selectedCarrier, setSelectedCarrier] = useState<string>('Econet Wireless');
  const [sniHost, setSniHost] = useState<string>('whatsapp.econet.co.zw');
  const [payloadType, setPayloadType] = useState<string>('HTTP CONNECT / SSL SNI');
  const [freeDataTurbo, setFreeDataTurbo] = useState<boolean>(true);
  const [tunnelLogs, setTunnelLogs] = useState<Array<string>>([
    '[INIT] QuantumShield Payload Engine v4.2 loaded.',
    '[CARRIER] Target network locked: Econet Wireless ZW',
    '[BYPASS] SNI Header Masking initialized via whatsapp.econet.co.zw',
    '[STATUS] Ready to establish zero-rated tunnel.'
  ]);

  // Settings Toggles
  const [killSwitch, setKillSwitch] = useState<boolean>(true);
  const [adBlocker, setAdBlocker] = useState<boolean>(true);
  const [dnsLeakProtection, setDnsLeakProtection] = useState<boolean>(true);
  const [autoConnect, setAutoConnect] = useState<boolean>(false);

  // Server Modal
  const [serverModalOpen, setServerModalOpen] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [importedConfigName, setImportedConfigName] = useState<string>('');
  const [importedConfigContent, setImportedConfigContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  // Speed Test State
  const [speedTestRunning, setSpeedTestRunning] = useState<boolean>(false);
  const [speedTestStage, setSpeedTestStage] = useState<'idle' | 'ping' | 'download' | 'upload' | 'completed'>('idle');
  const [currentPing, setCurrentPing] = useState<number>(0);
  const [currentDownload, setCurrentDownload] = useState<number>(0);
  const [currentUpload, setCurrentUpload] = useState<number>(0);
  const [speedProgress, setSpeedProgress] = useState<number>(0);

  // AI Security Advisor State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: "Hello! I'm QuantumShield AI, your personal network security and privacy advisor. How can I help secure your digital footprint today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Connection timer effect
  useEffect(() => {
    let timer: any;
    if (isConnected) {
      timer = setInterval(() => {
        setConnectionTime((prev) => prev + 1);
        // Simulate data increment
        setBytesDownloaded((prev) => +(prev + 0.05).toFixed(2));
        setBytesUploaded((prev) => +(prev + 0.01).toFixed(2));
      }, 1000);
    } else {
      setConnectionTime(0);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Connect / Disconnect Handler
  const toggleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
      }, 1500);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 && hrs > 0 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Run Speed Test
  const runSpeedTest = () => {
    if (speedTestRunning) return;
    setSpeedTestRunning(true);
    setSpeedTestStage('ping');
    setCurrentPing(0);
    setCurrentDownload(0);
    setCurrentUpload(0);
    setSpeedProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setSpeedProgress(progress);

      if (progress <= 25) {
        setSpeedTestStage('ping');
        setCurrentPing(Math.floor(selectedServer.ping + Math.random() * 4 - 2));
      } else if (progress <= 75) {
        setSpeedTestStage('download');
        const targetSpeed = parseFloat(selectedServer.speed) * (selectedServer.speed.includes('Gbps') ? 1000 : 1);
        setCurrentDownload(Math.floor(targetSpeed * (0.8 + Math.random() * 0.2)));
      } else if (progress < 100) {
        setSpeedTestStage('upload');
        const targetSpeed = parseFloat(selectedServer.speed) * 0.4 * (selectedServer.speed.includes('Gbps') ? 1000 : 1);
        setCurrentUpload(Math.floor(targetSpeed * (0.8 + Math.random() * 0.2)));
      } else {
        clearInterval(interval);
        setSpeedTestStage('completed');
        setSpeedTestRunning(false);
      }
    }, 60);
  };

  // Send message to AI Advisor
  const sendAiMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/security-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            isConnected,
            serverName: selectedServer.city,
            country: selectedServer.country,
            ip: selectedServer.ip,
            protocol,
            killSwitch
          }
        })
      });
      const data = await res.json();
      const aiMsg = {
        role: 'assistant' as const,
        text: data.reply || "I've analyzed your network request.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I'm having trouble connecting to the QuantumShield neural advisory node. Please check your connection.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // VPN File Import & Export Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportedConfigName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || '';
      setImportedConfigContent(content);
      const newServer: ServerLocation = {
        id: `imported-${Date.now()}`,
        country: 'Custom Config File',
        city: file.name.replace(/\.[^/.]+$/, ''),
        code: 'OVPN',
        ip: '10.8.0.50',
        ping: 16,
        load: 12,
        speed: '1.2 Gbps',
        premium: false
      };
      setSelectedServer(newServer);
      setTunnelLogs(prev => [
        ...prev,
        `[IMPORT] Successfully loaded VPN config file: ${file.name}`,
        `[TUNNEL] Remote endpoint and crypto parameters parsed successfully.`
      ]);
      setImportModalOpen(true);
    };
    reader.readAsText(file);
  };

  const exportConfigFile = () => {
    const configData = `client
dev tun
proto udp
remote ${selectedServer.ip} 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
key-direction 1
# QuantumShield VPN Pro Profile for ${selectedServer.city}, ${selectedServer.country}
<ca>
-----BEGIN CERTIFICATE-----
MIIF7TCCBHWgAwIBAgIQAfQo0N6t8s12vB...[QuantumShield Secure CA Root]...
-----END CERTIFICATE-----
</ca>
`;
    const blob = new Blob([configData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedServer.city.toLowerCase()}-quantumshield.ovpn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [autoSelectingServer, setAutoSelectingServer] = useState<boolean>(false);

  const autoSelectBestServer = () => {
    if (autoSelectingServer) return;
    setAutoSelectingServer(true);
    setTunnelLogs(prev => [...prev, '[PING] Pinging all global server nodes for lowest latency...']);

    setTimeout(() => {
      const best = SERVERS.reduce((prev, curr) => (curr.ping < prev.ping ? curr : prev));
      setSelectedServer(best);
      setAutoSelectingServer(false);
      setIsConnected(true);
      setTunnelLogs(prev => [
        ...prev,
        `[OPTIMAL] Lowest latency detected at ${best.city}, ${best.country} (${best.ping}ms).`,
        `[CONNECT] Secure tunnel established automatically.`
      ]);
      setActiveTab('dashboard');
    }, 1400);
  };

  const filteredServers = SERVERS.filter((s) => {
    const matchesSearch = s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedRegionFilter === 'all') return matchesSearch;
    if (selectedRegionFilter === 'americas' && (s.code === 'US' || s.code === 'CA')) return matchesSearch;
    if (selectedRegionFilter === 'europe' && ['GB', 'DE', 'CH'].includes(s.code)) return matchesSearch;
    if (selectedRegionFilter === 'asia' && ['JP', 'SG'].includes(s.code)) return matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar Contract (3 Zones) */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            QuantumShield <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">VPN Pro</span>
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('servers')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'servers' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Servers ({SERVERS.length})
          </button>
          <button
            onClick={() => setActiveTab('speedtest')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'speedtest' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Speed Test
          </button>
          <button
            onClick={() => setActiveTab('isptunnel')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'isptunnel' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Econet & ISP Bypass
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'advisor' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            AI Security Advisor
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'system' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            System & Network
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-medium tabular-nums">
              {isConnected ? 'Protected' : 'Unprotected'}
            </span>
          </div>
          <button
            onClick={toggleConnection}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap ${
              isConnected
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isConnected ? 'Disconnect' : 'Quick Connect'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Connection Control Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center">
              {/* Background Glow */}
              <div className={`absolute w-96 h-96 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${isConnected ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}`} />

              {/* Status Badge */}
              <div className="relative z-10 mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md ${
                  isConnected 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : isConnecting 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}>
                  {isConnected ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : isConnecting ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <ShieldAlert className="w-4 h-4 text-slate-400" />}
                  <span>{isConnected ? 'Secure VPN Tunnel Active' : isConnecting ? 'Establishing Secure Handshake...' : 'VPN Connection Paused'}</span>
                </div>
              </div>

              {/* Giant Interactive Connect Button */}
              <div className="relative z-10 my-4">
                <div className="relative group">
                  {/* Outer Pulsing Rings */}
                  {isConnected && (
                    <>
                      <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping opacity-75 pointer-events-none" />
                      <div className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-pulse pointer-events-none" />
                    </>
                  )}
                  {isConnecting && (
                    <div className="absolute -inset-6 rounded-full bg-amber-500/20 animate-ping opacity-75 pointer-events-none" />
                  )}

                  <button
                    onClick={toggleConnection}
                    disabled={isConnecting}
                    className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-2xl cursor-pointer ${
                      isConnected
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/30 hover:scale-105'
                        : isConnecting
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-amber-500/30 cursor-wait'
                        : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-200 border border-slate-700 hover:border-emerald-500/50 hover:scale-105'
                    }`}
                  >
                    <Power className={`w-12 h-12 stroke-[2.5] ${isConnected ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span className="text-sm font-bold tracking-wide uppercase">
                      {isConnected ? 'Disconnect' : isConnecting ? 'Connecting' : 'Connect'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Connection Stats & Info */}
              <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> Server Location
                  </div>
                  <div className="text-sm font-semibold text-white truncate flex items-center justify-between">
                    <span>{selectedServer.city}, {selectedServer.code}</span>
                    <button onClick={() => setServerModalOpen(true)} className="text-xs text-emerald-400 hover:underline">Change</button>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" /> Virtual IP
                  </div>
                  <div className="text-sm font-semibold text-white font-mono tabular-nums">
                    {isConnected ? selectedServer.ip : '192.168.1.1 (Exposed)'}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> Session Duration
                  </div>
                  <div className="text-sm font-semibold text-white font-mono tabular-nums">
                    {isConnected ? formatTime(connectionTime) : '00:00'}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Protocol
                  </div>
                  <div className="text-sm font-semibold text-white flex items-center justify-between">
                    <span>{protocol}</span>
                    <span className="text-xs text-emerald-400 font-mono">AES-256</span>
                  </div>
                </div>
              </div>

              {/* Generate Security Report Button */}
              <div className="relative z-10 mt-6">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="px-6 py-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 text-xs font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Generate Security Report</span>
                </button>
              </div>
            </div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Data Traffic Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-emerald-400" /> Traffic Transferred
                    </h3>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Encrypted</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <Download className="w-3 h-3 text-emerald-400" /> Download
                      </div>
                      <div className="text-xl font-bold text-white font-mono tabular-nums">
                        {bytesDownloaded} <span className="text-xs font-normal text-slate-400">GB</span>
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <Upload className="w-3 h-3 text-emerald-400" /> Upload
                      </div>
                      <div className="text-xl font-bold text-white font-mono tabular-nums">
                        {bytesUploaded} <span className="text-xs font-normal text-slate-400">GB</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between pt-4 border-t border-slate-800">
                  <span>Zero-Logs Policy</span>
                  <span className="text-emerald-400 font-medium">Verified Active</span>
                </div>
              </div>

              {/* Quick Server Switcher Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-emerald-400" /> Optimal Server
                    </h3>
                    <button onClick={() => setActiveTab('servers')} className="text-xs text-emerald-400 hover:underline">View All</button>
                  </div>
                  <div 
                    onClick={() => setServerModalOpen(true)}
                    className="bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-emerald-400 border border-slate-800">
                        {selectedServer.code}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-white">{selectedServer.city}, {selectedServer.country}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Ping: {selectedServer.ping}ms</span>
                          <span>·</span>
                          <span>{selectedServer.speed}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between pt-4 border-t border-slate-800">
                  <span>Load Balancing</span>
                  <span className="text-emerald-400 font-medium">{selectedServer.load}% Capacity</span>
                </div>
              </div>

              {/* Security Shields Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Privacy Shield Status
                    </h3>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Max Protection</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                      <span className="text-slate-300">Kill Switch</span>
                      <span className={killSwitch ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{killSwitch ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                      <span className="text-slate-300">Ad & Tracker Blocker</span>
                      <span className={adBlocker ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{adBlocker ? 'Active (1,420 blocked)' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                      <span className="text-slate-300">DNS Leak Protection</span>
                      <span className={dnsLeakProtection ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{dnsLeakProtection ? 'Secure' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <button onClick={() => setActiveTab('settings')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition-colors">
                    Configure Defenses
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SERVERS TAB */}
        {activeTab === 'servers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Global Server Locations</h1>
                <p className="text-sm text-slate-400 mt-1">Choose from over 50+ high-speed secure servers worldwide or import custom VPN files.</p>
              </div>

              {/* Import & Search Actions */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={autoSelectBestServer}
                  disabled={autoSelectingServer}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${autoSelectingServer ? 'animate-spin' : ''}`} />
                  <span>{autoSelectingServer ? 'Pinging Nodes...' : 'Auto-Select Best Server'}</span>
                </button>
                <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import OVPN File</span>
                  <input type="file" accept=".ovpn,.conf,.json,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={exportConfigFile}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Config</span>
                </button>
              </div>
            </div>

            {/* Server Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredServers.map((server) => {
                const isSelected = selectedServer.id === server.id;
                return (
                  <div
                    key={server.id}
                    onClick={() => {
                      setSelectedServer(server);
                      setActiveTab('dashboard');
                    }}
                    className={`bg-slate-900/60 border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between group hover:border-emerald-500/50 hover:bg-slate-900/90 ${
                      isSelected ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'border-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center font-bold text-emerald-400 text-sm border border-slate-700/50 group-hover:scale-105 transition-transform">
                          {server.code}
                        </div>
                        {server.premium && (
                          <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Pro
                          </span>
                        )}
                        {isSelected && !server.premium && (
                          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Connected
                          </span>
                        )}
                      </div>
                      <div className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">{server.city}</div>
                      <div className="text-xs text-slate-400">{server.country}</div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        <Radio className={`w-3.5 h-3.5 ${server.ping < 30 ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <span>{server.ping} ms</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono tabular-nums">
                        <Zap className="w-3.5 h-3.5 text-teal-400" />
                        <span>{server.speed}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SPEED TEST TAB */}
        {activeTab === 'speedtest' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn text-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Network Speed Benchmark</h1>
              <p className="text-sm text-slate-400 mt-1">Measure your encrypted tunnel bandwidth, latency, and throughput.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
              {/* Gauge Display */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto rounded-full border-8 border-slate-800 flex flex-col items-center justify-center my-6 shadow-inner">
                {speedTestRunning && (
                  <div className="absolute inset-0 rounded-full border-8 border-emerald-500 animate-spin border-t-transparent pointer-events-none" />
                )}
                <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                  {speedTestStage === 'idle' && 'Ready to Test'}
                  {speedTestStage === 'ping' && 'Testing Ping'}
                  {speedTestStage === 'download' && 'Download Speed'}
                  {speedTestStage === 'upload' && 'Upload Speed'}
                  {speedTestStage === 'completed' && 'Test Complete'}
                </div>

                <div className="text-3xl sm:text-5xl font-extrabold text-white font-mono tabular-nums">
                  {speedTestStage === 'ping' && `${currentPing} ms`}
                  {speedTestStage === 'download' && currentDownload}
                  {speedTestStage === 'upload' && currentUpload}
                  {speedTestStage === 'idle' && '0.0'}
                  {speedTestStage === 'completed' && currentDownload}
                </div>

                <div className="text-xs text-emerald-400 font-medium mt-1">
                  {speedTestStage === 'download' || speedTestStage === 'upload' ? 'Mbps' : speedTestStage === 'completed' ? 'Peak Download Mbps' : ''}
                </div>
              </div>

              {/* Progress Bar */}
              {speedTestRunning && (
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-8">
                  <div className="bg-emerald-500 h-full transition-all duration-75" style={{ width: `${speedProgress}%` }} />
                </div>
              )}

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-1">Ping</div>
                  <div className="text-lg font-bold text-white font-mono tabular-nums">{currentPing > 0 ? `${currentPing} ms` : '—'}</div>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-1">Download</div>
                  <div className="text-lg font-bold text-white font-mono tabular-nums">{currentDownload > 0 ? `${currentDownload} Mbps` : '—'}</div>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-1">Upload</div>
                  <div className="text-lg font-bold text-white font-mono tabular-nums">{currentUpload > 0 ? `${currentUpload} Mbps` : '—'}</div>
                </div>
              </div>

              <button
                onClick={runSpeedTest}
                disabled={speedTestRunning}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {speedTestRunning ? 'Running Diagnostic...' : 'Start Speed Test'}
              </button>
            </div>
          </div>
        )}

        {/* ISP & ECONET BYPASS TAB */}
        {activeTab === 'isptunnel' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-400" /> Econet & ISP Payload Bypass Configurator
              </h1>
              <p className="text-sm text-slate-400 mt-1">Configure SNI host masking, custom HTTP headers, and activate unlimited free data tunneling over Econet and regional carriers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Settings Panel */}
              <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Target Mobile Carrier</label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => {
                      setSelectedCarrier(e.target.value);
                      if (e.target.value.includes('Econet')) {
                        setSniHost('whatsapp.econet.co.zw');
                      } else if (e.target.value.includes('NetOne')) {
                        setSniHost('OneMoney.netone.co.zw');
                      } else {
                        setSniHost('free-data.tunnel.net');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Econet Wireless">Econet Wireless (ZW) — Zero-Rated Bug Host</option>
                    <option value="NetOne">NetOne Cellular (ZW)</option>
                    <option value="TelOne">TelOne Broadband (ZW)</option>
                    <option value="MTN South Africa">MTN (ZA)</option>
                    <option value="Vodacom">Vodacom (ZA)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">SNI / Bug Host (Bypass Domain)</label>
                  <input
                    type="text"
                    value={sniHost}
                    onChange={(e) => setSniHost(e.target.value)}
                    placeholder="e.g. whatsapp.econet.co.zw"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="text-[11px] text-slate-500 mt-1.5">Tricks carrier packet inspection to route full TCP/UDP traffic through zero-rated bundles.</div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Tunnel Payload Injection Type</label>
                  <select
                    value={payloadType}
                    onChange={(e) => setPayloadType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HTTP CONNECT / SSL SNI">HTTP CONNECT + SSL SNI Spoofing</option>
                    <option value="Direct SSL Tunnel">Direct SSL/TLS 1.3 Encrypted Handshake</option>
                    <option value="DNS UDP Payload Tunnel">DNS UDP Payload Tunneling (Port 53)</option>
                  </select>
                </div>

                {/* Free Data Turbo Toggle */}
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" /> Unlimited Free Data Turbo Mode
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">Bypasses bundle balance checks & routes unlimited high-speed data.</div>
                  </div>
                  <button
                    onClick={() => {
                      setFreeDataTurbo(!freeDataTurbo);
                      setTunnelLogs(prev => [
                        ...prev,
                        `[BYPASS] Unlimited Free Data Turbo Mode: ${!freeDataTurbo ? 'ACTIVATED (Unlimited Quota)' : 'DISABLED'}`
                      ]);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${freeDataTurbo ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${freeDataTurbo ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="pt-2">
                  <div className="text-xs text-slate-400 mb-2 font-medium">Quick Econet Payloads:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSniHost('whatsapp.econet.co.zw');
                        setTunnelLogs(prev => [...prev, '[PRESET] Loaded Econet WhatsApp Zero-Rated Host.']);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 rounded-xl transition-colors"
                    >
                      WhatsApp Bundle Host
                    </button>
                    <button
                      onClick={() => {
                        setSniHost('opera.econet.co.zw');
                        setTunnelLogs(prev => [...prev, '[PRESET] Loaded Econet Opera Mini Host.']);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 rounded-xl transition-colors"
                    >
                      Opera Mini Bug Host
                    </button>
                    <button
                      onClick={() => {
                        setSniHost('facebook.econet.co.zw');
                        setTunnelLogs(prev => [...prev, '[PRESET] Loaded Econet Facebook Free Basics Host.']);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 rounded-xl transition-colors"
                    >
                      Facebook Free Basics
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Live Console Panel */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" /> Bypass Console
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-72 overflow-y-auto font-mono text-[11px] text-emerald-400/90 space-y-2">
                    {tunnelLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">{log}</div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setTunnelLogs(prev => [
                        ...prev,
                        `[CONNECT] Injecting payload via ${sniHost}...`,
                        `[SUCCESS] Econet packet inspection bypassed! Free Data Quota: UNLIMITED`,
                        `[TUNNEL] Secure encrypted socket established.`
                      ]);
                      setIsConnected(true);
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Inject & Bypass Carrier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI SECURITY ADVISOR TAB */}
        {activeTab === 'advisor' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-emerald-400" /> QuantumShield AI Security Advisor
              </h1>
              <p className="text-sm text-slate-400 mt-1">Ask questions about network security, VPN tunneling, public Wi-Fi safety, and encryption.</p>
            </div>

            {/* Chat Container */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col h-[600px] shadow-2xl">
              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                        <span className="font-semibold">{msg.role === 'user' ? 'You' : 'QuantumShield AI'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/90 border border-slate-700/80 text-slate-300 rounded-2xl rounded-bl-none p-4 text-sm flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Analyzing security posture...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-800 mt-2">
                <button
                  onClick={() => sendAiMessage("Is my connection secure on public coffee shop Wi-Fi?")}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg whitespace-nowrap transition-colors"
                >
                  Public Wi-Fi Safety
                </button>
                <button
                  onClick={() => sendAiMessage("What is the difference between WireGuard and OpenVPN?")}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg whitespace-nowrap transition-colors"
                >
                  WireGuard vs OpenVPN
                </button>
                <button
                  onClick={() => sendAiMessage("How does a VPN Kill Switch protect my privacy?")}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg whitespace-nowrap transition-colors"
                >
                  Kill Switch Explained
                </button>
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Ask AI about network security, DNS leaks, encryption..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={() => sendAiMessage()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">VPN Security & Protocol Settings</h1>
              <p className="text-sm text-slate-400 mt-1">Customize your tunneling protocols, kill switch rules, and privacy shields.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Protocol Selector */}
              <div>
                <label className="text-sm font-semibold text-white block mb-3">Tunneling Protocol</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['WireGuard', 'OpenVPN', 'IKEv2'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        protocol === p
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{p}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {p === 'WireGuard' && 'Blazing fast, modern cryptography'}
                        {p === 'OpenVPN' && 'Highly secure, ultra-reliable'}
                        {p === 'IKEv2' && 'Great for mobile network switching'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Advanced Privacy Protections</h3>

                {/* Kill Switch Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <div>
                    <div className="text-sm font-semibold text-white">Kill Switch</div>
                    <div className="text-xs text-slate-400">Instantly block internet traffic if the VPN connection drops unexpectedly.</div>
                  </div>
                  <button
                    onClick={() => setKillSwitch(!killSwitch)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${killSwitch ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${killSwitch ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Ad & Tracker Blocker Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <div>
                    <div className="text-sm font-semibold text-white">Ad & Malware Blocker</div>
                    <div className="text-xs text-slate-400">Block malicious domains, phishing trackers, and intrusive ads at the DNS level.</div>
                  </div>
                  <button
                    onClick={() => setAdBlocker(!adBlocker)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${adBlocker ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${adBlocker ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* DNS Leak Protection */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <div>
                    <div className="text-sm font-semibold text-white">DNS Leak Protection</div>
                    <div className="text-xs text-slate-400">Route all DNS queries through encrypted QuantumShield secure resolvers.</div>
                  </div>
                  <button
                    onClick={() => setDnsLeakProtection(!dnsLeakProtection)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${dnsLeakProtection ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${dnsLeakProtection ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Auto Connect */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <div>
                    <div className="text-sm font-semibold text-white">Connect on App Launch</div>
                    <div className="text-xs text-slate-400">Automatically establish a secure VPN tunnel when the application starts.</div>
                  </div>
                  <button
                    onClick={() => setAutoConnect(!autoConnect)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${autoConnect ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${autoConnect ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM & NETWORK TELEMETRY TAB */}
        {activeTab === 'system' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Cpu className="w-6 h-6 text-emerald-400" /> Phone, Network & Hardware Telemetry
              </h1>
              <p className="text-sm text-slate-400 mt-1">Real-time system diagnostics, network interface stats, routing tables, and device permissions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Network Adapter Info */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-400" /> Network Telemetry
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Online Status:</span>
                    <span className="text-emerald-400 font-semibold">{navigator.onLine ? 'Online (Connected)' : 'Offline'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Connection Type:</span>
                    <span className="font-mono text-white">{(navigator as any).connection?.effectiveType || '4G / Broadband'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Estimated Round Trip (RTT):</span>
                    <span className="font-mono text-emerald-400">{(navigator as any).connection?.rtt || 24} ms</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Downlink Speed:</span>
                    <span className="font-mono text-white">{(navigator as any).connection?.downlink || 85} Mbps</span>
                  </div>
                </div>
              </div>

              {/* Device & Phone Hardware Info */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" /> Device & Phone Hardware
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">CPU Cores (Concurrency):</span>
                    <span className="font-mono text-white">{navigator.hardwareConcurrency || 8} Threads</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Device Memory:</span>
                    <span className="font-mono text-white">{(navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : '8+ GB RAM'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Platform / OS:</span>
                    <span className="font-mono text-white">{navigator.platform || 'Cross-Platform Mobile/Desktop'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Screen Resolution:</span>
                    <span className="font-mono text-white">{window.screen.width} x {window.screen.height} px</span>
                  </div>
                </div>
              </div>

              {/* Routing Table & Interfaces */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" /> Routing Table & Interfaces
                </h3>
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400 font-sans">Default Gateway:</span>
                    <span className="text-white">192.168.1.1</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400 font-sans">Tunnel Interface:</span>
                    <span className="text-emerald-400">tun0 ({isConnected ? selectedServer.ip : '10.8.0.1'})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400 font-sans">Primary DNS Resolver:</span>
                    <span className="text-white">1.1.1.1 (Cloudflare Secure)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-sans">Subnet Mask:</span>
                    <span className="text-white">255.255.255.0</span>
                  </div>
                </div>
              </div>

              {/* System Permissions Manager */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> System Permissions
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-semibold text-white">Network State Access</div>
                      <div className="text-[11px] text-slate-400">Read cellular & WiFi connectivity metrics</div>
                    </div>
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md">Granted</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-semibold text-white">Location / GeoIP Masking</div>
                      <div className="text-[11px] text-slate-400">Virtual location spoofing active</div>
                    </div>
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md">Granted</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-semibold text-white">Microphone (AI Voice / Live)</div>
                      <div className="text-[11px] text-slate-400">Voice commands & advisor audio</div>
                    </div>
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md">Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Data Transfer History Line Chart */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Data Transfer History (Last 7 Days)
                </h3>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Encrypted Tunnel</span>
              </div>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataTransferHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} unit=" GB" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="download" name="Download (GB)" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="upload" name="Upload (GB)" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Server Selection Modal */}
      {serverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Select Server Location</h2>
              <button
                onClick={() => setServerModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold px-3 py-1 bg-slate-800 rounded-xl"
              >
                Close
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search server..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredServers.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedServer(s);
                    setServerModalOpen(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedServer.id === s.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-emerald-400 text-xs border border-slate-800">
                      {s.code}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{s.city}</div>
                      <div className="text-xs text-slate-400">{s.country}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono tabular-nums text-slate-400">
                    <div>{s.ping} ms</div>
                    <div className="text-emerald-400">{s.speed}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Report Modal (PDF-like Report View) */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 text-slate-100 my-8">
            {/* PDF Report Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">QuantumShield Security Audit Report</h2>
                  <div className="text-xs text-slate-400 mt-0.5">Report ID: QSR-2026-9481 · Generated on {new Date().toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition-colors text-slate-200 flex items-center gap-1.5"
                >
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Overall Protection Status Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <div>
                  <div className="text-sm font-bold">Overall Status: {isConnected ? 'Fully Protected & Encrypted' : 'Unprotected / Paused'}</div>
                  <div className="text-xs opacity-80 mt-0.5">{isConnected ? `Tunnel active via ${selectedServer.city}, ${selectedServer.country}` : 'Connect to a secure node to activate IP masking.'}</div>
                </div>
              </div>
              <div className="text-xs font-mono font-semibold bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800">
                {isConnected ? 'AES-256-GCM' : 'UNSECURED'}
              </div>
            </div>

            {/* Report Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Connection Details */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tunnel & Routing Details</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Assigned Virtual IP:</span>
                    <span className="font-mono text-white">{isConnected ? selectedServer.ip : '192.168.1.1 (Local)'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Protocol:</span>
                    <span className="font-medium text-white">{protocol}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Server Ping:</span>
                    <span className="font-mono text-emerald-400">{selectedServer.ping} ms</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Data Transferred:</span>
                    <span className="font-mono text-white">{bytesDownloaded} GB Down / {bytesUploaded} GB Up</span>
                  </div>
                </div>
              </div>

              {/* Active Security Shields */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Defenses & Shields</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Kill Switch:</span>
                    <span className={killSwitch ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{killSwitch ? 'Active' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Ad & Tracker Blocker:</span>
                    <span className="text-emerald-400 font-semibold">{adBlocker ? '1,420 Blocked' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">DNS Leak Protection:</span>
                    <span className={dnsLeakProtection ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{dnsLeakProtection ? 'Secure' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Zero-Logs Policy:</span>
                    <span className="text-emerald-400 font-semibold">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Summary & Compliance */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-white">Compliance & Cryptographic Integrity</div>
              <p>
                All network packets traversing the QuantumShield tunnel are authenticated via HMAC-SHA256 and encrypted using military-grade AES-256-GCM ciphers. No traffic logs are recorded or stored on disk pursuant to our strict independent zero-logs audit verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Import Success Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">VPN Config Successfully Imported</h3>
                <div className="text-xs text-slate-400">File: {importedConfigName}</div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-h-48 overflow-y-auto font-mono text-[11px] text-emerald-400/90 whitespace-pre-wrap">
              {importedConfigContent || 'Client configuration parameters successfully parsed.'}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Apply & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
