/**
 * Mahmood Khordoo Portfolio Engine
 * Interactions: Project Filters & Directory Switcher, CRT Portrait Modes,
 * Embedded Live Terminal CLI, Montreal Live Telemetry, Copy Email,
 * Screenshot Lightbox & Theme Switcher.
 */

document.addEventListener('DOMContentLoaded', () => {
  initProjectFiltering();
  initAsciiPortrait();
  initTerminalCLI();
  initThemeToggle();
  initTelemetryScroll();
  initMontrealClock();
  initCopyEmail();
  initProjectLightbox();
});

/* ==========================================================================
   1. Project Filtering & Search
   ========================================================================== */

function initProjectFiltering() {
  const searchInput = document.getElementById('project-search');
  const filterBtns = document.querySelectorAll('[data-filter]');
  const viewToggleBtns = document.querySelectorAll('[data-view]');
  const countDisplay = document.getElementById('projects-count');
  const gridContainer = document.getElementById('projects-grid');
  const tableContainer = document.getElementById('projects-table');
  const emptyState = document.getElementById('projects-empty');

  let currentCategory = 'all';
  let searchQuery = '';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const viewMode = btn.getAttribute('data-view');
      if (viewMode === 'grid') {
        gridContainer?.classList.remove('hidden');
        tableContainer?.classList.add('hidden');
      } else {
        gridContainer?.classList.add('hidden');
        tableContainer?.classList.remove('hidden');
      }
    });
  });

  function applyFilters() {
    const gridItems = document.querySelectorAll('.project-card');
    const tableItems = document.querySelectorAll('.project-row');
    let visibleCount = 0;

    gridItems.forEach((card, index) => {
      const tableRow = tableItems[index];
      const category = card.getAttribute('data-category') || '';
      const text = card.textContent.toLowerCase();

      const matchesCat = currentCategory === 'all' || category.includes(currentCategory);
      const matchesSearch = !searchQuery || text.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = '';
        if (tableRow) tableRow.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
        if (tableRow) tableRow.style.display = 'none';
      }
    });

    if (countDisplay) {
      countDisplay.textContent = `[${visibleCount} SHOWN]`;
    }

    if (emptyState) {
      emptyState.classList.toggle('hidden', visibleCount !== 0);
    }
  }
}

/* ==========================================================================
   2. Portrait Viewport & CRT Phosphor Controls
   ========================================================================== */

function initAsciiPortrait() {
  const container = document.getElementById('ascii-container');
  const phosphorBtns = document.querySelectorAll('[data-phosphor]');
  const photoOverlay = document.getElementById('photo-overlay');
  const resReadout = document.getElementById('portrait-res-readout');
  const modeReadout = document.getElementById('portrait-mode-readout');

  phosphorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      phosphorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-phosphor');
      if (mode === 'photo') {
        photoOverlay?.classList.remove('hidden');
        if (resReadout) resReadout.textContent = 'RES: 1137x1528 // HD SOURCE';
        if (modeReadout) modeReadout.textContent = 'OPTICAL // ACTIVE';
      } else {
        photoOverlay?.classList.add('hidden');
        if (container) {
          container.classList.remove('phosphor-green', 'phosphor-cyan', 'phosphor-amber');
          container.classList.add(`phosphor-${mode}`);
        }
        if (resReadout) resReadout.textContent = 'RES: 112x70 CHARS // ASCII';
        if (modeReadout) modeReadout.textContent = `CRT ${mode.toUpperCase()} // ACTIVE`;
      }
    });
  });
}

/* ==========================================================================
   3. Embedded Live Interactive Terminal CLI
   ========================================================================== */

