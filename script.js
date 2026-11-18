
"use strict";

/* ==========================================
   ROSCOE V3 - COMPLETE APPLICATION
========================================== */

const $ = selector => document.querySelector(selector);

const STORAGE_KEY = "roscoeAppDataV3";

const defaultData = {
    profile: {
        name: "",
        email: "",
        education: "",
        skills: [],
        goals: "",
        target: "",
        bio: ""
    },

    tasks: [],

    challenges: [],

    skills: [],

    planner: [],

    resume: {
        objective: "",
        projects: "",
        experience: "",
        education: ""
    },

    chatHistory: [],

    interviewHistory: []
};

let data = loadData();
let currentPage = "dashboard";

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (!saved) return clone(defaultData);

        return {
            ...clone(defaultData),
            ...saved,
            profile: {
                ...defaultData.profile,
                ...(saved.profile || {})
            },
            resume: {
                ...defaultData.resume,
                ...(saved.resume || {})
            }
        };
    } catch (error) {
        console.error("Storage error:", error);
        return clone(defaultData);
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function showDate() {
    const date = $("#today-date");

    if (date) {
        date.textContent = new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    }
}

function navigate(page) {
    const validPages = [
        "dashboard",
        "profile",
        "challenges",
        "learning",
        "interview",
        "career",
        "resume",
        "planner",
        "settings"
    ];

    if (!validPages.includes(page)) return;

    currentPage = page;

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    const title = page
        .replace(/^./, char => char.toUpperCase())
        .replace(/([A-Z])/g, " $1")
        .trim();

    $("#page-title").textContent = title;

    renderPage();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================
   DASHBOARD
========================================== */

function renderDashboard() {
    const completed = data.tasks.filter(task => task.done).length;

    const totalTasks = data.tasks.length;

    const learned = data.skills.filter(skill => skill.learned).length;

    const challengesDone =
        data.challenges.filter(item => item.done).length;

    const progress = totalTasks
        ? Math.round(completed / totalTasks * 100)
        : 0;

    return `
        <section class="hero-card">
            <span class="tag">✦ YOUR PERSONAL GROWTH OS</span>

            <h2>
                Welcome back, ${escapeHTML(data.profile.name || "Boss")}.
                <br>Let's build your next level.
            </h2>

            <p>
                Your goals, learning, career preparation and daily
                actions in one place. Small consistent steps create
                meaningful progress.
            </p>

            <div class="button-row">
                <button class="btn btn-primary"
                    onclick="navigate('planner')">
                    Open my planner ↗
                </button>

                <button class="btn"
                    onclick="navigate('learning')">
                    Continue learning
                </button>
            </div>
        </section>

        <div class="section-heading">
            <h2>Your overview</h2>
            <p>A quick look at your current progress.</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <span>TASKS COMPLETED</span>
                <strong>${completed}/${totalTasks}</strong>
                <small>${progress}% completion</small>
            </div>

            <div class="stat-card">
                <span>LEARNING PROGRESS</span>
                <strong>${learned}</strong>
                <small>Skills marked as learned</small>
            </div>

            <div class="stat-card">
                <span>DAILY CHALLENGES</span>
                <strong>${challengesDone}</strong>
                <small>Challenges completed</small>
            </div>
        </div>

        <div class="section-heading">
            <h2>Your personal workspace</h2>
            <p>Choose what you want to work on next.</p>
        </div>

        <div class="workspace-grid">
            ${workspaceCard("⌘","Learning Studio",
                "Build skills and create your learning roadmap.",
                "learning")}

            ${workspaceCard("↗","Career Navigator",
                "Understand your career readiness.",
                "career")}

            ${workspaceCard("◎","Interview Arena",
                "Practise skill-based interview questions.",
                "interview")}

            ${workspaceCard("▦","Life Planner",
                "Organize your daily activities.",
                "planner")}

            ${workspaceCard("▤","Smart Resume",
                "Maintain your career information.",
                "resume")}

            ${workspaceCard("⚡","Daily Challenges",
                "Complete useful daily missions.",
                "challenges")}
        </div>
    `;
}

function workspaceCard(icon, title, description, page) {
    return `
        <div class="workspace-card" onclick="navigate('${page}')">
            <div class="workspace-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    `;
}

/* ==========================================
   PROFILE
========================================== */

function renderProfile() {
    const p = data.profile;

    return `
        <div class="page-intro">
            <h2>My Profile</h2>
            <p class="muted">
                Tell ROSCOE about your education, skills and goals.
            </p>
        </div>

        <form id="profile-form" class="card">
            <div class="form-grid">

                <div class="field">
                    <label>Full name</label>
                    <input name="name"
                        value="${escapeHTML(p.name)}"
                        placeholder="Your name">
                </div>

                <div class="field">
                    <label>Email</label>
                    <input name="email" type="email"
                        value="${escapeHTML(p.email)}"
                        placeholder="Your email">
                </div>

                <div class="field">
                    <label>Education</label>
                    <input name="education"
                        value="${escapeHTML(p.education)}"
                        placeholder="B.Tech AI & ML">
                </div>

                <div class="field">
                    <label>Target career</label>
                    <input name="target"
                        value="${escapeHTML(p.target)}"
                        placeholder="AI Engineer">
                </div>
            </div>

            <div class="field">
                <label>Your skills (comma separated)</label>
                <input name="skills"
                    value="${escapeHTML(p.skills.join(", "))}"
                    placeholder="Python, Java, Machine Learning">
            </div>

            <div class="field">
                <label>Your goals</label>
                <textarea name="goals"
                    placeholder="What do you want to achieve?">${escapeHTML(p.goals)}</textarea>
            </div>

            <div class="field">
                <label>About yourself</label>
                <textarea name="bio"
                    placeholder="Tell ROSCOE about yourself...">${escapeHTML(p.bio)}</textarea>
            </div>

            <button class="btn btn-primary">Save profile</button>
        </form>

        <div class="card">
            <h3>Your saved skills</h3>
            <div class="tag-list">
                ${p.skills.length
                    ? p.skills.map(s => `<span>${escapeHTML(s)}</span>`).join("")
                    : "<span>No skills added yet</span>"}
            </div>
        </div>
    `;
}

/* ==========================================
   DAILY CHALLENGES
========================================== */

function renderChallenges() {
    return `
        <div class="page-intro">
            <h2>Daily Challenges</h2>
            <p class="muted">
                Build consistency through small practical missions.
            </p>
        </div>

        <form id="challenge-form" class="card">
            <div class="field">
                <label>New challenge</label>
                <input name="title" required
                    placeholder="Example: Practise Python for 30 minutes">
            </div>
            <button class="btn btn-primary">Add challenge</button>
        </form>

        <div class="card">
            <h3>Your challenges</h3>
            <div class="item-list">
                ${data.challenges.length
                    ? data.challenges.map((item,index) => `
                        <div class="list-item ${item.done ? "done" : ""}">
                            <div>
                                <div class="item-title">${escapeHTML(item.title)}</div>
                                <div class="item-subtitle">
                                    ${item.done ? "Completed" : "Pending"}
                                </div>
                            </div>

                            <button class="btn"
                                onclick="toggleChallenge(${index})">
                                ${item.done ? "Undo" : "Complete"}
                            </button>
                        </div>
                    `).join("")
                    : '<div class="empty-state">No challenges yet. Add your first mission.</div>'}
            </div>
        </div>
    `;
}

function toggleChallenge(index) {
    data.challenges[index].done = !data.challenges[index].done;
    saveData();
    renderPage();
}

/* ==========================================
   LEARNING PATH
========================================== */

function renderLearning() {
    const learned = data.skills.filter(s => s.learned).length;

    const percent = data.skills.length
        ? Math.round(learned / data.skills.length * 100)
        : 0;

    return `
        <div class="page-intro">
            <h2>Learning Path</h2>
            <p class="muted">
                Track your current skills and the skills you want to learn.
            </p>
        </div>

        <div class="card">
            <h3>Your learning progress</h3>
            <strong>${percent}%</strong>
            <div class="progress-track">
                <div class="progress-fill" style="width:${percent}%"></div>
            </div>
            <p class="muted small">
                ${learned} of ${data.skills.length} skills completed
            </p>
        </div>

        <form id="skill-form" class="card">
            <div class="field">
                <label>Skill name</label>
                <input name="skill" required
                    placeholder="Python, SQL, Machine Learning...">
            </div>
            <div class="field">
                <label>Learning level</label>
                <select name="level">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                </select>
            </div>
            <button class="btn btn-primary">Add skill</button>
        </form>

        <div class="card">
            <h3>Your skills</h3>
            <div class="item-list">
                ${data.skills.length
                    ? data.skills.map((skill,index) => `
                        <div class="list-item ${skill.learned ? "done" : ""}">
                            <div>
                                <div class="item-title">${escapeHTML(skill.name)}</div>
                                <div class="item-subtitle">
                                    ${escapeHTML(skill.level)}
                                </div>
                            </div>

                            <button class="btn"
                                onclick="toggleSkill(${index})">
                                ${skill.learned ? "Learned" : "Mark learned"}
                            </button>
                        </div>
                    `).join("")
                    : '<div class="empty-state">Add your first skill to begin.</div>'}
            </div>
        </div>
    `;
}

function toggleSkill(index) {
    data.skills[index].learned = !data.skills[index].learned;
    saveData();
    renderPage();
}

/* ==========================================
   INTERVIEW ARENA
========================================== */

function renderInterview() {
    return `
        <div class="page-intro">
            <h2>Interview Arena</h2>
            <p class="muted">
                Practise interviews based on the exact skill you choose.
            </p>
        </div>

        <div class="card">
            <h3>Start an AI interview</h3>

            <form id="interview-form">
                <div class="field">
                    <label>Choose your skill</label>
                    <input name="skill" required
                        placeholder="Example: Python, Java, Machine Learning">
                </div>

                <div class="field">
                    <label>Interview difficulty</label>
                    <select name="level">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                    </select>
                </div>

                <div class="field">
                    <label>Interview type</label>
                    <select name="type">
                        <option>Technical</option>
                        <option>Conceptual</option>
                        <option>Practical</option>
                        <option>Mixed</option>
                    </select>
                </div>

                <button class="btn btn-primary">
                    Start interview
                </button>
            </form>
        </div>

        <div class="card">
            <h3>How it works</h3>
            <p class="muted">
                ROSCOE asks one question at a time, evaluates your
                answer, provides feedback and adjusts the next question
                based on your performance.
            </p>
        </div>

        <div class="card" id="interview-session">
            <h3>Interview session</h3>
            <p class="muted">Your interview will appear here.</p>
        </div>

        <div class="card">
            <h3>Interview history</h3>
            ${data.interviewHistory.length
                ? data.interviewHistory.slice(-10).reverse().map(item => `
                    <div class="list-item">
                        <div class="item-title">${escapeHTML(item.skill)}</div>
                        <div class="item-subtitle">${escapeHTML(item.date)}</div>
                    </div>
                `).join("")
                : '<p class="muted">No interviews recorded yet.</p>'}
        </div>
    `;
}

/* ==========================================
   CAREER READINESS
========================================== */

function renderCareer() {
    const p = data.profile;

    const checklist = [
        ["Profile completed", !!p.name && !!p.education],
        ["Skills added", p.skills.length > 0],
        ["Learning path started", data.skills.length > 0],
        ["Project experience recorded", !!data.resume.projects],
        ["Career target selected", !!p.target]
    ];

    const score = Math.round(
        checklist.filter(item => item[1]).length /
        checklist.length * 100
    );

    return `
        <div class="page-intro">
            <h2>Career Readiness</h2>
            <p class="muted">
                Review the preparation steps for your target career.
            </p>
        </div>

        <div class="card">
            <h3>Career preparation score</h3>
            <strong style="font-size:36px">${score}%</strong>

            <div class="progress-track">
                <div class="progress-fill" style="width:${score}%"></div>
            </div>

            <p class="muted small">
                This is a checklist completion score, not a job placement prediction.
            </p>
        </div>

        <div class="card">
            <h3>Your preparation checklist</h3>
            ${checklist.map(item => `
                <div class="list-item">
                    <span class="item-title">${item[0]}</span>
                    <span>${item[1] ? "✓ Complete" : "○ Pending"}</span>
                </div>
            `).join("")}
        </div>

        <div class="card">
            <h3>Your target role</h3>
            <p>${escapeHTML(p.target || "Not selected yet")}</p>
            <p class="muted small">
                Add your target role and skills in My Profile.
            </p>
        </div>
    `;
}

/* ==========================================
   SMART RESUME
========================================== */

function renderResume() {
    const r = data.resume;
    const p = data.profile;

    return `
        <div class="page-intro">
            <h2>Smart Resume</h2>
            <p class="muted">
                Maintain your professional information.
            </p>
        </div>

        <form id="resume-form" class="card">

            <div class="field">
                <label>Career objective</label>
                <textarea name="objective"
                    placeholder="Write your professional objective">${escapeHTML(r.objective)}</textarea>
            </div>

            <div class="field">
                <label>Projects</label>
                <textarea name="projects"
                    placeholder="Mention your projects and contributions">${escapeHTML(r.projects)}</textarea>
            </div>

            <div class="field">
                <label>Experience</label>
                <textarea name="experience"
                    placeholder="Internship or work experience">${escapeHTML(r.experience)}</textarea>
            </div>

            <div class="field">
                <label>Education</label>
                <textarea name="education"
                    placeholder="Your education">${escapeHTML(r.education)}</textarea>
            </div>

            <button class="btn btn-primary">Save resume</button>
            <button type="button" class="btn"
                onclick="downloadResume()">Download resume</button>
        </form>

        <div class="card">
            <h3>Resume preview</h3>
            <h2>${escapeHTML(p.name || "Your Name")}</h2>
            <p class="muted">${escapeHTML(p.email)}</p>
            <p>${escapeHTML(r.objective)}</p>
            <h3>Skills</h3>
            <p>${escapeHTML(p.skills.join(", "))}</p>
            <h3>Projects</h3>
            <p>${escapeHTML(r.projects)}</p>
            <h3>Experience</h3>
            <p>${escapeHTML(r.experience)}</p>
            <h3>Education</h3>
            <p>${escapeHTML(r.education || p.education)}</p>
        </div>
    `;
}

function downloadResume() {
    const p = data.profile;
    const r = data.resume;

    const content = `
${p.name}
${p.email}

CAREER OBJECTIVE
${r.objective}

EDUCATION
${r.education || p.education}

SKILLS
${p.skills.join(", ")}

PROJECTS
${r.projects}

EXPERIENCE
${r.experience}
`;

    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "ROSCOE-Resume.txt";
    a.click();

    URL.revokeObjectURL(url);
}

/* ==========================================
   LIFE PLANNER
========================================== */

function renderPlanner() {
    return `
        <div class="page-intro">
            <h2>Life Planner</h2>
            <p class="muted">
                Organize your day and track your progress.
            </p>
        </div>

        <form id="task-form" class="card">
            <div class="field">
                <label>Task name</label>
                <input name="title" required
                    placeholder="What do you want to complete?">
            </div>

            <div class="field">
                <label>Due date</label>
                <input name="date" type="date">
            </div>

            <button class="btn btn-primary">Add task</button>
        </form>

        <div class="card">
            <h3>Your tasks</h3>

            <div class="item-list">
                ${data.tasks.length
                    ? data.tasks.map((task,index) => `
                        <div class="list-item ${task.done ? "done" : ""}">
                            <div>
                                <div class="item-title">${escapeHTML(task.title)}</div>
                                <div class="item-subtitle">
                                    ${escapeHTML(task.date || "No deadline")}
                                </div>
                            </div>

                            <button class="btn"
                                onclick="toggleTask(${index})">
                                ${task.done ? "Undo" : "Complete"}
                            </button>
                        </div>
                    `).join("")
                    : '<div class="empty-state">Your planner is empty.</div>'}
            </div>
        </div>
    `;
}

function toggleTask(index) {
    data.tasks[index].done = !data.tasks[index].done;
    saveData();
    renderPage();
}

/* ==========================================
   SETTINGS
========================================== */

function renderSettings() {
    return `
        <div class="page-intro">
            <h2>Settings</h2>
            <p class="muted">
                Manage your local data and preferences.
            </p>
        </div>

        <div class="card">
            <h3>Voice assistant</h3>
            <p class="muted">
                Enable microphone access once per browser session.
                Say Hello ROSCOE to activate the assistant.
            </p>

            <div class="button-row">
                <button class="btn btn-primary"
                    onclick="enableVoice()">
                    Enable voice
                </button>

                <button class="btn"
                    onclick="disableVoice()">
                    Turn voice off
                </button>
            </div>
        </div>

        <div class="card">
            <h3>Data & privacy</h3>
            <p class="muted small">
                Your profile, tasks, learning records and chat history
                are saved in this browser using localStorage.
                They are not automatically synchronized to other devices.
            </p>

            <div class="button-row">
                <button class="btn" onclick="exportData()">
                    Export my data
                </button>

                <button class="btn btn-danger" onclick="resetData()">
                    Reset all data
                </button>
            </div>
        </div>

        <div class="card">
            <h3>About ROSCOE</h3>
            <p class="muted">
                ROSCOE is your personal life and career companion,
                powered by a connected AI model.
            </p>
            <span class="tag">ROSCOE V3.0</span>
        </div>
    `;
}

/* ==========================================
   PAGE RENDERER
========================================== */

function renderPage() {
    const content = $("#app-content");

    const renderers = {
        dashboard: renderDashboard,
        profile: renderProfile,
        challenges: renderChallenges,
        learning: renderLearning,
        interview: renderInterview,
        career: renderCareer,
        resume: renderResume,
        planner: renderPlanner,
        settings: renderSettings
    };

    content.innerHTML = renderers[currentPage]();
}

/* ==========================================
   FORM HANDLERS
========================================== */

document.addEventListener("click", event => {
    const nav = event.target.closest("[data-page]");

    if (nav) navigate(nav.dataset.page);
});

document.addEventListener("submit", async event => {
    const form = event.target;

    if (form.id === "profile-form") {
        event.preventDefault();

        const fd = new FormData(form);

        data.profile = {
            name: fd.get("name").trim(),
            email: fd.get("email").trim(),
            education: fd.get("education").trim(),
            target: fd.get("target").trim(),
            skills: fd.get("skills")
                .split(",")
                .map(s => s.trim())
                .filter(Boolean),
            goals: fd.get("goals").trim(),
            bio: fd.get("bio").trim()
        };

        saveData();
        renderPage();
        roscoeSay("Your profile has been saved.");
    }

    if (form.id === "challenge-form") {
        event.preventDefault();

        const title = new FormData(form).get("title").trim();

        if (!title) return;

        data.challenges.push({
            title,
            done: false
        });

        saveData();
        renderPage();
    }

    if (form.id === "skill-form") {
        event.preventDefault();

        const fd = new FormData(form);

        data.skills.push({
            name: fd.get("skill").trim(),
            level: fd.get("level"),
            learned: false
        });

        saveData();
        renderPage();
    }

    if (form.id === "task-form") {
        event.preventDefault();

        const fd = new FormData(form);

        data.tasks.push({
            title: fd.get("title").trim(),
            date: fd.get("date"),
            done: false
        });

        saveData();
        renderPage();
    }

    if (form.id === "resume-form") {
        event.preventDefault();

        const fd = new FormData(form);

        data.resume = {
            objective: fd.get("objective"),
            projects: fd.get("projects"),
            experience: fd.get("experience"),
            education: fd.get("education")
        };

        saveData();
        renderPage();
        roscoeSay("Your resume information has been saved.");
    }

    if (form.id === "interview-form") {
        event.preventDefault();

        const fd = new FormData(form);

        const skill = fd.get("skill").trim();
        const level = fd.get("level");
        const type = fd.get("type");

        if (!skill) return;

        const session = {
            skill,
            level,
            type,
            date: new Date().toLocaleDateString()
        };

        data.interviewHistory.push(session);
        saveData();

        const sessionBox = $("#interview-session");

        sessionBox.innerHTML = `
            <h3>Interview started: ${escapeHTML(skill)}</h3>
            <p class="muted">
                ${escapeHTML(level)} · ${escapeHTML(type)}
            </p>
            <p class="muted">
                ROSCOE is preparing your first question...
            </p>
        `;

        const prompt = `
Start a ${level} level ${type} interview on ${skill}.
Ask one question at a time.
Wait for my answer, evaluate it, explain mistakes,
and continue with a relevant next question.
Start with the first question now.
`;

        await sendToAI(prompt);
    }

    if (form.id === "roscoe-chat-form") {
        event.preventDefault();
        const input = $("#roscoe-chat-input");
        const message = input.value.trim();

        if (!message) return;

        input.value = "";
        await sendToAI(message);
    }
});

/* ==========================================
   AI CONVERSATION
========================================== */

function getAIHistory() {
    return data.chatHistory.slice(-12).map(item => ({
        role: "user",
        text: item.message
    })).flat();
}

async function sendToAI(message, options = {}) {
    const bot = $("#bot-message");

    if (!message) return;

    bot.textContent = "You: " + message;

    setAvatarState("thinking", "ROSCOE IS THINKING");

    try {
        const history = data.chatHistory.slice(-12).flatMap(item => [
            { role: "user", text: item.message },
            { role: "assistant", text: item.reply }
        ]);

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                profile: data.profile,
                history
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "AI request failed.");
        }

        const reply = result.reply;

        if (!reply) throw new Error("Empty AI response.");

        data.chatHistory.push({
            message,
            reply,
            timestamp: new Date().toISOString()
        });

        data.chatHistory = data.chatHistory.slice(-50);

        saveData();

        roscoeSay(reply);

        if (voiceState.enabled && !voiceState.muted) {
            await speak(reply);
        } else {
            setAvatarState("idle", "AI COMPANION ACTIVE");
        }

        return reply;

    } catch (error) {
        console.error("ROSCOE AI:", error);

        const message =
            "I couldn't connect to my AI service. " +
            "Please check that the ROSCOE server is running and your API key is configured.";

        roscoeSay(message);

        setAvatarState("idle", "AI CONNECTION ERROR");

        return null;
    }
}

