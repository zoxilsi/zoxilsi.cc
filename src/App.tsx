import { useEffect, useRef, useState } from 'react';
import type { ForwardRefExoticComponent, HTMLAttributes, RefAttributes } from 'react';
import {
  Sparkles,
  Globe,
  User,
  Tag,
  Star,
  Users,
  BookOpen,
  Award,
  Calendar,
  MapPoint,
  Palette,
  Building2,
} from 'reicon-react';
// Hand-animated Hugeicons (hugeicons-animated.com) — vendored as source, MIT.
import { ArrowRight02Icon } from '@/components/icons/arrow-right-02';
import { Bookmark01Icon } from '@/components/icons/bookmark-01';
import { ChevronDownIcon } from '@/components/icons/chevron-down';
import { ChevronUpIcon } from '@/components/icons/chevron-up';
import { Coffee02Icon } from '@/components/icons/coffee-02';
import { CommandIcon } from '@/components/icons/command';
import { CompassIcon } from '@/components/icons/compass';
import { Diamond02Icon } from '@/components/icons/diamond-02';
import { ExternalLinkIcon } from '@/components/icons/external-link';
import { File01Icon } from '@/components/icons/file-01';
import { GithubIcon } from '@/components/icons/github';
import { MagicWand01Icon } from '@/components/icons/magic-wand-01';
import { Mail01Icon } from '@/components/icons/mail-01';
import { Robot01Icon } from '@/components/icons/robot-01';
import { SentIcon } from '@/components/icons/sent';
import { Sun03Icon } from '@/components/icons/sun-03';
import type { AnimatedIconHandle } from '@/lib/use-icon-animation';
import { FaLinkedin } from 'react-icons/fa6';
import {
  Github,
  Gitlab,
  X as XLogo,
  Instagram as InstagramBrand,
  Javascript,
  Rust,
  Figma,
  Python,
  Postgresql,
  Mongodb,
  Mysql,
  Prisma,
  Nextdotjs,
  React as ReactBrand,
  Html5,
  Css,
  Nodedotjs,
  Git,
  Linux,
  Googlegemini,
  type BrandIconFn,
} from 'reicon-brands';

type AnimatedIcon = ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & { size?: number } & RefAttributes<AnimatedIconHandle>
>;

/**
 * Plays an animated icon once each time it scrolls into view, and again on
 * hover. Pass `loop` to keep it cycling for as long as it is on screen.
 * Passing a ref puts the icon into controlled mode, so hover is re-wired by
 * hand. Honours prefers-reduced-motion via useIconAnimation.
 */
function LiveIcon({
  icon: Icon,
  size,
  className,
  wrapperClassName,
  loop = false,
}: {
  icon: AnimatedIcon;
  size?: number;
  className?: string;
  wrapperClassName?: string;
  loop?: boolean;
}) {
  const handle = useRef<AnimatedIconHandle>(null);
  const host = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.5,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play once on arrival. With `loop`, keep cycling while on screen -
  // startAnimation() no-ops mid-run, so it resumes as each pass finishes.
  useEffect(() => {
    if (!inView) return;
    handle.current?.startAnimation();

    if (!loop) return;
    const id = window.setInterval(() => handle.current?.startAnimation(), 400);
    return () => window.clearInterval(id);
  }, [inView, loop]);

  return (
    <div ref={host} className={wrapperClassName ?? 'inline-flex'}>
      <Icon
        ref={handle}
        size={size}
        className={className}
        onMouseEnter={() => handle.current?.startAnimation()}
        onMouseLeave={() => {
          if (!loop) handle.current?.stopAnimation();
        }}
      />
    </div>
  );
}

