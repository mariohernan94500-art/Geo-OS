/* ============================================================
   VOREN – Application Logic (Full GTD Functionality)
   ============================================================ */

const translations = {
    es: {
        inbox: "Bandeja de entrada", today: "Hoy", upcoming: "Próximamente", anytime: "En cualquier momento", someday: "Algún día", 
        logbook: "Historial", analytics: "Dashboard", habits: "Hábitos", areas: "Áreas", projects: "Proyectos",
        new_task: "Nueva tarea", new_project: "Nuevo proyecto", new_habit: "Nuevo hábito", settings: "Configuración",
        pending: "Pendientes", completed: "Completadas", overdue: "Vencidas", streak: "Días racha",
        morning: "Esta mañana", afternoon: "Esta tarde", evening: "Esta noche", focus: "Enfoque ahora",
        save: "Guardar", cancel: "Cancelar", language: "Idioma", streak_msg: "días seguidos"
    },
    en: {
        inbox: "Inbox", today: "Today", upcoming: "Upcoming", anytime: "Anytime", someday: "Someday", 
        logbook: "Logbook", analytics: "Dashboard", habits: "Habits", areas: "Areas", projects: "Projects",
        new_task: "New Task", new_project: "New Project", new_habit: "New Habit", settings: "Settings",
        pending: "Pending", completed: "Completed", overdue: "Overdue", streak: "Streak",
        morning: "This morning", afternoon: "This afternoon", evening: "This evening", focus: "Focus Now",
        save: "Save", cancel: "Cancel", language: "Language", streak_msg: "days streak"
    },
    fr: {
        inbox: "Boîte de réception", today: "Aujourd'hui", upcoming: "À venir", anytime: "À tout moment", someday: "Un jour", 
        logbook: "Historique", analytics: "Tableau de bord", habits: "Habitudes", areas: "Domaines", projects: "Projets",
        new_task: "Nouvelle tâche", new_project: "Nouveau projet", new_habit: "Nouvelle habitude", settings: "Paramètres",
        pending: "En attente", completed: "Terminé", overdue: "En retard", streak: "Série",
        morning: "Ce matin", afternoon: "Cet après-midi", evening: "Ce soir", focus: "Concentration",
        save: "Enregistrer", cancel: "Annuler", language: "Langue", streak_msg: "jours de suite"
    },
    de: {
        inbox: "Eingang", today: "Heute", upcoming: "Anstehend", anytime: "Jederzeit", someday: "Irgendwann", 
        logbook: "Logbuch", analytics: "Dashboard", habits: "Gewohnheiten", areas: "Bereiche", projects: "Projekte",
        new_task: "Neue Aufgabe", new_project: "Neues Projekt", new_habit: "Neue Gewohnheit", settings: "Einstellungen",
        pending: "Ausstehend", completed: "Abgeschlossen", overdue: "Überfällig", streak: "Serie",
        morning: "Heute Morgen", afternoon: "Heute Nachmittag", evening: "Heute Abend", focus: "Fokus Jetzt",
        save: "Speichern", cancel: "Abbrechen", language: "Sprache", streak_msg: "Tage in Folge"
    },
    pt: {
        inbox: "Entrada", today: "Hoje", upcoming: "Próximos", anytime: "A qualquer momento", someday: "Algum dia", 
        logbook: "Histórico", analytics: "Dashboard", habits: "Hábitos", areas: "Áreas", projects: "Projetos",
        new_task: "Nova tarefa", new_project: "Novo projeto", new_habit: "Novo hábito", settings: "Configurações",
        pending: "Pendentes", completed: "Concluídas", overdue: "Atrasadas", streak: "Série",
        morning: "Esta manhã", afternoon: "Esta tarde", evening: "Esta noite", focus: "Foco agora",
        save: "Salvar", cancel: "Cancelar", language: "Idioma", streak_msg: "dias seguidos"
    },
    zh: {
        inbox: "收件箱", today: "今天", upcoming: "即将到来", anytime: "随时", someday: "某天", 
        logbook: "日志", analytics: "仪表板", habits: "习惯", areas: "领域", projects: "项目",
        new_task: "新任务", new_project: "新项目", new_habit: "新习惯", settings: "设置",
        pending: "待办", completed: "已完成", overdue: "逾期", streak: "连续天数",
        morning: "今天早上", afternoon: "今天下午", evening: "今天晚上", focus: "专注",
        save: "保存", cancel: "取消", language: "语言", streak_msg: "天连续"
    }
};

