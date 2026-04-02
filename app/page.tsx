"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────
   SLEEPSYNC — Landing Page
   Aesthetic: Dark editorial × retro-device × astronomical
   Inspired by pierrelouis.webflow.io:
     • Deep near-black dotted-grid background
     • Bold chunky device-style cards
     • Vibrant purple + amber accent palette
     • Playful but premium feel
     • Heavy serif display type
   ───────────────────────────────────────────── */

export default function HomePage() {
  const [time, setTime] = useState("")
  const [bedtime, setBedtime] = useState("23:00")
  const [countdown, setCountdown] = useState("")
  const [isOverdue, setIsOverdue] = useState(false)
  const [streak] = useState(7)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }))

      // Countdown to bedtime
      const [bh, bm] = bedtime.split(":").map(Number)
      const bed = new Date()
      bed.setHours(bh, bm, 0, 0)
      if (bed < now) bed.setDate(bed.getDate() + 1)
      const diff = Math.floor((bed.getTime() - now.getTime()) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setIsOverdue(diff < 0)
      setCountdown(diff < 0 ? "OVERDUE" : `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [bedtime])

  // Parallax mouse tracking
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })
    }
    window.addEventListener("mousemove", handle)
    return () => window.removeEventListener("mousemove", handle)
  }, [])

  const features = [
    { icon: "◎", label: "Countdown", desc: "Live timer to your exact bedtime. Every second counts.", color: "#7C6FF7" },
    { icon: "⬡", label: "Wind-down", desc: "5-step ritual that dims your mind before your eyes close.", color: "#F59E6A" },
    { icon: "◈", label: "Streaks", desc: "Flame-tracked consistency. Miss once, lose everything.", color: "#4ADE80" },
    { icon: "◉", label: "Check-in", desc: "Morning quality log. Build your personal sleep map.", color: "#F472B6" },
    { icon: "⬢", label: "Accountability", desc: "Link with a partner. They see when you're still awake.", color: "#60A5FA" },
    { icon: "◐", label: "Insights", desc: "AI patterns in your sleep. Personalized, never generic.", color: "#FBBF24" },
  ]

  const articles = [
    { tag: "Science", title: "Optimizing Your Bedroom for Deep Sleep", sub: "Lighting, temperature, and environment design.", time: "5 min" },
    { tag: "Breathing", title: "The Science of 4-7-8", sub: "Lower your heart rate 20% in minutes.", time: "4 min" },
    { tag: "Biology", title: "Circadian Rhythms", sub: "Align your lifestyle to your body's clock.", time: "6 min" },
  ]

  const urgencyColor = isOverdue ? "#EF4444" : countdown.startsWith("00:0") ? "#F59E6A" : "#7C6FF7"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080810;
          --surface: #0f0f1a;
          --surface2: #14142a;
          --border: rgba(124,111,247,0.18);
          --purple: #7C6FF7;
          --amber: #F59E6A;
          --green: #4ADE80;
          --text: #F0EEF8;
          --muted: #6B6880;
          --dot: rgba(124,111,247,0.08);
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Syne', sans-serif;
          overflow-x: hidden;
          cursor: none;
        }

        /* Custom cursor */
        .cursor {
          position: fixed;
          top: 0; left: 0;
          width: 10px; height: 10px;
          background: var(--purple);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s, background 0.2s;
          mix-blend-mode: screen;
        }
        .cursor-ring {
          position: fixed;
          top: 0; left: 0;
          width: 36px; height: 36px;
          border: 1px solid rgba(124,111,247,0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%);
          transition: transform 0.12s ease-out, width 0.3s, height 0.3s;
        }

        /* Dot grid background */
        .dot-grid {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, rgba(124,111,247,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          z-index: 0;
          pointer-events: none;
        }

        /* Ambient glow orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(80px);
          opacity: 0.25;
        }

        /* Nav */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 0.5px solid var(--border);
          backdrop-filter: blur(20px);
          background: rgba(8,8,16,0.7);
        }
        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--text);
          text-decoration: none;
        }
        .nav-logo span { color: var(--purple); }
        .nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
        }
        .nav-links a {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-cta {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 10px 22px;
          border: 1px solid var(--purple);
          background: transparent;
          color: var(--purple);
          border-radius: 3px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .nav-cta:hover { background: var(--purple); color: #fff; }

        /* HERO */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 40px 80px;
          z-index: 1;
        }
        .hero-inner {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 80px;
          align-items: center;
        }
        .hero-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--purple);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hero-eyebrow::before {
          content: '';
          display: block;
          width: 28px;
          height: 1px;
          background: var(--purple);
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 6vw, 88px);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -2px;
          margin-bottom: 28px;
        }
        .hero-title em {
          font-style: italic;
          color: var(--purple);
        }
        .hero-sub {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: var(--muted);
          line-height: 1.7;
          max-width: 480px;
          margin-bottom: 48px;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 16px 36px;
          background: var(--purple);
          color: #fff;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
          display: inline-block;
        }
        .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-ghost {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 16px 36px;
          background: transparent;
          color: var(--muted);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s, border-color 0.2s;
          display: inline-block;
        }
        .btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.3); }

        /* HERO DEVICE — the centrepiece clock widget */
        .device {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 6px;
          position: relative;
          box-shadow: 0 0 0 1px rgba(124,111,247,0.05), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .device::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          background: linear-gradient(135deg, rgba(124,111,247,0.3), transparent 50%, rgba(245,158,106,0.15));
          z-index: -1;
        }
        .device-inner {
          background: #0a0a14;
          border-radius: 15px;
          padding: 28px 24px 24px;
          border: 0.5px solid rgba(255,255,255,0.04);
        }
        .device-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .device-brand {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--muted);
        }
        .device-dots {
          display: flex;
          gap: 5px;
        }
        .device-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        /* Big countdown display */
        .clock-face {
          text-align: center;
          padding: 20px 0 24px;
          border: 0.5px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          background: rgba(0,0,0,0.3);
        }
        .clock-face::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center top, rgba(124,111,247,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .clock-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: var(--muted);
          margin-bottom: 10px;
        }
        .clock-time {
          font-family: 'DM Mono', monospace;
          font-size: 42px;
          font-weight: 500;
          letter-spacing: -1px;
          line-height: 1;
          transition: color 0.5s;
        }
        .clock-sub {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--muted);
          margin-top: 10px;
          letter-spacing: 0.1em;
        }

        /* Bedtime setter */
        .bedtime-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: rgba(124,111,247,0.06);
          border: 0.5px solid rgba(124,111,247,0.2);
          border-radius: 8px;
          margin-bottom: 14px;
        }
        .bedtime-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--muted);
        }
        .bedtime-input {
          font-family: 'DM Mono', monospace;
          font-size: 20px;
          font-weight: 500;
          background: transparent;
          border: none;
          color: var(--purple);
          text-align: right;
          width: 80px;
          cursor: pointer;
          outline: none;
        }
        .bedtime-input::-webkit-calendar-picker-indicator { filter: invert(0.5) sepia(1) saturate(5) hue-rotate(220deg); }

        /* Streak strip */
        .streak-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: rgba(245,158,106,0.06);
          border: 0.5px solid rgba(245,158,106,0.2);
          border-radius: 8px;
          margin-bottom: 14px;
        }
        .streak-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .streak-flame {
          font-size: 18px;
          animation: flicker 2s ease-in-out infinite alternate;
        }
        @keyframes flicker {
          0% { transform: scaleY(1) rotate(-2deg); }
          50% { transform: scaleY(1.08) rotate(1deg); }
          100% { transform: scaleY(0.96) rotate(-1deg); }
        }
        .streak-num {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--amber);
        }
        .streak-text {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        /* Week dots */
        .week-strip {
          display: flex;
          gap: 6px;
          justify-content: center;
          padding: 12px 0 4px;
        }
        .week-dot-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .week-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          transition: all 0.3s;
        }
        .week-dot.hit { background: var(--purple); border-color: var(--purple); }
        .week-dot.today {
          border-color: var(--amber);
          animation: pulse-ring 2s ease infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,106,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(245,158,106,0); }
        }
        .week-day {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          color: var(--muted);
          text-transform: uppercase;
        }

        /* Current time badge */
        .live-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 0.5px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          margin-top: 14px;
          background: rgba(255,255,255,0.02);
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          animation: blink 1.2s ease infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .live-text {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--muted);
          flex: 1;
        }
        .live-time {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        /* STATS TICKER */
        .stats-bar {
          position: relative;
          z-index: 1;
          border-top: 0.5px solid var(--border);
          border-bottom: 0.5px solid var(--border);
          overflow: hidden;
          padding: 0;
          background: rgba(124,111,247,0.03);
        }
        .stats-ticker {
          display: flex;
          animation: ticker 20s linear infinite;
          width: max-content;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .stats-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 40px;
          border-right: 0.5px solid var(--border);
          white-space: nowrap;
        }
        .stats-num {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
        }
        .stats-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--muted);
        }
        .stats-sep {
          font-size: 20px;
          color: var(--border);
          padding: 0 20px;
        }

        /* FEATURES GRID */
        .section {
          position: relative;
          z-index: 1;
          padding: 120px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .section-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--purple);
          margin-bottom: 16px;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 64px;
        }
        .section-title em { font-style: italic; color: var(--amber); }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .feature-card {
          background: var(--surface);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          position: relative;
          overflow: hidden;
          cursor: default;
          transition: border-color 0.3s, transform 0.25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(124,111,247,0.35);
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .feature-icon {
          font-size: 28px;
          margin-bottom: 20px;
          display: block;
        }
        .feature-label {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }
        .feature-desc {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }
        .feature-num {
          position: absolute;
          bottom: 20px;
          right: 24px;
          font-family: 'DM Mono', monospace;
          font-size: 48px;
          font-weight: 500;
          color: rgba(255,255,255,0.03);
          line-height: 1;
          pointer-events: none;
        }

        /* BIG QUOTE / MANIFESTO */
        .manifesto {
          position: relative;
          z-index: 1;
          padding: 100px 40px;
          text-align: center;
          border-top: 0.5px solid var(--border);
          border-bottom: 0.5px solid var(--border);
          overflow: hidden;
        }
        .manifesto-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(124,111,247,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .manifesto-quote {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 400;
          font-style: italic;
          line-height: 1.3;
          max-width: 900px;
          margin: 0 auto 28px;
          letter-spacing: -0.5px;
        }
        .manifesto-quote strong { font-weight: 900; font-style: normal; color: var(--purple); }
        .manifesto-attr {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--muted);
        }

        /* ARTICLES */
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 56px;
        }
        .article-card {
          background: var(--surface);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s, border-color 0.3s;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .article-card:hover { transform: translateY(-4px); border-color: rgba(124,111,247,0.3); }
        .article-img {
          height: 180px;
          position: relative;
          overflow: hidden;
        }
        .article-img-inner {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
          display: block;
        }
        .article-card:hover .article-img-inner { transform: scale(1.05); }
        .article-body { padding: 22px; }
        .article-tag {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--purple);
          margin-bottom: 10px;
          display: block;
        }
        .article-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1.25;
        }
        .article-sub {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .article-meta {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .article-meta::before { content: '→'; color: var(--purple); }

        /* COBE GLOBE SECTION */
        .globe-section {
          position: relative;
          z-index: 1;
          padding: 80px 40px 120px;
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 500px;
          gap: 80px;
          align-items: center;
        }
        .globe-wrap {
          position: relative;
        }
        .globe-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--muted);
          position: absolute;
          bottom: -24px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        /* CTA BLOCK */
        .cta-block {
          position: relative;
          z-index: 1;
          margin: 0 40px 120px;
          border: 0.5px solid var(--border);
          border-radius: 24px;
          padding: 80px 60px;
          text-align: center;
          overflow: hidden;
          background: var(--surface);
        }
        .cta-block::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(124,111,247,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .cta-block::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--purple), transparent);
        }
        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 60px);
          font-weight: 900;
          letter-spacing: -1.5px;
          margin-bottom: 16px;
          line-height: 1.05;
        }
        .cta-title em { font-style: italic; color: var(--purple); }
        .cta-sub {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          color: var(--muted);
          margin-bottom: 40px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }
        .cta-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* FOOTER */
        .footer {
          position: relative;
          z-index: 1;
          border-top: 0.5px solid var(--border);
          padding: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .footer-brand {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }
        .footer-brand span { color: var(--purple); }
        .footer-copy {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .footer-links {
          display: flex;
          gap: 24px;
          list-style: none;
        }
        .footer-links a {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--text); }

        /* Scroll reveal */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.in { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }
        .reveal-delay-5 { transition-delay: 0.5s; }
        .reveal-delay-6 { transition-delay: 0.6s; }

        @media (max-width: 1024px) {
          .hero-inner { grid-template-columns: 1fr; gap: 60px; }
          .device { max-width: 420px; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .articles-grid { grid-template-columns: repeat(2, 1fr); }
          .globe-section { grid-template-columns: 1fr; }
          .articles-grid .article-card:last-child { display: none; }
        }
        @media (max-width: 640px) {
          .nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .hero { padding: 100px 20px 60px; }
          .features-grid { grid-template-columns: 1fr; }
          .articles-grid { grid-template-columns: 1fr; }
          .section { padding: 80px 20px; }
          .manifesto { padding: 64px 20px; }
          .cta-block { margin: 0 20px 80px; padding: 52px 28px; }
          .footer { padding: 28px 20px; flex-direction: column; text-align: center; }
          body { cursor: auto; }
          .cursor, .cursor-ring { display: none; }
        }
      `}</style>

      {/* Custom cursor */}
      <CursorFollower mousePos={mousePos} />

      {/* Ambient background */}
      <div className="dot-grid" />
      <div className="orb" style={{ width: 600, height: 600, background: "#7C6FF7", top: "10%", left: "60%", transform: "translate(-50%,-50%)" }} />
      <div className="orb" style={{ width: 400, height: 400, background: "#F59E6A", top: "80%", left: "20%", transform: "translate(-50%,-50%)" }} />

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">Sleep<span>Sync</span></a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#science">Science</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
        </ul>
        <Link href="/dashboard" className="nav-cta">Start sleeping →</Link>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hero" ref={heroRef}>
        <div className="hero-inner">
          {/* Left: Copy */}
          <div>
            <div className="hero-eyebrow reveal in">Sleep behavior science</div>
            <h1 className="hero-title reveal in reveal-delay-1">
              Stop<br />
              <em>losing sleep</em><br />
              to your phone.
            </h1>
            <p className="hero-sub reveal in reveal-delay-2">
              A behavioral sleep tool built for the chronically online. Set your bedtime, commit to a ritual, build a streak — and actually wake up rested.
            </p>
            <div className="hero-actions reveal in reveal-delay-3">
              <Link href="/dashboard" className="btn-primary">Start tonight →</Link>
              <a href="#features" className="btn-ghost">See how it works</a>
            </div>
          </div>

          {/* Right: The Device Clock */}
          <div className="reveal in reveal-delay-2">
            <div className="device">
              <div className="device-inner">
                <div className="device-header">
                  <span className="device-brand">SleepSync OS v1.0</span>
                  <div className="device-dots">
                    <div className="device-dot" style={{ background: "#EF4444" }} />
                    <div className="device-dot" style={{ background: "#F59E6A" }} />
                    <div className="device-dot" style={{ background: "#4ADE80" }} />
                  </div>
                </div>

                {/* Big countdown */}
                <div className="clock-face">
                  <div className="clock-label">Time until bedtime</div>
                  <div className="clock-time" style={{ color: urgencyColor }}>{countdown || "──:──:──"}</div>
                  <div className="clock-sub">{isOverdue ? "You should be asleep right now." : "Stay present. Wind down starts soon."}</div>
                </div>

                {/* Bedtime setter */}
                <div className="bedtime-row">
                  <span className="bedtime-label">Bedtime target</span>
                  <input
                    type="time"
                    className="bedtime-input"
                    value={bedtime}
                    onChange={e => setBedtime(e.target.value)}
                  />
                </div>

                {/* Streak */}
                <div className="streak-row">
                  <div className="streak-info">
                    <span className="streak-flame">🔥</span>
                    <span className="streak-num">{streak}</span>
                    <div>
                      <div className="streak-text">day streak</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#4ADE80", textTransform: "uppercase", letterSpacing: "0.12em" }}>On track</span>
                </div>

                {/* Week dots */}
                <div className="week-strip">
                  {["M","T","W","T","F","S","S"].map((d, i) => (
                    <div className="week-dot-wrap" key={i}>
                      <div className={`week-dot ${i < 5 ? "hit" : ""} ${i === 5 ? "today" : ""}`} />
                      <span className="week-day">{d}</span>
                    </div>
                  ))}
                </div>

                {/* Live clock */}
                <div className="live-badge">
                  <div className="live-dot" />
                  <span className="live-text">Current time</span>
                  <span className="live-time">{time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS TICKER ═══════════════════ */}
      <div className="stats-bar">
        <div className="stats-ticker">
          {[
            { num: "10k+", label: "sleepers", color: "#7C6FF7" },
            { num: "3hr+", label: "extra sleep gained", color: "#F59E6A" },
            { num: "85%", label: "energy improvement", color: "#4ADE80" },
            { num: "14", label: "avg streak days", color: "#F472B6" },
            { num: "4:7:8", label: "breathing method", color: "#60A5FA" },
            { num: "0", label: "ads. ever.", color: "#FBBF24" },
            { num: "10k+", label: "sleepers", color: "#7C6FF7" },
            { num: "3hr+", label: "extra sleep gained", color: "#F59E6A" },
            { num: "85%", label: "energy improvement", color: "#4ADE80" },
            { num: "14", label: "avg streak days", color: "#F472B6" },
            { num: "4:7:8", label: "breathing method", color: "#60A5FA" },
            { num: "0", label: "ads. ever.", color: "#FBBF24" },
          ].map((s, i) => (
            <div className="stats-item" key={i}>
              <span className="stats-num" style={{ color: s.color }}>{s.num}</span>
              <span className="stats-label">{s.label}</span>
              <span className="stats-sep">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="section" id="features">
        <div className="section-eyebrow reveal">Everything you need</div>
        <h2 className="section-title reveal reveal-delay-1">
          Six tools.<br />
          <em>One ritual.</em>
        </h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className={`feature-card reveal reveal-delay-${i % 3 + 1}`} key={i}>
              <span className="feature-icon" style={{ color: f.color }}>{f.icon}</span>
              <div className="feature-label">{f.label}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-num">{String(i + 1).padStart(2, "0")}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ MANIFESTO ═══════════════════ */}
      <div className="manifesto">
        <div className="manifesto-bg" />
        <blockquote className="manifesto-quote reveal">
          "Sleep is the single most effective thing you can do to reset your brain and body.
          <strong> Not supplements. Not cold plunges. Not morning routines.</strong> Sleep."
        </blockquote>
        <p className="manifesto-attr reveal reveal-delay-1">— Dr. Matthew Walker, Why We Sleep</p>
      </div>

      {/* ═══════════════════ GLOBE SECTION ═══════════════════ */}
      <div className="globe-section" id="science">
        <div>
          <div className="section-eyebrow reveal">Global community</div>
          <h2 className="section-title reveal reveal-delay-1" style={{ marginBottom: 24 }}>
            Sleepers across<br />
            <em>every timezone.</em>
          </h2>
          <p className="hero-sub reveal reveal-delay-2" style={{ marginBottom: 32 }}>
            10,000+ users logging bedtimes from Sydney to San Francisco. Your sleep habit travels with you — timezone-aware, circadian-smart.
          </p>
          <div className="hero-actions reveal reveal-delay-3">
            <Link href="/dashboard" className="btn-primary">Join them →</Link>
          </div>
        </div>
        <div className="globe-wrap reveal reveal-delay-2">
          {/* Globe placeholder — replace with <GlobeCdn /> once cobe is installed */}
          <GlobePlaceholder />
          <span className="globe-label">Live sleep activity · {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ═══════════════════ ARTICLES ═══════════════════ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-eyebrow reveal">Sleep science</div>
        <h2 className="section-title reveal reveal-delay-1">
          Read the research.<br />
          <em>Own the night.</em>
        </h2>
        <div className="articles-grid">
          {articles.map((a, i) => (
            <a href="#" className={`article-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className="article-img">
                <img
                  className="article-img-inner"
                  src={`https://images.unsplash.com/photo-${["1541480601022-2308c0f02487","1506905925346-21bda4d32df4","1519681393784-d120267933ba"][i]}?w=600&q=80&fit=crop`}
                  alt={a.title}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.7) 0%, transparent 60%)" }} />
              </div>
              <div className="article-body">
                <span className="article-tag">{a.tag}</span>
                <div className="article-title">{a.title}</div>
                <div className="article-sub">{a.sub}</div>
                <div className="article-meta">{a.time} read</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <div className="cta-block reveal">
        <h2 className="cta-title">
          Tonight is night<br />
          <em>one.</em>
        </h2>
        <p className="cta-sub">Set your bedtime. Start your streak. Build the only habit that actually changes everything else.</p>
        <div className="cta-actions">
          <Link href="/dashboard" className="btn-primary">Open dashboard →</Link>
          <a href="#features" className="btn-ghost">Learn more</a>
        </div>
      </div>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="footer">
        <div className="footer-brand">Sleep<span>Sync</span></div>
        <ul className="footer-links">
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
          <li><a href="#">GitHub</a></li>
        </ul>
        <div className="footer-copy">© {new Date().getFullYear()} SleepSync — Built with Next.js</div>
      </footer>

      <ScrollReveal />
    </>
  )
}

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

function CursorFollower({ mousePos }: { mousePos: { x: number; y: number } }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    let rx = 0, ry = 0

    const move = (e: MouseEvent) => {
      const x = e.clientX, y = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = x + "px"
        dotRef.current.style.top = y + "px"
      }
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      const tick = () => {
        rx = lerp(rx, x, 0.15)
        ry = lerp(ry, y, 0.15)
        if (ringRef.current) {
          ringRef.current.style.left = rx + "px"
          ringRef.current.style.top = ry + "px"
        }
        raf = requestAnimationFrame(tick)
      }
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener("mousemove", move)
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div className="cursor" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}

function GlobePlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const W = canvas.width = canvas.offsetWidth * 2
    canvas.height = W
    const R = W / 2 - 20
    const cx = W / 2, cy = W / 2

    // Dots for globe effect
    const dots: { x: number; y: number; r: number }[] = []
    for (let i = 0; i < 1800; i++) {
      const phi = Math.random() * Math.PI * 2
      const theta = Math.acos(2 * Math.random() - 1)
      const x = cx + R * Math.sin(theta) * Math.cos(phi)
      const y = cy + R * Math.cos(theta)
      dots.push({ x, y, r: Math.random() * 1.2 + 0.3 })
    }

    const cities = [
      [38.9, -77.4, "#7C6FF7"],
      [37.6, -122.4, "#7C6FF7"],
      [49.0, 2.5, "#7C6FF7"],
      [35.6, 139.8, "#7C6FF7"],
      [-33.9, 151.2, "#7C6FF7"],
      [1.4, 104.0, "#7C6FF7"],
      [19.1, 72.9, "#F59E6A"],
    ]

    let angle = 0
    const raf = { id: 0 }

    const draw = () => {
      ctx.clearRect(0, 0, W, W)
      // Glow
      const grd = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.1)
      grd.addColorStop(0, "rgba(124,111,247,0.04)")
      grd.addColorStop(1, "transparent")
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, W)

      // Outline
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(124,111,247,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Dots
      dots.forEach(d => {
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(240,238,248,0.25)"
        ctx.fill()
      })

      // Arcs
      const rotatedCities = cities.map(([lat, lon, c]) => {
        const a = (lon as number) * Math.PI / 180 + angle
        const b = (lat as number) * Math.PI / 180
        const x = cx + R * Math.cos(b) * Math.cos(a)
        const y = cy - R * Math.sin(b)
        const visible = Math.cos(b) * Math.sin(a) > -0.2
        return { x, y, c, visible }
      })

      rotatedCities.forEach(city => {
        if (!city.visible) return
        ctx.beginPath()
        ctx.arc(city.x, city.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = city.c as string
        ctx.fill()
        ctx.beginPath()
        ctx.arc(city.x, city.y, 8, 0, Math.PI * 2)
        ctx.strokeStyle = `${city.c}44`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      angle += 0.003
      raf.id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf.id)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", aspectRatio: "1", borderRadius: "50%", display: "block" }}
    />
  )
}

function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)")
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
