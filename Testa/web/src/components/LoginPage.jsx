import React, { useState, useEffect, useRef } from 'react';
import { Lock, Mail, Eye, EyeOff, ChevronRight, RefreshCw, Shield } from 'lucide-react';
import logoImg from '../logo.png';

const ROLES = [
  { id: 'super_admin',    label: 'Super Admin',    icon: '👑', color: '#DC2626', creds: { email: 'superadmin@testraa.lk', pass: 'admin123' } },
  { id: 'admin',          label: 'Admin',          icon: '💼', color: '#EAB308', creds: { email: 'admin@testraa.lk',      pass: 'admin123' } },
  { id: 'branch_manager', label: 'Br. Manager',    icon: '🏢', color: '#22C55E', creds: { email: 'manager@testraa.lk',   pass: 'admin123' } },
  { id: 'marketing',      label: 'Marketing',      icon: '📣', color: '#3B82F6', creds: { email: 'marketing@testraa.lk', pass: 'admin123' } },
];

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 6,
  dur: 4 + Math.random() * 4,
  tx: (Math.random() - 0.5) * 180,
  ty: -(60 + Math.random() * 140),
  size: 2 + Math.random() * 3,
}));

export default function LoginPage({ onLogin, isLoading, loginError }) {
  const [role, setRole]           = useState('super_admin');
  const [email, setEmail]         = useState('superadmin@testraa.lk');
  const [password, setPassword]   = useState('admin123');
  const [showPass, setShowPass]   = useState(false);
  const [localErr, setLocalErr]   = useState('');
  const [animIn, setAnimIn]       = useState(false);
  const canvasRef = useRef(null);

  // Fade in on mount
  useEffect(() => { setTimeout(() => setAnimIn(true), 60); }, []);

  // Rotating ring canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let angle = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2, r = 58;
      // Outer dashed ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = 'rgba(34,197,94,0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // Inner dashed ring counter
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 1.4);
      ctx.strokeStyle = 'rgba(220,38,38,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, r - 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // Glow dot at angle
      const dotX = cx + Math.cos(angle) * r;
      const dotY = cy + Math.sin(angle) * r;
      const grad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 6);
      grad.addColorStop(0, 'rgba(234,179,8,0.9)');
      grad.addColorStop(1, 'rgba(234,179,8,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
      ctx.fill();
      angle += 0.012;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const selectRole = (r) => {
    setRole(r.id);
    setEmail(r.creds.email);
    setPassword(r.creds.pass);
    setLocalErr('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalErr('');
    if (!email || !password) { setLocalErr('Please enter email and password.'); return; }
    onLogin({ email: email.trim().toLowerCase(), password, role });
  };

  const activeRole = ROLES.find(r => r.id === role);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Ambient orbs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-orb-float absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.10) 0%, transparent 70%)' }} />
        <div className="animate-orb-float-r absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.09) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.05) 0%, transparent 65%)' }} />
      </div>

      {/* ── Floating particles ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map(p => (
          <span key={p.id} className="absolute rounded-full"
            style={{
              left: `${p.left}%`, top: `${p.top}%`,
              width: p.size, height: p.size,
              background: `rgba(${p.id % 3 === 0 ? '220,38,38' : p.id % 3 === 1 ? '234,179,8' : '34,197,94'},.65)`,
              '--tx': `${p.tx}px`, '--ty': `${p.ty}px`,
              animation: `particle ${p.dur}s ease-out ${p.delay}s infinite`,
            }} />
        ))}
      </div>

      {/* ── Grid lines ── */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ── Main card ── */}
      <div className={`relative z-10 w-full max-w-[440px] transition-all duration-700 ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Brand header */}
        <div className="text-center mb-6 space-y-3">
          {/* Logo with rotating canvas rings */}
          <div className="relative inline-block">
            <canvas ref={canvasRef} width={144} height={144} className="absolute -inset-8" />
            <div className="relative w-20 h-20 mx-auto rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl flex items-center justify-center scanline overflow-hidden">
              <img src={logoImg} alt="TESTRAA Logo" className="w-14 h-14 object-contain hover:scale-110 transition-transform duration-500" />
            </div>
            {/* Ping ring */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-sriRed/30 animate-ping" style={{ animationDuration: '2.5s' }} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-[0.15em] uppercase"
              style={{ fontFamily: 'Cinzel, serif', background: 'linear-gradient(90deg,#DC2626,#EAB308,#22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TESTRAA
            </h1>
            <p className="text-[11px] tracking-[0.3em] text-slate-400 uppercase font-bold mt-0.5">Export &amp; Import (PVT) LTD</p>
            {/* Tricolor bar */}
            <div className="flex mx-auto mt-2 rounded-full overflow-hidden" style={{ width: 120, height: 3 }}>
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-emerald-500" />
            </div>
            <p className="text-[9px] tracking-[0.2em] text-slate-500 uppercase mt-2 font-semibold">Enterprise Resource Planning Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl overflow-hidden border border-white/8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">

          {/* Role tabs */}
          <div className="grid grid-cols-4 bg-slate-900/70 border-b border-white/5 p-1.5 gap-1">
            {ROLES.map(r => (
              <button key={r.id} onClick={() => selectRole(r)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition-all duration-300 ${role === r.id ? 'bg-slate-950/90 shadow-inner border border-white/8' : 'opacity-40 hover:opacity-70'}`}>
                <span className="text-xl mb-0.5">{r.icon}</span>
                <span className="text-[9px] font-bold tracking-wider uppercase leading-tight">{r.label}</span>
                {role === r.id && <div className="w-3 h-0.5 rounded-full mt-1" style={{ background: r.color }} />}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">

            {/* Role info banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl border text-xs leading-relaxed transition-all duration-500"
              style={{ background: `rgba(${activeRole.color === '#DC2626' ? '220,38,38' : activeRole.color === '#EAB308' ? '234,179,8' : activeRole.color === '#22C55E' ? '34,197,94' : '59,130,246'},.06)`, borderColor: `${activeRole.color}30` }}>
              <Shield size={15} className="mt-0.5 shrink-0" style={{ color: activeRole.color }} />
              <div>
                <p className="font-bold uppercase tracking-wider mb-0.5" style={{ color: activeRole.color }}>
                  {activeRole.label} Portal
                </p>
                <p className="text-slate-400">
                  {role === 'super_admin' && 'Full system privileges — branches, staff, payroll, invoices & credential management.'}
                  {role === 'admin' && 'Operational admin — restock, expenses, payments & sales reports.'}
                  {role === 'branch_manager' && 'Branch logistics — local sales, expenses & branch metrics.'}
                  {role === 'marketing' && 'Field sales — client registration, invoices, GPS & commissions.'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="user@testraa.lk"
                    className="glass-input w-full pl-10 pr-4 py-3 text-sm rounded-xl" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                    {showPass ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Show</>}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input w-full pl-10 pr-4 py-3 text-sm rounded-xl" required />
                </div>
              </div>

              {(loginError || localErr) && (
                <div className="text-red-400 bg-red-950/30 border border-red-500/25 p-3 rounded-xl text-xs text-center font-semibold animate-pulse">
                  ⚠️ {loginError || localErr}
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="btn-shimmer w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60">
                {isLoading
                  ? <><RefreshCw size={16} className="animate-spin" /> Authenticating…</>
                  : <><span>Sign In to {activeRole.label}</span><ChevronRight size={16} /></>}
              </button>
            </form>

            {/* Quick demo strip */}
            <div className="pt-3 border-t border-white/5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest text-center mb-2 font-bold">Quick Demo Login</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => selectRole(r)}
                    className="text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all hover:scale-105"
                    style={{ borderColor: `${r.color}40`, color: r.color, background: `${r.color}10` }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <p className="text-center text-[9px] text-slate-600 mt-5 tracking-wider uppercase">
          TESTRAA ERP v2.0 · Sri Lanka · All Rights Reserved
        </p>
      </div>
    </div>
  );
}