const STORAGE_KEY = 'voren_app_data';

// --- Default Data ---
const defaultState = {
    tasks: [],
    projects: [
        { id: 1, name: "Proyecto Voren", area: "Trabajo", color: "#8B5CF6", deadline: "" }
    ],
    areas: ["Trabajo", "Personal", "Salud", "Finanzas", "Creativo"],
    habits: [
        { id: 1, name: "Beber agua", emoji: "💧", color: "#06B6D4", streak: 0, history: Array(7).fill(false) },
        { id: 2, name: "Leer 20 min", emoji: "📚", color: "#F97316", streak: 0, history: Array(7).fill(false) }
    ],
    currentView: 'analytics',
    currentLang: 'es',
    streak: 0,
    activeProject: null,
    activeArea: null,
    timer: {
        seconds: 1500, // 25 min
        isRunning: false,
        interval: null
    }
};

let state = loadState();

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateDates();
    renderAll();
    setupEventListeners();
    startHeatmap();
    updateStats();
}

function updateDates() {
    const localeMap = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE', pt: 'pt-PT', zh: 'zh-CN' };
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateText = new Date().toLocaleDateString(localeMap[state.currentLang] || 'es-ES', options);
    const dateEl = document.getElementById('today-date');
    if (dateEl) dateEl.innerText = dateText.charAt(0).toUpperCase() + dateText.slice(1);
}

function t(key) {
    return (translations[state.currentLang] && translations[state.currentLang][key]) || translations['es'][key] || key;
}

function setLanguage(lang) {
    state.currentLang = lang;
    saveState();
    location.reload(); // Reload to refresh all labels easily
}

// --- Persistence ---
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
}

// --- Navigation ---
function switchView(viewId, id = null) {
    state.currentView = viewId;
    
    // Update navigation UI
    document.querySelectorAll('.nav-item, .project-nav-item').forEach(item => {
        const itemDataView = item.getAttribute('data-view');
        const isProject = viewId === 'project' && item.classList.contains('project-nav-item') && item.getAttribute('onclick')?.includes(id);
        const isArea = viewId === 'area' && item.classList.contains('nav-item') && item.getAttribute('onclick')?.includes(`'${id}'`);
        
        item.classList.toggle('active', itemDataView === viewId || isProject || isArea);
    });

    // Hide all views
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    
    if (viewId === 'project' && id) {
        state.activeProject = Number(id);
        renderProjectDetail(Number(id));
        document.getElementById('view-project').classList.remove('hidden');
    } else if (viewId === 'area' && id) {
        state.activeArea = id;
        renderAreaDetail(id);
        document.getElementById('view-project').classList.remove('hidden');
    } else {
        const target = document.getElementById(`view-${viewId}`);
        if (target) target.classList.remove('hidden');
    }

    renderViewContent(viewId);
    saveState();
}

