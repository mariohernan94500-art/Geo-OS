/**
 * Voren — Centro de Productividad
 * FASE 4: Conectado a GeoCore API con token real (localStorage)
 */
document.addEventListener('DOMContentLoaded', () => {

    // ─── Config ───────────────────────────────────────────────────────────────
    // API_BASE: producción → https://agent.ecoorigenchile.com | local → http://localhost:3000
    const API_BASE = window.GEO_API_BASE || 'https://agent.ecoorigenchile.com';
    let GEO_TOKEN  = localStorage.getItem('geo_token') || '';

    // ─── Persistencia de tareas en localStorage ───────────────────────────────
    function loadTasks() {
        try { return JSON.parse(localStorage.getItem('voren_tasks') || '[]'); } catch { return []; }
    }
    function saveTasks(tasks) { localStorage.setItem('voren_tasks', JSON.stringify(tasks)); }
    let tasks = loadTasks();

    // ─── Render tareas ────────────────────────────────────────────────────────
    function renderTasks() {
        const container = document.getElementById('today-tasks');
        if (!container) return;
        container.innerHTML = '';
        (tasks.length ? tasks : [
            { id: 1, text: 'Configurar Shopify Admin Token en .env', done: false },
            { id: 2, text: 'Generar token JWT y guardarlo aquí', done: false },
            { id: 3, text: 'Desplegar en VPS con Lanzar_Master.bat', done: false },
        ]).forEach(task => {
            const div = document.createElement('div');
            div.className = 'task-item-mini';
            div.innerHTML = `
                <div class="task-checkbox" style="${task.done ? 'background:#00ff88;border-color:#00ff88' : ''}"
                     data-id="${task.id}"></div>
                <span style="${task.done ? 'text-decoration:line-through;opacity:0.5' : ''}">${task.text}</span>
                <span class="task-del" data-id="${task.id}" style="margin-left:auto;cursor:pointer;opacity:0.4;font-size:11px">✕</span>
            `;
            div.querySelector('.task-checkbox').addEventListener('click', () => toggleTask(task.id));
            div.querySelector('.task-del').addEventListener('click', () => deleteTask(task.id));
            container.appendChild(div);
        });
    }

    function addTask(text) {
        tasks.push({ id: Date.now(), text, done: false });
        saveTasks(tasks);
        renderTasks();
    }
    function toggleTask(id) {
        tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
        saveTasks(tasks);
        renderTasks();
    }
    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks(tasks);
        renderTasks();
    }

    // Tecla Enter en campo de nueva tarea
    const newTaskInput = document.getElementById('new-task-input');
    if (newTaskInput) {
        newTaskInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                addTask(e.target.value.trim());
                e.target.value = '';
            }
        });
    }
    renderTasks();

    // ─── Navegación ───────────────────────────────────────────────────────────────
    const navItems   = document.querySelectorAll('.nav-item:not(.nav-link-ext)');
    const viewTitle  = document.getElementById('view-title');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const view = item.getAttribute('data-view');
            if (!view) return;
            if (viewTitle) viewTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1).replace(/-/g,' ');
            document.querySelectorAll('section[id$="-view"]').forEach(p => {
                p.style.display = 'none'; p.classList.remove('active');
            });
            const panel = document.getElementById(`${view}-view`);
            if (panel) {
                panel.style.display = view === 'dashboard' ? 'grid' : 'flex';
                panel.classList.add('active');
            }
        });
    });

    // ─── Sidebar ──────────────────────────────────────────────────────────────
    const sidebar   = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    const openBtn   = document.getElementById('open-sidebar');
    toggleBtn?.addEventListener('click', () => { sidebar.classList.add('collapsed'); openBtn.style.display = 'flex'; });
    openBtn?.addEventListener('click',   () => { sidebar.classList.remove('collapsed'); openBtn.style.display = 'none'; checkStatus(); });

    // ─── Alt+G abre asistente ─────────────────────────────────────────────────
    const geoPanel = document.getElementById('geo-assistant');
    const aiInput  = document.getElementById('ai-input-field');
    document.addEventListener('keydown', e => {
        if (e.altKey && e.key === 'g') {
            geoPanel?.classList.toggle('active');
            if (geoPanel?.classList.contains('active')) aiInput?.focus();
        }
    });
    document.querySelector('.close-btn')?.addEventListener('click', () => geoPanel?.classList.remove('active'));

    // ─── Estado del sistema ───────────────────────────────────────────────────
    const statusDot = document.querySelector('.status-dot');
    async function checkStatus() {
        try {
            const res = await fetch(`${API_BASE}/health`);
            if (res.ok) {
                statusDot.style.background   = '#00ff88';
                statusDot.style.boxShadow    = '0 0 10px #00ff88';
                statusDot.title              = 'GeoCore Online ✅';
            } else throw new Error();
        } catch {
            statusDot.style.background = '#ff4444';
            statusDot.style.boxShadow  = '0 0 10px #ff4444';
            statusDot.title            = 'GeoCore Offline';
        }
    }
    checkStatus();

    // ─── Configurar token desde UI ────────────────────────────────────────────
    const tokenInput = document.getElementById('geo-token-input');
    const tokenBtn   = document.getElementById('save-token-btn');
    if (tokenInput) tokenInput.value = GEO_TOKEN;
    tokenBtn?.addEventListener('click', () => {
        GEO_TOKEN = tokenInput?.value.trim() || '';
        localStorage.setItem('geo_token', GEO_TOKEN);
        tokenBtn.textContent = '✅ Guardado';
        setTimeout(() => tokenBtn.textContent = 'Guardar Token', 1500);
        checkStatus();
    });

    // ─── Llamada a GeoCore API ────────────────────────────────────────────────
    async function geoChat(text, mode = 'productividad') {
        if (!GEO_TOKEN) return '[Sin token] Ve a Ajustes y pega tu token JWT.';
        const res = await fetch(`${API_BASE}/api/chat`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GEO_TOKEN}` },
            body:    JSON.stringify({ texto: text, mode }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        return data.respuesta || '(sin respuesta)';
    }

    function appendMsg(container, role, text) {
        const d = document.createElement('div');
        d.className = `msg${container.id === 'main-chat-history' ? '-main' : ''} ${role}`;
        d.textContent = text;
        container.appendChild(d);
        container.scrollTop = container.scrollHeight;
        return d;
    }

    // ─── Chat principal (dashboard) ───────────────────────────────────────────
    const mainInput   = document.getElementById('main-chat-input');
    const mainSendBtn = document.getElementById('send-main');
    const mainHistory = document.getElementById('main-chat-history');
    const suggestions = document.querySelector('.suggestions-grid');

    async function sendMain(text) {
        if (!text) return;
        appendMsg(mainHistory, 'user', text);
        if (suggestions) suggestions.style.display = 'none';
        const thinking = appendMsg(mainHistory, 'bot thinking', 'Geo trabajando...');
        try {
            const resp = await geoChat(text, 'productividad');
            thinking.className = 'msg-main bot';
            thinking.textContent = resp;
        } catch (err) {
            thinking.className = 'msg-main bot';
            thinking.textContent = `[OFFLINE] ${err.message}`;
        }
        mainHistory.scrollTop = mainHistory.scrollHeight;
    }

    mainSendBtn?.addEventListener('click', () => { sendMain(mainInput.value.trim()); mainInput.value = ''; });
    mainInput?.addEventListener('keypress', e => { if (e.key === 'Enter') { sendMain(mainInput.value.trim()); mainInput.value = ''; } });

    // Chips de sugerencia
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => sendMain(chip.textContent));
    });

    // ─── Chat de panel lateral (Alt+G) ────────────────────────────────────────
    const aiChat   = document.getElementById('ai-chat');
    const sendSide = document.getElementById('send-ai');

    async function sendSideChat(text) {
        if (!text) return;
        appendMsg(aiChat, 'user', text);
        const thinking = appendMsg(aiChat, 'bot thinking', 'Geo está pensando...');
        try {
            const resp = await geoChat(text, 'geo');
            thinking.className = 'msg bot';
            thinking.textContent = resp;
        } catch {
            thinking.className = 'msg bot';
            thinking.textContent = '[OFFLINE] GeoCore no disponible.';
        }
    }

    sendSide?.addEventListener('click', () => { sendSideChat(aiInput?.value.trim()); if (aiInput) aiInput.value = ''; });
    aiInput?.addEventListener('keypress', e => { if (e.key === 'Enter') sendSide?.click(); });

    console.log('🦾 Voren OS v1.1 — Conectado a GeoCore.');
});