/* ==========================================
   COMPANION QUICK ACTIONS
========================================== */

function roscoeSay(message) {
    const box = $("#bot-message");

    if (box) box.textContent = message;
}

function roscoeReply(type) {
    const prompts = {
        motivation: "Motivate me with practical advice based on my goals.",
        challenge: "Give me a new useful daily challenge based on my skills.",
        career: "Give me personalized career guidance based on my profile."
    };

    sendToAI(prompts[type] || "How can you help me today?");
}

/* ==========================================
   AVATAR STATE
========================================== */

function setAvatarState(state, label) {
    const avatar = $("#roscoe-avatar");
    const status = $("#avatar-state");

    if (avatar) {
        avatar.classList.remove(
            "speaking",
            "thinking",
            "listening"
        );

        if (state !== "idle") {
            avatar.classList.add(state);
        }
    }

    if (status) status.textContent = label;
}

/* ==========================================
   VOICE ASSISTANT
========================================== */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

const voiceState = {
    enabled: false,
    awake: false,
    busy: false,
    speaking: false,
    muted: false,
    running: false,
    recognition: null,
    restartTimer: null,
    sleepTimer: null,
    voices: []
};

function updateVoiceUI() {
    const button = $("#voice-toggle");

    if (button) {
        button.textContent = voiceState.enabled
            ? "🎙 Voice ON"
            : "🎙 Enable voice";

        button.classList.toggle("active", voiceState.enabled);
    }

    const mute = $("#voice-mute");

    if (mute) {
        mute.textContent = voiceState.muted
            ? "🔇 Unmute"
            : "🔊 Mute";
    }
}