function renderViewContent(viewId) {
    const viewTitles = {
        inbox: t('inbox'),
        today: t('today'),
        upcoming: t('upcoming'),
        anytime: t('anytime'),
        someday: t('someday'),
        analytics: t('analytics'),
        habits: t('habits'),
        logbook: t('logbook'),
        settings: t('settings')
    };
    
    const titleEl = document.querySelector(`#view-${viewId} .view-title`);
    if (titleEl && viewTitles[viewId]) titleEl.innerText = viewTitles[viewId];

    switch(viewId) {
        case 'inbox': renderInbox(); break;
        case 'today': renderTodayTasks(); break;
        case 'upcoming': renderUpcoming(); break;
        case 'anytime': renderAnytime(); break;
        case 'someday': renderSomeday(); break;
        case 'analytics': renderAnalytics(); break;
        case 'habits': renderHabits(); break;
        case 'logbook': renderLogbook(); break;
        case 'settings': renderSettings(); break;
    }

    // Update global buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if (btn.innerText.includes('+')) {
            if (viewId === 'habits') btn.innerHTML = `<span>+</span> ${t('new_habit')}`;
            else btn.innerHTML = `<span>+</span> ${t('new_task')}`;
        }
    });
}

// --- Rendering Logic ---

function renderAll() {
    renderSidebar();
    renderViewContent(state.currentView);
    renderRightPanel();
    updateStats();
}

function renderSidebar() {
    const navPrincipal = document.querySelector('.sidebar-nav .nav-section-label');
    if (navPrincipal) navPrincipal.innerText = t('projects'); // Or just keep labels if they are standard

    // Update static labels in sidebar
    const setLabel = (view, key) => { 
        const el = document.querySelector(`[data-view="${view}"] span:not(.nav-icon):not(.nav-badge)`);
        if (el) el.innerText = t(key);
    };
    setLabel('inbox', 'inbox');
    setLabel('today', 'today');
    setLabel('upcoming', 'upcoming');
    setLabel('anytime', 'anytime');
    setLabel('someday', 'someday');
    setLabel('logbook', 'logbook');
    setLabel('analytics', 'analytics');
    setLabel('habits', 'habits');

    document.querySelectorAll('.nav-section-label').forEach((el, i) => {
        const labels = [t('today'), t('analytics'), t('areas'), t('projects')];
        if (labels[i]) el.innerText = labels[i];
    });

    const areasList = document.getElementById('areas-list');
    if (areasList) {
        areasList.innerHTML = state.areas.map(area => `
            <a class="nav-item ${state.currentView === 'area' && state.activeArea === area ? 'active' : ''}" onclick="switchView('area', '${area}')">
                <span class="nav-icon">📁</span>
                <span>${area}</span>
            </a>
        `).join('');
    }

    const projectsList = document.getElementById('projects-list');
    if (projectsList) {
        projectsList.innerHTML = state.projects.map(p => {
            const tasks = state.tasks.filter(t => t.project === p.id);
            const done = tasks.filter(t => t.completed).length;
            const percent = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);
            return `
            <a class="project-nav-item ${state.currentView === 'project' && state.activeProject === p.id ? 'active' : ''}" onclick="switchView('project', ${p.id})">
                <span class="project-dot" style="background: ${p.color}"></span>
                <span>${p.name}</span>
                <div class="project-nav-progress">
                    <div class="project-nav-progress-fill" style="width: ${percent}%; background: ${p.color}"></div>
                </div>
            </a>
        `}).join('');
    }
    
    const btnProj = document.getElementById('btn-add-project');
    if (btnProj) btnProj.innerHTML = `<span>+</span> ${t('new_project')}`;

    // Fill selects in modals
    const areaSelects = [document.getElementById('task-area-input'), document.getElementById('project-area-input')];
    areaSelects.forEach(sel => {
        if (!sel) return;
        sel.innerHTML = `<option value="">${t('areas')}</option>` + state.areas.map(a => `<option value="${a}">${a}</option>`).join('');
    });

    const projSelect = document.getElementById('task-project-input');
    if (projSelect) {
        projSelect.innerHTML = `<option value="">${t('projects')}</option>` + state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
}

