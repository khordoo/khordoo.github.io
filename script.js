/**
 * Mahmood Khordoo Portfolio Engine
 * Interactions: Interactive Filters, Directory/Grid Switcher, CRT Phosphors,
 * Terminal CLI Emulator, Theme Switcher & Telemetry.
 */

document.addEventListener('DOMContentLoaded', () => {
  initProjectFiltering();
  initAsciiPortrait();
  initTerminalCLI();
  initThemeToggle();
  initTelemetryScroll();
});

/* ==========================================================================
   1. Project Filtering & Search (AwesomeJEV Style)
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

  // Category filter clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'bg-slate-900', 'text-white', 'dark:bg-emerald-500', 'dark:text-slate-950'));
      btn.classList.add('active', 'bg-slate-900', 'text-white', 'dark:bg-emerald-500', 'dark:text-slate-950');
      currentCategory = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  // Search input typing
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // View Mode Switcher: Grid vs Table
  viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewToggleBtns.forEach(b => b.classList.remove('active', 'bg-slate-900', 'text-white', 'dark:bg-emerald-500', 'dark:text-slate-950'));
      btn.classList.add('active', 'bg-slate-900', 'text-white', 'dark:bg-emerald-500', 'dark:text-slate-950');
      const viewMode = btn.getAttribute('data-view');
      if (viewMode === 'grid') {
        gridContainer.classList.remove('hidden');
        tableContainer.classList.add('hidden');
      } else {
        gridContainer.classList.add('hidden');
        tableContainer.classList.remove('hidden');
      }
    });
  });

  function applyFilters() {
    const gridItems = document.querySelectorAll('.project-card');
    const tableItems = document.querySelectorAll('.project-row');
    let visibleCount = 0;

    gridItems.forEach((card, index) => {
      const tableRow = tableItems[index];
      const category = card.getAttribute('data-category');
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
      if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }
}

/* ==========================================================================
   2. ASCII Portrait & Phosphor Controls (imnosovsky.dev Style)
   ========================================================================== */

function initAsciiPortrait() {
  const container = document.getElementById('ascii-container');
  const phosphorBtns = document.querySelectorAll('[data-phosphor]');
  const photoOverlay = document.getElementById('photo-overlay');

  phosphorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      phosphorBtns.forEach(b => b.classList.remove('active', 'bg-slate-900', 'text-white', 'dark:bg-emerald-500', 'dark:text-slate-950'));
      btn.classList.add('active', 'bg-slate-900', 'text-white', 'dark:bg-emerald-500', 'dark:text-slate-950');

      const mode = btn.getAttribute('data-phosphor');
      if (mode === 'photo') {
        if (photoOverlay) photoOverlay.classList.remove('hidden');
      } else {
        if (photoOverlay) photoOverlay.classList.add('hidden');
        if (container) {
          container.classList.remove('phosphor-green', 'phosphor-cyan', 'phosphor-amber');
          container.classList.add(`phosphor-${mode}`);
        }
      }
    });
  });
}

/* ==========================================================================
   3. Interactive Terminal CLI Emulator
   ========================================================================== */