function setVoiceStatus(message, mode = "") {
    const text = $("#voice-status-text");
    const status = $("#voice-status");

    if (text) text.textContent = message;

    if (status) {
        status.className = "voice-status " + mode;
    }
}

function loadSpeechVoices() {
    if (!window.speechSynthesis) return;

    voiceState.voices = window.speechSynthesis.getVoices();
}

if (window.speechSynthesis) {
    loadSpeechVoices();
    window.speechSynthesis.onvoiceschanged = loadSpeechVoices;
}

/* Select an available voice. Actual voice gender depends on the OS. */

function chooseVoice(text) {
    const isHindi = /[\u0900-\u097F]/.test(text);

    const voices = voiceState.voices;

    if (isHindi) {
        return voices.find(v => /hi-IN/i.test(v.lang));
    }

    return voices.find(v =>
        /female|zira|samantha|aria|jenny|neerja/i.test(v.name)
    ) || voices.find(v => /en-IN/i.test(v.lang));
}

/* TEXT TO SPEECH */

function speak(text) {
    return new Promise(resolve => {
        if (!window.speechSynthesis || voiceState.muted) {
            resolve();
            return;
        }

        window.speechSynthesis.cancel();

        voiceState.speaking = true;

        if (voiceState.recognition && voiceState.running) {
            try {
                voiceState.recognition.stop();
            } catch {}
        }

        const utterance = new SpeechSynthesisUtterance(text);

        const voice = chooseVoice(text);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = /[\u0900-\u097F]/.test(text)
                ? "hi-IN"
                : "en-IN";
        }

        utterance.rate = 1;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        setAvatarState("speaking", "ROSCOE IS SPEAKING");
        setVoiceStatus("ROSCOE is speaking...", "speaking");

        function finished() {
            voiceState.speaking = false;
            setAvatarState("idle", "AI COMPANION ACTIVE");
            resolve();

            if (voiceState.enabled) {
                setTimeout(startRecognition, 500);
            }
        }

        utterance.onend = finished;
        utterance.onerror = finished;

        window.speechSynthesis.speak(utterance);
    });
}