function renderTaskList(containerId, tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="task-card empty" style="opacity: 0.4; border-style: dashed; justify-content: center; background: transparent; cursor: default;">
                <span style="font-size: 13px; color: var(--text-muted)">No hay tareas aquí</span>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-card ${task.completed ? 'done' : ''} priority-${task.priority}" onclick="toggleTask(${task.id})">
            <div class="task-check ${task.completed ? 'checked' : ''}"></div>
            <div class="task-body">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    ${task.project ? `<span class="task-project-badge" style="background: ${getProjectColor(task.project)}20; color: ${getProjectColor(task.project)}">${getProjectName(task.project)}</span>` : ''}
                    ${task.area ? `<span class="task-tag">📁 ${task.area}</span>` : ''}
                    ${task.date ? `<span class="task-date">📅 ${task.date}</span>` : ''}
                </div>
            </div>
            <div class="task-actions" onclick="event.stopPropagation(); deleteTask(${task.id})">🗑️</div>
        </div>
    `).join('');
}

// --- Specific Views ---
function renderInbox() {
    const tasks = state.tasks.filter(t => !t.completed && !t.date && !t.project && !t.bucket);
    renderTaskList('inbox-tasks-list', tasks);
}

function renderTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    const tasks = state.tasks.filter(t => !t.completed && (t.date === today || t.bucket === 'today'));
    
    const labels = document.querySelectorAll('#view-today .group-title');
    if (labels[0]) labels[0].innerText = t('morning');
    if (labels[1]) labels[1].innerText = t('afternoon');
    if (labels[2]) labels[2].innerText = t('evening');

    renderTaskList('morning-tasks', tasks.filter(t => t.timeOfDay === 'morning' || !t.timeOfDay));
    renderTaskList('afternoon-tasks', tasks.filter(t => t.timeOfDay === 'afternoon'));
    renderTaskList('evening-tasks', tasks.filter(t => t.timeOfDay === 'evening'));
}

function renderUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    const tasks = state.tasks.filter(t => !t.completed && t.date && t.date > today);
    
    const groups = {};
    tasks.forEach(t => {
        if (!groups[t.date]) groups[t.date] = [];
        groups[t.date].push(t);
    });

    const sortedDates = Object.keys(groups).sort();
    const container = document.getElementById('upcoming-timeline');
    if (!container) return;

    container.innerHTML = sortedDates.map(date => `
        <div class="timeline-day">
            <div class="timeline-day-header">
                <div class="timeline-date-badge">${date}</div>
                <div class="timeline-count">${groups[date].length} tareas</div>
            </div>
            <div class="timeline-line" id="tasks-for-${date}"></div>
        </div>
    `).join('');

    sortedDates.forEach(date => {
        renderTaskList(`tasks-for-${date}`, groups[date]);
    });
}

function renderAnytime() {
    const tasks = state.tasks.filter(t => !t.completed && (t.bucket === 'anytime' || (!t.date && (t.project || t.area))));
    renderTaskList('anytime-tasks-list', tasks);
}

function renderSomeday() {
    const tasks = state.tasks.filter(t => !t.completed && t.bucket === 'someday');
    renderTaskList('someday-tasks-list', tasks);
}

function renderLogbook() {
    const container = document.getElementById('logbook-container');
    if (!container) return;

    const completed = state.tasks.filter(t => t.completed);
    const groups = {};
    completed.forEach(t => {
        const date = t.completedDate || "Antiguas";
        if (!groups[date]) groups[date] = [];
        groups[date].push(t);
    });

    const sortedDates = Object.keys(groups).sort().reverse();
    container.innerHTML = sortedDates.map(date => `
        <div class="logbook-day">
            <div class="logbook-day-header">
                <span class="logbook-day-date">${date}</span>
                <span class="logbook-day-count">${groups[date].length} completadas</span>
            </div>
            <div class="logbook-tasks" id="logbook-${date}"></div>
        </div>
    `).join('');

    sortedDates.forEach(date => {
        renderTaskList(`logbook-${date}`, groups[date]);
    });
}

function renderProjectDetail(id) {
    const p = state.projects.find(p => p.id === id);
    if (!p) return;

    document.getElementById('project-title').innerText = p.name;
    document.getElementById('project-color-dot').style.background = p.color;
    
    const tasks = state.tasks.filter(t => t.project === id && !t.completed);
    const total = state.tasks.filter(t => t.project === id).length;
    const done = state.tasks.filter(t => t.project === id && t.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const bar = document.getElementById('project-progress-bar');
    if (bar) bar.style.setProperty('--progress', `${percent}%`);
    document.getElementById('project-progress-label').innerText = `${percent}%`;

    renderTaskList('project-tasks-list', tasks);
}

function renderAreaDetail(area) {
    document.getElementById('project-title').innerText = area;
    document.getElementById('project-color-dot').style.background = 'var(--violet)';
    
    const tasks = state.tasks.filter(t => t.area === area && !t.completed);
    const total = state.tasks.filter(t => t.area === area).length;
    const done = state.tasks.filter(t => t.area === area && t.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const bar = document.getElementById('project-progress-bar');
    if (bar) bar.style.setProperty('--progress', `${percent}%`);
    document.getElementById('project-progress-label').innerText = `${percent}%`;

    renderTaskList('project-tasks-list', tasks);
}

// --- Analytics ---
function renderAnalytics() {
    renderWeeklyChart();
    drawDonutChart();
    renderGoals();
}

function renderWeeklyChart() {
    const container = document.getElementById('weekly-chart');
    if (!container) return;
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const stats = Array(7).fill(0);
    const today = new Date();
    
    state.tasks.forEach(t => {
        if (t.completed && t.completedDate) {
            const d = new Date(t.completedDate);
            if ((today - d) / (1000 * 3600 * 24) < 7) stats[d.getDay()]++;
        }
    });

    const max = Math.max(...stats, 1);
    container.innerHTML = days.map((day, i) => `
        <div class="bar-item">
            <span class="bar-value">${stats[i]}</span>
            <div class="bar-fill ${i === today.getDay() ? 'today-bar' : ''}" style="height: ${(stats[i]/max)*100}%"></div>
            <span class="bar-label">${day}</span>
        </div>
    `).join('');
}

function drawDonutChart() {
    const canvas = document.getElementById('donut-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const colors = ['#8B5CF6', '#06B6D4', '#F97316', '#10B981', '#EC4899'];
    const areaStats = state.areas.map(a => ({ name: a, count: state.tasks.filter(t => t.area === a && t.completed).length }));
    const total = areaStats.reduce((a, b) => a + b.count, 0);

    ctx.clearRect(0,0, 200, 200);
    let start = -0.5 * Math.PI;
    areaStats.forEach((s, i) => {
        if (total === 0) return;
        const slice = (s.count / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(100, 100, 80, start, start + slice);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 20;
        ctx.stroke();
        start += slice;
    });

    document.getElementById('donut-legend').innerHTML = areaStats.filter(s => s.count > 0).map((s, i) => `
        <div class="legend-item">
            <span class="legend-dot" style="background: ${colors[i % colors.length]}"></span>
            <span>${s.name}</span>
            <span class="legend-value">${Math.round((s.count/total)*100)}%</span>
        </div>
    `).join('');
}

function renderGoals() {
    const container = document.getElementById('goals-list');
    if (!container) return;
    container.innerHTML = state.projects.map(p => {
        const tasks = state.tasks.filter(t => t.project === p.id);
        const done = tasks.filter(t => t.completed).length;
        const percent = tasks.length === 0 ? 0 : Math.round((done/tasks.length)*100);
        return `
            <div class="goal-item">
                <div class="goal-header"><span>${p.name}</span><span>${percent}%</span></div>
                <div class="goal-bar"><div class="goal-bar-fill" style="width: ${percent}%; background: ${p.color}"></div></div>
            </div>
        `;
    }).join('');
}

function startHeatmap() {
    const container = document.getElementById('heatmap');
    if (!container) return;
    container.innerHTML = Array(52 * 7).fill(0).map(() => `<div class="heatmap-cell level-${Math.floor(Math.random() * 5)}"></div>`).join('');
}

// --- Right Panel ---
function renderRightPanel() {
    const streakDisplay = document.getElementById('panel-streak');
    if (streakDisplay) streakDisplay.innerText = state.streak;
    
    document.querySelectorAll('.panel-title').forEach((el, i) => {
        const titles = [t('streak'), t('today'), t('focus'), t('upcoming')];
        if (titles[i]) el.innerText = titles[i];
    });

    const streakLabel = document.querySelector('.streak-label');
    if (streakLabel) streakLabel.innerText = t('streak_msg').split(' ')[0]; // dias

    const miniBars = document.getElementById('mini-bars');
    if (miniBars) {
        miniBars.innerHTML = Array(7).fill(0).map((_, i) => `<div class="mini-bar-wrap"><div class="mini-bar" style="height: ${Math.random()*100}%"></div></div>`).join('');
    }
    
    const upcomingMini = document.getElementById('upcoming-mini');
    const tasks = state.tasks.filter(t => !t.completed && t.date).sort((a,b) => a.date > b.date ? 1 : -1).slice(0, 3);
    if (upcomingMini) upcomingMini.innerHTML = tasks.map(t => `<div class="upcoming-mini-item"><span>${t.title}</span><span class="upcoming-mini-date">${t.date}</span></div>`).join('');

    const timerBtn = document.getElementById('timer-start-btn');
    if (timerBtn && !state.timer.isRunning) timerBtn.innerText = `▶ ${t('morning').split(' ')[0]}`; // Start
}

function renderSettings() {
    const container = document.getElementById('settings-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-card">
            <h3>${t('language')}</h3>
            <div class="modal-field">
                <select class="modal-input" onchange="setLanguage(this.value)">
                    <option value="es" ${state.currentLang === 'es' ? 'selected' : ''}>Español</option>
                    <option value="en" ${state.currentLang === 'en' ? 'selected' : ''}>English</option>
                    <option value="fr" ${state.currentLang === 'fr' ? 'selected' : ''}>Français</option>
                    <option value="de" ${state.currentLang === 'de' ? 'selected' : ''}>Deutsch</option>
                    <option value="pt" ${state.currentLang === 'pt' ? 'selected' : ''}>Português</option>
                    <option value="zh" ${state.currentLang === 'zh' ? 'selected' : ''}>中文</option>
                </select>
            </div>
        </div>
        <div class="settings-card">
            <h3>Notificaciones</h3>
            <div class="settings-row">
                <span class="settings-label">Recordatorios hoy</span>
                <div class="toggle on"></div>
            </div>
        </div>
    `;
}

