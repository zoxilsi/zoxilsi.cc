import { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, Mail, Globe, User, ArrowRight, Tags, Star, Users, Smile, Instagram } from 'lucide-react';
import { FaInstagram, FaGitlab, FaXTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6';
import { SiJavascript, SiRust, SiFigma, SiPython, SiPostgresql, SiMongodb, SiMysql, SiPrisma, SiNextdotjs, SiReact, SiHtml5, SiCss, SiNodedotjs, SiGit, SiLinux, SiGooglegemini } from 'react-icons/si';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = ['home', 'projects', 'education', 'skills', 'contact'];

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
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' },
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
        <nav className="flex items-center justify-between mb-16 bg-white/40 backdrop-blur-xl p-2 pl-4 rounded-full border border-slate-200/60 shadow-sm transition-all duration-300 pointer-events-auto">
          <div className="flex items-center gap-4 pr-2">
            <span className="font-black text-xl md:text-2xl tracking-tight uppercase bg-gradient-to-r from-brand-pink via-brand-blue to-brand-green bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.08)]">
              zoxilsi
            </span>
            <div className="hidden sm:flex border-l border-slate-200 pl-4">
              <a href="https://instagram.com/zoxilsi" target="_blank" rel="noreferrer" className="group relative flex items-center justify-center p-1 rounded-full transition-colors">
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="insta-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433"/>
                    <stop offset="25%" stopColor="#e6683c"/>
                    <stop offset="50%" stopColor="#dc2743"/>
                    <stop offset="75%" stopColor="#cc2366"/>
                    <stop offset="100%" stopColor="#bc1888"/>
                  </linearGradient>
                </svg>
                <Instagram size={20} className="text-slate-400 group-hover:text-transparent group-hover:stroke-[url(#insta-grad)] transition-all duration-300 insta-play" />
              </a>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <button onClick={() => scrollToSection('projects')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:text-foreground hover:bg-slate-100 transition-colors">Projects</button>
            <button onClick={() => scrollToSection('about')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:text-foreground hover:bg-slate-100 transition-colors">About</button>
            <button onClick={() => scrollToSection('skills')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:text-foreground hover:bg-slate-100 transition-colors">Skills</button>
            <button onClick={() => scrollToSection('contact')} className="px-5 py-2 rounded-full text-sm font-bold bg-foreground text-white hover:bg-brand-blue transition-colors">Contact</button>
          </div>
        </nav>

        {/* Intro */}
        <section id="home" className="mb-24 pt-4 relative flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full font-bold text-sm mb-8 shadow-sm text-foreground transition-transform hover:scale-105 duration-300">
              <Sparkles className="text-brand-magenta animate-pulse" size={18} />
              <span>A vibe coder & web developer exploring AI</span>
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
              Turning bold ideas into real products people use.
            </p>
          </div>
          
          <div className="flex-shrink-0 relative w-56 md:w-72 mt-8 md:mt-0 group">
             <div className="polaroid z-20 group-hover:scale-105 transition-transform duration-300">
              <img src="/profile.png" alt="My Profile" className="polaroid-img" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'; }} />
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
            <div className="soft-card overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors flex flex-col group min-h-[300px] relative mt-4">
              
              {/* Gift Ribbon */}
              <div className="absolute -right-14 top-8 w-48 h-10 bg-[#111] border-y-4 border-[#D4AF37] rotate-45 z-30 shadow-2xl flex items-center justify-center pointer-events-none before:absolute before:inset-0 before:border-y before:border-dashed before:border-[#FFDF73]/50">
                <span className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5 drop-shadow-md">
                  <Sparkles size={10} /> VIRAL
                </span>
              </div>
              <a href="https://bananacv.fun/" target="_blank" rel="noreferrer" className="h-56 bg-brand-pink/10 relative overflow-hidden flex items-center justify-center p-4 rounded-t-[1.3rem]">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                <img src="/bananacv.png" alt="BananaCV" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                <h3 className="hidden font-handwriting text-5xl text-brand-pink font-bold rotate-[-5deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">BananaCV</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow bg-white rounded-b-[1.3rem]">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">BananaCV</h3>
                  <div className="flex gap-2">
                    <a href="https://bananacv.fun/" title="Live Demo" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition-all">
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Globe size={10} className="text-brand-blue" /> Web Tool</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><SiReact size={10} color="#61DAFB" /> React</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-brand-pink">
                  <li>A simple web tool to find common mistakes in resumes.</li>
                  <li>Achieved massive reach with <span className="text-slate-800 font-bold">200K+ visitors</span>.</li>
                  <li>Grew entirely through organic sharing as a viral project.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors flex flex-col group min-h-[300px] mt-4">
              <a href="https://github.com/zoxilsi/Linara-Terminal" target="_blank" rel="noreferrer" className="h-56 bg-brand-yellow/10 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/linara-terminal.png" alt="Linara Terminal" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-5xl text-brand-yellow font-bold rotate-[-2deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">Linara</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">Linara AI Terminal</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/Linara-Terminal" title="Source Code" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition-all">
                      <FaGithub size={18} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><SiRust size={10} color="#000000" /> Rust</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><SiLinux size={10} color="#FCC624" /> CLI</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Sparkles size={10} className="text-brand-magenta" /> AI</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-brand-yellow">
                  <li>A modern, AI-enhanced terminal emulator written in Rust.</li>
                  <li>Bridges the gap between human language and command-line interfaces.</li>
                  <li>Type plain English to seamlessly execute terminal commands.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors flex flex-col group min-h-[300px]">
              <a href="https://mallu-key.vercel.app/" target="_blank" rel="noreferrer" className="h-56 bg-brand-blue/10 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/mallukey.png" alt="malluKey" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-4xl text-brand-blue font-bold rotate-[3deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">malluKey</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">malluKey</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/malluKey" title="Source Code" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition-all">
                      <FaGithub size={18} />
                    </a>
                    <a href="https://mallu-key.vercel.app/" title="Live Demo" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition-all">
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Globe size={10} className="text-brand-green" /> Web App</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><SiJavascript size={10} color="#F7DF1E" /> Performance</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-brand-blue">
                  <li>Minimalist, ultra-responsive web application for Malayalam typing.</li>
                  <li>Features an interactive keyboard map and global leaderboard.</li>
                  <li>Steadily grown to an active user base of <span className="text-slate-800 font-bold">500+ visitors</span>.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors flex flex-col group min-h-[300px]">
              <a href="https://github.com/zoxilsi/vibe" target="_blank" rel="noreferrer" className="h-56 bg-indigo-50 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/vibe.png" alt="Vibe Website Builder" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-5xl text-indigo-500 font-bold rotate-[-2deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">Vibe</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">Vibe</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/vibe" title="Source Code" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition-all">
                      <FaGithub size={18} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><SiNextdotjs size={10} color="#000000" /> Next.js</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><SiGooglegemini size={10} color="#8E75B2" /> Gemini AI</span>
                  <span className="px-2.5 py-1 border border-slate-200 text-slate-600 bg-white text-[10px] font-black uppercase rounded-md tracking-wider flex items-center gap-1.5"><Tags size={10} className="text-orange-500" /> E2B Sandboxes</span>
                </div>
                <ul className="text-muted font-medium mb-4 flex-grow text-sm list-disc pl-4 space-y-1.5 marker:text-indigo-500">
                  <li>AI-powered platform for generating fully functioning Next.js applications.</li>
                  <li>Builds customized React components directly from detailed prompts.</li>
                  <li>Integated with generative AI and secure, isolated cloud sandboxes.</li>
                </ul>
              </div>
            </div>

            <div className="soft-card overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors flex flex-col group min-h-[300px]">
              <a href="https://mca-rit.vercel.app/" target="_blank" rel="noreferrer" className="h-56 bg-emerald-500/10 relative overflow-hidden flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                 <img src="/mca-study-materials.png" alt="MCA Study Materials" className="object-cover w-full h-full rounded-md shadow-md group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <h3 className="hidden font-handwriting text-4xl text-emerald-600 font-bold rotate-[-2deg] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">MCA Notes</h3>
              </a>
              <div className="p-6 flex flex-col flex-grow bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold leading-tight">MCA Study Materials</h3>
                  <div className="flex gap-2">
                    <a href="https://github.com/zoxilsi/MCA-STUDY-MATERIALS" title="Source Code" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition-all">
                      <FaGithub size={18} />
                    </a>
                    <a href="https://mca-rit.vercel.app/" title="Live Demo" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 transition-all">
                      <ExternalLink size={18} />
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

        {/* About */}
        <section id="about" className="mb-20">
          <div className="soft-card p-10 border border-slate-200 bg-white/80 backdrop-blur-sm">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span className="bg-brand-green/20 w-10 h-10 rounded-full flex items-center justify-center text-brand-green">
                <Smile size={20} />
              </span>
              Who am I
            </h2>
            <div className="text-lg font-medium leading-relaxed flex flex-col gap-4 text-foreground/80">
              <p>
                I'm an <span className="font-bold text-slate-800">MCA 2026 student</span> who genuinely loves to build things. I spend my time exploring new tech tools, keeping up with the evolving tech space, and talking about all things technology.
              </p>
              <p>
                I thrive on turning ideas into reality. One of my projects even went viral and reached over <span className="bg-brand-yellow/30 text-amber-700 px-2 py-0.5 rounded-md inline-block font-bold">200K+ visitors</span>, which was an incredible experience that showed me the real-world impact of creating simple, creative solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black uppercase text-foreground">Education</h2>
            <div className="h-0.5 flex-grow bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="soft-card p-6 bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Master of Computer Applications</h3>
                <p className="text-slate-500 font-medium mt-1">Rajiv Gandhi Institute of Technology</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">2024 - 2026</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-md tracking-wider">Postgraduate</span>
              </div>
            </div>
            
            <div className="soft-card p-6 bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Bachelor of Computer Science</h3>
                <p className="text-slate-500 font-medium mt-1">Kannur University</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Graduated</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-md tracking-wider">Undergraduate</span>
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
            <div className="soft-card p-6 bg-white border border-slate-200">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiJavascript size={14} color="#F7DF1E" /> JavaScript</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiPython size={14} color="#3776AB" /> Python</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiRust size={14} color="#000000" /> Rust</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiPostgresql size={14} color="#4169E1" /> SQL</span>
              </div>
            </div>

            <div className="soft-card p-6 bg-white border border-slate-200">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiReact size={14} color="#61DAFB" /> React.js</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiNextdotjs size={14} color="#000000" /> Next.js</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiHtml5 size={14} color="#E34F26" /> HTML</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiCss size={14} color="#1572B6" /> CSS</span>
              </div>
            </div>

            <div className="soft-card p-6 bg-white border border-slate-200">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Backend</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiNodedotjs size={14} color="#339933" /> Node.js</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><Globe size={14} className="text-brand-blue" /> APIs</span>
              </div>
            </div>

            <div className="soft-card p-6 bg-white border border-slate-200">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Databases</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiMongodb size={14} color="#47A248" /> MongoDB</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiMysql size={14} color="#4479A1" /> MySQL</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiPrisma size={14} color="#2D3748" /> Prisma</span>
              </div>
            </div>

            <div className="soft-card p-6 bg-white border border-slate-200 lg:col-span-2">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">Tools & Other</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiGit size={14} color="#F05032" /> Git</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiLinux size={14} color="#FCC624" /> Linux</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiFigma size={14} color="#F24E1E" /> Figma</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><SiGooglegemini size={14} color="#8E75B2" /> Gemini AI</span>
                <span className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 text-sm font-bold rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"><Tags size={14} className="text-orange-500" /> E2B Sandboxes</span>
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
              <a href="https://linkedin.com/in/zoxilsi" target="_blank" rel="noreferrer" className="group inline-flex items-center gap-3 px-8 py-4 bg-foreground hover:bg-gradient-to-r hover:from-brand-pink hover:via-brand-blue hover:to-brand-green text-white rounded-full font-bold shadow-sm transition-all duration-700 ease-in-out">
                <FaLinkedin size={20} className="transition-transform duration-700 group-hover:rotate-12" /> 
                <span>Send a Message</span> 
                <ArrowRight className="group-hover:translate-x-2 transition-transform duration-700" size={18} />
              </a>
              
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-slate-500 font-medium">Fastest way to reach me for collaborations.</p>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-700 mt-1 hover:bg-slate-100 transition-colors duration-500">
                  <Mail size={16} className="text-brand-pink" /> 
                  <a href="mailto:hey.abhijith@gmail.com" className="hover:text-brand-blue transition-colors duration-500">hey.abhijith@gmail.com</a>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <a href="https://github.com/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-foreground transition-all hover:scale-110">
                <FaGithub size={28} />
              </a>
              <a href="https://linkedin.com/in/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-[#0A66C2] transition-all hover:scale-110">
                <FaLinkedin size={28} />
              </a>
              <a href="https://x.com/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-black transition-all hover:scale-110">
                <FaXTwitter size={28} />
              </a>
              <a href="https://instagram.com/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-brand-pink transition-all hover:scale-110">
                <FaInstagram size={28} />
              </a>
              <a href="https://gitlab.com/zoxilsi" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-[#FC6D26] transition-all hover:scale-110">
                <FaGitlab size={28} />
              </a>
              <a href="https://zoxilsi.tech" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-brand-green transition-all hover:scale-110">
                <Globe size={28} />
              </a>
            </div>
          </div>
        </section>

      </div>
      
      {/* Floating Theme Menu */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#121212] backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-4 md:px-6 py-3 flex items-center gap-2 md:gap-3 justify-center">
          {sectionItems.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs md:text-sm font-medium transition-colors ${
                  isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive ? 'bg-brand-pink shadow-[0_0_10px_rgba(255,104,175,0.95)]' : 'bg-white/25'
                  }`}
                ></span>
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
