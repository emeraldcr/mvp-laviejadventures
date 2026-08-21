"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppWindow, BatteryCharging, Bell, Bluetooth, ChevronLeft, CirclePower, Cpu, Database, Gauge, Home, Layers3, LoaderCircle, LockKeyhole, MapPin, Radio, RefreshCw, Send, ShieldCheck, Smartphone, Sun, Volume1, Volume2, VolumeX, Wifi, Zap } from "lucide-react";

type Report = {
  summary: Record<string, string>;
  display: string;
  battery: Record<string, string>;
  storage: string;
  memory: string[];
  wifi: { enabled: boolean; connected: boolean; scanning: boolean; note: string };
  hotspot: { supported: boolean; active: boolean; cellular_permitted: boolean; upstream: string | null; client_information_present: boolean };
  features: string[];
};

const groups: Record<string, { icon: typeof Wifi; match: string[] }> = {
  Network: { icon: Wifi, match: ["wifi", "bluetooth", "nfc", "location", "telephony", "sip", "ipsec"] },
  Camera: { icon: Radio, match: ["camera", "audio", "microphone"] },
  Sensors: { icon: Smartphone, match: ["sensor", "fingerprint"] },
  Graphics: { icon: Cpu, match: ["vulkan", "opengl", "screen", "touchscreen"] },
  Android: { icon: Database, match: ["android.software", "huawei"] },
};

