import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   CHEMBOT AI — LOGIN PAGE  v9.0
   Mobile-first, fully responsive, production-grade
═══════════════════════════════════════════════════════════ */

const HEADLINES = ["Explore Chemistry", "Master Reactions", "Decode Elements", "Ace Your Exams", "Think Molecular"];

const ELEMENTS = [
  { n: "1",  s: "H",  nm: "Hydrogen", c: "#38bdf8" },
  { n: "6",  s: "C",  nm: "Carbon",   c: "#94a3b8" },
  { n: "7",  s: "N",  nm: "Nitrogen", c: "#60a5fa" },
  { n: "8",  s: "O",  nm: "Oxygen",   c: "#f87171" },
  { n: "11", s: "Na", nm: "Sodium",   c: "#fb923c" },
  { n: "17", s: "Cl", nm: "Chlorine", c: "#4ade80" },
  { n: "26", s: "Fe", nm: "Iron",     c: "#f59e0b" },
];

const STATS = [
  { n: "50K+", l: "Students",  ic: "👥" },
  { n: "500+", l: "Reactions", ic: "⚗️" },
  { n: "11",   l: "Languages", ic: "🌐" },
  { n: "99%",  l: "Accuracy",  ic: "🎯" },
];

const FEATS = [
  { i: "⚗️", t: "Point-wise Answers", d: "Structured chemistry explanations" },
  { i: "🧮", t: "Formula Database",   d: "400+ formulas with molecular weights" },
  { i: "🎨", t: "RDKit Structures",   d: "2D molecular diagrams from SMILES" },
  { i: "🔬", t: "PDF Analysis",       d: "Summary · Quiz · Video from PDFs" },
  { i: "🧩", t: "AI Quiz Engine",     d: "MCQ quizzes with instant feedback" },
  { i: "🌐", t: "11 Languages",       d: "Telugu, Hindi, Tamil, Kannada + 7 more" },
];

function AtomIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="2.5" fill="#38bdf8" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={FS.fieldLabel}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={FS.fieldIcon}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

