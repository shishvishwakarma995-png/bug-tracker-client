import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TYPING_WORDS = ['Bugs.', 'Issues.', 'Features.', 'Sprints.'];

const FEATURES = [
  { icon: '🧩', title: 'Kanban Board', desc: 'Drag & drop tickets across To Do, In Progress, and Done columns in real-time.', color: '#7C3AED' },
  { icon: '🐛', title: 'Issue Tracking', desc: 'Track bugs, features, and tasks with priority levels, types, and assignees.', color: '#0891B2' },
  { icon: '💬', title: 'Comments', desc: 'Collaborate with your team directly on tickets with threaded comments.', color: '#EC4899' },
  { icon: '🏃', title: 'Sprint Planning', desc: 'Organize work into sprints and track velocity across your team.', color: '#F59E0B' },
  { icon: '📋', title: 'Backlog View', desc: 'Manage your entire backlog in a clean list view with powerful filters.', color: '#10B981' },
  { icon: '👥', title: 'Team Management', desc: 'Invite members, assign roles, and collaborate across multiple projects.', color: '#6366F1' },
];

const STATS = [
  { value: 10000, label: 'Issues Tracked', suffix: '+' },
  { value: 500, label: 'Teams Using', suffix: '+' },
  { value: 99, label: 'Uptime', suffix: '%' },
  { value: 3, label: 'Min Setup', suffix: ' min' },
];