export default function PhonePage() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("https://");
  const [hotspotPassword, setHotspotPassword] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/phone?view=report", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Phone unavailable");
      setReport(body.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Connection failed"); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const grouped = useMemo(() => Object.entries(groups).map(([name, config]) => ({
    name, icon: config.icon, items: report?.features.filter((feature) => config.match.some((part) => feature.toLowerCase().includes(part))) || [],
  })), [report]);

  async function action(name: string) {
    setBusy(true); setMessage(""); setError("");
    try {
      const value = name === "type-hotspot-password" ? hotspotPassword : url;
      const response = await fetch("/api/phone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: name, value }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Action failed");
      if (name === "type-hotspot-password") { setHotspotPassword(""); setMessage("Password inserted. Tap Save on the Huawei."); }
      else setMessage(name === "open-url" ? "URL opened on phone" : name === "tether-settings" ? "Hotspot settings opened on phone" : `Sent ${name}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Action failed"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#164e3b_0%,#07110f_42%,#020706_100%)] text-[#eaf7ef] md:grid md:place-items-center md:p-8">
    <div className="relative mx-auto h-dvh w-full overflow-hidden bg-[#07110f] shadow-2xl md:h-[min(900px,92vh)] md:max-w-[440px] md:rounded-[3.25rem] md:border-[10px] md:border-[#171d1b] md:ring-1 md:ring-white/20">
      <div className="pointer-events-none absolute left-1/2 top-2 z-30 hidden h-6 w-24 -translate-x-1/2 rounded-full bg-black md:block"><span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-slate-800 ring-1 ring-slate-600"/></div>
      <div className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between bg-[#07110f]/90 px-6 text-[10px] font-semibold backdrop-blur"><span>MAO-LX9</span><span className="flex items-center gap-1.5"><Wifi size={12}/><BatteryCharging size={13}/>{report?.battery.level || "--"}%</span></div>
      <div className="h-full overflow-y-auto px-4 pb-10 pt-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.28em] text-emerald-400">Local device bridge</p><h1 className="text-4xl font-semibold tracking-tight md:text-6xl">MAO‑LX9 Control Deck</h1><p className="mt-3 max-w-2xl text-slate-400">A consent-based command surface for the Huawei connected to this computer. Browser → Next.js → Python → ADB.</p></div>
        <button aria-label="Refresh device" onClick={() => void refresh()} disabled={busy} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 disabled:opacity-50"><RefreshCw size={18} className={busy ? "animate-spin" : ""}/></button>
      </header>

      {error && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">{error}</div>}
      {message && <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-200">{message}</div>}
      {!report && busy && <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-emerald-400" size={40}/></div>}

      {report && <>
        <section className="grid grid-cols-2 gap-3">
          <Metric icon={Smartphone} label="Device" value={`${report.summary.maker} ${report.summary.model}`} detail={report.summary.product}/>
          <Metric icon={Cpu} label="System" value={`Android ${report.summary.android}`} detail={`${report.summary.soc} · API ${report.summary.api}`}/>
          <Metric icon={BatteryCharging} label="Battery" value={`${report.battery.level || "?"}%`} detail={`${Number(report.battery.temperature || 0) / 10}°C · ${report.battery.voltage || "?"} mV`}/>
          <Metric icon={ShieldCheck} label="Integrity" value={report.summary.verified_boot === "green" ? "Verified" : report.summary.verified_boot} detail={report.summary.locked === "1" ? "Bootloader locked" : "Bootloader state unknown"}/>
        </section>

        <section className="mt-5 grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/[.045] p-4">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Connection & commands</h2><p className="text-sm text-slate-400">Only allowlisted actions are exposed.</p></div><span className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400"/>ADB online</span></div>
            <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-2"><Wifi size={18} className={report.hotspot.active ? "text-emerald-400" : "text-amber-300"}/><strong>Personal hotspot: {report.hotspot.active ? "ON" : "OFF"}</strong></div><p className="mt-1 text-sm text-slate-400">{report.hotspot.active ? "Internet sharing is requesting an upstream connection." : "Supported and cellular upstream is permitted. Turn it on from the phone settings."}</p></div><button onClick={() => void action("tether-settings")} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#07110f]">Open hotspot settings</button></div>
            <div className="mb-5 rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold">Change hotspot password</h3><p className="mt-1 text-sm text-slate-400">1. Open settings. 2. Tap the password field on Huawei. 3. Send replacement. 4. Tap Save on Huawei.</p><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input type="password" autoComplete="new-password" value={hotspotPassword} onChange={(event) => setHotspotPassword(event.target.value)} placeholder="8–63 characters" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-emerald-400/60"/><button disabled={!/^[A-Za-z0-9._@#+=!-]{8,63}$/.test(hotspotPassword) || busy} onClick={() => void action("type-hotspot-password")} className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-40">Replace focused field</button></div><p className="mt-2 text-xs text-slate-500">Allowed: letters, numbers and . _ @ # + = ! -. The value is not stored by this app.</p></div>
            <ControlGroup title="Navigation & screen">
              <Command icon={Home} label="Home" onClick={() => void action("home")}/><Command icon={ChevronLeft} label="Back" onClick={() => void action("back")}/><Command icon={Layers3} label="Recent apps" onClick={() => void action("recents")}/><Command icon={Bell} label="Notifications" onClick={() => void action("notifications")}/><Command icon={Zap} label="Quick settings" onClick={() => void action("quick-settings")}/><Command icon={CirclePower} label="Power button" onClick={() => void action("power")}/><Command icon={Sun} label="Wake screen" onClick={() => void action("wake")}/>
            </ControlGroup>
            <ControlGroup title="Audio">
              <Command icon={Volume1} label="Volume down" onClick={() => void action("volume-down")}/><Command icon={Volume2} label="Volume up" onClick={() => void action("volume-up")}/><Command icon={VolumeX} label="Mute" onClick={() => void action("mute")}/>
            </ControlGroup>
            <ControlGroup title="System panels">
              <Command icon={Wifi} label="Wi-Fi" onClick={() => void action("wifi-settings")}/><Command icon={Bluetooth} label="Bluetooth" onClick={() => void action("bluetooth-settings")}/><Command icon={Sun} label="Display" onClick={() => void action("display-settings")}/><Command icon={Volume2} label="Sound" onClick={() => void action("sound-settings")}/><Command icon={BatteryCharging} label="Battery" onClick={() => void action("battery-settings")}/><Command icon={Database} label="Storage" onClick={() => void action("storage-settings")}/><Command icon={MapPin} label="Location" onClick={() => void action("location-settings")}/><Command icon={ShieldCheck} label="Security" onClick={() => void action("security-settings")}/><Command icon={AppWindow} label="Apps" onClick={() => void action("app-settings")}/><Command icon={Gauge} label="Developer options" onClick={() => void action("developer-settings")}/>
            </ControlGroup>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={url} onChange={(event) => setUrl(event.target.value)} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-emerald-400/60" aria-label="URL to open"/><button onClick={() => void action("open-url")} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-[#07110f]"><Send size={17}/>Open on phone</button></div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[.045] p-6"><h2 className="text-xl font-semibold">Build</h2><dl className="mt-4 space-y-3 text-sm"><Row label="Firmware" value={report.summary.build}/><Row label="Security patch" value={report.summary.patch}/><Row label="Display" value={report.display}/><Row label="Architecture" value={report.summary.abis}/></dl></div>
        </section>

        <section className="mt-6"><div className="mb-4"><h2 className="text-2xl font-semibold">Capability map</h2><p className="text-sm text-slate-400">Features declared by Android PackageManager on this exact device.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{grouped.map(({name,icon:Icon,items}) => <article key={name} className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300"><Icon size={20}/></span><h3 className="font-semibold">{name}</h3><span className="ml-auto text-xs text-slate-500">{items.length}</span></div><div className="flex flex-wrap gap-2">{items.map(item => <span key={item} title={item} className="max-w-full truncate rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300">{item.replace(/^android\.(hardware|software)\./, "")}</span>)}</div></article>)}</div></section>
        <footer className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm text-amber-100/80"><LockKeyhole className="mt-0.5 shrink-0" size={18}/><p>This dashboard is a local management bridge, not root. It cannot bypass the lock screen, extract app credentials, or write protected partitions. Disable USB/Wireless debugging when finished.</p></footer>
      </>}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-7 items-end justify-center bg-gradient-to-t from-[#07110f] to-transparent pb-2"><span className="h-1 w-28 rounded-full bg-white/70"/></div>
    </div>
  </main>;
}

function Metric({icon:Icon,label,value,detail}:{icon:typeof Wifi;label:string;value:string;detail:string}) { return <article className="min-w-0 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.025] p-4"><Icon className="mb-5 text-emerald-400" size={20}/><p className="text-[10px] uppercase tracking-[.16em] text-slate-500">{label}</p><p className="mt-1 truncate text-base font-semibold">{value}</p><p className="mt-1 truncate text-xs text-slate-400" title={detail}>{detail}</p></article>; }
function Row({label,value}:{label:string;value:string}) { return <div className="grid grid-cols-[110px_1fr] gap-3"><dt className="text-slate-500">{label}</dt><dd className="break-words text-slate-200">{value}</dd></div>; }
function Command({icon:Icon,label,onClick}:{icon:typeof Home;label:string;onClick:()=>void}) { return <button onClick={onClick} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm hover:border-emerald-400/40 hover:bg-emerald-400/10"><Icon size={17}/>{label}</button>; }
function ControlGroup({title,children}:{title:string;children:React.ReactNode}) { return <div className="mt-5"><h3 className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-slate-500">{title}</h3><div className="flex flex-wrap gap-3">{children}</div></div>; }