// --- Stats & Badges ---
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = state.tasks.filter(t => t.completed && t.completedDate === today).length;
    const totalToday = state.tasks.filter(t => t.date === today || t.bucket === 'today').length;
    
    document.getElementById('badge-inbox').innerText = state.tasks.filter(t => !t.completed && !t.date && !t.project && !t.bucket).length;
    document.getElementById('badge-today').innerText = state.tasks.filter(t => !t.completed && (t.date === today || t.bucket === 'today')).length;
    document.getElementById('badge-upcoming').innerText = state.tasks.filter(t => !t.completed && t.date && t.date > today).length;
    document.getElementById('badge-anytime').innerText = state.tasks.filter(t => !t.completed && (t.bucket === 'anytime' || (!t.date && (t.project || t.area)))).length;
    document.getElementById('badge-someday').innerText = state.tasks.filter(t => !t.completed && t.bucket === 'someday').length;

    // Rings & KPI
    const ring = document.getElementById('today-ring');
    const percent = totalToday === 0 ? 0 : (completedToday / totalToday) * 100;
    if (ring) ring.style.strokeDashoffset = 314 - (314 * percent / 100);
    
    document.getElementById('ring-done').innerText = completedToday;
    document.getElementById('ring-total').innerText = `/ ${totalToday}`;
    document.getElementById('stat-done').innerText = state.tasks.filter(t => t.completed).length;
    document.getElementById('stat-pending').innerText = state.tasks.filter(t => !t.completed).length;
}

