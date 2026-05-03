import { useState, useEffect, useRef, useCallback } from "react";

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [activeElem, setActiveElem] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const threeRef = useRef(null);
  const cardRef = useRef(null);
  const raf2d = useRef(null);
  const headRef = useRef(0);
  const charRef = useRef(0);
  const delRef = useRef(false);
  const timerRef = useRef(null);

  const HEADLINES = ["Explore Chemistry", "Master Reactions", "Decode Elements", "Ace Your Exams", "Think Molecular"];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const tick = () => {
      const cur = HEADLINES[headRef.current];
      if (!delRef.current) {
        setTypedText(cur.slice(0, charRef.current + 1));
        charRef.current++;
        if (charRef.current === cur.length) { delRef.current = true; timerRef.current = setTimeout(tick, 2200); return; }
      } else {
        setTypedText(cur.slice(0, charRef.current - 1));
        charRef.current--;
        if (charRef.current === 0) { delRef.current = false; headRef.current = (headRef.current + 1) % HEADLINES.length; }
      }
      timerRef.current = setTimeout(tick, delRef.current ? 45 : 88);
    };
    timerRef.current = setTimeout(tick, 600);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const h = (e) => setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 38, y: (e.clientY / window.innerHeight - 0.5) * 26 });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [isMobile]);

  const onCardMove = useCallback((e) => {
    if (isMobile) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    setCardTilt({ x: -dy * 9, y: dx * 9 });
  }, [isMobile]);
  const onCardLeave = useCallback(() => setCardTilt({ x: 0, y: 0 }), []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = cv.width = window.innerWidth;
    let H = cv.height = window.innerHeight;
    const ptCount = isMobile ? 28 : 65;
    const PTS = Array.from({ length: ptCount }, () => ({
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
        const alpha = 0.35 + 0.35 * Math.sin(p.ph);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(56,189,248,${alpha})`);
        g.addColorStop(1, "rgba(56,189,248,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      PTS.forEach((a, i) => {
        PTS.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(56,189,248,${0.1 * (1 - d / 130)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      raf2d.current = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf2d.current); window.removeEventListener("resize", resize); };
  }, [isMobile]);

  useEffect(() => {
    const cv = threeRef.current;
    if (!cv) return;
    let threeRaf;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      const THREE = window.THREE;
      const W = cv.clientWidth, H = cv.clientHeight;
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
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.78, 32, 32), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.1 })));
      const makeRing = (rx, ry, rz, color) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.022, 16, 100), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 }));
        m.rotation.set(rx, ry, rz); scene.add(m); return m;
      };
      const rings = [makeRing(0, 0, 0, 0x38bdf8), makeRing(Math.PI / 3, 0, Math.PI / 5, 0x818cf8), makeRing(-Math.PI / 3, 0, -Math.PI / 5, 0x06b6d4)];
      const makeElec = (color) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), new THREE.MeshPhongMaterial({ color, emissive: color, shininess: 220 }));
        m.add(new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2 })));
        scene.add(m); return m;
      };
      const elecs = [makeElec(0x38bdf8), makeElec(0xa78bfa), makeElec(0x34d399)];
      scene.add(new THREE.AmbientLight(0x1e3a5f, 3.5));
      const dl = new THREE.DirectionalLight(0x38bdf8, 3); dl.position.set(5, 5, 5); scene.add(dl);
      scene.add(Object.assign(new THREE.PointLight(0x818cf8, 2, 14), { position: { x: -4, y: -3, z: 2 } }));
      scene.add(Object.assign(new THREE.PointLight(0x34d399, 1.5, 10), { position: { x: 3, y: -4, z: -2 } }));
      const tilts = [[0, 0, 0], [Math.PI / 3, 0, Math.PI / 5], [-Math.PI / 3, 0, -Math.PI / 5]];
      let t = 0;
      const animate = () => {
        threeRaf = requestAnimationFrame(animate); t += 0.011;
        nucleus.rotation.y += 0.007; nucleus.rotation.x += 0.003;
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

  useEffect(() => {
    const id = setInterval(() => setActiveElem(n => (n + 1) % ELEMENTS.length), 2000);
    return () => clearInterval(id);
  }, []);

  const clearFields = () => { setEmail(""); setPassword(""); setConfirm(""); setError(""); setSuccess(""); };
  const switchMode = (m) => { clearFields(); setMode(m); };
  const simulate = (fn) => {
    setLoading(true); setError(""); setSuccess("");
    setTimeout(() => { setLoading(false); fn(); }, 950);
  };

  const handleSignup = () => {
    if (!email || !password || !confirm) { setError("Please fill in all fields."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    simulate(() => {
      const users = JSON.parse(localStorage.getItem("chem-users")) || [];
      if (users.find(u => u.email === email)) { setError("Email already registered."); return; }
      users.push({ email, password });
      localStorage.setItem("chem-users", JSON.stringify(users));
      setSuccess("Account created! Please sign in.");
      setTimeout(() => switchMode("login"), 1300);
    });
  };

  const handleLogin = () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    simulate(() => {
      const users = JSON.parse(localStorage.getItem("chem-users")) || [];
      const ok = users.find(u => u.email === email && u.password === password);
      if (ok) { onLoginSuccess(); } else { setError("Invalid email or password."); }
    });
  };

  const handleForgot = () => {
    if (!email) { setError("Enter the email linked to your account."); return; }
    if (!password || !confirm) { setError("Enter and confirm your new password."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    simulate(() => {
      const users = JSON.parse(localStorage.getItem("chem-users")) || [];
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

  const steps = mode === "login" ? ["Credentials", "Access"] : mode === "signup" ? ["Identity", "Security", "Confirm"] : ["Email", "New Password", "Update"];
  const curStep = mode === "login" ? (password ? 1 : 0) : mode === "signup" ? (confirm ? 2 : password ? 1 : 0) : (password ? 1 : 0);

  const cardTransform = isMobile ? "none" : `perspective(1100px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`;

  return (
    <div style={S.root}>
      <style>{CSS}</style>
      <canvas ref={canvasRef} style={S.canvas} />
      <div style={S.bg} />
      <div style={S.grid} />
      <div style={S.scanline} />
      <div style={S.orb1} />
      <div style={S.orb2} />
      <div style={S.orb3} />

      {isMobile ? (
        /* ══════════════ MOBILE LAYOUT ══════════════ */
        <div style={S.mobileRoot}>
          {/* ── HERO SECTION (top ~45%) ── */}
          <div style={S.mobileHero}>
            {/* Badge */}
            <div style={S.badge} className="fadeIn">
              <AtomIcon size={15} />
              <span style={S.badgeText}>ChemBot AI</span>
              <span style={S.badgePill}>KIET · JNTU Kakinada</span>
            </div>

            {/* Headline + 3D atom side by side */}
            <div style={S.mobileHeroRow}>
              <div style={S.mobileHeadlineCol}>
                <h1 style={S.mobileH1} className="fadeIn">
                  <span style={S.typed}>{typedText || "Explore Chemistry"}<span style={S.cursor}>|</span></span>
                  <span style={S.mobileHlRow}>
                    <span style={S.hlWith}>with </span>
                    <span style={S.hlAI}>AI</span>
                  </span>
                </h1>
                <p style={S.mobileSub} className="fadeIn">
                  Powered by <strong style={{ color: "#38bdf8" }}>FLAN-T5 + LoRA</strong> — university-grade chemistry answers, molecular diagrams & multilingual support.
                </p>
              </div>
              <div style={S.mobileAtomCol}>
                <canvas ref={threeRef} style={S.mobileThreeCv} />
                <div style={S.atomLbl}>WebGL 3D</div>
              </div>
            </div>

            {/* Element strip */}
            <div style={S.mobileElemStrip} className="fadeIn">
              {ELEMENTS.slice(0, 7).map((el, i) => (
                <div key={el.s} style={{
                  ...S.elemCell,
                  background: i === activeElem % 7 ? el.c + "22" : "rgba(255,255,255,0.03)",
                  borderColor: i === activeElem % 7 ? el.c : "rgba(255,255,255,0.08)",
                  color: i === activeElem % 7 ? el.c : "#475569",
                  transform: i === activeElem % 7 ? "scale(1.15) translateY(-3px)" : "scale(1)",
                  boxShadow: i === activeElem % 7 ? `0 4px 14px ${el.c}44` : "none",
                }}>
                  <div style={{ fontSize: 6, fontWeight: 700, opacity: 0.7 }}>{el.n}</div>
                  <div style={{ fontSize: 12, fontWeight: 900 }}>{el.s}</div>
                  <div style={{ fontSize: 5.5, opacity: 0.6, textAlign: "center", lineHeight: 1.2 }}>{el.nm}</div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div style={S.mobileStatsRow} className="fadeIn">
              {STATS.map(({ n, l, ic }) => (
                <div key={l} style={S.mobileStatBox}>
                  <span style={{ fontSize: 12 }}>{ic}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#38bdf8", lineHeight: 1 }}>{n}</span>
                  <span style={{ fontSize: 8, color: "#64748b", fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM SECTION (bottom ~55%) ── */}
          <div style={S.mobileFormSection}>
            {/* Divider with label */}
            <div style={S.mobileDivider}>
              <div style={S.mobileDivLine} />
              <span style={S.mobileDivText}>Your Account</span>
              <div style={S.mobileDivLine} />
            </div>

            <div style={S.mobileCard} className="mobileCardIn">
              <div style={S.cardGlow} />
              {[
                { top: 0, left: 0, borderTop: "1.5px solid #38bdf8", borderLeft: "1.5px solid #38bdf8" },
                { top: 0, right: 0, borderTop: "1.5px solid #38bdf8", borderRight: "1.5px solid #38bdf8" },
                { bottom: 0, left: 0, borderBottom: "1.5px solid #38bdf8", borderLeft: "1.5px solid #38bdf8" },
                { bottom: 0, right: 0, borderBottom: "1.5px solid #38bdf8", borderRight: "1.5px solid #38bdf8" },
              ].map((cs, i) => <div key={i} style={{ position: "absolute", width: 12, height: 12, ...cs }} />)}

              {/* Tabs */}
              <div style={S.tabs}>
                {["login", "signup"].map(m => (
                  <button key={m} style={{ ...S.tab, ...(mode === m ? S.tabOn : {}) }} onClick={() => switchMode(m)}>
                    {m === "login" ? "🔑 Sign In" : "🚀 Sign Up"}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div style={{ marginBottom: 14 }}>
                <h2 style={S.mobileTitle}>
                  {mode === "login" ? "Welcome Back 👋" : mode === "signup" ? "Create Account 🚀" : "Reset Password 🔑"}
                </h2>
                <p style={S.titleSub}>
                  {mode === "login" ? "Sign in to your Chemistry AI dashboard" : mode === "signup" ? "Join the KIET Chemistry AI platform" : "Set a new password for your account"}
                </p>
              </div>

              {/* Progress steps */}
              <div style={S.stepsRow}>
                {steps.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                    <div style={{ ...S.dot, background: i <= curStep ? "linear-gradient(135deg,#38bdf8,#0ea5e9)" : "rgba(255,255,255,0.08)", boxShadow: i <= curStep ? "0 0 10px rgba(56,189,248,0.5)" : "none" }}>
                      {i < curStep ? "✓" : i + 1}
                    </div>
                    <span style={{ ...S.dotLbl, color: i <= curStep ? "#38bdf8" : "#475569" }}>{s}</span>
                    {i < steps.length - 1 && <div style={{ ...S.stepLine, background: i < curStep ? "linear-gradient(90deg,#38bdf8,#0ea5e9)" : "rgba(255,255,255,0.08)" }} />}
                  </div>
                ))}
              </div>

              {error && <div style={S.errBox}><span>⚠️</span>{error}</div>}
              {success && <div style={S.sucBox}><span>✅</span>{success}</div>}

              {/* Email */}
              <Field label="Email Address" icon="✉">
                <input type="email" value={email} placeholder="you@university.edu"
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()} style={S.inp} />
              </Field>

              {/* Password */}
              <Field label={mode === "forgot" ? "New Password" : "Password"} icon="🔒">
                <input type={showPass ? "text" : "password"} value={password}
                  placeholder={mode === "forgot" ? "New secure password" : "Your password"}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  style={{ ...S.inp, paddingRight: 44 }} />
                <button style={S.eyeBtn} onClick={() => setShowPass(v => !v)}>{showPass ? "🙈" : "👁"}</button>
              </Field>

              {(mode === "signup" || mode === "forgot") && password && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: -8, marginBottom: 12 }}>
                  {[1, 2, 3, 4].map(lv => (
                    <div key={lv} style={{ flex: 1, height: 3, borderRadius: 3, background: lv <= pwStrength ? pwColor : "rgba(255,255,255,0.08)", transition: "background 0.4s" }} />
                  ))}
                  <span style={{ fontSize: 9, fontWeight: 700, color: pwColor, minWidth: 46 }}>{pwLabel}</span>
                </div>
              )}

              {(mode === "signup" || mode === "forgot") && (
                <Field label="Confirm Password" icon="🔒">
                  <input type={showConfirm ? "text" : "password"} value={confirm}
                    placeholder="Repeat password"
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    style={{ ...S.inp, paddingRight: 44, borderColor: confirm ? (confirm === password ? "#22c55e" : "#ef4444") : undefined }} />
                  <button style={S.eyeBtn} onClick={() => setShowConfirm(v => !v)}>{showConfirm ? "🙈" : "👁"}</button>
                  {confirm && <div style={{ position: "absolute", bottom: -16, left: 0, fontSize: 10, color: confirm === password ? "#22c55e" : "#ef4444" }}>
                    {confirm === password ? "✓ Passwords match" : "✗ Don't match"}
                  </div>}
                </Field>
              )}

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: -4, marginBottom: 10 }}>
                  <span style={S.lnk} onClick={() => switchMode("forgot")}>Forgot password?</span>
                </div>
              )}

              <button className="shimmerBtn" style={{ ...S.submitBtn, opacity: loading ? 0.72 : 1 }} onClick={submit} disabled={loading}>
                {loading
                  ? <span style={S.spin} />
                  : <>{mode === "login" ? "Sign In to Dashboard" : mode === "signup" ? "Create Account" : "Update Password"}<span style={{ marginLeft: 7 }}>→</span></>}
              </button>

              <p style={S.switchTxt}>
                {mode === "login"
                  ? <>New here? <span style={S.lnk} onClick={() => switchMode("signup")}>Create account</span></>
                  : <>Have an account? <span style={S.lnk} onClick={() => switchMode("login")}>Sign in</span></>}
              </p>
              {mode === "forgot" && (
                <p style={{ ...S.switchTxt, marginTop: 4 }}>
                  <span style={S.lnk} onClick={() => switchMode("login")}>← Back to Sign In</span>
                </p>
              )}

              <div style={S.secNote}>
                <span>🔐</span>
                <span>Data stored locally · KIET University · JNTU Kakinada</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════ DESKTOP LAYOUT ══════════════ */
        <div style={{ display: "flex", width: "100%", minHeight: "100vh", alignItems: "stretch" }}>
          {/* LEFT */}
          <div style={{ ...S.left, transform: `translate(${mousePos.x * 0.055}px, ${mousePos.y * 0.055}px)` }}>
            <div style={S.badge} className="fadeIn">
              <AtomIcon size={19} />
              <span style={S.badgeText}>ChemBot AI</span>
              <span style={S.badgePill}>KIET · JNTU Kakinada</span>
            </div>
            <h1 style={S.h1} className="slideR">
              <span style={S.typed}>{typedText || "Explore Chemistry"}<span style={S.cursor}>|</span></span>
              <div style={{ marginTop: 6 }}>
                <span style={S.hlWith}>with </span>
                <span style={S.hlAI}>AI</span>
              </div>
            </h1>
            <p style={S.sub} className="fadeIn">
              A university-grade platform powered by <strong style={{ color: "#38bdf8" }}>FLAN-T5 + LoRA</strong> — point-wise chemistry answers, molecular diagrams, PDF analysis, interactive quizzes, and multilingual support across 11 languages.
            </p>
            <div style={S.atomWrap} className="fadeIn">
              <canvas ref={threeRef} style={S.threeCv} />
              {FLOAT_MOLS.map((m, i) => (
                <div key={m.f} style={{ ...S.floatMol, top: `${m.top}%`, left: `${m.left}%`, animationDelay: `${i * 0.8}s`, borderColor: m.c + "44", background: m.c + "10", color: m.c }}>
                  <span style={{ fontSize: 11, fontWeight: 900 }}>{m.f}</span>
                  <span style={{ fontSize: 9, opacity: 0.65 }}>{m.mw}</span>
                </div>
              ))}
              <div style={S.atomLbl}>3D Molecular Model · Real-time WebGL</div>
            </div>
            <div style={S.featGrid} className="fadeIn">
              {FEATS.map((f, i) => (
                <div key={f.t} style={{ ...S.featCard, animationDelay: `${i * 0.09}s` }} className="fadeIn"
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.07)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.25)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <span style={{ fontSize: 19 }}>{f.i}</span>
                  <span style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>{f.t}</span>
                  <span style={{ color: "#64748b", fontSize: 10, lineHeight: 1.4, marginTop: 1 }}>{f.d}</span>
                </div>
              ))}
            </div>
            <div style={S.elemStrip} className="fadeIn">
              {ELEMENTS.map((el, i) => (
                <div key={el.s} style={{ ...S.elemCell, background: i === activeElem ? el.c + "1a" : "rgba(255,255,255,0.025)", borderColor: i === activeElem ? el.c : "rgba(255,255,255,0.07)", color: i === activeElem ? el.c : "#475569", transform: i === activeElem ? "scale(1.14) translateY(-4px)" : "scale(1)", boxShadow: i === activeElem ? `0 4px 18px ${el.c}40` : "none", transition: "all 0.35s ease" }}>
                  <div style={{ fontSize: 7, fontWeight: 700, opacity: 0.7 }}>{el.n}</div>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{el.s}</div>
                  <div style={{ fontSize: 7, opacity: 0.6, textAlign: "center" }}>{el.nm}</div>
                </div>
              ))}
            </div>
            <div style={S.stats} className="fadeIn">
              {STATS.map(({ n, l, ic }) => (
                <div key={l} style={S.statBox}>
                  <span style={{ fontSize: 16 }}>{ic}</span>
                  <span style={S.statN}>{n}</span>
                  <span style={S.statL}>{l}</span>
                </div>
              ))}
            </div>
            <div style={S.techRow} className="fadeIn">
              {["FLAN-T5", "LoRA Adapter", "FastAPI", "MongoDB", "RDKit", "PyMuPDF", "googletrans"].map(t => (
                <span key={t} style={S.tech}>{t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div style={S.right}>
            <div style={{ ...S.shadow, transform: "translate(10px,10px) scale(0.98)" }} />
            <div style={{ ...S.shadow, transform: "translate(5px,5px) scale(0.99)", opacity: 0.5 }} />
            <div ref={cardRef} style={{ ...S.card, transform: cardTransform }} onMouseMove={onCardMove} onMouseLeave={onCardLeave}>
              <div style={S.cardGlow} />
              <div style={S.cardScan} />
              {[
                { top: 0, left: 0, borderTop: "1.5px solid #38bdf8", borderLeft: "1.5px solid #38bdf8" },
                { top: 0, right: 0, borderTop: "1.5px solid #38bdf8", borderRight: "1.5px solid #38bdf8" },
                { bottom: 0, left: 0, borderBottom: "1.5px solid #38bdf8", borderLeft: "1.5px solid #38bdf8" },
                { bottom: 0, right: 0, borderBottom: "1.5px solid #38bdf8", borderRight: "1.5px solid #38bdf8" },
              ].map((cs, i) => <div key={i} style={{ position: "absolute", width: 14, height: 14, ...cs }} />)}
              <div style={S.tabs}>
                {["login", "signup"].map(m => (
                  <button key={m} style={{ ...S.tab, ...(mode === m ? S.tabOn : {}) }} onClick={() => switchMode(m)}>
                    {m === "login" ? "🔑 Sign In" : "🚀 Sign Up"}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 18 }}>
                <h2 style={S.title}>{mode === "login" ? "Welcome Back 👋" : mode === "signup" ? "Create Account 🚀" : "Reset Password 🔑"}</h2>
                <p style={S.titleSub}>{mode === "login" ? "Sign in to your Chemistry AI dashboard" : mode === "signup" ? "Join the KIET Chemistry AI platform" : "Set a new password for your account"}</p>
              </div>
              <div style={S.stepsRow}>
                {steps.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, flex: 1 }}>
                    <div style={{ ...S.dot, background: i <= curStep ? "linear-gradient(135deg,#38bdf8,#0ea5e9)" : "rgba(255,255,255,0.08)", boxShadow: i <= curStep ? "0 0 12px rgba(56,189,248,0.5)" : "none" }}>{i < curStep ? "✓" : i + 1}</div>
                    <span style={{ ...S.dotLbl, color: i <= curStep ? "#38bdf8" : "#475569" }}>{s}</span>
                    {i < steps.length - 1 && <div style={{ ...S.stepLine, background: i < curStep ? "linear-gradient(90deg,#38bdf8,#0ea5e9)" : "rgba(255,255,255,0.08)" }} />}
                  </div>
                ))}
              </div>
              {error && <div style={S.errBox}><span>⚠️</span>{error}</div>}
              {success && <div style={S.sucBox}><span>✅</span>{success}</div>}
              <Field label="Email Address" icon="✉">
                <input type="email" value={email} placeholder="you@university.edu" onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={S.inp} />
              </Field>
              <Field label={mode === "forgot" ? "New Password" : "Password"} icon="🔒">
                <input type={showPass ? "text" : "password"} value={password} placeholder={mode === "forgot" ? "New secure password" : "Your password"} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ ...S.inp, paddingRight: 44 }} />
                <button style={S.eyeBtn} onClick={() => setShowPass(v => !v)}>{showPass ? "🙈" : "👁"}</button>
              </Field>
              {(mode === "signup" || mode === "forgot") && password && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: -8, marginBottom: 12 }}>
                  {[1, 2, 3, 4].map(lv => <div key={lv} style={{ flex: 1, height: 3, borderRadius: 3, background: lv <= pwStrength ? pwColor : "rgba(255,255,255,0.08)", transition: "background 0.4s" }} />)}
                  <span style={{ fontSize: 10, fontWeight: 700, color: pwColor, minWidth: 52 }}>{pwLabel}</span>
                </div>
              )}
              {(mode === "signup" || mode === "forgot") && (
                <Field label="Confirm Password" icon="🔒">
                  <input type={showConfirm ? "text" : "password"} value={confirm} placeholder="Repeat password" onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ ...S.inp, paddingRight: 44, borderColor: confirm ? (confirm === password ? "#22c55e" : "#ef4444") : undefined }} />
                  <button style={S.eyeBtn} onClick={() => setShowConfirm(v => !v)}>{showConfirm ? "🙈" : "👁"}</button>
                  {confirm && <div style={{ position: "absolute", bottom: -18, left: 0, fontSize: 11, color: confirm === password ? "#22c55e" : "#ef4444" }}>{confirm === password ? "✓ Passwords match" : "✗ Don't match"}</div>}
                </Field>
              )}
              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: -4, marginBottom: 10 }}>
                  <span style={S.lnk} onClick={() => switchMode("forgot")}>Forgot password?</span>
                </div>
              )}
              <button className="shimmerBtn" style={{ ...S.submitBtn, opacity: loading ? 0.72 : 1 }} onClick={submit} disabled={loading}>
                {loading ? <span style={S.spin} /> : <>{mode === "login" ? "Sign In to Dashboard" : mode === "signup" ? "Create Account" : "Update Password"}<span style={{ marginLeft: 8 }}>→</span></>}
              </button>
              <p style={S.switchTxt}>
                {mode === "login" ? <>New here? <span style={S.lnk} onClick={() => switchMode("signup")}>Create account</span></> : <>Have an account? <span style={S.lnk} onClick={() => switchMode("login")}>Sign in</span></>}
              </p>
              {mode === "forgot" && <p style={{ ...S.switchTxt, marginTop: 4 }}><span style={S.lnk} onClick={() => switchMode("login")}>← Back to Sign In</span></p>}
              <div style={S.secNote}><span style={{ fontSize: 11 }}>🔐</span><span>Data stored locally · KIET University · JNTU Kakinada</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AtomIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8">
      <circle cx="12" cy="12" r="2.5" fill="#38bdf8" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 5, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: 12, fontSize: 13, zIndex: 1, pointerEvents: "none", opacity: 0.5 }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

const FEATS = [
  { i: "⚗️", t: "Point-wise Answers", d: "Expandable structured chemistry explanations" },
  { i: "🧮", t: "Formula Database", d: "400+ formulas with molecular weights" },
  { i: "🎨", t: "RDKit Structures", d: "2D molecular diagrams from SMILES data" },
  { i: "🔬", t: "PDF Analysis", d: "Summary · Quiz · Video script from PDFs" },
  { i: "🧩", t: "AI Quiz Engine", d: "MCQ quizzes with instant scored feedback" },
  { i: "🌐", t: "11 Languages", d: "Telugu, Hindi, Tamil, Kannada + 7 more" },
];

const ELEMENTS = [
  { n: "1", s: "H", nm: "Hydrogen", c: "#38bdf8" },
  { n: "6", s: "C", nm: "Carbon", c: "#94a3b8" },
  { n: "7", s: "N", nm: "Nitrogen", c: "#60a5fa" },
  { n: "8", s: "O", nm: "Oxygen", c: "#f87171" },
  { n: "11", s: "Na", nm: "Sodium", c: "#fb923c" },
  { n: "17", s: "Cl", nm: "Chlorine", c: "#4ade80" },
  { n: "26", s: "Fe", nm: "Iron", c: "#f59e0b" },
  { n: "79", s: "Au", nm: "Gold", c: "#fbbf24" },
  { n: "47", s: "Ag", nm: "Silver", c: "#cbd5e1" },
];

const FLOAT_MOLS = [
  { f: "H₂O", mw: "18 g/mol", top: 8, left: 4, c: "#38bdf8" },
  { f: "CO₂", mw: "44 g/mol", top: 18, left: 88, c: "#94a3b8" },
  { f: "NaCl", mw: "58 g/mol", top: 74, left: 5, c: "#fb923c" },
  { f: "C₆H₆", mw: "78 g/mol", top: 78, left: 86, c: "#a78bfa" },
];

const STATS = [
  { n: "50K+", l: "Students", ic: "👥" },
  { n: "500+", l: "Reactions", ic: "⚗️" },
  { n: "11", l: "Languages", ic: "🌐" },
  { n: "99%", l: "Accuracy", ic: "🎯" },
];

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; overflow-x: hidden; }
  @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes floatUp   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
  @keyframes orb1anim  { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.1) translate(18px,-14px)} }
  @keyframes orb2anim  { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.07) translate(-14px,12px)} }
  @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes scanMove  { 0%{top:-50%} 100%{top:130%} }
  @keyframes glowPulse { 0%,100%{box-shadow:0 20px 60px rgba(0,0,0,0.8),0 0 30px rgba(56,189,248,0.08),inset 0 1px 0 rgba(255,255,255,0.06)} 50%{box-shadow:0 20px 60px rgba(0,0,0,0.8),0 0 50px rgba(56,189,248,0.2),inset 0 1px 0 rgba(255,255,255,0.06)} }
  @keyframes fadeIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideR    { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cardScan  { 0%{top:-60px} 100%{top:110%} }
  @keyframes mobileCardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .fadeIn { animation: fadeIn 0.7s ease both; }
  .slideR { animation: slideR 0.7s ease both; }
  .mobileCardIn { animation: mobileCardIn 0.5s ease both; }

  .shimmerBtn {
    background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 40%, #818cf8 80%, #0ea5e9 100%) !important;
    background-size: 300% auto !important;
    animation: shimmer 3.5s linear infinite !important;
  }
  .shimmerBtn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 30px rgba(56,189,248,0.5) !important;
  }
  .shimmerBtn:active:not(:disabled) { transform: translateY(0) !important; }

  input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px rgba(8,12,28,0.95) inset !important;
    -webkit-text-fill-color: #f1f5f9 !important;
    caret-color: #f1f5f9;
  }
  input:focus {
    border-color: rgba(56,189,248,0.7) !important;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.13), 0 0 12px rgba(56,189,248,0.15) !important;
    outline: none;
  }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 3px; }

  @media (max-width: 767px) {
    input, select, textarea { font-size: 16px !important; }
    button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  }
`;

const S = {
  root: {
    minHeight: "100vh",
    background: "#020617",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  canvas: { position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" },
  bg: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    background: `
      radial-gradient(ellipse 75% 55% at 12% 28%, rgba(56,189,248,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 55% 45% at 88% 72%, rgba(99,102,241,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 35% 25% at 50% 8%, rgba(6,182,212,0.04) 0%, transparent 50%),
      linear-gradient(180deg, #020617 0%, #060f26 50%, #020617 100%)
    `,
  },
  grid: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: `linear-gradient(rgba(56,189,248,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.022) 1px,transparent 1px)`,
    backgroundSize: "55px 55px",
    maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%,black 0%,transparent 100%)",
  },
  scanline: {
    position: "fixed", left: 0, right: 0, height: "42%", zIndex: 0, pointerEvents: "none",
    background: "linear-gradient(180deg,transparent 0%,rgba(56,189,248,0.013) 50%,transparent 100%)",
    animation: "scanMove 9s linear infinite",
  },
  orb1: { position: "fixed", width: 620, height: 620, borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle,rgba(56,189,248,0.11) 0%,transparent 70%)", top: -220, left: -170, filter: "blur(90px)", animation: "orb1anim 13s ease-in-out infinite" },
  orb2: { position: "fixed", width: 520, height: 520, borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 70%)", bottom: -160, right: 280, filter: "blur(80px)", animation: "orb2anim 16s ease-in-out infinite" },
  orb3: { position: "fixed", width: 320, height: 320, borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 70%)", top: "42%", right: "9%", filter: "blur(70px)", animation: "orb1anim 20s ease-in-out infinite reverse" },

  /* ══ MOBILE LAYOUT ══ */
  mobileRoot: {
    position: "relative", zIndex: 2,
    minHeight: "100vh",
    display: "flex", flexDirection: "column",
    overflowY: "auto",
  },
  mobileHero: {
    padding: "24px 18px 16px",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 0,
    flexShrink: 0,
  },
  mobileHeroRow: {
    display: "flex", alignItems: "flex-start", gap: 12,
    width: "100%", marginBottom: 14,
  },
  mobileHeadlineCol: {
    flex: 1, display: "flex", flexDirection: "column", gap: 6,
  },
  mobileAtomCol: {
    width: 120, height: 120, flexShrink: 0, position: "relative",
    borderRadius: 14,
    background: "radial-gradient(ellipse at center, rgba(56,189,248,0.06) 0%, transparent 70%)",
    border: "1px solid rgba(56,189,248,0.15)",
  },
  mobileThreeCv: {
    width: "100%", height: "100%", borderRadius: 14,
  },
  mobileH1: {
    fontSize: 24, fontWeight: 900, lineHeight: 1.2, color: "#fff",
    letterSpacing: -0.5, margin: 0,
  },
  mobileHlRow: {
    display: "block", marginTop: 3,
  },
  mobileSub: {
    fontSize: 11, color: "#94a3b8", lineHeight: 1.6, margin: 0,
  },
  mobileElemStrip: {
    display: "flex", gap: 5, width: "100%", marginBottom: 12,
    overflowX: "auto", paddingBottom: 2,
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    justifyContent: "flex-start",
  },
  mobileStatsRow: {
    display: "flex", gap: 6, width: "100%", justifyContent: "center",
    marginBottom: 4,
  },
  mobileStatBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "6px 8px", borderRadius: 9,
    background: "rgba(56,189,248,0.05)",
    border: "1px solid rgba(56,189,248,0.12)",
    gap: 1, flex: 1, maxWidth: 72,
  },
  mobileFormSection: {
    padding: "0 14px 28px",
    display: "flex", flexDirection: "column",
    flex: 1,
  },
  mobileDivider: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 14,
  },
  mobileDivLine: {
    flex: 1, height: 1,
    background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)",
  },
  mobileDivText: {
    fontSize: 10, fontWeight: 700, color: "#38bdf8",
    letterSpacing: 1.5, textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  mobileCard: {
    background: "rgba(10,13,30,0.92)", backdropFilter: "blur(36px)",
    border: "1px solid rgba(255,255,255,0.09)", borderRadius: 22,
    padding: "22px 18px 18px", position: "relative", overflow: "hidden",
    animation: "glowPulse 4.5s ease-in-out infinite",
  },
  mobileTitle: {
    fontSize: 17, fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px",
  },

  /* ══ DESKTOP LAYOUT ══ */
  left: {
    flex: 1, padding: "70px 50px 48px 58px",
    position: "relative", zIndex: 2,
    display: "flex", flexDirection: "column", justifyContent: "center",
    transition: "transform 0.12s ease-out",
    overflowY: "auto", maxHeight: "100vh",
  },
  right: {
    width: 455, padding: "36px 32px",
    position: "relative", zIndex: 2,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  shadow: {
    position: "absolute", inset: 0, borderRadius: 24, zIndex: -1,
    background: "rgba(56,189,248,0.05)",
    border: "1px solid rgba(56,189,248,0.09)",
    backdropFilter: "blur(8px)",
  },
  card: {
    width: "100%", background: "rgba(10,13,30,0.9)", backdropFilter: "blur(36px)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24,
    padding: "32px 28px 24px", position: "relative", overflow: "hidden",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    animation: "glowPulse 4.5s ease-in-out infinite",
  },

  /* ══ SHARED ══ */
  badge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.22)",
    borderRadius: 40, padding: "5px 13px 5px 8px", marginBottom: 20, alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: 800, color: "#38bdf8", letterSpacing: 0.4 },
  badgePill: { fontSize: 9, fontWeight: 700, color: "#475569", marginLeft: 3, letterSpacing: 0.5 },

  h1: { fontSize: 44, fontWeight: 900, lineHeight: 1.2, color: "#fff", margin: "0 0 18px", letterSpacing: -1 },
  typed: {
    display: "block", minHeight: "1.2em", fontWeight: 900,
    background: "linear-gradient(120deg, #38bdf8, #818cf8, #34d399)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    animation: "shimmer 4s linear infinite",
  },
  cursor: { display: "inline-block", animation: "blink 1s step-end infinite", color: "#38bdf8", WebkitTextFillColor: "#38bdf8" },
  hlWith: { color: "#64748b", fontWeight: 400, fontSize: 22 },
  hlAI: { fontSize: 34, fontWeight: 900, background: "linear-gradient(120deg,#38bdf8,#818cf8,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sub: { fontSize: 13, color: "#94a3b8", lineHeight: 1.72, maxWidth: 490, margin: "0 0 20px" },

  atomWrap: { position: "relative", width: "100%", maxWidth: 400, height: 210, marginBottom: 18 },
  threeCv: { width: "100%", height: "100%", borderRadius: 14, background: "radial-gradient(ellipse at center,rgba(56,189,248,0.04) 0%,transparent 70%)" },
  atomLbl: { position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: "#38bdf8", fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase", opacity: 0.55, whiteSpace: "nowrap" },
  floatMol: { position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", padding: "5px 8px", borderRadius: 8, border: "1px solid", animation: "floatUp 3.2s ease-in-out infinite", lineHeight: 1.2 },

  featGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 },
  featCard: { padding: "10px 11px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 2, cursor: "default", transition: "all 0.22s ease" },

  elemStrip: { display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" },
  elemCell: { display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 5px", borderRadius: 7, border: "1px solid", minWidth: 32, cursor: "default", transition: "all 0.35s ease", flexShrink: 0 },

  stats: { display: "flex", gap: 10, marginBottom: 14 },
  statBox: { display: "flex", flexDirection: "column", alignItems: "center", padding: "9px 14px", borderRadius: 11, background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.12)", gap: 2 },
  statN: { fontSize: 20, fontWeight: 900, color: "#38bdf8", lineHeight: 1 },
  statL: { fontSize: 10, color: "#64748b", fontWeight: 600 },

  techRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  tech: { padding: "3px 10px", borderRadius: 18, fontSize: 10, fontWeight: 700, background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.18)", color: "#7dd3fc" },

  cardGlow: { position: "absolute", top: 0, left: "9%", right: "9%", height: 1.5, background: "linear-gradient(90deg,transparent,#38bdf8 30%,#818cf8 70%,transparent)", borderRadius: "0 0 3px 3px" },
  cardScan: { position: "absolute", left: 0, right: 0, height: 70, pointerEvents: "none", background: "linear-gradient(180deg,transparent,rgba(56,189,248,0.018),transparent)", animation: "cardScan 7s linear infinite" },

  tabs: { display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, marginBottom: 18, gap: 3 },
  tab: { flex: 1, padding: "8px 0", border: "none", borderRadius: 8, background: "transparent", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.25s" },
  tabOn: { background: "rgba(56,189,248,0.12)", color: "#38bdf8", boxShadow: "0 0 14px rgba(56,189,248,0.18)", border: "1px solid rgba(56,189,248,0.25)" },

  title: { fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: "0 0 5px" },
  titleSub: { fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.5 },

  stepsRow: { display: "flex", alignItems: "center", marginBottom: 14 },
  dot: { width: 21, height: 21, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0, transition: "all 0.3s" },
  dotLbl: { fontSize: 8, fontWeight: 600, whiteSpace: "nowrap", transition: "color 0.3s" },
  stepLine: { flex: 1, height: 2, borderRadius: 2, margin: "0 4px", transition: "background 0.3s" },

  errBox: { background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 9, padding: "8px 12px", color: "#fca5a5", fontSize: 11, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 },
  sucBox: { background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 9, padding: "8px 12px", color: "#86efac", fontSize: 11, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 },

  inp: { width: "100%", padding: "11px 14px 11px 38px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "all 0.3s", fontFamily: "inherit" },
  eyeBtn: { position: "absolute", right: 10, background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: 3, fontSize: 14, display: "flex", alignItems: "center" },

  submitBtn: { width: "100%", padding: "13px", border: "none", borderRadius: 11, color: "#020617", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6, transition: "all 0.3s", boxSizing: "border-box" },
  spin: { width: 15, height: 15, border: "2px solid rgba(2,6,23,0.25)", borderTopColor: "#020617", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },

  lnk: { color: "#38bdf8", cursor: "pointer", fontWeight: 600, fontSize: 12 },
  switchTxt: { textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 12, marginBottom: 0 },
  secNote: { textAlign: "center", fontSize: 10, color: "#334155", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 10px", borderRadius: 7, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" },
};