/* SPEECH RECOGNITION */

function createRecognition() {
    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        voiceState.running = true;

        if (!voiceState.busy && !voiceState.speaking) {
            setVoiceStatus(
                voiceState.awake
                    ? "Listening to your message..."
                    : 'Listening for "Hello ROSCOE"...',
                "listening"
            );

            setAvatarState("listening", "LISTENING");
        }
    };

    recognition.onresult = event => {
        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            if (!event.results[i].isFinal) continue;

            const transcript =
                event.results[i][0].transcript.trim();

            if (transcript) handleVoiceInput(transcript);
        }
    };

    recognition.onerror = event => {
        console.warn("Speech recognition:", event.error);

        if (event.error === "not-allowed" ||
            event.error === "service-not-allowed") {

            voiceState.enabled = false;
            updateVoiceUI();

            setVoiceStatus(
                "Microphone permission denied.",
                "error"
            );
        }
    };

    recognition.onend = () => {
        voiceState.running = false;

        if (voiceState.enabled &&
            !voiceState.speaking &&
            !voiceState.busy) {

            clearTimeout(voiceState.restartTimer);

            voiceState.restartTimer = setTimeout(
                startRecognition,
                700
            );
        }
    };

    voiceState.recognition = recognition;

    return true;
}

function startRecognition() {
    if (!voiceState.enabled ||
        !voiceState.recognition ||
        voiceState.running ||
        voiceState.busy ||
        voiceState.speaking) {
        return;
    }

    try {
        voiceState.recognition.start();
    } catch (error) {
        console.warn("Recognition restart:", error);
    }
}