const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'Lead Developer @ TechCorp', text: 'Bug Tracker replaced Jira for our 20-person team. The UI is so much cleaner and faster.', avatar: 'R' },
  { name: 'Priya Patel', role: 'Product Manager @ StartupX', text: 'Sprint planning and backlog management is exactly what we needed. Highly recommend!', avatar: 'P' },
  { name: 'Amit Kumar', role: 'CTO @ DevStudio', text: 'Setup took 3 minutes. Our team was tracking bugs within the hour. Incredible product.', avatar: 'A' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useRef(null);
  const statsStarted = useRef(false);

  // Typewriter effect
  useEffect(() => {
    const word = TYPING_WORDS[wordIndex];
    let timeout;
    if (!isDeleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!isDeleting && displayed.length === word.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setWordIndex(i => (i + 1) % TYPING_WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex]);

  // Scroll parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !statsStarted.current) {
        statsStarted.current = true;
        STATS.forEach((stat, i) => {
          let start = 0;
          const step = stat.value / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= stat.value) {
              start = stat.value;
              clearInterval(timer);
            }
            setCounts(prev => {
              const next = [...prev];
              next[i] = Math.floor(start);
              return next;
            });
          }, 25);
        });
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Testimonial auto-slide
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const floatingCards = [
    { top: '15%', left: '62%', delay: '0s', title: 'Fix login bug', priority: '⬆ High', type: '🐛', status: 'IN PROGRESS', color: '#7C3AED' },
    { top: '38%', left: '68%', delay: '0.4s', title: 'Add dark mode', priority: '➡ Medium', type: '✨', status: 'TO DO', color: '#0891B2' },
    { top: '60%', left: '60%', delay: '0.8s', title: 'Update README', priority: '⬇ Low', type: '📝', status: 'DONE', color: '#10B981' },
  ];

  return (
    <div style={{ background: '#030712', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes slide-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes bounce-in { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes slide-right { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        .float-card { animation: float2 4s ease-in-out infinite; }
        .float-card:nth-child(2) { animation-delay: 0.4s; }
        .float-card:nth-child(3) { animation-delay: 0.8s; }
        .glow-text { background: linear-gradient(135deg, #22D3EE, #818CF8, #C084FC, #F472B6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background-size: 300%; animation: gradient-shift 4s ease infinite; text-shadow: 0 0 30px rgba(192, 132, 252, 0.4); }
        .nav-blur { background: rgba(3,7,18,0.8); backdrop-filter: blur(20px); }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .feature-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .btn-primary { background: linear-gradient(135deg, #0891B2 0%, #7C3AED 60%, #EC4899 100%); transition: all 0.3s; box-shadow: 0 4px 24px rgba(124,58,237,0.35); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(124,58,237,0.55); }
        .btn-outline { border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); backdrop-filter: blur(10px); transition: all 0.3s; }
        .btn-outline:hover { border-color: rgba(124,58,237,0.5); background: rgba(124,58,237,0.1); }
        .orbit { animation: rotate-slow 20s linear infinite; }
        .pricing-card:hover { transform: scale(1.02); }
        .pricing-card { transition: all 0.3s; }
        .testimonial-slide { transition: all 0.5s cubic-bezier(0.4,0,0.2,1); }
        .shimmer-line::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent); animation: shimmer 2s infinite; }
        .particle { position: absolute; border-radius: 50%; animation: pulse-glow 3s ease-in-out infinite; }
        .mobile-hide { display: block; }
        @media (max-width: 768px) { .mobile-hide { display: none; } }
      `}</style>

      {/* Navbar */}
      <nav className="nav-blur fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #0891B2, #7C3AED, #EC4899)' }}>BT</div>
          <span className="text-white font-bold text-lg">Bug Tracker</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="text-sm text-slate-400 hover:text-white transition cursor-pointer">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-outline px-4 py-2 rounded-lg text-sm text-white font-medium">
            Sign in
          </button>
          <button onClick={() => navigate('/register')} className="btn-primary px-4 py-2 rounded-lg text-sm text-white font-semibold">
            Get started free
          </button>
        </div>
      </nav>

      {/* Background particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" style={{
            width: `${[300, 200, 400, 150, 250, 180][i]}px`,
            height: `${[300, 200, 400, 150, 250, 180][i]}px`,
            top: `${[10, 60, 30, 80, 20, 70][i]}%`,
            left: `${[10, 70, 40, 20, 80, 50][i]}%`,
            background: `radial-gradient(circle, ${['rgba(124,58,237,0.08)', 'rgba(8,145,178,0.06)', 'rgba(236,72,153,0.05)', 'rgba(99,102,241,0.07)', 'rgba(34,211,238,0.05)', 'rgba(167,139,250,0.06)'][i]}, transparent)`,
            animationDelay: `${i * 0.5}s`,
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', paddingTop: '80px', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}
            className="mobile-grid">

            {/* Left */}
            <div style={{ animation: 'slide-up 0.8s ease forwards' }}>
              <a href="#features" className="shimmer-line relative hover:scale-105 transition-transform cursor-pointer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)',
                borderRadius: '999px', padding: '6px 16px', marginBottom: '24px', overflow: 'hidden'
              }}>
                <span style={{ fontSize: '10px', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', borderRadius: '999px', padding: '2px 8px', color: 'white', fontWeight: '800', boxShadow: '0 0 10px rgba(124,58,237,0.5)' }}>NEW</span>
                <span style={{ fontSize: '12px', color: '#C4B5FD', fontWeight: '500' }}>Sprint Planning is now live →</span>
              </a>

              <h1 style={{ fontSize: '58px', fontWeight: '900', lineHeight: '1.1', color: 'white', marginBottom: '16px' }}>
                The modern way<br />to track
              </h1>
              <h1 style={{ fontSize: '58px', fontWeight: '900', lineHeight: '1.1', marginBottom: '28px', minHeight: '72px' }}>
                <span className="glow-text">{displayed}</span>
                <span style={{ animation: 'blink 1s step-end infinite', color: '#7C3AED', fontSize: '52px' }}>|</span>
              </h1>

              <p style={{ fontSize: '18px', color: '#64748B', lineHeight: '1.7', marginBottom: '40px', maxWidth: '480px' }}>
                A powerful, beautiful issue tracker built for modern dev teams. Kanban boards, sprint planning, team collaboration — all in one place.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')} className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-base flex items-center gap-2">
                  Start for free
                  <span style={{ fontSize: '18px' }}>→</span>
                </button>
                <button onClick={() => navigate('/login')} className="btn-outline px-8 py-4 rounded-xl text-white font-semibold text-base">
                  Sign in
                </button>
              </div>

              <div style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
                {[
                  { icon: '✓', text: 'Free forever' },
                  { icon: '✓', text: 'No credit card' },
                  { icon: '✓', text: '3 min setup' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontWeight: '700', fontSize: '14px' }}>{item.icon}</span>
                    <span style={{ color: '#475569', fontSize: '13px' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Floating Cards */}
            <div className="mobile-hide" style={{ position: 'relative', height: '500px' }}>
              {/* Orbit ring */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '400px', height: '400px', marginTop: '-200px', marginLeft: '-200px',
                border: '1px solid rgba(124,58,237,0.1)', borderRadius: '50%',
              }} className="orbit" />

              {/* Main board preview */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(17,24,39,0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px', padding: '20px', width: '280px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                animation: 'float 6s ease-in-out infinite',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5F57' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFBD2E' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28C840' }} />
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>KANBAN BOARD</span>
                </div>
                {[
                  { col: 'TO DO', dot: '#94A3B8', items: ['Fix nav bug 🐛', 'Update docs 📝'] },
                  { col: 'IN PROGRESS', dot: '#7C3AED', items: ['Auth flow ✨'] },
                  { col: 'DONE', dot: '#10B981', items: ['Setup DB ✓'] },
                ].map(col => (
                  <div key={col.col} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: col.dot }} />
                      <span style={{ fontSize: '9px', fontWeight: '700', color: col.dot, letterSpacing: '1px' }}>{col.col}</span>
                    </div>
                    {col.items.map(item => (
                      <div key={item} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 10px', marginBottom: '4px', fontSize: '11px', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.04)' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Floating mini cards */}
              {floatingCards.map((card, i) => (
                <div key={i} className="float-card" style={{
                  position: 'absolute',
                  top: card.top, left: card.left,
                  background: 'rgba(17,24,39,0.95)',
                  border: `1px solid ${card.color}30`,
                  borderRadius: '14px', padding: '12px 14px',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${card.color}20`,
                  minWidth: '160px',
                  animationDelay: card.delay,
                }}>
                  <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px', letterSpacing: '0.5px' }}>{card.status}</div>
                  <div style={{ fontSize: '12px', color: '#E2E8F0', fontWeight: '500', marginBottom: '8px' }}>
                    {card.type} {card.title}
                  </div>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: `${card.color}15`, color: card.color, border: `1px solid ${card.color}30` }}>
                    {card.priority}
                  </span>
                </div>
              ))}

              {/* Notification popup */}
              <div style={{
                position: 'absolute', top: '5%', left: '5%',
                background: 'rgba(17,24,39,0.95)',
                border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: '14px', padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                animation: 'float 5s ease-in-out infinite',
                animationDelay: '1.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Issue <span style={{ color: '#10B981' }}>resolved</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {STATS.map((stat, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '32px 24px',
                background: 'rgba(17,24,39,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: '42px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
                  {counts[i]}{stat.suffix}
                </div>
                <div style={{ fontSize: '13px', color: '#475569' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '3px', color: '#7C3AED', textTransform: 'uppercase' }}>Features</span>
            <h2 style={{ fontSize: '44px', fontWeight: '800', color: 'white', marginTop: '12px', marginBottom: '16px' }}>
              Everything your team needs
            </h2>
            <p style={{ fontSize: '17px', color: '#475569', maxWidth: '500px', margin: '0 auto' }}>
              Built for developers who want power without complexity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{
                background: 'rgba(17,24,39,0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px', padding: '32px',
                backdropFilter: 'blur(10px)',
                cursor: 'default',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', marginBottom: '20px',
                  background: `${f.color}15`, border: `1px solid ${f.color}25`,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7' }}>{f.desc}</p>
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', color: f.color, fontSize: '13px', fontWeight: '600' }}>
                  Learn more <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '3px', color: '#0891B2', textTransform: 'uppercase' }}>How it works</span>
          <h2 style={{ fontSize: '44px', fontWeight: '800', color: 'white', marginTop: '12px', marginBottom: '64px' }}>
            Up and running in minutes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { step: '01', title: 'Create a project', desc: 'Set up your project in seconds. Invite your team members.', color: '#7C3AED' },
              { step: '02', title: 'Add issues', desc: 'Create bugs, features, and tasks. Set priority and assignees.', color: '#0891B2' },
              { step: '03', title: 'Track & ship', desc: 'Move tickets across the board. Plan sprints. Ship faster.', color: '#EC4899' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {i < 2 && (
                  <div style={{
                    position: 'absolute', top: '24px', left: '70%', width: '60%', height: '1px',
                    background: 'linear-gradient(90deg, rgba(124,58,237,0.4), transparent)',
                  }} />
                )}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '900', color: 'white',
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
                  margin: '0 auto 20px',
                  boxShadow: `0 8px 24px ${s.color}40`,
                }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '10px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '3px', color: '#EC4899', textTransform: 'uppercase' }}>Testimonials</span>
          <h2 style={{ fontSize: '44px', fontWeight: '800', color: 'white', marginTop: '12px', marginBottom: '48px' }}>
            Teams love Bug Tracker
          </h2>

          <div style={{ position: 'relative', minHeight: '200px' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-slide" style={{
                position: i === activeTestimonial ? 'relative' : 'absolute',
                opacity: i === activeTestimonial ? 1 : 0,
                top: 0, left: 0, right: 0,
                background: 'rgba(17,24,39,0.8)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '24px', padding: '40px',
                backdropFilter: 'blur(10px)',
                transform: i === activeTestimonial ? 'scale(1)' : 'scale(0.96)',
              }}>
                <p style={{ fontSize: '17px', color: '#CBD5E1', lineHeight: '1.7', marginBottom: '28px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    color: 'white', fontWeight: '700', fontSize: '16px',
                  }}>{t.avatar}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{t.name}</div>
                    <div style={{ color: '#475569', fontSize: '12px' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? '24px' : '8px',
                height: '8px', borderRadius: '999px',
                background: i === activeTestimonial ? '#7C3AED' : 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '3px', color: '#F59E0B', textTransform: 'uppercase' }}>Pricing</span>
          <h2 style={{ fontSize: '44px', fontWeight: '800', color: 'white', marginTop: '12px', marginBottom: '16px' }}>Simple, honest pricing</h2>
          <p style={{ fontSize: '17px', color: '#475569', marginBottom: '56px' }}>No hidden fees. No surprises.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { name: 'Starter', price: 'Free', period: 'forever', features: ['3 projects', '10 team members', 'Kanban board', 'Basic filters'], color: '#64748B', popular: false },
              { name: 'Pro', price: '₹999', period: '/month', features: ['Unlimited projects', 'Unlimited members', 'Sprint planning', 'Activity logs', 'Priority support'], color: '#7C3AED', popular: true },
              { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'SSO / SAML', 'Custom integrations', 'SLA guarantee', 'Dedicated support'], color: '#0891B2', popular: false },
            ].map((plan, i) => (
              <div key={i} className="pricing-card" style={{
                background: plan.popular ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.08))' : 'rgba(17,24,39,0.7)',
                border: plan.popular ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '24px', padding: '36px 28px',
                position: 'relative', backdropFilter: 'blur(10px)',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    borderRadius: '999px', padding: '4px 16px',
                    fontSize: '11px', fontWeight: '700', color: 'white', whiteSpace: 'nowrap',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: '15px', fontWeight: '700', color: plan.color, marginBottom: '16px' }}>{plan.name}</div>
                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontSize: '40px', fontWeight: '900', color: 'white' }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: '#475569' }}>{plan.period}</span>
                </div>
                <div style={{ marginBottom: '28px', textAlign: 'left' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ color: plan.color, fontSize: '14px', fontWeight: '700' }}>✓</span>
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/register')} style={{
                  width: '100%', padding: '12px',
                  borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', border: 'none',
                  background: plan.popular ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  transition: 'all 0.3s',
                }}>
                  {plan.price === 'Custom' ? 'Contact us' : 'Get started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(8,145,178,0.1), rgba(236,72,153,0.1))',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '32px', padding: '72px 48px',
          }}>
            <h2 style={{ fontSize: '44px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.2' }}>
              Ready to ship<br />
              <span className="glow-text">faster?</span>
            </h2>
            <p style={{ fontSize: '17px', color: '#475569', marginBottom: '40px' }}>
              Join thousands of developers who track bugs better.
            </p>
            <button onClick={() => navigate('/register')} className="btn-primary px-10 py-4 rounded-xl text-white font-bold text-lg">
              Start for free — no credit card needed →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0891B2, #7C3AED)', color: 'white', fontWeight: '700', fontSize: '12px'
              }}>BT</div>
              <div>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Bug Tracker</div>
                <div style={{ color: '#334155', fontSize: '11px' }}>Built with MERN Stack</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '32px' }}>
              {['Features', 'Pricing', 'GitHub', 'LinkedIn'].map(item => (
                <span key={item} style={{ fontSize: '13px', color: '#334155', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#7C3AED'}
                  onMouseLeave={e => e.target.style.color = '#334155'}>{item}</span>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#1E293B' }}>
              © 2026 Bug Tracker. Made by Shishanki Vishwakarma
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}