function initTerminalCLI() {
  const termInput = document.getElementById('terminal-cli-input');
  const termHistory = document.getElementById('terminal-cli-output');
  const termScrollArea = document.getElementById('interactive-terminal');
  const termCard = document.getElementById('terminal');
  const quickCmdBtns = document.querySelectorAll('[data-cli-cmd]');

  if (!termInput || !termHistory) return;

  const commandHistory = ['whoami'];
  let historyIndex = commandHistory.length;

  // Global '/' key focuses terminal and brings it into view
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      termCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => termInput.focus(), 180);
    }
  });

  // Clicking terminal body focuses input (unless selecting text or clicking link/button)
  termScrollArea?.addEventListener('click', (e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    const selection = window.getSelection()?.toString();
    if (!selection) termInput.focus();
  });

  // Quick-run clickable command chips
  quickCmdBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cli-cmd');
      if (!cmd) return;
      executeCommand(cmd);
      termInput.focus();
    });
  });

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const fullCmd = termInput.value.trim();
      if (!fullCmd) return;
      executeCommand(fullCmd);
      termInput.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex > 0) {
        historyIndex--;
        termInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        termInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        termInput.value = '';
      }
    }
  });

  function executeCommand(fullCmd) {
    commandHistory.push(fullCmd);
    historyIndex = commandHistory.length;
    renderCommandOutput(fullCmd);
  }

  function renderCommandOutput(cmdStr) {
    const parts = cmdStr.trim().split(/\s+/);
    const command = parts[0].toLowerCase();

    if (command === 'clear') {
      termHistory.innerHTML = '';
      return;
    }

    const cmdRow = document.createElement('div');
    cmdRow.className = 'mt-2.5 text-slate-300';
    cmdRow.innerHTML = `<span class="text-emerald-400 font-bold">mahmood@mtl:~$</span> <span class="text-white font-semibold">${escapeHtml(cmdStr)}</span>`;
    termHistory.appendChild(cmdRow);

    const outRow = document.createElement('div');
    outRow.className = 'text-slate-300 text-[11.5px] mt-1 leading-relaxed';

    switch (command) {
      case 'help':
        outRow.innerHTML = `
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <div><span class="text-emerald-400 font-bold">whoami</span> — Role &amp; summary</div>
            <div><span class="text-emerald-400 font-bold">montreal</span> — Base &amp; status</div>
            <div><span class="text-emerald-400 font-bold">projects</span> — 9 featured repos</div>
            <div><span class="text-emerald-400 font-bold">exp</span> — Career log</div>
            <div><span class="text-emerald-400 font-bold">skills</span> — Compute &amp; AI stack</div>
            <div><span class="text-emerald-400 font-bold">certs</span> — 7 verified certs</div>
            <div><span class="text-amber-400 font-bold">awards</span> — Google &amp; AWS wins</div>
            <div><span class="text-emerald-400 font-bold">contact</span> — Direct dispatch</div>
            <div><span class="text-sky-400 font-bold">photo</span> / <span class="text-sky-400 font-bold">ascii</span> — Portrait view</div>
            <div><span class="text-sky-400 font-bold">theme</span> / <span class="text-sky-400 font-bold">clear</span> — UI / Reset</div>
          </div>
        `;
        break;

      case 'whoami':
        outRow.innerHTML = `
          <div class="text-white font-bold">Mahmood Khordoo — Senior AI &amp; Machine Learning Engineer</div>
          <div class="text-emerald-300">&gt; Focus: GenAI, Multi-Agent Systems, Production MLOps</div>
          <div class="text-slate-300">&gt; Base: Montreal, QC [45.5°N 73.5°W]</div>
          <div class="text-slate-300">&gt; Impact: MULT-MM$ MLOps Platform · &lt;5wk Multi-Agent RAG · 19%→85% Agent Eval</div>
        `;
        break;

      case 'montreal':
      case 'location':
      case 'status':
        outRow.innerHTML = `
          <div class="text-emerald-300 font-semibold">● NODE: MONTREAL, QUEBEC, CANADA [45.5017°N, 73.5673°W]</div>
          <div class="text-slate-300">&gt; Focus: Enterprise GenAI, Multi-Agent Systems &amp; Production MLOps</div>
          <div class="text-slate-400">&gt; Timezone: America/Toronto (EST/EDT) · Direct: <a href="mailto:m.khordoo@gmail.com" class="text-emerald-400 hover:underline">m.khordoo@gmail.com</a></div>
        `;
        break;

      case 'about':
      case 'cat':
        outRow.innerHTML = `
          <div class="text-slate-300">
            10+ years architecting production ML, enterprise MLOps, and autonomous multi-agent systems.
            Industrial MLOps Platform (MULT-MM$ impact), reusable LangGraph RAG (&lt;5wk delivery, six-figure savings),
            8M-param LLM from scratch (DustyLM), and biological connectome simulations (FLINCH).
          </div>
        `;
        break;

      case 'projects':
      case 'ls':
        outRow.innerHTML = `
          <div class="flex flex-col gap-1">
            <div>★ <a href="https://github.com/khordoo/dusty-lm" target="_blank" rel="noopener" class="text-sky-400 hover:underline font-semibold">DustyLM</a> — 8M-param LLM in 15m [PyTorch, PyPI, Wasm]</div>
            <div>★ <a href="https://jev-reflex-autonomy-lab.vercel.app" target="_blank" rel="noopener" class="text-sky-400 hover:underline font-semibold">JEV Reflex Lab</a> — Multi-drone System 1/2 (★24)</div>
            <div>★ <a href="https://flinch-fly-brain-duel.vercel.app" target="_blank" rel="noopener" class="text-sky-400 hover:underline font-semibold">FLINCH</a> — Drosophila connectome escape duel</div>
            <div>★ <a href="https://github.com/khordoo/advanced-agentic-rag" target="_blank" rel="noopener" class="text-sky-400 hover:underline font-semibold">Advanced Agentic RAG</a> — Hybrid RRF &amp; Phoenix eval</div>
            <div>★ <a href="#projects" class="text-emerald-400 hover:underline font-semibold">Industrial MLOps Platform</a> — SageMaker &amp; drift ops (MULT-MM$)</div>
            <div>★ <a href="https://pypi.org/project/clauth/" target="_blank" rel="noopener" class="text-sky-400 hover:underline font-semibold">CLAUTH</a> — PyPI CLI for Claude Code + AWS Bedrock</div>
            <div>★ <a href="https://github.com/khordoo/disaster-watch-classifier" target="_blank" rel="noopener" class="text-amber-400 hover:underline font-semibold">Disaster Watch</a> — Google TF 2.0 Grand Prize (★28)</div>
            <div>★ <a href="https://github.com/khordoo/traffic-watch-object-detection" target="_blank" rel="noopener" class="text-sky-400 hover:underline font-semibold">Traffic Watch Edge</a> — Jetson TX2 + DeepStream (★10)</div>
            <div>★ <a href="https://github.com/khordoo/Deep-Reinforcement-Learning-with-PyTorch" target="_blank" rel="noopener" class="text-sky-400 hover:underline font-semibold">Deep RL PyTorch</a> — Double/Dueling DQN (Top-10 Gym)</div>
          </div>
        `;
        break;

      case 'exp':
      case 'experience':
        outRow.innerHTML = `
          <div class="flex flex-col gap-1">
            <div><span class="text-emerald-400 font-bold">[2021—Now]</span> Rio Tinto (Montreal) — Sr. GenAI &amp; ML Eng / Lead</div>
            <div><span class="text-sky-400 font-bold">[2020—21]</span> TMC (Montreal) — Sr. Data Eng, ML &amp; MLOps (80% ETL speedup)</div>
            <div><span class="text-sky-400 font-bold">[2018—20]</span> SensorUp — Data Scientist (15k+ IoT railcars, 128 feeds)</div>
            <div><span class="text-slate-400 font-bold">[2017—18]</span> Independent Research — Python/C++ Algorithm Dev</div>
          </div>
        `;
        break;

      case 'skills':
      case 'stack':
        outRow.innerHTML = `
          <div><span class="text-emerald-400 font-semibold">Core:</span> Python 3.12, PyTorch, C++20, CUDA, Go, SQL, TypeScript</div>
          <div><span class="text-sky-400 font-semibold">GenAI:</span> LangGraph, Multi-Agent RAG, RRF, DSPy, LoRA, Bedrock, Phoenix</div>
          <div><span class="text-amber-400 font-semibold">MLOps:</span> AWS SageMaker, Ray, Triton, vLLM, Docker, CI/CD, IaC</div>
        `;
        break;

      case 'certs':
        outRow.innerHTML = `
          <div>✓ <span class="text-emerald-400">AWS ML Specialty</span> · <span class="text-sky-400">AWS Solutions Architect</span> · <span class="text-sky-400">AWS Developer</span></div>
          <div>✓ DeepLearning.AI Specialization · Udacity Data Eng · Triplebyte DS · IBM DS</div>
        `;
        break;

      case 'awards':
      case 'honors':
        outRow.innerHTML = `
          <div><span class="text-amber-400 font-bold">🏆 Google Grand Prize</span> — TensorFlow 2.0 Global Competition</div>
          <div><span class="text-emerald-400 font-bold">🥇 1st Place Winner</span> — AWS GenAI Hackathon</div>
          <div><span class="text-sky-400 font-bold">⚡ Arize Phoenix</span> — Self-Improving Cloud Agents (19% → 85%)</div>
        `;
        break;

      case 'contact':
      case 'email':
        outRow.innerHTML = `
          <div>Email: <a href="mailto:m.khordoo@gmail.com" class="text-emerald-400 font-bold hover:underline">m.khordoo@gmail.com</a></div>
          <div>GitHub: <a href="https://github.com/khordoo" target="_blank" rel="noopener" class="text-sky-400 hover:underline">github.com/khordoo</a></div>
          <div>LinkedIn: <a href="https://linkedin.com/in/khordoo" target="_blank" rel="noopener" class="text-sky-400 hover:underline">linkedin.com/in/khordoo</a></div>
        `;
        break;

      case 'theme':
        document.getElementById('theme-toggle-btn')?.click();
        const isDark = document.documentElement.classList.contains('dark');
        outRow.innerHTML = `Theme switched to: <span class="text-emerald-400 font-bold">${isDark ? 'DARK CRT' : 'LIGHT PRECISION'}</span>`;
        break;

      case 'photo':
        document.querySelector('[data-phosphor="photo"]')?.click();
        outRow.innerHTML = `<span class="text-emerald-400">Portrait viewport → High-Resolution Photograph.</span>`;
        break;

      case 'ascii':
        document.querySelector('[data-phosphor="green"]')?.click();
        outRow.innerHTML = `<span class="text-emerald-400">Portrait viewport → CRT Green Phosphor ASCII.</span>`;
        break;

      default:
        outRow.innerHTML = `<span class="text-rose-400">Unknown command "${escapeHtml(cmdStr)}".</span> Type <span class="text-emerald-400 font-bold">help</span> or click a chip below.`;
        break;
    }

    termHistory.appendChild(outRow);
    if (termScrollArea) {
      termScrollArea.scrollTop = termScrollArea.scrollHeight;
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/* ==========================================================================
   4. Theme Toggle (Light Precision Lab / Dark CRT)
   ========================================================================== */

function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const labelEl = document.getElementById('theme-toggle-label');
  const urlTheme = new URLSearchParams(window.location.search).get('theme');
  const savedTheme = urlTheme || localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  }
  syncLabel();

  toggleBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    syncLabel();
  });

  function syncLabel() {
    if (!labelEl) return;
    const isDark = document.documentElement.classList.contains('dark');
    labelEl.textContent = isDark ? 'LIGHT' : 'DARK';
  }
}