/* WAKE WORD HANDLER */

function wakeRoscoe(command = "") {
    voiceState.awake = true;

    clearTimeout(voiceState.sleepTimer);

    voiceState.sleepTimer = setTimeout(() => {
        voiceState.awake = false;

        if (voiceState.enabled) {
            setVoiceStatus(
                'Listening for "Hello ROSCOE"...',
                "listening"
            );
        }
    }, 60000);

    if (command) {
        speak("Hey Boss!").then(() => sendToAI(command));
    } else {
        speak("Hey Boss! How can I help you?");
    }
}

function handleVoiceInput(transcript) {
    const wakePattern = /\bhello\s+roscoe\b/i;

    if (!voiceState.awake) {
        const match = transcript.match(wakePattern);

        if (!match) return;

        const command = transcript
            .replace(wakePattern, "")
            .replace(/^[,.\s]+/, "")
            .trim();

        wakeRoscoe(command);
        return;
    }

    clearTimeout(voiceState.sleepTimer);

    voiceState.sleepTimer = setTimeout(() => {
        voiceState.awake = false;
    }, 60000);

    sendToAI(transcript);
}

/* ENABLE / DISABLE MICROPHONE */

async function enableVoice() {
    if (!SpeechRecognition) {
        setVoiceStatus(
            "Speech recognition needs a supported Chrome or Edge browser.",
            "error"
        );
        return;
    }

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia ||
        !window.isSecureContext) {
        setVoiceStatus(
            "Use localhost or HTTPS and allow microphone access.",
            "error"
        );
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        stream.getTracks().forEach(track => track.stop());

        if (!voiceState.recognition && !createRecognition()) {
            throw new Error("Speech recognition unavailable.");
        }

        voiceState.enabled = true;
        voiceState.awake = false;

        updateVoiceUI();

        setVoiceStatus(
            'Voice ready. Say "Hello ROSCOE".',
            "listening"
        );

        startRecognition();

    } catch (error) {
        console.error(error);

        setVoiceStatus(
            "Please allow microphone access in browser settings.",
            "error"
        );
    }
}

