"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/* ─────────────────────────────────────────────────────────────
   SLEEPSYNC DASHBOARD — Full Redesign
   Aesthetic: Dark command-center × editorial luxury × alive
   
   FEATURES (all demo-functional):
   ─ Live countdown clock (real time)
   ─ Bedtime / wake time editor
   ─ 7-day sleep calendar with quality ratings
   ─ Wind-down ritual checklist (5 steps, interactive)
   ─ 4-7-8 breathing exercise with animated guide
   ─ Sleep quality chart (last 14 nights)
   ─ Streak tracker with animation
   ─ "Log sleep" modal
   ─ "Morning check-in" quality rating
   ─ Accountability partner nudge card
   ─ Sidebar navigation
   ───────────────────────────────────────────────────────────── */

type View = "dashboard" | "winddown" | "checkin" | "insights"
type QualityLog = { day: string; quality: number; slept: boolean; time: string }

const INITIAL_LOGS: QualityLog[] = [
  { day: "Mon", quality: 4, slept: true,  time: "11:05 PM" },
  { day: "Tue", quality: 5, slept: true,  time: "10:58 PM" },
  { day: "Wed", quality: 3, slept: true,  time: "11:32 PM" },
  { day: "Thu", quality: 4, slept: true,  time: "11:02 PM" },
  { day: "Fri", quality: 2, slept: true,  time: "12:14 AM" },
  { day: "Sat", quality: 5, slept: true,  time: "11:00 PM" },
  { day: "Sun", quality: 0, slept: false, time: "—"        },
]

const WIND_DOWN_STEPS = [
  { icon: "◐", label: "Put phone face-down",      desc: "Remove it from reach entirely." },
  { icon: "◑", label: "Dim all lights",            desc: "Switch to warm 2700K only."     },
  { icon: "◒", label: "Stop all screens",          desc: "TV off, laptop closed."          },
  { icon: "◓", label: "4-7-8 breathing",           desc: "3 full cycles. Use the guide →" },
  { icon: "●",  label: "Set tomorrow's intention", desc: "One sentence. Then sleep."       },
]