function BrandIcon({ icon, size = 20, color, className }: { icon: BrandIconFn; size?: number; color?: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color || 'currentColor'}
      className={className}
      dangerouslySetInnerHTML={{ __html: icon.svgContent }}
    />
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    // Fetch GitHub stars for the repository
    fetch('https://api.github.com/repos/zoxilsi/zoxilsi.cc')
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setGithubStars(data.stargazers_count);
        }
      })
      .catch(console.error);

    const sections = ['home', 'projects', 'experience', 'education', 'skills', 'contact'];

    const updateActiveSection = () => {
      const triggerLine = window.scrollY + window.innerHeight * 0.35;
      let current = 'home';

      // If user has scrolled near the bottom, force "contact" to be active
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        current = 'contact';
      } else {
        for (const id of sections) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (el.offsetTop <= triggerLine) current = id;
        }
      }

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const sectionItems = [
    { id: 'home', label: 'Home', icon: Sun03Icon },
    { id: 'projects', label: 'Projects', icon: MagicWand01Icon },
    { id: 'experience', label: 'Work', icon: Coffee02Icon },
    { id: 'education', label: 'Education', icon: Bookmark01Icon },
    { id: 'skills', label: 'Skills', icon: CommandIcon },
    { id: 'contact', label: 'Contact', icon: SentIcon },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative text-foreground overflow-x-hidden selection:bg-brand-pink selection:text-white transition-colors duration-500">
      {/* Noise Texture Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "#ffffff",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="max-w-4xl mx-auto px-6 py-6 pb-32 relative z-10">

        {/* Navigation */}
        <nav className="glass-nav flex items-center justify-between mb-16 px-5 py-3 rounded-full transition-all duration-300 pointer-events-auto">
          <div className="flex items-center">
            <span className="font-black text-xl md:text-2xl tracking-tight uppercase bg-gradient-to-r from-brand-pink via-brand-blue to-brand-green bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.08)]">
              zoxilsi
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-5">
            <a href="https://github.com/zoxilsi" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-foreground transition-colors duration-300 flex items-center justify-center">
              <BrandIcon icon={Github} size={20} />
            </a>
            <a href="https://x.com/zoxilsi" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-black transition-colors duration-300 flex items-center justify-center">
              <BrandIcon icon={XLogo} size={20} />
            </a>
            <a href="https://linkedin.com/in/zoxilsi" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-colors duration-300 flex items-center justify-center">
              <FaLinkedin size={20} />
            </a>
            <a href="https://instagram.com/zoxilsi" target="_blank" rel="noreferrer" className="group relative flex items-center justify-center transition-colors duration-300">
              <svg width="0" height="0" className="absolute">
                <linearGradient id="insta-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433"/>
                  <stop offset="25%" stopColor="#e6683c"/>
                  <stop offset="50%" stopColor="#dc2743"/>
                  <stop offset="75%" stopColor="#cc2366"/>
                  <stop offset="100%" stopColor="#bc1888"/>
                </linearGradient>
              </svg>
              <BrandIcon icon={InstagramBrand} size={20} className="text-slate-400 group-hover:fill-[url(#insta-grad)] transition-all duration-300" />
            </a>
          </div>
        </nav>

        {/* Intro */}
        <section id="home" className="mb-24 pt-4 relative flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 relative z-10 text-center md:text-left">
            <div className="glass-chip inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-8 text-foreground transition-transform hover:scale-105 duration-300">
              <LiveIcon icon={Robot01Icon} className="text-brand-magenta" size={18} />
              <span>Vibe coder. Product engineer. Chasing what AI can do.</span>
            </div>

            <h1 className="leading-[1.1]">
              <span className="block text-[60px] md:text-[88px] font-black tracking-tight text-foreground">
                zoxilsi
              </span>
              <span className="block text-[34px] md:text-[46px] font-handwriting text-brand-pink leading-none mt-1 -rotate-1 hover:rotate-0 transition-transform duration-500">
                Making the web feel alive.
              </span>
            </h1>

            <p className="mt-6 text-lg font-medium text-muted leading-relaxed max-w-xl mx-auto md:mx-0">
              Bold ideas go in. Real products come out. People actually use them.
            </p>
          </div>

          <div className="flex-shrink-0 relative w-56 md:w-72 mt-8 md:mt-0 group">
             <div className="polaroid z-20 group-hover:scale-105 transition-transform duration-300">
              <img src="/images/profile.png" alt="My Profile" className="polaroid-img" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'; }} />
              <p className="font-handwriting text-2xl text-center mt-1 font-bold text-foreground">zoxilsi</p>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black uppercase text-foreground">Featured Projects</h2>
            <div className="h-0.5 flex-grow bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="soft-card overflow-hidden border border-white/60 hover:border-white/90 transition-colors flex flex-col group min-h-[300px] mt-4">
              <a href="https://studio.zoxilsi.cc/" target="_blank" rel="noreferrer" className="h-56 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-cyan-500/10 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/images/zoxilsi-studio.png" alt="zoxilsi studio" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-5xl text-fuchsia-600 font-bold rotate-[-2deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">studio</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">zoxilsi studio</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/studio" title="Source Code" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <BrandIcon icon={Github} size={18} />
                    </a>
                    <a href="https://studio.zoxilsi.cc/" title="Live Demo" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <LiveIcon icon={ExternalLinkIcon} size={18} loop />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Palette size={10} className="text-fuchsia-500" /> Design Tool</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Globe size={10} className="text-cyan-500" /> WebGL</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Star size={10} className="text-yellow-500" fill="currentColor" /> 100+ Stars</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Users size={10} className="text-purple-500" /> 4 Contributors</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-fuchsia-600">
                  <li>A browser-based mesh gradient editor for sculpting organic, flowing gradients in real-time WebGL.</li>
                  <li>Export gradients as images, video, code, or fully editable project files.</li>
                  <li>Grown organically to over <span className="text-slate-800 font-bold">2K+ users</span>.</li>
                  <li>Picked up <span className="text-slate-800 font-bold">100+ stars</span> on GitHub.</li>
                  <li>Landed my <span className="text-slate-800 font-bold">first GitHub sponsor</span> through this project.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-white/60 hover:border-white/90 transition-colors flex flex-col group min-h-[300px] relative mt-4">

              {/* Gift Ribbon */}
              <div className="absolute -right-14 top-8 w-48 h-10 bg-[#111] border-y-4 border-[#D4AF37] rotate-45 z-30 shadow-2xl flex items-center justify-center pointer-events-none before:absolute before:inset-0 before:border-y before:border-dashed before:border-[#FFDF73]/50">
                <span className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5 drop-shadow-md">
                  <Sparkles size={10} /> VIRAL
                </span>
              </div>
              <a href="https://bananacv.fun/" target="_blank" rel="noreferrer" className="h-56 bg-brand-pink/10 relative overflow-hidden flex items-center justify-center p-4 rounded-t-[1.3rem]">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                <img src="/images/bananacv.png" alt="BananaCV" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                <h3 className="hidden font-handwriting text-5xl text-brand-pink font-bold rotate-[-5deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">BananaCV</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">BananaCV</h3>
                  <div className="flex gap-2">
                    <a href="https://bananacv.fun/" title="Live Demo" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <LiveIcon icon={ExternalLinkIcon} size={18} loop />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Globe size={10} className="text-brand-blue" /> Web Tool</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><BrandIcon icon={ReactBrand} size={10} color="#61DAFB" /> React</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-brand-pink">
                  <li>A simple web tool to find common mistakes in resumes.</li>
                  <li>Achieved massive reach with <span className="text-slate-800 font-bold">200K+ visitors</span>.</li>
                  <li>Grew entirely through organic sharing as a viral project.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-white/60 hover:border-white/90 transition-colors flex flex-col group min-h-[300px] mt-4">
              <a href="https://github.com/zoxilsi/Linara-Terminal" target="_blank" rel="noreferrer" className="h-56 bg-brand-yellow/10 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/images/linara-terminal.png" alt="Linara Terminal" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-5xl text-brand-yellow font-bold rotate-[-2deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">Linara</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">Linara AI Terminal</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/Linara-Terminal" title="Source Code" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <BrandIcon icon={Github} size={18} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><BrandIcon icon={Rust} size={10} color="#000000" /> Rust</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><BrandIcon icon={Linux} size={10} color="#FCC624" /> CLI</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Sparkles size={10} className="text-brand-magenta" /> AI</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-brand-yellow">
                  <li>A modern, AI-enhanced terminal emulator written in Rust.</li>
                  <li>Bridges the gap between human language and command-line interfaces.</li>
                  <li>Type plain English to seamlessly execute terminal commands.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-white/60 hover:border-white/90 transition-colors flex flex-col group min-h-[300px]">
              <a href="https://mallu-key.vercel.app/" target="_blank" rel="noreferrer" className="h-56 bg-brand-blue/10 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/images/mallukey.png" alt="malluKey" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-4xl text-brand-blue font-bold rotate-[3deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">malluKey</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">malluKey</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/malluKey" title="Source Code" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <BrandIcon icon={Github} size={18} />
                    </a>
                    <a href="https://mallu-key.vercel.app/" title="Live Demo" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <LiveIcon icon={ExternalLinkIcon} size={18} loop />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Globe size={10} className="text-brand-green" /> Web App</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><BrandIcon icon={Javascript} size={10} color="#F7DF1E" /> Performance</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-brand-blue">
                  <li>Minimalist, ultra-responsive web application for Malayalam typing.</li>
                  <li>Features an interactive keyboard map and global leaderboard.</li>
                  <li>Steadily grown to an active user base of <span className="text-slate-800 font-bold">500+ visitors</span>.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-white/60 hover:border-white/90 transition-colors flex flex-col group min-h-[300px]">
              <a href="https://github.com/zoxilsi/vibe" target="_blank" rel="noreferrer" className="h-56 bg-indigo-50 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/images/vibe.png" alt="Vibe Website Builder" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-5xl text-indigo-500 font-bold rotate-[-2deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">Vibe</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">Vibe</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/vibe" title="Source Code" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <BrandIcon icon={Github} size={18} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><BrandIcon icon={Nextdotjs} size={10} color="#000000" /> Next.js</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><BrandIcon icon={Googlegemini} size={10} color="#8E75B2" /> Gemini AI</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Tag size={10} className="text-orange-500" /> E2B Sandboxes</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-indigo-500">
                  <li>AI-powered platform for generating fully functioning Next.js applications.</li>
                  <li>Builds customized React components directly from detailed prompts.</li>
                  <li>Integated with generative AI and secure, isolated cloud sandboxes.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-white/60 hover:border-white/90 transition-colors flex flex-col group min-h-[300px]">
              <a href="https://mca-rit.vercel.app/" target="_blank" rel="noreferrer" className="h-56 bg-emerald-500/10 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/images/mca-study-materials.png" alt="MCA Study Materials" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-4xl text-emerald-600 font-bold rotate-[-2deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">MCA Notes</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">MCA Study Materials</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/MCA-STUDY-MATERIALS" title="Source Code" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <BrandIcon icon={Github} size={18} />
                    </a>
                    <a href="https://mca-rit.vercel.app/" title="Live Demo" target="_blank" rel="noreferrer" className="glass-chip p-2 rounded-full text-slate-700 transition-all">
                      <LiveIcon icon={ExternalLinkIcon} size={18} loop />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Globe size={10} className="text-emerald-500" /> Open Source</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><User size={10} className="text-emerald-600" /> Education</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Star size={10} className="text-yellow-500" fill="currentColor" /> 43 Stars</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Users size={10} className="text-purple-500" /> 24 Contributors</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-emerald-600">
                  <li>Resource platform for KTU MCA students to study and access curated notes.</li>
                  <li>Improves student collaboration and easy access to previous questions.</li>
                  <li>Proudly part of the <span className="text-slate-800 font-bold">GSSoC Project</span> (GirlScript Summer of Code).</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black uppercase text-foreground flex items-center gap-3">
              <LiveIcon icon={Coffee02Icon} size={28} className="text-orange-500" />
              Where I Work
            </h2>
            <div className="h-0.5 flex-grow bg-slate-200"></div>
          </div>

          <div className="soft-card p-6 border border-white/60 hover:border-white/90 transition-colors group">
            {/* Company header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <img src="/images/eduport_logo.png" alt="Eduport" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                  <Building2 size={24} className="hidden text-orange-500" />
                </div>
                <div>
                  <a href="https://eduport.app" target="_blank" rel="noreferrer" className="text-xl font-bold text-slate-800 hover:text-orange-500 transition-colors inline-flex items-center gap-1.5">
                    Eduport <LiveIcon icon={ExternalLinkIcon} size={13} />
                  </a>
                  <p className="text-slate-500 font-medium text-sm mt-0.5">5 mos</p>
                  <p className="text-muted font-medium text-sm mt-0.5 flex items-center gap-1.5">
                    <MapPoint size={13} className="text-slate-400" />
                    Kozhikode · Kerala · India · Onsite
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5 flex-shrink-0">
                <Calendar size={10} className="text-orange-500" />
                Present
              </span>
            </div>

            {/* Role timeline */}
            <ol className="mt-6 ml-3 border-l-2 border-slate-200 pl-6 space-y-6">
              <li className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-white"></span>
                <h3 className="text-lg font-bold text-slate-800">Product Engineer</h3>
                <p className="text-slate-500 font-medium text-sm">Full time</p>
                <p className="text-muted font-medium text-sm">Aug 2026 &rarr; Present · 2 mos</p>
                <ul className="text-muted font-medium text-sm list-disc pl-4 space-y-1.5 mt-2 marker:text-orange-500">
                  <li>Chasing one question. What if learning felt like play?</li>
                  <li>Building 3D textbooks students want to hold. Not chapters they survive.</li>
                  <li>Shaping product end to end. Idea. Spec. Ship.</li>
                  <li>Building internal tools that make everyday work at Eduport lighter.</li>
                  <li>Shipped an exam platform. Marks go in. Insight comes out. Parents stay in the loop.</li>
                </ul>
              </li>
              <li className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white"></span>
                <h3 className="text-lg font-bold text-slate-800">Product Manager</h3>
                <p className="text-slate-500 font-medium text-sm">Internship</p>
                <p className="text-muted font-medium text-sm">May 2026 &rarr; Aug 2026 · 4 mos</p>
                <ul className="text-muted font-medium text-sm list-disc pl-4 space-y-1.5 mt-2 marker:text-orange-500">
                  <li>Steered product direction with the team. Poked at applied AI research alongside it.</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black uppercase text-foreground flex items-center gap-3">
              <LiveIcon icon={Bookmark01Icon} size={28} className="text-brand-blue" />
              Education
            </h2>
            <div className="h-0.5 flex-grow bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="soft-card p-6 border border-white/60 flex flex-col justify-between group">
              <div>
                <div className="bg-brand-pink/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <LiveIcon icon={Diamond02Icon} size={24} className="text-brand-pink" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Master of Computer Applications</h3>
                <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                  <MapPoint size={14} className="text-slate-400" />
                  Rajiv Gandhi Institute of Technology
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  2024 - 2026
                </span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5">
                  <Award size={10} className="text-brand-pink" />
                  Postgraduate
                </span>
              </div>
            </div>

            <div className="soft-card p-6 border border-white/60 flex flex-col justify-between group">
              <div>
                <div className="bg-brand-blue/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <LiveIcon icon={File01Icon} size={24} className="text-brand-blue" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Bachelor of Computer Science</h3>
                <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                  <MapPoint size={14} className="text-slate-400" />
                  Kannur University
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  Graduated
                </span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5">
                  <BookOpen size={10} className="text-brand-blue" />
                  Undergraduate
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black uppercase text-foreground">Skills</h2>
            <div className="h-0.5 flex-grow bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="soft-card p-6 border border-white/60">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Javascript} size={14} color="#F7DF1E" /> JavaScript</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Python} size={14} color="#3776AB" /> Python</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Rust} size={14} color="#000000" /> Rust</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Postgresql} size={14} color="#4169E1" /> SQL</span>
              </div>
            </div>

            <div className="soft-card p-6 border border-white/60">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={ReactBrand} size={14} color="#61DAFB" /> React.js</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Nextdotjs} size={14} color="#000000" /> Next.js</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Html5} size={14} color="#E34F26" /> HTML</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Css} size={14} color="#1572B6" /> CSS</span>
              </div>
            </div>

            <div className="soft-card p-6 border border-white/60">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Backend</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Nodedotjs} size={14} color="#339933" /> Node.js</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><Globe size={14} className="text-brand-blue" /> APIs</span>
              </div>
            </div>

            <div className="soft-card p-6 border border-white/60">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Databases</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Mongodb} size={14} color="#47A248" /> MongoDB</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Mysql} size={14} color="#4479A1" /> MySQL</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Prisma} size={14} color="#2D3748" /> Prisma</span>
              </div>
            </div>

            <div className="soft-card p-6 border border-white/60 lg:col-span-2">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Tools & Other</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Git} size={14} color="#F05032" /> Git</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Linux} size={14} color="#FCC624" /> Linux</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Figma} size={14} color="#F24E1E" /> Figma</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><BrandIcon icon={Googlegemini} size={14} color="#8E75B2" /> Gemini AI</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><Tag size={14} className="text-orange-500" /> E2B Sandboxes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Details & Footer */}
        <section id="contact" className="mb-8 mt-24">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-black uppercase text-foreground mb-4">Let's Connect</h2>
            <p className="text-muted font-medium mb-12 max-w-lg">
              Interested in building something together or just want to say hi? I'd love to hear from you.
            </p>

            <div className="mb-16 flex flex-col items-center gap-6">
              <a href="https://linkedin.com/in/zoxilsi" target="_blank" rel="noreferrer" className="glass-btn-dark group inline-flex items-center gap-3 px-8 py-4 hover:bg-gradient-to-r hover:from-brand-pink hover:via-brand-blue hover:to-brand-green text-white rounded-full font-bold transition-all duration-700 ease-in-out">
                <FaLinkedin size={20} className="transition-transform duration-700 group-hover:rotate-12" />
                <span>Send a Message</span>
                <LiveIcon icon={ArrowRight02Icon} wrapperClassName="inline-flex group-hover:translate-x-2 transition-transform duration-700" size={18} />
              </a>

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-slate-500 font-medium">Fastest way to reach me for collaborations.</p>
                <div className="glass-chip flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-slate-700 mt-1 transition-colors duration-500">
                  <LiveIcon icon={Mail01Icon} size={16} className="text-brand-pink" />
                  <a href="mailto:hey.abhijith@gmail.com" className="hover:text-brand-blue transition-colors duration-500">hey.abhijith@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <a href="https://github.com/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-foreground transition-all hover:scale-110">
                <BrandIcon icon={Github} size={28} />
              </a>
              <a href="https://linkedin.com/in/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-[#0A66C2] transition-all hover:scale-110">
                <FaLinkedin size={28} />
              </a>
              <a href="https://x.com/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-black transition-all hover:scale-110">
                <BrandIcon icon={XLogo} size={28} />
              </a>
              <a href="https://instagram.com/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-brand-pink transition-all hover:scale-110">
                <BrandIcon icon={InstagramBrand} size={28} />
              </a>
              <a href="https://gitlab.com/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-[#FC6D26] transition-all hover:scale-110">
                <BrandIcon icon={Gitlab} size={28} />
              </a>
              <a href="https://zoxilsi.tech" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-brand-green transition-all hover:scale-110">
                <LiveIcon icon={CompassIcon} size={28} />
              </a>
            </div>
          </div>
        </section>

        {/* Footer GitHub Star CTA */}
        <div className="mt-20 border-t border-slate-200/60 pt-10 pb-8 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-600 to-slate-900 bg-clip-text text-transparent mb-2">Like the design?</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            Check out the source code and drop a star if you like it.
          </p>
          <a href="https://github.com/zoxilsi/zoxilsi.cc" title="Star on GitHub" target="_blank" rel="noreferrer" className="glass-chip inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-slate-700 hover:text-foreground transition-all group">
            <LiveIcon icon={GithubIcon} size={16} className="text-slate-500 group-hover:text-foreground transition-colors" />
            <span>Star the repo</span>
            {githubStars !== null && (
              <span className="bg-slate-100 flex items-center justify-center px-2 py-0.5 rounded-full ml-1 text-slate-600 font-mono text-[11px] font-black border border-slate-200/50 group-hover:bg-slate-200 transition-colors">
                <Star size={10} className="mr-1 text-amber-400 fill-amber-400" />
                {githubStars}
              </span>
            )}
          </a>
        </div>

      </div>

      {/* Floating Theme Menu */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">

        {/* Mobile Dropdown Menu */}
        <div className="md:hidden relative flex flex-col items-center">
          <div className={`glass-dock absolute bottom-full mb-3 w-48 rounded-2xl p-2 flex flex-col gap-1 transition-all duration-300 z-40 ${isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            {sectionItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { scrollToSection(item.id); setIsMobileMenuOpen(false); }}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {isActive && <LiveIcon icon={Icon} size={16} className="text-brand-pink drop-shadow-[0_0_8px_rgba(255,104,175,0.8)]" />}
                    {item.label}
                  </span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(255,104,175,0.95)]"></div>}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="glass-dock rounded-full px-6 py-3 flex items-center gap-3 justify-center text-white text-sm font-medium z-50 transition-colors"
          >
            {(() => {
              const activeItem = sectionItems.find(i => i.id === activeSection);
              if (activeItem) {
                const ActiveIcon = activeItem.icon;
                return (
                  <span className="flex items-center gap-2">
                    <LiveIcon icon={ActiveIcon} size={16} className="text-brand-pink drop-shadow-[0_0_8px_rgba(255,104,175,0.8)]" />
                    <span>{activeItem.label}</span>
                  </span>
                );
              }
              return 'Menu';
            })()}
            {isMobileMenuOpen ? <LiveIcon icon={ChevronDownIcon} size={16} className="text-white/50" /> : <LiveIcon icon={ChevronUpIcon} size={16} className="text-white/50" />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="glass-dock hidden md:flex rounded-full px-6 py-3 items-center gap-3 justify-center">
          {sectionItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <LiveIcon icon={Icon} size={14} className="text-brand-pink drop-shadow-[0_0_8px_rgba(255,104,175,0.8)] transition-all" />
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