function disableVoice() {
    voiceState.enabled = false;
    voiceState.awake = false;

    clearTimeout(voiceState.restartTimer);
    clearTimeout(voiceState.sleepTimer);

    if (voiceState.recognition) {
        try {
            voiceState.recognition.stop();
        } catch {}
    }

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    voiceState.speaking = false;

    updateVoiceUI();
    setVoiceStatus("Voice assistant is turned off.");
    setAvatarState("idle", "AI COMPANION ACTIVE");
}

/* MUTE VOICE OUTPUT */

function toggleMute() {
    voiceState.muted = !voiceState.muted;

    if (voiceState.muted) {
        window.speechSynthesis.cancel();
        voiceState.speaking = false;
    }

    updateVoiceUI();
}

/* ==========================================
   EXPORT AND RESET
========================================== */

function exportData() {
    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "roscoe-data.json";
    link.click();

    URL.revokeObjectURL(url);
}

function resetData() {
    if (!confirm("Delete all ROSCOE data from this browser?")) {
        return;
    }

    data = clone(defaultData);

    saveData();
    navigate("dashboard");

    roscoeSay("Your local data has been reset.");
}

/* ==========================================
   INITIALIZE APPLICATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    showDate();

    renderPage();

    const toggle = $("#voice-toggle");
    const mute = $("#voice-mute");

    if (toggle) {
        toggle.addEventListener("click", enableVoice);
    }

    if (mute) {
        mute.addEventListener("click", toggleMute);
    }

    updateVoiceUI();

    fetch("/api/health")
        .then(response => response.json())
        .then(result => {
            if (!result.ai_configured) {
                setVoiceStatus(
                    "AI API key not configured. Voice can listen, but AI replies need setup.",
                    "error"
                );
            }
        })
        .catch(() => {
            roscoeSay(
                "ROSCOE is open, but the AI server is not connected. Start server.py."
            );
        });
});

/* Expose functions used by HTML buttons. */

window.navigate = navigate;
window.roscoeSay = roscoeSay;
window.roscoeReply = roscoeReply;
window.toggleTask = toggleTask;
window.toggleSkill = toggleSkill;
window.toggleChallenge = toggleChallenge;
window.downloadResume = downloadResume;
window.exportData = exportData;
window.resetData = resetData;
window.enableVoice = enableVoice;
window.disableVoice = disableVoice;