export default function DashboardPage() {
  const [view, setView]               = useState<View>("dashboard")
  const [bedtime, setBedtime]         = useState("23:00")
  const [waketime, setWaketime]       = useState("07:00")
  const [countdown, setCountdown]     = useState("")
  const [nowTime, setNowTime]         = useState("")
  const [urgency, setUrgency]         = useState<"safe"|"warn"|"danger">("safe")
  const [streak]                      = useState(7)
  const [logs, setLogs]               = useState<QualityLog[]>(INITIAL_LOGS)
  const [checkedSteps, setChecked]    = useState<boolean[]>([false,false,false,false,false])
  const [windDone, setWindDone]       = useState(false)
  const [breathPhase, setBreathPhase] = useState<"inhale"|"hold"|"exhale"|"idle">("idle")
  const [breathCount, setBreathCount] = useState(0)
  const [breathTimer, setBreathTimer] = useState(0)
  const [logModal, setLogModal]       = useState(false)
  const [checkinQ, setCheckinQ]       = useState(0)
  const [checkinDone, setCheckinDone] = useState(false)
  const [intention, setIntention]     = useState("")
  const breathRef = useRef<ReturnType<typeof setTimeout>|null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ── Live clock + countdown ──────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setNowTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }))
      const [bh, bm] = bedtime.split(":").map(Number)
      const bed = new Date(); bed.setHours(bh, bm, 0, 0)
      if (bed <= now) bed.setDate(bed.getDate() + 1)
      const diff = Math.max(0, Math.floor((bed.getTime() - now.getTime()) / 1000))
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setCountdown(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`)
      setUrgency(diff < 1800 ? "danger" : diff < 3600 ? "warn" : "safe")
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [bedtime])

  // ── Sleep quality chart canvas ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth * dpr
    const H = canvas.offsetHeight * dpr
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, W, H)
    const data = logs.map(l => l.quality)
    const days = logs.map(l => l.day)
    const pad = { t: 20 * dpr, r: 20 * dpr, b: 36 * dpr, l: 20 * dpr }
    const cw = W - pad.l - pad.r
    const ch = H - pad.t - pad.b
    const step = cw / (data.length - 1)
    // grid lines
    for (let i = 0; i <= 5; i++) {
      const y = pad.t + ch - (ch * i / 5)
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y)
      ctx.strokeStyle = "rgba(124,111,247,0.08)"; ctx.lineWidth = 1; ctx.stroke()
    }
    // area fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch)
    grad.addColorStop(0, "rgba(124,111,247,0.25)")
    grad.addColorStop(1, "rgba(124,111,247,0)")
    ctx.beginPath()
    ctx.moveTo(pad.l, pad.t + ch)
    data.forEach((v, i) => {
      const x = pad.l + i * step
      const y = pad.t + ch - (ch * v / 5)
      i === 0 ? ctx.lineTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.lineTo(pad.l + (data.length - 1) * step, pad.t + ch)
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill()
    // line
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = pad.l + i * step
      const y = pad.t + ch - (ch * v / 5)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = "#7C6FF7"; ctx.lineWidth = 2 * dpr; ctx.lineJoin = "round"; ctx.stroke()
    // dots
    data.forEach((v, i) => {
      const x = pad.l + i * step
      const y = pad.t + ch - (ch * v / 5)
      ctx.beginPath(); ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2)
      ctx.fillStyle = v >= 4 ? "#4ADE80" : v >= 3 ? "#7C6FF7" : "#F59E6A"
      ctx.fill()
      ctx.fillStyle = "rgba(240,238,248,0.5)"
      ctx.font = `${10 * dpr}px DM Mono, monospace`
      ctx.textAlign = "center"
      ctx.fillText(days[i], x, H - pad.b / 2)
    })
  }, [logs, view])

  // ── Breathing exercise ──────────────────────────────────────
  const startBreath = useCallback(() => {
    let cycle = 0
    const run = (phase: "inhale"|"hold"|"exhale", duration: number, next: ()=>void) => {
      setBreathPhase(phase); setBreathTimer(duration)
      let t = duration
      const id = setInterval(() => {
        t--; setBreathTimer(t)
        if (t <= 0) { clearInterval(id); next() }
      }, 1000)
      breathRef.current = id
    }
    const doCycle = () => {
      if (cycle >= 3) { setBreathPhase("idle"); setBreathCount(3); return }
      cycle++; setBreathCount(cycle)
      run("inhale", 4, () => run("hold", 7, () => run("exhale", 8, doCycle)))
    }
    doCycle()
  }, [])

  const stopBreath = () => {
    if (breathRef.current) clearInterval(breathRef.current)
    setBreathPhase("idle"); setBreathTimer(0)
  }

  // ── Log sleep ───────────────────────────────────────────────
  const logSleep = () => {
    const today = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    setLogs(prev => {
      const updated = [...prev]
      updated[6] = { day: "Sun", quality: checkinQ || 4, slept: true, time: today }
      return updated
    })
    setLogModal(false)
    setCheckinDone(true)
  }

  // ── helpers ─────────────────────────────────────────────────
  const toggleStep = (i: number) => {
    const next = [...checkedSteps]; next[i] = !next[i]; setChecked(next)
    if (next.every(Boolean)) setTimeout(() => setWindDone(true), 400)
  }

  const urgencyColor = urgency === "danger" ? "#EF4444" : urgency === "warn" ? "#F59E6A" : "#7C6FF7"
  const breathLabel = { inhale: "Inhale", hold: "Hold", exhale: "Exhale", idle: "" }[breathPhase]
  const breathScale = breathPhase === "inhale" ? 1.35 : breathPhase === "hold" ? 1.35 : breathPhase === "exhale" ? 0.85 : 1

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Mono:wght@400;500&family=Syne:wght@500;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080810;--s1:#0d0d1c;--s2:#111128;--s3:#16162e;
          --border:rgba(124,111,247,0.15);--border2:rgba(124,111,247,0.28);
          --purple:#7C6FF7;--amber:#F59E6A;--green:#4ADE80;--pink:#F472B6;
          --text:#F0EEF8;--muted:#5a5875;--muted2:#7a7898;
        }
        html,body{background:var(--bg);color:var(--text);font-family:'Syne',sans-serif;height:100%}
        .layout{display:flex;min-height:100vh}

        /* SIDEBAR */
        .sidebar{
          width:68px;background:var(--s1);border-right:0.5px solid var(--border);
          display:flex;flex-direction:column;align-items:center;padding:20px 0;gap:4px;
          position:sticky;top:0;height:100vh;flex-shrink:0;z-index:50;
          transition:width 0.3s;overflow:hidden;
        }
        .sidebar:hover{width:200px}
        .sidebar:hover .nav-label{opacity:1;width:auto}
        .nav-logo{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;
          color:var(--text);white-space:nowrap;padding:0 20px;margin-bottom:24px;
          width:100%;display:flex;align-items:center;gap:10px}
        .nav-logo span{color:var(--purple)}
        .nav-logo-icon{width:28px;height:28px;border-radius:8px;background:var(--purple);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
          font-size:14px;color:#fff;font-family:'DM Mono',monospace;font-weight:500}
        .nav-item{
          width:calc(100% - 16px);display:flex;align-items:center;gap:12px;
          padding:10px 12px;border-radius:10px;cursor:pointer;
          transition:background 0.15s,color 0.15s;color:var(--muted2);font-size:13px;font-weight:600;
          white-space:nowrap;border:none;background:transparent;text-align:left;
        }
        .nav-item:hover{background:rgba(124,111,247,0.1);color:var(--text)}
        .nav-item.active{background:rgba(124,111,247,0.15);color:var(--purple)}
        .nav-icon{font-size:18px;flex-shrink:0;width:20px;text-align:center}
        .nav-label{opacity:0;width:0;overflow:hidden;transition:opacity 0.2s,width 0.3s;font-family:'DM Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em}

        /* MAIN */
        .main{flex:1;overflow:auto;background:var(--bg);position:relative}
        .dot-bg{position:fixed;inset:0;background-image:radial-gradient(circle,rgba(124,111,247,0.09) 1px,transparent 1px);background-size:28px 28px;pointer-events:none;z-index:0}
        .orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0;filter:blur(90px);opacity:0.18}

        /* TOPBAR */
        .topbar{
          position:sticky;top:0;z-index:40;
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 32px;border-bottom:0.5px solid var(--border);
          background:rgba(8,8,16,0.85);backdrop-filter:blur(20px);
        }
        .topbar-left{display:flex;align-items:center;gap:16px}
        .topbar-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700}
        .topbar-title span{color:var(--purple);font-style:italic}
        .topbar-right{display:flex;align-items:center;gap:12px}
        .live-chip{display:flex;align-items:center;gap:7px;padding:7px 14px;border:0.5px solid var(--border);border-radius:20px;background:rgba(255,255,255,0.02)}
        .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 1.2s ease infinite;flex-shrink:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.15}}
        .live-time{font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:var(--text)}
        .signout-btn{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;padding:8px 16px;border:0.5px solid var(--border2);background:transparent;color:var(--muted2);border-radius:6px;cursor:pointer;transition:all 0.2s}
        .signout-btn:hover{color:var(--text);border-color:rgba(255,255,255,0.25)}

        /* CONTENT */
        .content{position:relative;z-index:1;padding:28px 32px;max-width:1300px}

        /* GRID LAYOUTS */
        .grid-hero{display:grid;grid-template-columns:340px 1fr 280px;gap:18px;margin-bottom:18px}
        .grid-mid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
        .grid-bot{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}

        /* CARD */
        .card{
          background:var(--s1);border:0.5px solid var(--border);border-radius:18px;
          position:relative;overflow:hidden;
          animation:fadeUp 0.5s ease forwards;opacity:0;
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);pointer-events:none}
        .card-pad{padding:22px 24px}
        .card-label{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.22em;color:var(--muted);margin-bottom:12px;display:block}
        .card-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;margin-bottom:6px;color:var(--text)}

        /* BIG COUNTDOWN */
        .countdown-card{
          background:linear-gradient(145deg,#0d0d1c,#0a0a18);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:32px 24px;text-align:center;gap:6px;
          animation-delay:0.05s;
        }
        .cd-ring{
          width:160px;height:160px;position:relative;margin-bottom:16px;flex-shrink:0;
        }
        .cd-ring svg{position:absolute;inset:0;width:100%;height:100%}
        .cd-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
        .cd-label{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:0.22em;color:var(--muted)}
        .cd-num{font-family:'DM Mono',monospace;font-size:28px;font-weight:500;letter-spacing:-0.5px;line-height:1}
        .cd-hint{font-family:'Syne',sans-serif;font-size:11px;color:var(--muted)}
        .cd-times{display:flex;gap:16px}
        .cd-time-item{text-align:center}
        .cd-time-val{font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:var(--text)}
        .cd-time-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:0.15em;color:var(--muted);margin-top:3px}
        .cd-divider{width:1px;background:var(--border);align-self:stretch}
        .time-input{background:transparent;border:none;color:var(--purple);font-family:'DM Mono',monospace;font-size:14px;font-weight:500;cursor:pointer;outline:none;width:64px;text-align:center}
        .time-input::-webkit-calendar-picker-indicator{filter:invert(0.4) sepia(1) saturate(5) hue-rotate(220deg)}

        /* STREAK */
        .streak-card{animation-delay:0.1s;display:flex;flex-direction:column;justify-content:space-between}
        .streak-top{padding:22px 24px 0}
        .streak-big{display:flex;align-items:flex-end;gap:10px;margin:8px 0}
        .streak-num{font-family:'Playfair Display',serif;font-size:64px;font-weight:900;line-height:0.9;color:var(--amber)}
        .streak-meta{padding-bottom:4px}
        .streak-unit{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--amber)}
        .streak-sub{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:var(--muted)}
        .flame{font-size:32px;animation:flicker 2s ease-in-out infinite alternate;display:inline-block}
        @keyframes flicker{0%{transform:scaleY(1) rotate(-2deg)}50%{transform:scaleY(1.1) rotate(1deg)}100%{transform:scaleY(0.96) rotate(-1deg)}}
        .streak-bar{height:4px;background:var(--s3);margin:16px 24px 0;border-radius:2px;overflow:hidden}
        .streak-fill{height:100%;background:linear-gradient(90deg,var(--amber),#F59E6A88);border-radius:2px;transition:width 1s ease}
        .streak-week{display:flex;justify-content:space-between;padding:12px 24px 22px}
        .sw-item{display:flex;flex-direction:column;align-items:center;gap:5px}
        .sw-dot{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,0.07);transition:all 0.3s;cursor:default}
        .sw-dot.hit{background:var(--purple);border-color:var(--purple)}
        .sw-dot.today{border:1.5px solid var(--amber);animation:pulseRing 2s ease infinite}
        @keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(245,158,106,0.4)}50%{box-shadow:0 0 0 6px rgba(245,158,106,0)}}
        .sw-day{font-family:'DM Mono',monospace;font-size:8px;color:var(--muted);text-transform:uppercase}

        /* ACCOUNTABILITY */
        .acct-card{animation-delay:0.15s;padding:22px 24px}
        .acct-avatar{width:40px;height:40px;border-radius:50%;background:rgba(124,111,247,0.15);border:1.5px solid var(--purple);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:var(--purple);flex-shrink:0}
        .acct-row{display:flex;align-items:center;gap:12px;margin-top:14px}
        .acct-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--text)}
        .acct-status{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted)}
        .acct-badge{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;padding:3px 10px;border-radius:20px;background:rgba(74,222,128,0.12);color:var(--green);border:0.5px solid rgba(74,222,128,0.25);margin-left:auto}
        .nudge-box{margin-top:16px;padding:12px 14px;border-radius:10px;background:rgba(244,114,182,0.07);border:0.5px solid rgba(244,114,182,0.2);font-family:'Syne',sans-serif;font-size:12px;color:var(--pink);line-height:1.5}

        /* SLEEP CHART */
        .chart-card{animation-delay:0.2s;grid-column:span 2}
        .chart-canvas{width:100%;height:160px;display:block;margin-top:8px}

        /* 7-DAY CALENDAR */
        .cal-card{animation-delay:0.25s}
        .cal-grid{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
        .cal-day{flex:1;min-width:34px;border-radius:10px;padding:10px 6px;text-align:center;border:0.5px solid var(--border);background:var(--s2);transition:all 0.2s;cursor:default}
        .cal-day.slept{background:rgba(124,111,247,0.1);border-color:rgba(124,111,247,0.3)}
        .cal-day.missed{background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.2)}
        .cal-day.today{border-color:var(--amber)!important;position:relative}
        .cal-day-name{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:6px}
        .cal-day-q{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;line-height:1}
        .cal-day-time{font-family:'DM Mono',monospace;font-size:8px;color:var(--muted);margin-top:4px}
        .q-stars{font-size:8px;margin-top:3px;display:flex;justify-content:center;gap:1px}

        /* WIND-DOWN */
        .wd-card{animation-delay:0.3s}
        .wd-step{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:0.5px solid var(--border);cursor:pointer;transition:opacity 0.2s}
        .wd-step:last-child{border-bottom:none;padding-bottom:0}
        .wd-step.done{opacity:0.4}
        .wd-check{width:22px;height:22px;border-radius:6px;border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all 0.2s;font-size:12px}
        .wd-step.done .wd-check{background:var(--purple);border-color:var(--purple);color:#fff}
        .wd-icon{font-size:16px;flex-shrink:0;margin-top:2px}
        .wd-lbl{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--text)}
        .wd-desc{font-family:'Syne',sans-serif;font-size:11px;color:var(--muted);margin-top:2px}
        .wd-done-banner{padding:16px;background:rgba(74,222,128,0.08);border:0.5px solid rgba(74,222,128,0.25);border-radius:12px;text-align:center;margin-top:8px}
        .wd-done-text{font-family:'Playfair Display',serif;font-size:16px;font-style:italic;color:var(--green)}

        /* BREATHING */
        .breath-card{animation-delay:0.35s;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center}
        .breath-ring{
          width:120px;height:120px;border-radius:50%;
          border:1.5px solid rgba(124,111,247,0.2);
          display:flex;align-items:center;justify-content:center;
          position:relative;margin:16px 0;
          transition:transform 0.8s ease;
        }
        .breath-inner{
          width:70px;height:70px;border-radius:50%;background:rgba(124,111,247,0.15);
          border:1px solid var(--purple);display:flex;align-items:center;justify-content:center;
          flex-direction:column;gap:2px;
          transition:transform 1s ease,background 0.8s ease;
        }
        .breath-ph{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:var(--purple)}
        .breath-t{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--text)}
        .breath-cycles{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.12em}
        .breath-btns{display:flex;gap:8px;margin-top:8px}
        .btn-sm{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;padding:9px 18px;border-radius:6px;cursor:pointer;transition:all 0.2s;border:0.5px solid}
        .btn-purple{background:var(--purple);color:#fff;border-color:var(--purple)}
        .btn-purple:hover{opacity:0.85}
        .btn-outline{background:transparent;color:var(--muted2);border-color:var(--border2)}
        .btn-outline:hover{color:var(--text);border-color:rgba(255,255,255,0.25)}

        /* CHECK-IN */
        .ci-card{animation-delay:0.4s}
        .ci-emojis{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
        .ci-btn{font-size:24px;background:transparent;border:1.5px solid var(--border);border-radius:12px;padding:10px 14px;cursor:pointer;transition:all 0.2s;line-height:1}
        .ci-btn:hover{border-color:var(--purple);transform:scale(1.1)}
        .ci-btn.sel{border-color:var(--purple);background:rgba(124,111,247,0.15);transform:scale(1.12)}
        .ci-confirm{margin-top:14px;display:flex;gap:8px}
        .ci-done{margin-top:14px;padding:14px;background:rgba(74,222,128,0.07);border:0.5px solid rgba(74,222,128,0.2);border-radius:12px;text-align:center}
        .ci-done-text{font-family:'Playfair Display',serif;font-size:15px;font-style:italic;color:var(--green)}

        /* LOG MODAL */
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center}
        .modal{background:var(--s1);border:0.5px solid var(--border2);border-radius:22px;padding:36px;max-width:420px;width:100%;position:relative}
        .modal::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--purple),transparent)}
        .modal-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;margin-bottom:6px}
        .modal-sub{font-family:'Syne',sans-serif;font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.5}
        .modal-q{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:var(--muted);margin-bottom:12px}
        .modal-emojis{display:flex;gap:10px;margin-bottom:24px}
        .modal-close{position:absolute;top:18px;right:18px;background:transparent;border:0.5px solid var(--border);color:var(--muted);font-size:16px;width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s}
        .modal-close:hover{color:var(--text);border-color:rgba(255,255,255,0.2)}
        .btn-full{width:100%;padding:14px;font-family:'DM Mono',monospace;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;background:var(--purple);color:#fff;border:none;border-radius:10px;cursor:pointer;transition:opacity 0.2s;margin-top:8px}
        .btn-full:hover{opacity:0.85}

        /* STAGGER */
        .card:nth-child(1){animation-delay:0.05s}
        .card:nth-child(2){animation-delay:0.10s}
        .card:nth-child(3){animation-delay:0.15s}
        .card:nth-child(4){animation-delay:0.20s}
        .card:nth-child(5){animation-delay:0.25s}
        .card:nth-child(6){animation-delay:0.30s}
        .card:nth-child(7){animation-delay:0.35s}
        .card:nth-child(8){animation-delay:0.40s}

        /* TAG */
        .tag{display:inline-flex;align-items:center;gap:5px;font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;padding:3px 10px;border-radius:20px}
        .tag-purple{background:rgba(124,111,247,0.12);color:var(--purple);border:0.5px solid rgba(124,111,247,0.25)}
        .tag-amber{background:rgba(245,158,106,0.12);color:var(--amber);border:0.5px solid rgba(245,158,106,0.25)}
        .tag-green{background:rgba(74,222,128,0.10);color:var(--green);border:0.5px solid rgba(74,222,128,0.2)}
        .tag-red{background:rgba(239,68,68,0.10);color:#F87171;border:0.5px solid rgba(239,68,68,0.2)}

        /* CTA STRIP */
        .cta-strip{display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap}
        .cta-card{flex:1;min-width:160px;padding:18px 20px;background:var(--s1);border:0.5px solid var(--border);border-radius:16px;cursor:pointer;transition:all 0.2s;text-decoration:none;color:inherit}
        .cta-card:hover{border-color:var(--border2);background:var(--s2);transform:translateY(-2px)}
        .cta-card.primary{background:rgba(124,111,247,0.1);border-color:rgba(124,111,247,0.35)}
        .cta-card.primary:hover{background:rgba(124,111,247,0.18)}
        .cta-icon{font-size:22px;margin-bottom:8px;display:block}
        .cta-lbl{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px}
        .cta-sub{font-family:'Syne',sans-serif;font-size:11px;color:var(--muted)}
      `}</style>

      {/* DOT GRID + ORBS */}
      <div className="dot-bg" />
      <div className="orb" style={{ width:500,height:500,background:"#7C6FF7",top:"-100px",right:"-50px" }} />
      <div className="orb" style={{ width:300,height:300,background:"#F59E6A",bottom:"100px",left:"100px" }} />

      <div className="layout">
        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="nav-logo">
            <div className="nav-logo-icon">S</div>
            <span>Sleep<span>Sync</span></span>
          </div>
          {([
            { id:"dashboard", icon:"◎", label:"Dashboard"  },
            { id:"winddown",  icon:"◐", label:"Wind-down"  },
            { id:"checkin",   icon:"◑", label:"Check-in"   },
            { id:"insights",  icon:"◒", label:"Insights"   },
          ] as {id:View,icon:string,label:string}[]).map(n => (
            <button key={n.id} className={`nav-item ${view===n.id?"active":""}`} onClick={()=>setView(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </aside>

        {/* ── MAIN ─────────────────────────────────────────────── */}
        <div className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-left">
              <div className="topbar-title">
                {view === "dashboard" && <><em>Tonight's</em> command center</>}
                {view === "winddown"  && <><em>Wind-down</em> ritual</>}
                {view === "checkin"   && <><em>Morning</em> check-in</>}
                {view === "insights"  && <><em>Sleep</em> insights</>}
              </div>
            </div>
            <div className="topbar-right">
              <div className="live-chip">
                <div className="live-dot" />
                <span className="live-time">{nowTime}</span>
              </div>
              <span className="tag tag-amber">🔥 {streak} streak</span>
              <button className="signout-btn" onClick={()=>setLogModal(true)}>Log sleep</button>
            </div>
          </div>

          <div className="content">

            {/* ═══════════════ DASHBOARD VIEW ═══════════════ */}
            {view === "dashboard" && (<>

              {/* CTA STRIP */}
              <div className="cta-strip">
                <div className="cta-card primary" onClick={()=>setView("winddown")}>
                  <span className="cta-icon">◐</span>
                  <div className="cta-lbl">Start wind-down</div>
                  <div className="cta-sub">5-step pre-sleep ritual</div>
                </div>
                <div className="cta-card" onClick={()=>setLogModal(true)}>
                  <span className="cta-icon">◉</span>
                  <div className="cta-lbl">Log sleep now</div>
                  <div className="cta-sub">Record tonight's bedtime</div>
                </div>
                <div className="cta-card" onClick={()=>setView("checkin")}>
                  <span className="cta-icon">◑</span>
                  <div className="cta-lbl">Morning check-in</div>
                  <div className="cta-sub">Rate last night's quality</div>
                </div>
                <div className="cta-card" onClick={()=>setView("insights")}>
                  <span className="cta-icon">◒</span>
                  <div className="cta-lbl">View insights</div>
                  <div className="cta-sub">14-night sleep analysis</div>
                </div>
              </div>

              {/* HERO ROW */}
              <div className="grid-hero">
                {/* Countdown */}
                <div className="card countdown-card">
                  <div className="cd-ring">
                    <svg viewBox="0 0 160 160" fill="none">
                      <circle cx="80" cy="80" r="70" stroke="rgba(124,111,247,0.1)" strokeWidth="3"/>
                      <circle cx="80" cy="80" r="70"
                        stroke={urgencyColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * 0.3}`}
                        transform="rotate(-90 80 80)"
                        style={{transition:"stroke 0.5s"}}
                      />
                    </svg>
                    <div className="cd-inner">
                      <span className="cd-label">until bed</span>
                      <span className="cd-num" style={{color:urgencyColor}}>{countdown}</span>
                    </div>
                  </div>
                  <span className="tag tag-purple" style={{marginBottom:12}}>
                    {urgency==="danger"?"⚠ Wind down now":urgency==="warn"?"◑ Almost time":"◎ You have time"}
                  </span>
                  <div className="cd-times">
                    <div className="cd-time-item">
                      <input type="time" className="time-input" value={bedtime} onChange={e=>setBedtime(e.target.value)} />
                      <div className="cd-time-lbl">Bedtime</div>
                    </div>
                    <div className="cd-divider" />
                    <div className="cd-time-item">
                      <input type="time" className="time-input" value={waketime} onChange={e=>setWaketime(e.target.value)} />
                      <div className="cd-time-lbl">Wake time</div>
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="card streak-card">
                  <div className="streak-top">
                    <span className="card-label">Current streak</span>
                    <div className="streak-big">
                      <span className="flame">🔥</span>
                      <span className="streak-num">{streak}</span>
                      <div className="streak-meta">
                        <div className="streak-unit">nights</div>
                        <div className="streak-sub">Personal best: 14</div>
                      </div>
                    </div>
                  </div>
                  <div className="streak-bar">
                    <div className="streak-fill" style={{width:`${(streak/14)*100}%`}} />
                  </div>
                  <div className="streak-week">
                    {["M","T","W","T","F","S","S"].map((d,i)=>(
                      <div className="sw-item" key={i}>
                        <div className={`sw-dot ${i<5?"hit":""} ${i===5?"today":""}`} />
                        <span className="sw-day" style={i===5?{color:"var(--amber)"}:{}}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accountability */}
                <div className="card acct-card">
                  <span className="card-label">Accountability partner</span>
                  <div className="acct-row">
                    <div className="acct-avatar">AK</div>
                    <div>
                      <div className="acct-name">Alex K.</div>
                      <div className="acct-status">Slept 10:57 PM last night</div>
                    </div>
                    <span className="acct-badge">Slept ✓</span>
                  </div>
                  <div className="nudge-box" style={{marginTop:14}}>
                    <strong style={{fontFamily:"Syne,sans-serif",fontSize:12}}>💬 Alex says:</strong><br/>
                    "Still on our streak! Don't break it tonight 👀"
                  </div>
                  <button className="btn-sm btn-outline" style={{marginTop:12,width:"100%"}} onClick={()=>setLogModal(true)}>
                    Invite a partner →
                  </button>
                </div>
              </div>

              {/* MID ROW */}
              <div className="grid-mid">
                {/* Sleep quality chart */}
                <div className="card chart-card" style={{padding:"22px 24px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <span className="card-label">Sleep quality</span>
                      <div className="card-title">Last 7 nights</div>
                    </div>
                    <span className="tag tag-green">Avg 3.9 / 5</span>
                  </div>
                  <canvas ref={canvasRef} className="chart-canvas" />
                </div>

                {/* 7-day calendar */}
                <div className="card cal-card" style={{padding:"22px 24px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <span className="card-label">Sleep log</span>
                      <div className="card-title">This week</div>
                    </div>
                    <span className="tag tag-purple">6 / 7 nights</span>
                  </div>
                  <div className="cal-grid">
                    {logs.map((l,i)=>(
                      <div key={i} className={`cal-day ${l.slept?"slept":"missed"} ${i===6?"today":""}`}>
                        <div className="cal-day-name">{l.day}</div>
                        <div className="cal-day-q" style={{color:l.slept?(l.quality>=4?"#4ADE80":l.quality>=3?"#7C6FF7":"#F59E6A"):"#EF4444"}}>
                          {l.slept ? l.quality : "✕"}
                        </div>
                        <div className="q-stars">
                          {l.slept && Array.from({length:5},(_,j)=>(
                            <span key={j} style={{color:j<l.quality?"#7C6FF7":"rgba(255,255,255,0.1)"}}>★</span>
                          ))}
                        </div>
                        <div className="cal-day-time">{l.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className="grid-bot">
                {/* Wind-down preview */}
                <div className="card wd-card" style={{padding:"22px 24px"}}>
                  <span className="card-label">Tonight's ritual</span>
                  <div className="card-title" style={{marginBottom:14}}>Wind-down checklist</div>
                  {WIND_DOWN_STEPS.slice(0,3).map((s,i)=>(
                    <div key={i} className={`wd-step ${checkedSteps[i]?"done":""}`} onClick={()=>toggleStep(i)}>
                      <div className="wd-check">{checkedSteps[i]?"✓":""}</div>
                      <span className="wd-icon">{s.icon}</span>
                      <div><div className="wd-lbl">{s.label}</div></div>
                    </div>
                  ))}
                  <button className="btn-sm btn-purple" style={{marginTop:14,width:"100%"}} onClick={()=>setView("winddown")}>
                    Full ritual →
                  </button>
                </div>

                {/* Breathing widget */}
                <div className="card breath-card">
                  <span className="card-label" style={{alignSelf:"flex-start"}}>4-7-8 breathing</span>
                  <div className="breath-ring">
                    <div className="breath-inner" style={{transform:`scale(${breathScale})`,background:breathPhase!=="idle"?"rgba(124,111,247,0.25)":"rgba(124,111,247,0.15)"}}>
                      <span className="breath-ph">{breathLabel}</span>
                      {breathPhase!=="idle" && <span className="breath-t">{breathTimer}</span>}
                      {breathPhase==="idle" && <span style={{fontSize:22}}>◐</span>}
                    </div>
                  </div>
                  <span className="breath-cycles">
                    {breathPhase==="idle" ? "3 cycles · lowers HR 20%" : `Cycle ${breathCount} / 3`}
                  </span>
                  <div className="breath-btns">
                    {breathPhase==="idle"
                      ? <button className="btn-sm btn-purple" onClick={startBreath}>Start exercise</button>
                      : <button className="btn-sm btn-outline" onClick={stopBreath}>Stop</button>
                    }
                  </div>
                </div>

                {/* Stats */}
                <div className="card" style={{padding:"22px 24px"}}>
                  <span className="card-label">Sleep stats</span>
                  <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:8}}>
                    {[
                      {label:"Avg sleep time",  val:"11:08 PM", tag:"tag-purple"},
                      {label:"Avg wake time",   val:"7:02 AM",  tag:"tag-green"},
                      {label:"Avg duration",    val:"7h 54m",   tag:"tag-amber"},
                      {label:"On-time nights",  val:"6 / 7",    tag:"tag-green"},
                      {label:"Best quality",    val:"5 / 5",    tag:"tag-purple"},
                    ].map((s,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"0.5px solid var(--border)",paddingBottom:10}}>
                        <span style={{fontFamily:"Syne,sans-serif",fontSize:12,color:"var(--muted2)"}}>{s.label}</span>
                        <span className={`tag ${s.tag}`}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>)}

            {/* ═══════════════ WIND-DOWN VIEW ═══════════════ */}
            {view === "winddown" && (
              <div style={{maxWidth:600,margin:"0 auto"}}>
                <div className="card" style={{padding:"32px 32px"}}>
                  <span className="card-label">Tonight's ritual</span>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,marginBottom:6}}>Wind-down checklist</div>
                  <p style={{fontFamily:"Syne,sans-serif",fontSize:13,color:"var(--muted)",marginBottom:28,lineHeight:1.6}}>
                    Complete each step before you sleep. The page dims as you go.
                  </p>
                  {windDone ? (
                    <div className="wd-done-banner">
                      <div className="wd-done-text">"All steps complete. Time to sleep." 🌙</div>
                      <button className="btn-sm btn-purple" style={{marginTop:14}} onClick={()=>setLogModal(true)}>Log sleep now →</button>
                    </div>
                  ) : (
                    WIND_DOWN_STEPS.map((s,i)=>(
                      <div key={i} className={`wd-step ${checkedSteps[i]?"done":""}`} onClick={()=>toggleStep(i)}
                        style={{background:checkedSteps[i]?"rgba(124,111,247,0.05)":"transparent",borderRadius:10,padding:"14px 12px",margin:"4px 0",borderBottom:"none",border:"0.5px solid "+(checkedSteps[i]?"rgba(124,111,247,0.2)":"var(--border)")}}>
                        <div className="wd-check">{checkedSteps[i]?"✓":""}</div>
                        <span className="wd-icon" style={{fontSize:22}}>{s.icon}</span>
                        <div>
                          <div className="wd-lbl" style={{fontSize:15}}>{s.label}</div>
                          <div className="wd-desc">{s.desc}</div>
                        </div>
                        {i===3 && !checkedSteps[i] && (
                          <button className="btn-sm btn-outline" style={{marginLeft:"auto"}} onClick={e=>{e.stopPropagation();startBreath();toggleStep(i)}}>Start →</button>
                        )}
                      </div>
                    ))
                  )}
                  {!windDone && (
                    <div style={{marginTop:20}}>
                      <label style={{fontFamily:"DM Mono,monospace",fontSize:9,textTransform:"uppercase",letterSpacing:"0.18em",color:"var(--muted)",display:"block",marginBottom:8}}>
                        Tomorrow's intention
                      </label>
                      <textarea
                        value={intention}
                        onChange={e=>setIntention(e.target.value)}
                        placeholder="One sentence about tomorrow..."
                        style={{width:"100%",background:"var(--s2)",border:"0.5px solid var(--border2)",borderRadius:10,padding:"12px 14px",color:"var(--text)",fontFamily:"Syne,sans-serif",fontSize:13,resize:"none",height:72,outline:"none"}}
                      />
                    </div>
                  )}
                </div>

                {/* Breathing card in winddown */}
                <div className="card breath-card" style={{marginTop:18}}>
                  <span className="card-label" style={{alignSelf:"flex-start"}}>Step 4 · 4-7-8 breathing exercise</span>
                  <div className="breath-ring" style={{width:150,height:150}}>
                    <div className="breath-inner" style={{transform:`scale(${breathScale})`,width:90,height:90,background:breathPhase!=="idle"?"rgba(124,111,247,0.25)":"rgba(124,111,247,0.15)"}}>
                      <span className="breath-ph">{breathLabel || "◐"}</span>
                      {breathPhase!=="idle" && <span className="breath-t">{breathTimer}</span>}
                    </div>
                  </div>
                  <p style={{fontFamily:"Syne,sans-serif",fontSize:12,color:"var(--muted)",marginBottom:12,textAlign:"center",maxWidth:280}}>
                    Inhale 4s → Hold 7s → Exhale 8s. Repeat 3 cycles. Lowers heart rate by ~20%.
                  </p>
                  <div className="breath-btns">
                    {breathPhase==="idle"
                      ? <button className="btn-sm btn-purple" onClick={startBreath}>Begin 3 cycles</button>
                      : <>
                          <button className="btn-sm btn-outline" onClick={stopBreath}>Stop</button>
                          <span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--muted)",display:"flex",alignItems:"center"}}>Cycle {breathCount} / 3</span>
                        </>
                    }
                    {breathCount===3 && breathPhase==="idle" && (
                      <span className="tag tag-green" style={{marginLeft:4}}>Complete ✓</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ CHECK-IN VIEW ═══════════════ */}
            {view === "checkin" && (
              <div style={{maxWidth:560,margin:"0 auto"}}>
                <div className="card ci-card" style={{padding:"32px"}}>
                  <span className="card-label">Morning ritual</span>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,marginBottom:8}}>How did you sleep?</div>
                  <p style={{fontFamily:"Syne,sans-serif",fontSize:13,color:"var(--muted)",marginBottom:24,lineHeight:1.6}}>
                    Rate last night's quality. This builds your personal sleep profile over time.
                  </p>
                  {checkinDone ? (
                    <div className="ci-done">
                      <div className="ci-done-text">Logged! Your streak is still alive 🔥</div>
                      <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--muted)",marginTop:6,textTransform:"uppercase",letterSpacing:"0.12em"}}>Streak: {streak} nights</div>
                    </div>
                  ) : (
                    <>
                      <div className="modal-q">Rate quality (1–5)</div>
                      <div className="ci-emojis">
                        {["😴","😐","🙂","😊","✨"].map((e,i)=>(
                          <button key={i} className={`ci-btn ${checkinQ===i+1?"sel":""}`} onClick={()=>setCheckinQ(i+1)}>
                            {e}
                          </button>
                        ))}
                      </div>
                      {checkinQ > 0 && (
                        <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--purple)",marginBottom:16,textTransform:"uppercase",letterSpacing:"0.12em"}}>
                          {["","Rough night","Okay","Good","Great","Perfect!"][checkinQ]}
                        </div>
                      )}
                      <label style={{fontFamily:"DM Mono,monospace",fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--muted)",display:"block",marginBottom:8}}>What time did you actually fall asleep?</label>
                      <input type="time" defaultValue="23:00"
                        style={{background:"var(--s2)",border:"0.5px solid var(--border2)",borderRadius:8,padding:"10px 14px",color:"var(--text)",fontFamily:"DM Mono,monospace",fontSize:14,marginBottom:20,outline:"none",width:"100%"}}
                      />
                      <label style={{fontFamily:"DM Mono,monospace",fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--muted)",display:"block",marginBottom:8}}>Notes (optional)</label>
                      <textarea placeholder="Anything affecting sleep? Stress, coffee, late screen time..."
                        style={{width:"100%",background:"var(--s2)",border:"0.5px solid var(--border2)",borderRadius:10,padding:"12px 14px",color:"var(--text)",fontFamily:"Syne,sans-serif",fontSize:13,resize:"none",height:80,outline:"none",marginBottom:20}}
                      />
                      <button className="btn-full" onClick={logSleep} disabled={checkinQ===0}
                        style={{opacity:checkinQ===0?0.4:1}}>
                        Submit check-in →
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════ INSIGHTS VIEW ═══════════════ */}
            {view === "insights" && (
              <div>
                <div className="grid-mid" style={{marginBottom:18}}>
                  {[
                    {label:"Average sleep time", val:"7h 54m", sub:"vs 7h 30m last week", color:"var(--purple)", tag:"tag-green", tagVal:"↑ 24min"},
                    {label:"On-time nights",      val:"86%",   sub:"6 of 7 nights this week", color:"var(--amber)", tag:"tag-green", tagVal:"↑ from 71%"},
                    {label:"Average quality",     val:"3.9/5", sub:"Based on your ratings", color:"var(--green)", tag:"tag-purple", tagVal:"Good"},
                    {label:"Best streak ever",    val:"14",    sub:"Nights in a row", color:"var(--pink)", tag:"tag-amber", tagVal:"🔥 Record"},
                  ].map((s,i)=>(
                    <div key={i} className="card" style={{padding:"24px",animationDelay:`${i*0.08}s`}}>
                      <span className="card-label">{s.label}</span>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:900,color:s.color,lineHeight:1,marginBottom:6}}>{s.val}</div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontFamily:"Syne,sans-serif",fontSize:12,color:"var(--muted)"}}>{s.sub}</span>
                        <span className={`tag ${s.tag}`}>{s.tagVal}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{padding:"24px",marginBottom:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div>
                      <span className="card-label">Sleep quality trend</span>
                      <div className="card-title">Last 7 nights</div>
                    </div>
                    <span className="tag tag-green">Improving ↑</span>
                  </div>
                  <canvas ref={canvasRef} style={{width:"100%",height:180,display:"block"}} />
                </div>
                <div className="card" style={{padding:"24px"}}>
                  <span className="card-label">AI insights</span>
                  <div className="card-title" style={{marginBottom:16}}>What your data says</div>
                  {[
                    {icon:"◎",text:"You sleep best on Tuesdays and Saturdays — both nights you were in bed before 11 PM.",color:"var(--green)"},
                    {icon:"◐",text:"Friday is your weakest night. Late screens or social activity likely pushing bedtime past midnight.",color:"var(--amber)"},
                    {icon:"◑",text:"Your average quality jumps from 2.8 to 4.2 when you complete the wind-down checklist.",color:"var(--purple)"},
                    {icon:"◒",text:"7 more nights on current streak equals your personal record of 14. You're halfway there.",color:"var(--pink)"},
                  ].map((ins,i)=>(
                    <div key={i} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:"0.5px solid var(--border)"}}>
                      <span style={{fontSize:18,color:ins.color,flexShrink:0,marginTop:2}}>{ins.icon}</span>
                      <span style={{fontFamily:"Syne,sans-serif",fontSize:13,color:"var(--muted2)",lineHeight:1.6}}>{ins.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>{/* /content */}
        </div>{/* /main */}
      </div>{/* /layout */}

      {/* ── LOG SLEEP MODAL ──────────────────────────────────── */}
      {logModal && (
        <div className="modal-bg" onClick={()=>setLogModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={()=>setLogModal(false)}>✕</button>
            <div className="modal-title">Log your sleep 🌙</div>
            <div className="modal-sub">Record that you're going to sleep. This counts toward your streak.</div>
            <div className="modal-q">Rate tonight's wind-down</div>
            <div className="modal-emojis">
              {["😴","😐","🙂","😊","✨"].map((e,i)=>(
                <button key={i} className={`ci-btn ${checkinQ===i+1?"sel":""}`} onClick={()=>setCheckinQ(i+1)}>
                  {e}
                </button>
              ))}
            </div>
            <div style={{background:"var(--s2)",border:"0.5px solid var(--border)",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"DM Mono,monospace",fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--muted)"}}>Bedtime</span>
                <span style={{fontFamily:"DM Mono,monospace",fontSize:16,color:"var(--purple)",fontWeight:500}}>{bedtime}</span>
              </div>
            </div>
            <button className="btn-full" onClick={logSleep}>
              Going to sleep — log it ✓
            </button>
          </div>
        </div>
      )}
    </>
  )
}