// --- Actions ---
function toggleTask(id) {
    const t = state.tasks.find(x => x.id === id);
    if (t) {
        t.completed = !t.completed;
        t.completedDate = t.completed ? new Date().toISOString().split('T')[0] : null;
        if (t.completed) showToast("¡Tarea completada! 🎉");
        saveState();
        renderAll();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    renderAll();
    showToast("Tarea eliminada");
}

function addTask() {
    const title = document.getElementById('task-title-input').value.trim();
    if (!title) return;
    
    const newTask = {
        id: Date.now(),
        title,
        notes: document.getElementById('task-notes-input').value,
        date: document.getElementById('task-date-input').value,
        area: document.getElementById('task-area-input').value,
        project: Number(document.getElementById('task-project-input').value) || null,
        priority: document.getElementById('task-priority-input').value,
        completed: false,
        bucket: state.currentView === 'someday' ? 'someday' : (state.currentView === 'anytime' ? 'anytime' : null)
    };

    state.tasks.push(newTask);
    saveState();
    closeModal('modal-add-task');
    renderAll();
    showToast("Tarea añadida");
}

function addProject() {
    const name = document.getElementById('project-name-input').value.trim();
    if (!name) return;
    state.projects.push({ id: Date.now(), name, area: document.getElementById('project-area-input').value, color: '#8B5CF6' });
    saveState();
    closeModal('modal-add-project');
    renderSidebar();
}

function toggleHabit(id) {
    const h = state.habits.find(x => x.id === id);
    if (h) { h.history[6] = !h.history[6]; h.streak += h.history[6] ? 1 : -1; saveState(); renderHabits(); }
}

// --- Timer ---
function toggleTimer() {
    if (state.timer.isRunning) { clearInterval(state.timer.interval); state.timer.isRunning = false; }
    else { 
        state.timer.isRunning = true; 
        state.timer.interval = setInterval(() => { state.timer.seconds--; updateTimerDisplay(); if (state.timer.seconds <= 0) { clearInterval(state.timer.interval); state.timer.isRunning = false; showToast("¡Tiempo!"); } }, 1000);
    }
}
function updateTimerDisplay() { const m = Math.floor(state.timer.seconds/60); const s = state.timer.seconds % 60; document.getElementById('timer-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`; }
function resetTimer() { clearInterval(state.timer.interval); state.timer.isRunning = false; state.timer.seconds = 1500; updateTimerDisplay(); }

// --- UI Helpers ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isMobile = window.innerWidth <= 1024;
    
    if (isMobile) {
        sidebar.classList.toggle('active');
    } else {
        sidebar.classList.toggle('hidden-sidebar');
    }
}

function showAddTaskModal(bucket) { 
    const modal = document.getElementById('modal-add-task');
    modal.classList.remove('hidden'); 
    document.querySelector('#modal-add-task .modal-title').innerText = t('new_task');
    document.querySelector('#modal-add-task .btn-primary').innerText = t('save');
    document.querySelector('#modal-add-task .btn-ghost').innerText = t('cancel');
    document.getElementById('task-title-input').focus(); 
}

function showAddProjectModal() { 
    const modal = document.getElementById('modal-add-project');
    modal.classList.remove('hidden'); 
    document.querySelector('#modal-add-project .modal-title').innerText = t('new_project');
    document.querySelector('#modal-add-project .btn-primary').innerText = t('save');
    document.querySelector('#modal-add-project .btn-ghost').innerText = t('cancel');
}
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function showToast(m) { const t = document.getElementById('toast'); t.innerText = m; t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 3000); }
function getProjectColor(id) { return state.projects.find(p => p.id === id)?.color || '#fff'; }
function getProjectName(id) { return state.projects.find(p => p.id === id)?.name || ''; }
function setupEventListeners() { 
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden')); });
}