function initTerminalCLI() {
  const termInput = document.getElementById('terminal-cli-input');
  const termHistory = document.getElementById('terminal-cli-output');
  const termContainer = document.getElementById('interactive-terminal');

  if (!termInput || !termHistory) return;

  const commandHistory = [];
  let historyIndex = -1;

  // Global key to focus terminal: pressing '/' when not in input
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      termInput.focus();
      termContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const fullCmd = termInput.value.trim();
      if (!fullCmd) return;

      commandHistory.push(fullCmd);
      historyIndex = commandHistory.length;

      renderCommandOutput(fullCmd);
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

  function renderCommandOutput(cmdStr) {
    const parts = cmdStr.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase();

    const cmdRow = document.createElement('div');
    cmdRow.className = 'mt-2 text-slate-300';
    cmdRow.innerHTML = `<span class="text-emerald-400 font-bold">mahmood@lab:~$</span> <span class="text-white">${escapeHtml(cmdStr)}</span>`;
    termHistory.appendChild(cmdRow);

    const outRow = document.createElement('div');
    outRow.className = 'text-slate-400 text-xs mt-1 leading-relaxed';

    switch (command) {
      case 'help':
        outRow.innerHTML = `
          <div class="grid grid-cols-2 gap-x-4 max-w-md">
            <div><span class="text-emerald-400 font-bold">whoami</span> — Identity & title</div>
            <div><span class="text-emerald-400 font-bold">about</span> — Bio & thesis</div>
            <div><span class="text-emerald-400 font-bold">projects</span> — List featured projects</div>
            <div><span class="text-emerald-400 font-bold">exp</span> — Experience log</div>
            <div><span class="text-emerald-400 font-bold">skills</span> — Tech stack matrix</div>
            <div><span class="text-emerald-400 font-bold">certs</span> — Official certs</div>
            <div><span class="text-amber-400 font-bold">awards</span> — Honors & awards</div>
            <div><span class="text-emerald-400 font-bold">photo</span> — View original photo</div>
            <div><span class="text-emerald-400 font-bold">ascii</span> — View ASCII portrait</div>
            <div><span class="text-emerald-400 font-bold">contact</span> — Get in touch</div>
            <div><span class="text-emerald-400 font-bold">theme</span> — Toggle light/dark</div>
            <div><span class="text-emerald-400 font-bold">clear</span> — Clear terminal</div>
          </div>
        `;
        break;

      case 'whoami':
        outRow.innerHTML = `
          <div class="text-white font-bold">Mahmood Khordoo — Senior Machine Learning Engineer & Technical Lead</div>
          <div class="text-emerald-300">> Specialization: Generative AI, Multi-Agent Systems, MLOps, Bio-Inspired Computing</div>
          <div class="text-slate-400">> Location: Montreal, Quebec, Canada [45.5°N, 73.5°W]</div>
          <div class="text-slate-400">> Status: <span class="text-emerald-400">RESEARCH_MODE // SYS: ONLINE</span></div>
        `;
        break;

      case 'about':
      case 'cat':
        outRow.innerHTML = `
          <div class="text-slate-300">
            “Architecting resilient autonomous reasoning systems, high-throughput model pipelines, and multi-agent infrastructure.”
            <br/><br/>
            Lead AI & ML Engineer with proven enterprise impact: Industrial MLOps Platform (MULT-MM$ impact), reusable multi-agent RAG framework (&lt;5wk delivery, six-figure savings), custom 8M-parameter LLM architectures (DustyLM), and biological connectome simulations (FLINCH).
          </div>
        `;
        break;

      case 'projects':
      case 'ls':
        outRow.innerHTML = `
          <div class="flex flex-col gap-1 text-slate-300">
            <div>★ <a href="https://github.com/khordoo/dusty-lm" target="_blank" class="text-sky-400 hover:underline">DustyLM</a> — 8M-param LLM trained in 15 min [PyTorch, PyPI, Wasm]</div>
            <div>★ <a href="https://github.com/khordoo/jev-reflex-autonomy-lab" target="_blank" class="text-sky-400 hover:underline">JEV Reflex Autonomy Lab</a> — Multi-drone System 1/2 autonomy</div>
            <div>★ <a href="https://flinch-fly-brain-duel.vercel.app" target="_blank" class="text-sky-400 hover:underline">FLINCH: Fly Brain Duel</a> — Fly connectome neural simulation</div>
            <div>★ <a href="https://github.com/khordoo/advanced-agentic-rag" target="_blank" class="text-sky-400 hover:underline">Advanced Agentic RAG</a> — RRF reranking & Phoenix eval</div>
            <div>★ <a href="#projects" class="text-emerald-400 font-semibold hover:underline">Industrial MLOps Platform</a> — Automated ML training, deployment & monitoring (MULT-MM$ impact)</div>
            <div>★ <a href="https://pypi.org/project/clauth/" target="_blank" class="text-sky-400 hover:underline">CLAUTH</a> — Published PyPI CLI for AWS Bedrock auth</div>
            <div>★ <a href="#projects" class="text-amber-400 hover:underline">Disaster Watch</a> — Google Grand Prize in TensorFlow 2.0</div>
          </div>
        `;
        break;

      case 'exp':
      case 'experience':
        outRow.innerHTML = `
          <div class="flex flex-col gap-1.5 text-slate-300">
            <div><span class="text-emerald-400 font-bold">[2021—Present]</span> Rio Tinto — Senior ML Engineer | Tech Lead</div>
            <div class="text-slate-400 pl-4">> Industrial MLOps Platform (MULT-MM$ impact); reusable multi-agent RAG (&lt;5wk delivery, six-figure savings).</div>
            <div><span class="text-emerald-400 font-bold">[2020—2021]</span> TMC — Senior Data Engineer - ML & MLOps</div>
            <div class="text-slate-400 pl-4">> Predictive maintenance MVP; 80% ETL speedup with Python AsyncIO.</div>
            <div><span class="text-emerald-400 font-bold">[2018—2020]</span> SensorUp Inc. — Data Scientist (Geospatial & IoT)</div>
            <div class="text-slate-400 pl-4">> Real-time streaming ETL across 15,000+ IoT sensors on railcars.</div>
            <div><span class="text-emerald-400 font-bold">[2017—2018]</span> Independent Research — Python Algorithm Developer</div>
            <div class="text-slate-400 pl-4">> Novel Fuzzy C-Mean clustering algorithm; fluid transport simulator in Python & C++.</div>
          </div>
        `;
        break;

      case 'skills':
      case 'stack':
        outRow.innerHTML = `
          <div class="text-slate-300">
            <div><span class="text-emerald-400 font-semibold">Compute:</span> Python 3.12, PyTorch, C++, CUDA, Go, SQL</div>
            <div><span class="text-sky-400 font-semibold">AI/GenAI:</span> LangGraph, Multi-Agent Orchestration, Advanced RAG, DSPy, LoRA/PEFT, Transformers</div>
            <div><span class="text-amber-400 font-semibold">Cloud/MLOps:</span> AWS (SageMaker, Lambda, S3, IoT Core), Ray, Triton, vLLM, Docker, CI/CD</div>
          </div>
        `;
        break;

      case 'certs':
        outRow.innerHTML = `
          <div class="text-slate-300">
            <div>✓ <span class="text-emerald-400 font-semibold">AWS Certified Machine Learning - Specialty</span> [Active]</div>
            <div>✓ <span class="text-sky-400 font-semibold">AWS Certified Solutions Architect</span> [Active]</div>
            <div>✓ <span class="text-sky-400 font-semibold">AWS Certified Developer - Associate</span> [Active]</div>
            <div>✓ <span class="text-emerald-400 font-semibold">Deep Learning Specialization</span> — DeepLearning.AI [ID: EMPUKWSQAE7Q]</div>
            <div>✓ <span class="text-sky-400 font-semibold">Data Engineering NanoDegree</span> — Udacity</div>
            <div>✓ <span class="text-emerald-400 font-semibold">Triplebyte Certified Data Scientist</span> — Triplebyte [ID: JbNDjOg]</div>
            <div>✓ <span class="text-slate-400 font-semibold">Professional Data Science Certificate</span> — IBM [ID: CUNQGFUWD3KR]</div>
            <div class="mt-2 text-xs text-slate-400">> Type <span class="text-amber-400 font-bold">awards</span> to view global competition wins & honors.</div>
          </div>
        `;
        break;

      case 'awards':
      case 'honors':
        outRow.innerHTML = `
          <div class="text-slate-300 flex flex-col gap-2">
            <div>
              <span class="text-amber-400 font-bold">🏆 Google Grand Prize Winner</span> — TensorFlow 2.0 Global Competition
              <div class="text-slate-400 pl-4 text-xs">> Top worldwide honor for Disaster Watch real-time NLP crisis mapping platform.</div>
            </div>
            <div>
              <span class="text-emerald-400 font-bold">🥇 Winner — AWS GenAI Hackathon</span> [AWS / Amazon]
              <div class="text-slate-400 pl-4 text-xs">> Architected winning generative AI solution with serverless model orchestration & agentic reasoning.</div>
            </div>
            <div>
              <span class="text-sky-400 font-bold">⚡ Arize Phoenix: Building Self-Improving Agents</span> [Arize AI]
              <div class="text-slate-400 pl-4 text-xs">> Engineered self-improving agents using Arize CLI skills and Phoenix golden datasets; continuous online evaluation loops to improve cloud resource provisioning agents.</div>
            </div>
          </div>
        `;
        break;

      case 'contact':
      case 'email':
        outRow.innerHTML = `
          <div class="text-slate-300">
            Direct dispatch: <a href="mailto:mahmood.khordoo@gmail.com" class="text-emerald-400 font-bold hover:underline">mahmood.khordoo@gmail.com</a>
            <br/>
            GitHub: <a href="https://github.com/khordoo" target="_blank" class="text-sky-400 hover:underline">github.com/khordoo</a>
            <br/>
            LinkedIn: <a href="https://linkedin.com/in/khordoo" target="_blank" class="text-sky-400 hover:underline">linkedin.com/in/khordoo</a>
          </div>
        `;
        break;

      case 'theme':
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        outRow.innerHTML = `Theme switched to: <span class="text-emerald-400 font-bold">${isDark ? 'DARK CRT' : 'LIGHT PRECISION'}</span>`;
        break;

      case 'photo':
        const photoBtn = document.querySelector('[data-phosphor="photo"]');
        if (photoBtn) photoBtn.click();
        outRow.innerHTML = `<span class="text-emerald-400">Switched portrait viewport to High-Resolution Photograph.</span>`;
        break;

      case 'ascii':
        const greenBtn = document.querySelector('[data-phosphor="green"]');
        if (greenBtn) greenBtn.click();
        outRow.innerHTML = `<span class="text-emerald-400">Switched portrait viewport to CRT ASCII art mode.</span>`;
        break;

      case 'clear':
        termHistory.innerHTML = '';
        return;

      default:
        outRow.innerHTML = `<span class="text-rose-400">Command not found: "${escapeHtml(cmdStr)}". Type <span class="text-emerald-400 font-bold">help</span> to view available commands.</span>`;
        break;
    }

    termHistory.appendChild(outRow);
    termContainer.scrollTop = termContainer.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/* ==========================================================================
   4. Theme Toggle (Light / Dark)
   ========================================================================== */

function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
}

/* ==========================================================================
   5. Telemetry & Navigation Scroll
   ========================================================================== */

function initTelemetryScroll() {
  const sections = document.querySelectorAll('section[id]');
  const telemetryDisplay = document.getElementById('nav-section-telemetry');

  if (!sections.length || !telemetryDisplay) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        telemetryDisplay.textContent = `// SEC: ${id.toUpperCase()}`;
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}