/* ==========================================================================
   5. Telemetry Section Tracker & Scroll Progress Bar
   ========================================================================== */

function initTelemetryScroll() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const telemetryDisplay = document.getElementById('nav-section-telemetry');
  const progressBar = document.getElementById('scroll-progress-bar');

  if (sections.length && telemetryDisplay) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id) telemetryDisplay.textContent = `// SEC: ${id.toUpperCase()}`;
        }
      });
    }, { threshold: 0.22 });

    sections.forEach(s => observer.observe(s));
  }

  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progressBar.style.width = `${pct.toFixed(1)}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
}

/* ==========================================================================
   6. Live Montreal Local Time Telemetry
   ========================================================================== */

function initMontrealClock() {
  const clockEl = document.getElementById('montreal-clock');
  if (!clockEl) return;

  const updateClock = () => {
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short'
      }).format(now);
      clockEl.textContent = formatted.toUpperCase();
    } catch {
      clockEl.textContent = 'MTL // EST';
    }
  };

  updateClock();
  setInterval(updateClock, 30000);
}

/* ==========================================================================
   7. One-Click Copy Email Feedback
   ========================================================================== */

function initCopyEmail() {
  const btns = document.querySelectorAll('[data-copy-email]');
  btns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-copy-email') || 'm.khordoo@gmail.com';
      const label = btn.querySelector('[data-copy-label]');
      const original = label ? label.textContent : '';
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const tmp = document.createElement('textarea');
        tmp.value = email;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }
      if (label) {
        label.textContent = '✓ Copied!';
        setTimeout(() => { label.textContent = original; }, 1800);
      }
    });
  });
}

/* ==========================================================================
   8. Project Screenshot Click-to-Zoom Lightbox
   ========================================================================== */

function initProjectLightbox() {
  const backdrop = document.getElementById('project-lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbTitle = document.getElementById('lightbox-title');
  const lbSubtitle = document.getElementById('lightbox-subtitle');
  const lbClose = document.getElementById('lightbox-close');

  if (!backdrop || !lbImg) return;

  const openLightbox = (src, title, subtitle, bgClass) => {
    lbImg.src = src;
    lbImg.alt = title;
    lbImg.className = `w-full max-h-[76vh] object-contain ${bgClass || 'bg-[#031216]'}`;
    if (lbTitle) lbTitle.textContent = title;
    if (lbSubtitle) lbSubtitle.textContent = subtitle;
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.project-media').forEach(media => {
    media.addEventListener('click', () => {
      const img = media.querySelector('img');
      if (!img) return;
      const title = media.getAttribute('data-lb-title') || img.alt || 'Project Preview';
      const subtitle = media.getAttribute('data-lb-sub') || '';
      const bg = media.getAttribute('data-lb-bg') || 'bg-[#031216]';
      openLightbox(img.src, title, subtitle, bg);
    });
  });

  lbClose?.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeLightbox();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeLightbox();
    }
  });
}