export default function Login({ onLoginSuccess }) {
  const [mode,       setMode]       = useState("login");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [typedText,  setTypedText]  = useState("");
  const [activeElem, setActiveElem] = useState(0);
  const [showHero,   setShowHero]   = useState(true); // mobile hero toggle

  const canvasRef = useRef(null);
  const threeRef  = useRef(null);
  const raf2d     = useRef(null);
  const headRef   = useRef(0);
  const charRef   = useRef(0);
  const delRef    = useRef(false);
  const timerRef  = useRef(null);

  // ── Typewriter ──
  useEffect(() => {
    const tick = () => {
      const cur = HEADLINES[headRef.current];
      if (!delRef.current) {
        setTypedText(cur.slice(0, ++charRef.current));
        if (charRef.current === cur.length) { delRef.current = true; timerRef.current = setTimeout(tick, 2200); return; }
      } else {
        setTypedText(cur.slice(0, --charRef.current));
        if (charRef.current === 0) { delRef.current = false; headRef.current = (headRef.current + 1) % HEADLINES.length; }
      }
      timerRef.current = setTimeout(tick, delRef.current ? 45 : 88);
    };
    timerRef.current = setTimeout(tick, 600);
    return () => clearTimeout(timerRef.current);
  }, []);

  // ── Element cycling ──
  useEffect(() => {
    const id = setInterval(() => setActiveElem(n => (n + 1) % ELEMENTS.length), 2000);
    return () => clearInterval(id);
  }, []);

  // ── Canvas particle network ──
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = cv.width  = window.innerWidth;
    let H = cv.height = window.innerHeight;
    const PTS = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.5, ph: Math.random() * Math.PI * 2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      PTS.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.ph += 0.028;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const alpha = 0.3 + 0.25 * Math.sin(p.ph);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(56,189,248,${alpha})`);
        g.addColorStop(1, "rgba(56,189,248,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      PTS.forEach((a, i) => PTS.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(56,189,248,${0.08 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf2d.current = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf2d.current); window.removeEventListener("resize", resize); };
  }, []);

  // ── Three.js atom ──
  useEffect(() => {
    const cv = threeRef.current;
    if (!cv) return;
    let threeRaf;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      const THREE = window.THREE;
      const W = cv.clientWidth || 200, H = cv.clientHeight || 200;
      const renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
      camera.position.z = 7;
      const nucGeo = new THREE.SphereGeometry(0.55, 48, 48);
      const nucMat = new THREE.MeshPhongMaterial({ color: 0x0ea5e9, emissive: 0x0c4a6e, shininess: 150, transparent: true, opacity: 0.95 });
      const nucleus = new THREE.Mesh(nucGeo, nucMat);
      scene.add(nucleus);
      const makeRing = (rx, ry, rz, color) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.022, 16, 100), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 }));
        m.rotation.set(rx, ry, rz); scene.add(m); return m;
      };
      const rings = [makeRing(0, 0, 0, 0x38bdf8), makeRing(Math.PI / 3, 0, Math.PI / 5, 0x818cf8), makeRing(-Math.PI / 3, 0, -Math.PI / 5, 0x06b6d4)];
      const makeElec = (color) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), new THREE.MeshPhongMaterial({ color, emissive: color, shininess: 220 }));
        scene.add(m); return m;
      };
      const elecs = [makeElec(0x38bdf8), makeElec(0xa78bfa), makeElec(0x34d399)];
      scene.add(new THREE.AmbientLight(0x1e3a5f, 3.5));
      const dl = new THREE.DirectionalLight(0x38bdf8, 3); dl.position.set(5, 5, 5); scene.add(dl);
      const tilts = [[0, 0, 0], [Math.PI / 3, 0, Math.PI / 5], [-Math.PI / 3, 0, -Math.PI / 5]];
      let t = 0;
      const animate = () => {
        threeRaf = requestAnimationFrame(animate); t += 0.011;
        nucleus.rotation.y += 0.007;
        elecs.forEach((e, i) => {
          const angle = t * [1, 0.72, 1.28][i] + [0, 2.1, 4.2][i];
          const R = 2.3, bx = Math.cos(angle) * R, bz = Math.sin(angle) * R;
          const [rx,, rz] = tilts[i];
          const cx = Math.cos(rz), sx = Math.sin(rz), cy = Math.cos(rx), sy = Math.sin(rx);
          const y1 = -bz * sy, z1 = bz * cy;
          e.position.set(bx * cx - y1 * sx, bx * sx + y1 * cx, z1);
        });
        rings.forEach((r, i) => { r.rotation.y += [0.004, 0.003, 0.005][i]; });
        renderer.render(scene, camera);
      };
      animate();
    };
    document.head.appendChild(script);
    return () => { if (threeRaf) cancelAnimationFrame(threeRaf); try { document.head.removeChild(script); } catch {} };
  }, []);

  // ── Auth logic ──
  const clearFields = () => { setEmail(""); setPassword(""); setConfirm(""); setError(""); setSuccess(""); };
  const switchMode  = m => { clearFields(); setMode(m); };
  const simulate    = fn => { setLoading(true); setError(""); setSuccess(""); setTimeout(() => { setLoading(false); fn(); }, 950); };

  const handleLogin = () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    simulate(() => {
      const users = JSON.parse(localStorage.getItem("chem-users") || "[]");
      const ok = users.find(u => u.email === email && u.password === password);
      if (ok) { onLoginSuccess(); } else { setError("Invalid email or password."); }
    });
  };

  const handleSignup = () => {
    if (!email || !password || !confirm) { setError("Please fill in all fields."); return; }
    if (!/\S+@\S+\.\S+/.test(email))    { setError("Enter a valid email address."); return; }
    if (password.length < 6)            { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm)            { setError("Passwords do not match."); return; }
    simulate(() => {
      const users = JSON.parse(localStorage.getItem("chem-users") || "[]");
      if (users.find(u => u.email === email)) { setError("Email already registered."); return; }
      users.push({ email, password });
      localStorage.setItem("chem-users", JSON.stringify(users));
      setSuccess("Account created! Please sign in.");
      setTimeout(() => switchMode("login"), 1300);
    });
  };

  const handleForgot = () => {
    if (!email)                     { setError("Enter your registered email."); return; }
    if (!password || !confirm)      { setError("Enter and confirm your new password."); return; }
    if (password !== confirm)       { setError("Passwords do not match."); return; }
    simulate(() => {
      const users = JSON.parse(localStorage.getItem("chem-users") || "[]");
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) { setError("Email not found."); return; }
      users[idx].password = password;
      localStorage.setItem("chem-users", JSON.stringify(users));
      setSuccess("Password updated!");
      setTimeout(() => switchMode("login"), 1300);
    });
  };

  const submit = mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot;

  const pwStrength = !password ? 0
    : password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
    : password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
    : password.length >= 6 ? 2 : 1;
  const pwLabel = ["", "Weak", "Fair", "Strong", "Excellent"][pwStrength];
  const pwColor = ["", "#ef4444", "#f59e0b", "#22c55e", "#38bdf8"][pwStrength];

  return (
    <div style={LS.root}>
      <style>{LOGIN_CSS}</style>
      <canvas ref={canvasRef} style={LS.canvas} />
      <div style={LS.bgGrad} />
      <div style={LS.gridOverlay} />

      {/* ═══ DESKTOP LAYOUT (≥768px) ═══ */}
      <div className="desktop-layout">
        {/* LEFT HERO */}
        <div style={LS.heroCol}>
          {/* Badge */}
          <div style={LS.badge}>
            <AtomIcon size={16} />
            <span style={LS.badgeText}>ChemBot AI</span>
            <span style={LS.badgeDivider}>|</span>
            <span style={LS.badgeSub}>KIET · JNTU Kakinada</span>
          </div>

          {/* Headline */}
          <h1 style={LS.headline}>
            <span style={LS.typedSpan}>{typedText || "Explore Chemistry"}<span style={LS.cursor}>|</span></span>
            <span style={LS.headlineSub}>
              <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.55em" }}>with </span>
              <span style={LS.aiWord}>AI</span>
            </span>
          </h1>

          <p style={LS.heroPara}>
            A university-grade platform powered by <strong style={{ color: "#38bdf8" }}>FLAN-T5 + LoRA</strong> — point-wise chemistry answers, molecular diagrams, PDF analysis, quizzes, and 11-language support.
          </p>

          {/* 3D Atom */}
          <div style={LS.atomBox}>
            <canvas ref={threeRef} style={LS.threeCv} />
            <div style={LS.atomLbl}>3D Molecular Model · Real-time WebGL</div>
          </div>

          {/* Feature grid */}
          <div style={LS.featGrid}>
            {FEATS.map(f => (
              <div key={f.t} style={LS.featCard} className="feat-card">
                <span style={{ fontSize: 18 }}>{f.i}</span>
                <div>
                  <div style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 700 }}>{f.t}</div>
                  <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Element strip */}
          <div style={LS.elemStrip}>
            {ELEMENTS.map((el, i) => (
              <div key={el.s} style={{
                ...LS.elemCell,
                background:   i === activeElem ? el.c + "1a" : "rgba(255,255,255,0.025)",
                borderColor:  i === activeElem ? el.c : "rgba(255,255,255,0.07)",
                color:        i === activeElem ? el.c : "#475569",
                transform:    i === activeElem ? "scale(1.14) translateY(-4px)" : "scale(1)",
                boxShadow:    i === activeElem ? `0 4px 18px ${el.c}40` : "none",
              }}>
                <div style={{ fontSize: 7, fontWeight: 700, opacity: 0.7 }}>{el.n}</div>
                <div style={{ fontSize: 14, fontWeight: 900 }}>{el.s}</div>
                <div style={{ fontSize: 7, opacity: 0.6, textAlign: "center" }}>{el.nm}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={LS.statsRow}>
            {STATS.map(({ n, l, ic }) => (
              <div key={l} style={LS.statBox}>
                <span style={{ fontSize: 16 }}>{ic}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#38bdf8", lineHeight: 1 }}>{n}</span>
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FORM */}
        <div style={LS.formCol}>
          <div style={LS.card} className="auth-card">
            <CardInner
              mode={mode} switchMode={switchMode} error={error} success={success}
              email={email} setEmail={setEmail} password={password} setPassword={setPassword}
              confirm={confirm} setConfirm={setConfirm} showPass={showPass} setShowPass={setShowPass}
              showConf={showConf} setShowConf={setShowConf} loading={loading} submit={submit}
              pwStrength={pwStrength} pwLabel={pwLabel} pwColor={pwColor}
            />
          </div>
        </div>
      </div>

      {/* ═══ MOBILE LAYOUT (<768px) ═══ */}
      <div className="mobile-layout">
        {/* Mobile top bar */}
        <div style={ML.topBar}>
          <div style={ML.brand}>
            <AtomIcon size={18} />
            <span style={ML.brandText}>ChemBot AI</span>
            <span style={ML.brandSub}>KIET · JNTU Kakinada</span>
          </div>
          <button style={ML.heroToggle} onClick={() => setShowHero(h => !h)}>
            {showHero ? "Hide Info ▲" : "About ▼"}
          </button>
        </div>

        {/* Mobile hero (collapsible) */}
        {showHero && (
          <div style={ML.hero} className="mobile-hero-in">
            {/* Atom + headline side-by-side */}
            <div style={ML.heroTop}>
              <div style={ML.heroText}>
                <h1 style={ML.h1}>
                  <span style={LS.typedSpan}>{typedText || "Explore Chemistry"}<span style={LS.cursor}>|</span></span>
                  <span style={{ display: "block", marginTop: 4 }}>
                    <span style={{ color: "#64748b", fontWeight: 400, fontSize: 14 }}>with </span>
                    <span style={ML.aiWord}>AI</span>
                  </span>
                </h1>
                <p style={ML.sub}>
                  Powered by <strong style={{ color: "#38bdf8" }}>FLAN-T5 + LoRA</strong> — chemistry answers, diagrams & multilingual support.
                </p>
              </div>
              <div style={ML.atomWrap}>
                <canvas ref={threeRef} style={ML.threeCv} />
              </div>
            </div>

            {/* Element strip */}
            <div style={ML.elemStrip} className="no-scrollbar">
              {ELEMENTS.map((el, i) => (
                <div key={el.s} style={{
                  ...LS.elemCell, minWidth: 40,
                  background:  i === activeElem % 7 ? el.c + "22" : "rgba(255,255,255,0.03)",
                  borderColor: i === activeElem % 7 ? el.c : "rgba(255,255,255,0.08)",
                  color:       i === activeElem % 7 ? el.c : "#475569",
                  transform:   i === activeElem % 7 ? "scale(1.1) translateY(-2px)" : "scale(1)",
                }}>
                  <div style={{ fontSize: 6, fontWeight: 700, opacity: 0.7 }}>{el.n}</div>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{el.s}</div>
                  <div style={{ fontSize: 5.5, opacity: 0.6, textAlign: "center" }}>{el.nm}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={ML.statsRow}>
              {STATS.map(({ n, l, ic }) => (
                <div key={l} style={ML.statBox}>
                  <span style={{ fontSize: 12 }}>{ic}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#38bdf8" }}>{n}</span>
                  <span style={{ fontSize: 8, color: "#64748b", fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile form */}
        <div style={ML.formWrap}>
          <div style={ML.divider}>
            <div style={ML.divLine} />
            <span style={ML.divText}>Your Account</span>
            <div style={ML.divLine} />
          </div>

          <div style={ML.card} className="auth-card">
            <CardInner
              mode={mode} switchMode={switchMode} error={error} success={success}
              email={email} setEmail={setEmail} password={password} setPassword={setPassword}
              confirm={confirm} setConfirm={setConfirm} showPass={showPass} setShowPass={setShowPass}
              showConf={showConf} setShowConf={setShowConf} loading={loading} submit={submit}
              pwStrength={pwStrength} pwLabel={pwLabel} pwColor={pwColor} isMobile
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared form card content ── */
function CardInner({
  mode, switchMode, error, success,
  email, setEmail, password, setPassword,
  confirm, setConfirm, showPass, setShowPass,
  showConf, setShowConf, loading, submit,
  pwStrength, pwLabel, pwColor, isMobile = false,
}) {
  const steps   = mode === "login" ? ["Credentials", "Access"] : mode === "signup" ? ["Identity", "Security", "Confirm"] : ["Email", "New Password", "Update"];
  const curStep = mode === "login" ? (password ? 1 : 0) : mode === "signup" ? (confirm ? 2 : password ? 1 : 0) : (password ? 1 : 0);

  return (
    <>
      {/* Corner accents */}
      {[
        { top: 0, left: 0,  borderTop: "1.5px solid #38bdf8", borderLeft:  "1.5px solid #38bdf8" },
        { top: 0, right: 0, borderTop: "1.5px solid #38bdf8", borderRight: "1.5px solid #38bdf8" },
        { bottom: 0, left:  0, borderBottom: "1.5px solid #38bdf8", borderLeft:  "1.5px solid #38bdf8" },
        { bottom: 0, right: 0, borderBottom: "1.5px solid #38bdf8", borderRight: "1.5px solid #38bdf8" },
      ].map((cs, i) => (
        <div key={i} style={{ position: "absolute", width: 12, height: 12, ...cs }} />
      ))}

      {/* Top glow */}
      <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1.5, background: "linear-gradient(90deg,transparent,#38bdf8 30%,#818cf8 70%,transparent)", borderRadius: "0 0 3px 3px" }} />

      {/* Tabs */}
      <div style={FS.tabs}>
        {["login", "signup"].map(m => (
          <button key={m} style={{ ...FS.tab, ...(mode === m ? FS.tabOn : {}) }} onClick={() => switchMode(m)}>
            {m === "login" ? "🔑 Sign In" : "🚀 Sign Up"}
          </button>
        ))}
      </div>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ ...FS.title, fontSize: isMobile ? 18 : 21 }}>
          {mode === "login" ? "Welcome Back 👋" : mode === "signup" ? "Create Account 🚀" : "Reset Password 🔑"}
        </h2>
        <p style={FS.titleSub}>
          {mode === "login" ? "Sign in to your Chemistry AI dashboard" : mode === "signup" ? "Join the KIET Chemistry AI platform" : "Set a new password for your account"}
        </p>
      </div>

      {/* Progress steps */}
      <div style={FS.stepsRow}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
            <div style={{ ...FS.dot, background: i <= curStep ? "linear-gradient(135deg,#38bdf8,#0ea5e9)" : "rgba(255,255,255,0.08)", boxShadow: i <= curStep ? "0 0 10px rgba(56,189,248,0.5)" : "none", flexShrink: 0 }}>
              {i < curStep ? "✓" : i + 1}
            </div>
            <span style={{ ...FS.dotLbl, color: i <= curStep ? "#38bdf8" : "#475569", fontSize: isMobile ? 8 : 9 }}>{s}</span>
            {i < steps.length - 1 && <div style={{ ...FS.stepLine, flex: 1, background: i < curStep ? "linear-gradient(90deg,#38bdf8,#0ea5e9)" : "rgba(255,255,255,0.08)" }} />}
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error   && <div style={FS.errBox}><span>⚠️</span>{error}</div>}
      {success && <div style={FS.sucBox}><span>✅</span>{success}</div>}

      {/* Email */}
      <Field label="Email Address" icon="✉">
        <input type="email" value={email} placeholder="you@university.edu"
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={FS.inp} />
      </Field>

      {/* Password */}
      <Field label={mode === "forgot" ? "New Password" : "Password"} icon="🔒">
        <input type={showPass ? "text" : "password"} value={password}
          placeholder={mode === "forgot" ? "New secure password" : "Your password"}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ ...FS.inp, paddingRight: 44 }} />
        <button style={FS.eyeBtn} onClick={() => setShowPass(v => !v)}>{showPass ? "🙈" : "👁"}</button>
      </Field>

      {/* Strength bar */}
      {(mode === "signup" || mode === "forgot") && password && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: -10, marginBottom: 14 }}>
          {[1, 2, 3, 4].map(lv => (
            <div key={lv} style={{ flex: 1, height: 3, borderRadius: 3, background: lv <= pwStrength ? pwColor : "rgba(255,255,255,0.08)", transition: "background 0.4s" }} />
          ))}
          <span style={{ fontSize: 9, fontWeight: 700, color: pwColor, minWidth: 46 }}>{pwLabel}</span>
        </div>
      )}

      {/* Confirm password */}
      {(mode === "signup" || mode === "forgot") && (
        <Field label="Confirm Password" icon="🔒">
          <input type={showConf ? "text" : "password"} value={confirm}
            placeholder="Repeat password"
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={{ ...FS.inp, paddingRight: 44, borderColor: confirm ? (confirm === password ? "#22c55e" : "#ef4444") : undefined }} />
          <button style={FS.eyeBtn} onClick={() => setShowConf(v => !v)}>{showConf ? "🙈" : "👁"}</button>
          {confirm && (
            <div style={{ position: "absolute", bottom: -16, left: 0, fontSize: 10, color: confirm === password ? "#22c55e" : "#ef4444" }}>
              {confirm === password ? "✓ Passwords match" : "✗ Passwords don't match"}
            </div>
          )}
        </Field>
      )}

      {/* Forgot link */}
      {mode === "login" && (
        <div style={{ textAlign: "right", marginTop: -4, marginBottom: 12 }}>
          <span style={FS.lnk} onClick={() => switchMode("forgot")}>Forgot password?</span>
        </div>
      )}

      {/* Submit button */}
      <button className="shimmer-btn" style={{ ...FS.submitBtn, opacity: loading ? 0.72 : 1 }} onClick={submit} disabled={loading}>
        {loading
          ? <span style={FS.spin} />
          : <>{mode === "login" ? "Sign In to Dashboard" : mode === "signup" ? "Create Account" : "Update Password"} <span style={{ marginLeft: 6 }}>→</span></>}
      </button>

      {/* Switch mode */}
      <p style={FS.switchTxt}>
        {mode === "login"
          ? <>New here? <span style={FS.lnk} onClick={() => switchMode("signup")}>Create account</span></>
          : <>Have an account? <span style={FS.lnk} onClick={() => switchMode("login")}>Sign in</span></>}
      </p>
      {mode === "forgot" && (
        <p style={{ ...FS.switchTxt, marginTop: 4 }}>
          <span style={FS.lnk} onClick={() => switchMode("login")}>← Back to Sign In</span>
        </p>
      )}

      <div style={FS.secNote}>
        <span>🔐</span>
        <span>Data stored locally · KIET University · JNTU Kakinada</span>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════════ */
const LOGIN_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; overflow-x: hidden; }

  /* Animations */
  @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes spin       { to{transform:rotate(360deg)} }
  @keyframes shimmerBg  { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes fadeIn     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes heroIn     { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cardGlow   {
    0%,100%{box-shadow:0 24px 70px rgba(0,0,0,0.85),0 0 32px rgba(56,189,248,0.07),inset 0 1px 0 rgba(255,255,255,0.06)}
    50%    {box-shadow:0 24px 70px rgba(0,0,0,0.85),0 0 54px rgba(56,189,248,0.18),inset 0 1px 0 rgba(255,255,255,0.06)}
  }

  /* Responsive show/hide */
  .desktop-layout { display: none; }
  .mobile-layout  { display: flex; flex-direction: column; min-height: 100vh; }

  @media (min-width: 768px) {
    .desktop-layout { display: flex; width: 100%; min-height: 100vh; align-items: stretch; }
    .mobile-layout  { display: none; }
  }

  /* Mobile hero animation */
  .mobile-hero-in { animation: heroIn 0.35s ease; }

  /* Scrollbar */
  .no-scrollbar { overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }

  /* Shimmer button */
  .shimmer-btn {
    background: linear-gradient(135deg,#0ea5e9 0%,#38bdf8 40%,#818cf8 80%,#0ea5e9 100%) !important;
    background-size: 300% auto !important;
    animation: shimmerBg 3.5s linear infinite !important;
  }
  .shimmer-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 30px rgba(56,189,248,0.5) !important;
  }
  .shimmer-btn:active:not(:disabled) { transform: translateY(0) !important; }

  /* Feature card hover */
  .feat-card:hover {
    background: rgba(56,189,248,0.07) !important;
    border-color: rgba(56,189,248,0.25) !important;
    transform: translateY(-2px) !important;
  }

  /* Auth card */
  .auth-card { animation: cardGlow 4.5s ease-in-out infinite; }

  /* Input focus */
  input:focus {
    border-color: rgba(56,189,248,0.7) !important;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.13) !important;
    outline: none;
  }

  /* Autofill */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px rgba(8,12,28,0.98) inset !important;
    -webkit-text-fill-color: #f1f5f9 !important;
    caret-color: #f1f5f9;
  }

  /* Mobile form font size to prevent zoom */
  @media (max-width: 767px) {
    input, select, textarea { font-size: 16px !important; }
    button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 4px; }
`;

/* ── Shared layout styles ── */
const LS = {
  root:      { minHeight: "100vh", background: "#020617", fontFamily: "'Segoe UI',system-ui,sans-serif", position: "relative", overflow: "hidden" },
  canvas:    { position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" },
  bgGrad:    { position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 75% 55% at 12% 28%,rgba(56,189,248,0.08) 0%,transparent 60%),radial-gradient(ellipse 55% 45% at 88% 72%,rgba(99,102,241,0.07) 0%,transparent 60%),linear-gradient(180deg,#020617 0%,#060f26 50%,#020617 100%)" },
  gridOverlay: { position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(56,189,248,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.022) 1px,transparent 1px)", backgroundSize: "55px 55px", maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%,black 0%,transparent 100%)" },

  // Desktop
  heroCol: { flex: 1, padding: "60px 48px 48px 56px", position: "relative", zIndex: 2, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto", maxHeight: "100vh" },
  formCol: { width: 460, padding: "32px 28px", position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" },
  card:    { width: "100%", background: "rgba(10,13,30,0.92)", backdropFilter: "blur(36px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "32px 28px 24px", position: "relative", overflow: "hidden" },

  badge:       { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.22)", borderRadius: 40, padding: "5px 14px 5px 8px", marginBottom: 22, alignSelf: "flex-start" },
  badgeText:   { fontSize: 12, fontWeight: 800, color: "#38bdf8" },
  badgeDivider:{ color: "rgba(56,189,248,0.3)", margin: "0 2px" },
  badgeSub:    { fontSize: 10, color: "#475569", fontWeight: 700 },

  headline:    { fontSize: "clamp(30px,3.5vw,46px)", fontWeight: 900, lineHeight: 1.15, color: "#fff", margin: "0 0 18px", letterSpacing: -1 },
  typedSpan:   { display: "block", fontWeight: 900, background: "linear-gradient(120deg,#38bdf8,#818cf8,#34d399)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmerBg 4s linear infinite" },
  cursor:      { display: "inline-block", animation: "blink 1s step-end infinite", color: "#38bdf8", WebkitTextFillColor: "#38bdf8" },
  headlineSub: { display: "block", marginTop: 4 },
  aiWord:      { fontSize: "0.85em", fontWeight: 900, background: "linear-gradient(120deg,#38bdf8,#818cf8,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },

  heroPara: { fontSize: 13, color: "#94a3b8", lineHeight: 1.72, maxWidth: 480, margin: "0 0 22px" },
  atomBox:  { position: "relative", width: "100%", maxWidth: 380, height: 200, marginBottom: 20 },
  threeCv:  { width: "100%", height: "100%", borderRadius: 12 },
  atomLbl:  { position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: "#38bdf8", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.55, whiteSpace: "nowrap" },

  featGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 18 },
  featCard: { padding: "10px 11px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "flex-start", gap: 8, cursor: "default", transition: "all 0.22s ease" },

  elemStrip: { display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" },
  elemCell:  { display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 5px", borderRadius: 7, border: "1px solid", minWidth: 34, cursor: "default", transition: "all 0.35s ease" },

  statsRow: { display: "flex", gap: 10 },
  statBox:  { display: "flex", flexDirection: "column", alignItems: "center", padding: "9px 14px", borderRadius: 11, background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.12)", gap: 2 },
};

/* ── Mobile-specific styles ── */
const ML = {
  topBar:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "rgba(2,6,23,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 50 },
  brand:     { display: "flex", alignItems: "center", gap: 8 },
  brandText: { fontSize: 14, fontWeight: 900, color: "#38bdf8" },
  brandSub:  { fontSize: 9, color: "#475569", fontWeight: 700, display: "none" }, // hidden on tiny screens, shown on wider mobile
  heroToggle:{ padding: "5px 12px", borderRadius: 20, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8", fontSize: 11, fontWeight: 700, cursor: "pointer" },

  hero:    { padding: "16px", display: "flex", flexDirection: "column", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" },
  heroTop: { display: "flex", gap: 12, alignItems: "flex-start" },
  heroText:{ flex: 1 },
  h1:      { fontSize: 22, fontWeight: 900, lineHeight: 1.2, color: "#fff", margin: "0 0 6px" },
  aiWord:  { fontSize: 20, fontWeight: 900, background: "linear-gradient(120deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sub:     { fontSize: 11, color: "#94a3b8", lineHeight: 1.6 },
  atomWrap:{ width: 110, height: 110, flexShrink: 0, borderRadius: 12, background: "radial-gradient(ellipse at center,rgba(56,189,248,0.06) 0%,transparent 70%)", border: "1px solid rgba(56,189,248,0.15)", overflow: "hidden" },
  threeCv: { width: "100%", height: "100%" },
  elemStrip: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 },
  statsRow:{ display: "flex", gap: 6, justifyContent: "center" },
  statBox: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 4px", borderRadius: 9, background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.12)", gap: 1 },

  formWrap:{ padding: "0 14px 32px", position: "relative", zIndex: 2, flex: 1 },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "16px 0 14px" },
  divLine: { flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.3),transparent)" },
  divText: { fontSize: 10, fontWeight: 800, color: "#38bdf8", letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap" },
  card:    { background: "rgba(10,13,30,0.94)", backdropFilter: "blur(36px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: "20px 18px 18px", position: "relative", overflow: "hidden" },
};

/* ── Form/input styles ── */
const FS = {
  tabs:    { display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, marginBottom: 18, gap: 3 },
  tab:     { flex: 1, padding: "8px 0", border: "none", borderRadius: 8, background: "transparent", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.25s" },
  tabOn:   { background: "rgba(56,189,248,0.12)", color: "#38bdf8", boxShadow: "0 0 14px rgba(56,189,248,0.18)", border: "1px solid rgba(56,189,248,0.25)" },
  title:   { fontWeight: 800, color: "#f1f5f9", margin: "0 0 5px" },
  titleSub:{ fontSize: 11, color: "#64748b", lineHeight: 1.5 },
  stepsRow:{ display: "flex", alignItems: "center", marginBottom: 16, gap: 2 },
  dot:     { width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0, transition: "all 0.3s" },
  dotLbl:  { fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 60 },
  stepLine:{ height: 2, borderRadius: 2, margin: "0 3px", transition: "background 0.3s" },
  errBox:  { background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 9, padding: "8px 12px", color: "#fca5a5", fontSize: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 },
  sucBox:  { background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 9, padding: "8px 12px", color: "#86efac", fontSize: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 },
  fieldLabel:{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 5, letterSpacing: 0.5, textTransform: "uppercase" },
  fieldIcon: { position: "absolute", left: 12, fontSize: 13, zIndex: 1, pointerEvents: "none", opacity: 0.5 },
  inp:     { width: "100%", padding: "11px 14px 11px 38px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "all 0.3s", fontFamily: "inherit" },
  eyeBtn:  { position: "absolute", right: 10, background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: 3, fontSize: 14, display: "flex", alignItems: "center" },
  submitBtn:{ width: "100%", padding: "13px", border: "none", borderRadius: 11, color: "#020617", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6, transition: "all 0.3s", boxSizing: "border-box" },
  spin:    { width: 15, height: 15, border: "2px solid rgba(2,6,23,0.25)", borderTopColor: "#020617", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  lnk:     { color: "#38bdf8", cursor: "pointer", fontWeight: 600, fontSize: 12 },
  switchTxt:{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 12 },
  secNote: { textAlign: "center", fontSize: 10, color: "#334155", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 10px", borderRadius: 7, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" },
};
