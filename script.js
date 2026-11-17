
const $ = (selector) => document.querySelector(selector);

const pageTitles = {
  dashboard: "Dashboard",
  profile: "My Profile",
  challenges: "Daily Challenges",
  learning: "Learning Path",
  interview: "Interview Arena",
  career: "Career Readiness",
  resume: "Smart Resume",
  planner: "Life Planner",
  settings: "Settings"
};

const defaultData = {
  profile: {
    name: "User",
    role: "AI & ML Student",
    skills: "Python, HTML, CSS, JavaScript",
    goals: "Become an AI/ML engineer",
    interests: "Artificial Intelligence, Web Development",
    target: "AI/ML Engineer"
  },
  tasks: [
    { id: 1, title: "Practice Python for 30 minutes", category: "Learning", done: false },
    { id: 2, title: "Solve one coding problem", category: "Practice", done: false },
    { id: 3, title: "Learn one new AI/ML concept", category: "Growth", done: false },
    { id: 4, title: "Review today's progress", category: "Personal", done: false }
  ],
  challengesDone: 0,
  learnedSkills: [],
  resumeMode: "approval",
  reminder: "Practice coding every day",
  chatHistory: []
};

function loadData() {
  try {
    const saved = localStorage.getItem("roscoeAppData");
    if (!saved) return structuredClone(defaultData);

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultData),
      ...parsed,
      profile: { ...defaultData.profile, ...(parsed.profile || {}) },
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : structuredClone(defaultData.tasks),
      learnedSkills: Array.isArray(parsed.learnedSkills) ? parsed.learnedSkills : [],
      chatHistory: Array.isArray(parsed.chatHistory) ? parsed.chatHistory : []
    };
  } catch {
    return structuredClone(defaultData);
  }
}

let data = loadData();
let currentPage = "dashboard";

function saveData() {
  try {
    localStorage.setItem("roscoeAppData", JSON.stringify(data));
  } catch (error) {
    console.warn("Browser storage is unavailable.", error);
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function showDate() {
  $("#today-date").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function navigate(page) {
  if (!pageTitles[page]) return;

  currentPage = page;

  $("#page-title").textContent = pageTitles[page];

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  renderPage();
}

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
  updateAvatar();
}

function updateAvatar() {
  const name = data.profile.name.trim();
  $(".avatar-button").textContent = name ? name.charAt(0).toUpperCase() : "U";
}

function getCompletion() {
  if (!data.tasks.length) return 0;
  return Math.round(
    data.tasks.filter((task) => task.done).length / data.tasks.length * 100
  );
}

function renderDashboard() {
  const completed = data.tasks.filter((task) => task.done).length;
  const total = data.tasks.length;
  const completion = getCompletion();
  const name = escapeHTML(data.profile.name || "User");

  return `
    <div class="hero-card">
      <span class="tag">✦ YOUR PERSONAL GROWTH OS</span>
      <h2>Welcome back, ${name}.<br>Let's build your next level.</h2>
      <p>
        Your goals, learning, career preparation and daily actions in one place.
        Small consistent steps create meaningful progress.
      </p>
      <div class="button-row">
        <button class="btn btn-primary" onclick="navigate('planner')">Open my planner ↗</button>
        <button class="btn" onclick="navigate('learning')">Continue learning</button>
      </div>
    </div>

    <div class="section-heading">
      <div>
        <h2>Your overview</h2>
        <p>A quick look at your current progress.</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">TASKS COMPLETED</div>
        <div class="stat-value">${completed}<span class="muted">/${total}</span></div>
        <div class="stat-note">Keep moving forward</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">LEARNING PROGRESS</div>
        <div class="stat-value">${data.learnedSkills.length}</div>
        <div class="stat-note">Skills marked as learned</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">DAILY CHALLENGES</div>
        <div class="stat-value">${data.challengesDone}</div>
        <div class="stat-note">Challenges completed</div>
      </div>
    </div>

    <div class="section-heading">
      <div>
        <h2>Your personal workspace</h2>
        <p>Choose what you want to work on next.</p>
      </div>
    </div>

    <div class="content-grid">
      <button class="feature-card" onclick="navigate('learning')">
        <span class="feature-icon">⌘</span>
        <strong>Learning Studio</strong>
        <small>Build a learning path from your current skills to your goals.</small>
      </button>
      <button class="feature-card" onclick="navigate('career')">
        <span class="feature-icon">↗</span>
        <strong>Career Navigator</strong>
        <small>Explore your target role and identify skills to improve.</small>
      </button>
      <button class="feature-card" onclick="navigate('challenges')">
        <span class="feature-icon">⚡</span>
        <strong>Daily Challenge</strong>
        <small>Complete a practical task and build consistency.</small>
      </button>
      <button class="feature-card" onclick="navigate('interview')">
        <span class="feature-icon">◎</span>
        <strong>Interview Arena</strong>
        <small>Practice answering common technical interview questions.</small>
      </button>
    </div>

    <div class="section-heading">
      <div>
        <h2>Today's action list</h2>
        <p>Complete tasks at your own pace.</p>
      </div>
      <button class="btn" onclick="navigate('planner')">Manage tasks</button>
    </div>

    <div class="card">
      <div class="stat-label">DAILY COMPLETION · ${completion}%</div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${completion}%"></div>
      </div>
      ${renderTaskRows()}
    </div>
  `;
}

function renderTaskRows() {
  if (!data.tasks.length) {
    return `<div class="empty-state">No tasks yet. Add your first task in Life Planner.</div>`;
  }

  return data.tasks.map((task) => `
    <div class="task-row ${task.done ? "done" : ""}">
      <input
        type="checkbox"
        ${task.done ? "checked" : ""}
        aria-label="Complete ${escapeHTML(task.title)}"
        onchange="toggleTask(${task.id}, this.checked)"
      >
      <div class="task-copy">
        <strong>${escapeHTML(task.title)}</strong>
        <small>${escapeHTML(task.category || "Personal")}</small>
      </div>
      ${task.done ? '<span class="pill">Done</span>' : ""}
    </div>
  `).join("");
}

function toggleTask(id, checked) {
  const task = data.tasks.find((item) => item.id === id);
  if (!task) return;

  task.done = checked;
  saveData();
  renderPage();
}

function renderProfile() {
  const profile = data.profile;

  return `
    <div class="hero-card">
      <span class="tag">♙ PERSONAL PROFILE</span>
      <h2>Know yourself. Shape your future.</h2>
      <p>Tell ROSCOE what you know, what you want to learn and where you want to go.</p>
    </div>

    <div class="section-heading"><h2>Your information</h2></div>

    <form class="card form-grid" onsubmit="saveProfile(event)">
      <div class="field">
        <label for="profile-name">Your name</label>
        <input id="profile-name" name="name" value="${escapeHTML(profile.name)}" required>
      </div>
      <div class="field">
        <label for="profile-role">Current role</label>
        <input id="profile-role" name="role" value="${escapeHTML(profile.role)}">
      </div>
      <div class="field full-width">
        <label for="profile-skills">Skills you already know</label>
        <textarea id="profile-skills" name="skills">${escapeHTML(profile.skills)}</textarea>
      </div>
      <div class="field full-width">
        <label for="profile-interests">Your interests</label>
        <input id="profile-interests" name="interests" value="${escapeHTML(profile.interests)}">
      </div>
      <div class="field full-width">
        <label for="profile-goals">Your main goal</label>
        <textarea id="profile-goals" name="goals">${escapeHTML(profile.goals)}</textarea>
      </div>
      <div class="field full-width">
        <label for="profile-target">Career you want to pursue</label>
        <input id="profile-target" name="target" value="${escapeHTML(profile.target)}">
      </div>
      <div class="full-width">
        <button class="btn btn-primary" type="submit">Save my profile</button>
      </div>
    </form>
  `;
}

function saveProfile(event) {
  event.preventDefault();
  const form = new FormData(event.target);

  data.profile = {
    name: String(form.get("name") || "User").trim(),
    role: String(form.get("role") || "").trim(),
    skills: String(form.get("skills") || "").trim(),
    interests: String(form.get("interests") || "").trim(),
    goals: String(form.get("goals") || "").trim(),
    target: String(form.get("target") || "").trim()
  };

  saveData();
  renderPage();
  roscoeSay("Your profile has been saved. I'll use these details in this frontend demo to personalize the suggestions.");
}

const challenges = [
  {
    title: "The 25-Minute Focus Sprint",
    description: "Choose one topic and study it for 25 minutes without switching tasks.",
    category: "Productivity"
  },
  {
    title: "Explain It Simply",
    description: "Pick one technical concept and explain it in five sentences as if teaching a beginner.",
    category: "Communication"
  },
  {
    title: "Solve One Problem",
    description: "Solve one beginner coding problem. Test your answer with at least three inputs.",
    category: "Coding"
  },
  {
    title: "Build Something Small",
    description: "Create a small improvement in one of your projects and write down what you learned.",
    category: "Building"
  },
  {
    title: "Career Research",
    description: "Read one job description in your target field and list three required skills.",
    category: "Career"
  }
];

function todayChallengeIndex() {
  const date = new Date();
  return (date.getFullYear() * 367 + date.getMonth() * 31 + date.getDate()) % challenges.length;
}

function renderChallenges() {
  const challenge = challenges[todayChallengeIndex()];

  return `
    <div class="hero-card">
      <span class="tag">⚡ YOUR DAILY MISSION</span>
      <h2>Challenge yourself, one step at a time.</h2>
      <p>Consistency matters more than perfection. Complete the mission and keep building your skills.</p>
    </div>

    <div class="section-heading"><h2>Today's challenge</h2></div>

    <div class="card">
      <span class="tag">${escapeHTML(challenge.category)}</span>
      <h2 style="margin-top:15px">${escapeHTML(challenge.title)}</h2>
      <p class="muted small">${escapeHTML(challenge.description)}</p>
      <div class="button-row">
        <button class="btn btn-primary" onclick="completeChallenge()">✓ Mark challenge complete</button>
        <button class="btn" onclick="roscoeSay('Start small. Set a timer, remove distractions, and focus on finishing the challenge rather than making it perfect.')">Get a tip</button>
      </div>
      <div class="result-box">
        <h3>Your progress</h3>
        <p>Challenges completed: <strong>${data.challengesDone}</strong></p>
      </div>
    </div>

    <div class="section-heading"><h2>More ways to grow</h2></div>
    <div class="content-grid">
      ${challenges.map((item) => `
        <div class="feature-card">
          <span class="feature-icon">✦</span>
          <strong>${escapeHTML(item.title)}</strong>
          <small>${escapeHTML(item.description)}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function completeChallenge() {
  data.challengesDone += 1;
  saveData();
  renderPage();
  roscoeSay("Challenge completed! Take a moment to notice what you learned. Then choose your next small step.");
}

function renderLearning() {
  const known = data.profile.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const roadmap = [
    {
      title: "Stage 1 · Strengthen fundamentals",
      text: "Review programming fundamentals, problem solving, functions, data structures and basic debugging."
    },
    {
      title: "Stage 2 · Build practical projects",
      text: "Create small projects, practise JavaScript or Python, use Git and document your work."
    },
    {
      title: "Stage 3 · Learn your target specialization",
      text: "For AI/ML, study statistics, NumPy, pandas, data preparation, model evaluation and introductory machine learning."
    },
    {
      title: "Stage 4 · Demonstrate your skills",
      text: "Build a portfolio, write project READMEs, solve interview questions and review your progress weekly."
    }
  ];

  return `
    <div class="hero-card">
      <span class="tag">⌘ LEARNING STUDIO</span>
      <h2>Your skills. Your roadmap.</h2>
      <p>Start from what you know and follow a practical sequence toward your target.</p>
    </div>

    <div class="section-heading"><h2>Your current starting point</h2></div>
    <div class="card">
      <p class="muted small">Skills listed in your profile</p>
      <div class="button-row">
        ${known.length
          ? known.map((skill) => `<span class="tag">${escapeHTML(skill)}</span>`).join("")
          : '<span class="muted small">Add your skills in My Profile.</span>'}
      </div>
      <p class="muted small" style="margin-top:18px">Your goal: <strong>${escapeHTML(data.profile.goals || "Set a goal in your profile")}</strong></p>
    </div>

    <div class="section-heading">
      <div><h2>Suggested learning roadmap</h2><p>Adapt these stages to your own pace.</p></div>
    </div>

    <div class="card">
      ${roadmap.map((stage, index) => `
        <div class="task-row">
          <div class="feature-icon">${index + 1}</div>
          <div class="task-copy">
            <strong>${escapeHTML(stage.title)}</strong>
            <small>${escapeHTML(stage.text)}</small>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="section-heading"><h2>Record a new skill</h2></div>
    <form class="card" onsubmit="addSkill(event)">
      <div class="field">
        <label for="new-skill">What have you learned?</label>
        <input id="new-skill" name="skill" placeholder="e.g. Python functions" required>
      </div>
      <div class="button-row">
        <button class="btn btn-primary" type="submit">Add to my progress</button>
      </div>
    </form>

    <div class="section-heading"><h2>Skills you've recorded</h2></div>
    <div class="card">
      ${data.learnedSkills.length
        ? data.learnedSkills.map((skill, index) => `
          <div class="task-row">
            <div class="task-copy"><strong>${escapeHTML(skill)}</strong><small>Added to your learning record</small></div>
            <button class="btn btn-danger" onclick="removeSkill(${index})">Remove</button>
          </div>
        `).join("")
        : '<div class="empty-state">Your learned skills will appear here.</div>'}
    </div>
  `;
}

function addSkill(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const skill = String(form.get("skill") || "").trim();

  if (!skill) return;

  data.learnedSkills.push(skill);
  saveData();
  renderPage();
  roscoeSay(`Nice progress! I've added "${skill}" to your local learning record. You can also update your resume with it.`);
}

function removeSkill(index) {
  data.learnedSkills.splice(index, 1);
  saveData();
  renderPage();
}

const interviewQuestions = [
  {
    question: "What is the difference between a list and a tuple in Python?",
    points: ["Mutability", "Syntax", "A suitable use case"]
  },
  {
    question: "Explain supervised and unsupervised learning.",
    points: ["Labeled versus unlabeled data", "Learning objective", "One example of each"]
  },
  {
    question: "What is overfitting in machine learning?",
    points: ["Performance on training data", "Generalization to unseen data", "Ways to reduce overfitting"]
  },
  {
    question: "How would you explain one of your projects to an interviewer?",
    points: ["Problem being solved", "Your contribution and tools", "Outcome and lessons learned"]
  }
];

function renderInterview() {
  return `
    <div class="hero-card">
      <span class="tag">◎ INTERVIEW ARENA</span>
      <h2>Practise before the real interview.</h2>
      <p>Generate a practice question, write your answer and evaluate it against a simple checklist.</p>
    </div>

    <div class="section-heading"><h2>Practice session</h2></div>
    <div class="card">
      <div id="interview-question">
        <span class="tag">QUESTION</span>
        <h3 style="margin-top:14px">Select a question to begin.</h3>
      </div>

      <form onsubmit="evaluateInterview(event)" style="margin-top:18px">
        <div class="field">
          <label for="interview-answer">Your answer</label>
          <textarea id="interview-answer" placeholder="Write your answer here..." required></textarea>
        </div>
        <div class="button-row">
          <button class="btn btn-primary" type="submit">Review my answer</button>
          <button class="btn" type="button" onclick="nextInterviewQuestion()">New question ↻</button>
        </div>
      </form>

      <div id="interview-result"></div>
    </div>

    <div class="notice" style="margin-top:15px">
      This is a frontend practice tool. The feedback is based on answer length and a general checklist, not a real AI evaluation.
    </div>
  `;
}

let activeInterviewQuestion = 0;

function nextInterviewQuestion() {
  activeInterviewQuestion = (activeInterviewQuestion + 1) % interviewQuestions.length;
  const item = interviewQuestions[activeInterviewQuestion];

  $("#interview-question").innerHTML = `
    <span class="tag">QUESTION ${activeInterviewQuestion + 1}</span>
    <h3 style="margin-top:14px;line-height:1.7">${escapeHTML(item.question)}</h3>
    <p class="muted small">Consider covering: ${item.points.map(escapeHTML).join(" · ")}</p>
  `;

  $("#interview-answer").value = "";
  $("#interview-result").innerHTML = "";
}

function evaluateInterview(event) {
  event.preventDefault();

  const answer = $("#interview-answer").value.trim();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  const tips = [];

  if (wordCount < 25) tips.push("Try adding more explanation and a concrete example.");
  if (!/\b(example|for instance|such as)\b/i.test(answer)) {
    tips.push("Include an example to demonstrate your understanding.");
  }
  if (!/\b(because|therefore|so that|which means)\b/i.test(answer)) {
    tips.push("Explain why the concept matters or how it works.");
  }

  if (!tips.length) tips.push("Your answer has some useful detail. Check technical accuracy and practise explaining it aloud.");

  $("#interview-result").innerHTML = `
    <div class="result-box">
      <h3>Practice feedback</h3>
      <p>Your answer contains approximately ${wordCount} words.</p>
      <ul>${tips.map((tip) => `<li>${escapeHTML(tip)}</li>`).join("")}</ul>
      <p>Review the question's key points and refine your answer.</p>
    </div>
  `;
}

function renderCareer() {
  const target = escapeHTML(data.profile.target || "your target role");

  const careerSkills = [
    "Programming fundamentals",
    "Problem solving and data structures",
    "Projects that demonstrate practical ability",
    "Communication and explaining technical choices",
    "Git, documentation and collaboration",
    "Role-specific technical knowledge"
  ];

  return `
    <div class="hero-card">
      <span class="tag">↗ CAREER NAVIGATOR</span>
      <h2>Prepare for the work you want.</h2>
      <p>Identify the skills, projects and practice you may need for your target role.</p>
    </div>

    <div class="section-heading"><h2>Your target role</h2></div>
    <div class="card">
      <span class="tag">CAREER GOAL</span>
      <h2 style="margin-top:15px">${target}</h2>
      <p class="muted small">Update your target anytime in My Profile.</p>
    </div>

    <div class="section-heading"><h2>Readiness checklist</h2></div>
    <div class="card">
      ${careerSkills.map((skill, index) => `
        <div class="task-row">
          <input type="checkbox" aria-label="${escapeHTML(skill)}">
          <div class="task-copy">
            <strong>${escapeHTML(skill)}</strong>
            <small>Use this as a self-assessment checklist.</small>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="section-heading"><h2>Suggested next steps</h2></div>
    <div class="content-grid">
      <button class="feature-card" onclick="navigate('learning')">
        <span class="feature-icon">⌘</span>
        <strong>Build a roadmap</strong>
        <small>Organize your learning into manageable stages.</small>
      </button>
      <button class="feature-card" onclick="navigate('resume')">
        <span class="feature-icon">▤</span>
        <strong>Improve your resume</strong>
        <small>Record your skills and projects.</small>
      </button>
    </div>

    <div class="notice" style="margin-top:15px">
      Career readiness here is a self-assessment, not a verified job eligibility score. Real job requirements vary by employer.
    </div>
  `;
}

function renderResume() {
  const profile = data.profile;
  const allSkills = [
    ...profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
    ...data.learnedSkills
  ];

  const uniqueSkills = [...new Set(allSkills)];

  return `
    <div class="hero-card">
      <span class="tag">▤ SMART RESUME</span>
      <h2>Keep your achievements organized.</h2>
      <p>Your resume preview uses the information you've saved in ROSCOE.</p>
    </div>

    <div class="section-heading"><h2>Resume update preference</h2></div>
    <div class="card">
      <div class="field">
        <label for="resume-mode">When you add a new skill</label>
        <select id="resume-mode" onchange="setResumeMode(this.value)">
          <option value="approval" ${data.resumeMode === "approval" ? "selected" : ""}>Ask me before updating</option>
          <option value="automatic" ${data.resumeMode === "automatic" ? "selected" : ""}>Automatically include in preview</option>
        </select>
      </div>
      <p class="muted small">
        This preference controls the local demo preview. It does not edit or submit an external resume.
      </p>
    </div>

    <div class="section-heading"><h2>Your resume preview</h2></div>
    <div class="card" id="resume-preview">
      <h2>${escapeHTML(profile.name || "Your Name")}</h2>
      <p class="muted">${escapeHTML(profile.role || "")}</p>
      <div class="companion-divider"></div>

      <h3>Career objective</h3>
      <p class="muted small">${escapeHTML(profile.goals || "Add your career objective in My Profile.")}</p>

      <h3 style="margin-top:20px">Skills</h3>
      <p class="muted small">${uniqueSkills.length
        ? uniqueSkills.map(escapeHTML).join(" · ")
        : "Add skills in My Profile or Learning Path."}</p>

      <h3 style="margin-top:20px">Career interest</h3>
      <p class="muted small">${escapeHTML(profile.target || "Not specified")}</p>

      <h3 style="margin-top:20px">Interests</h3>
      <p class="muted small">${escapeHTML(profile.interests || "Not specified")}</p>

      <div class="button-row">
        <button class="btn btn-primary" onclick="printResume()">Print / Save as PDF</button>
        <button class="btn" onclick="copyResume()">Copy resume text</button>
      </div>
    </div>
  `;
}

function setResumeMode(mode) {
  data.resumeMode = mode === "automatic" ? "automatic" : "approval";
  saveData();
  roscoeSay(data.resumeMode === "automatic"
    ? "Automatic preview mode is enabled. Skills you record will appear in the resume preview."
    : "Approval mode is enabled. Review your information in the preview before using it.");
}

function getResumeText() {
  const profile = data.profile;
  const skills = [
    ...profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
    ...data.learnedSkills
  ];

  return [
    profile.name,
    profile.role,
    "",
    "CAREER OBJECTIVE",
    profile.goals,
    "",
    "SKILLS",
    [...new Set(skills)].join(", "),
    "",
    "CAREER INTEREST",
    profile.target,
    "",
    "INTERESTS",
    profile.interests
  ].join("\n");
}

function printResume() {
  const preview = $("#resume-preview");
  const original = document.body.innerHTML;

  document.body.innerHTML = `
    <div style="max-width:800px;margin:35px auto;padding:35px;color:#111;font-family:Arial,sans-serif">
      <pre style="white-space:pre-wrap;font:15px/1.8 Arial,sans-serif">${escapeHTML(getResumeText())}</pre>
    </div>
  `;

  window.print();
  document.body.innerHTML = original;

  // Reinitialize the app after printing.
  showDate();
  renderPage();
}

async function copyResume() {
  const text = getResumeText();

  try {
    await navigator.clipboard.writeText(text);
    roscoeSay("Your resume text has been copied.");
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = text;
    document.body.appendChild(temporary);
    temporary.select();
    const copied = document.execCommand("copy");
    temporary.remove();
    roscoeSay(copied ? "Your resume text has been copied." : "Copy was blocked by the browser. Select and copy the preview text manually.");
  }
}

function renderPlanner() {
  return `
    <div class="hero-card">
      <span class="tag">▦ LIFE PLANNER</span>
      <h2>Turn your plans into actions.</h2>
      <p>Manage daily tasks, add priorities and track what you have completed.</p>
    </div>

    <div class="section-heading"><h2>Add a task</h2></div>

    <form class="card form-grid" onsubmit="addTask(event)">
      <div class="field full-width">
        <label for="task-title">Task description</label>
        <input id="task-title" name="title" placeholder="e.g. Complete Python practice" required>
      </div>
      <div class="field">
        <label for="task-category">Category</label>
        <select id="task-category" name="category">
          <option>Learning</option>
          <option>Career</option>
          <option>Personal</option>
          <option>Health</option>
          <option>Project</option>
        </select>
      </div>
      <div class="field">
        <label for="task-reminder">Daily reminder note</label>
        <input id="task-reminder" name="reminder" value="${escapeHTML(data.reminder)}">
      </div>
      <div class="full-width">
        <button class="btn btn-primary" type="submit">+ Add task</button>
      </div>
    </form>

    <div class="section-heading">
      <div><h2>Your task list</h2><p>${data.tasks.filter((task) => task.done).length} of ${data.tasks.length} completed</p></div>
      <button class="btn" onclick="clearCompletedTasks()">Clear completed</button>
    </div>

    <div class="card">
      ${data.tasks.length ? data.tasks.map((task) => `
        <div class="task-row ${task.done ? "done" : ""}">
          <input type="checkbox" ${task.done ? "checked" : ""} onchange="toggleTask(${task.id}, this.checked)" aria-label="Complete task">
          <div class="task-copy">
            <strong>${escapeHTML(task.title)}</strong>
            <small>${escapeHTML(task.category)}</small>
          </div>
          <button class="btn btn-danger" onclick="deleteTask(${task.id})" aria-label="Delete task">✕</button>
        </div>
      `).join("") : '<div class="empty-state">No tasks yet. Add your first task above.</div>'}
    </div>

    <div class="section-heading"><h2>Your reminder</h2></div>
    <div class="notice">✦ ${escapeHTML(data.reminder || "Add a reminder note above.")}</div>
  `;
}

function addTask(event) {
  event.preventDefault();

  const form = new FormData(event.target);
  const title = String(form.get("title") || "").trim();
  if (!title) return;

  data.tasks.push({
    id: Date.now(),
    title,
    category: String(form.get("category") || "Personal"),
    done: false
  });

  data.reminder = String(form.get("reminder") || "").trim();
  saveData();
  renderPage();
  roscoeSay("Your new task is in your planner. Take it one step at a time.");
}

function deleteTask(id) {
  data.tasks = data.tasks.filter((task) => task.id !== id);
  saveData();
  renderPage();
}

function clearCompletedTasks() {
  data.tasks = data.tasks.filter((task) => !task.done);
  saveData();
  renderPage();
}

function renderSettings() {
  return `
    <div class="hero-card">
      <span class="tag">⚙ PERSONAL SETTINGS</span>
      <h2>Make ROSCOE work your way.</h2>
      <p>Manage your local demo data and your preferences.</p>
    </div>

    <div class="section-heading"><h2>Data & privacy</h2></div>

    <div class="card">
      <h3>Local browser storage</h3>
      <p class="muted small">
        This demo saves your profile, tasks and learning records in this browser using localStorage.
        Clearing browser data may remove them. This is not cloud synchronization.
      </p>
      <div class="button-row">
        <button class="btn" onclick="exportData()">Export my data</button>
        <button class="btn btn-danger" onclick="resetData()">Reset all demo data</button>
      </div>
    </div>

    <div class="section-heading"><h2>About ROSCOE</h2></div>
    <div class="card">
      <h3>Your personal growth companion</h3>
      <p class="muted small">
        ROSCOE combines planning, learning, interview practice and career preparation in one interface.
        This version uses predefined frontend responses rather than a live AI model.
      </p>
      <span class="tag">FRONTEND DEMO · VERSION 2.0</span>
    </div>
  `;
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "roscoe-data.json";
  link.click();
  URL.revokeObjectURL(url);
}

function resetData() {
  if (!confirm("Reset your profile, tasks and learning records? This cannot be undone.")) return;

  data = structuredClone(defaultData);
  saveData();
  navigate("dashboard");
  roscoeSay("Your demo data has been reset. You can set up your profile again.");
}

/* ROSCOE COMPANION */

function roscoeSay(message) {
  $("#bot-message").textContent = message;
}

function roscoeReply(type) {
  const replies = {
    motivation: "You don't need to solve your whole future today. Pick one useful task, give it your full attention, and finish it. Progress comes from consistent action.",
    challenge: "Your challenge: choose one skill, spend 20 focused minutes practising it, then write down one thing you learned. Open Daily Challenges to see today's mission.",
    career: `Let's work toward ${data.profile.target || "your target career"}. Start by strengthening your fundamentals, building practical projects, and practising how to explain your work. Open Career Readiness to plan your next step.`
  };

  roscoeSay(replies[type] || replies.motivation);
}

function respondToMessage(message) {
  const text = message.toLowerCase();

  if (/\b(hello|hi|hey|good morning|good evening)\b/.test(text)) {
    return `Hey ${data.profile.name || "there"}! I'm here to help you plan, learn and grow. What would you like to focus on today?`;
  }

  if (/\b(motivat|sad|lazy|tired|discourag|procrastinat)\b/.test(text)) {
    return "Take a breath. You don't have to do everything at once. Choose the smallest useful action you can finish in ten minutes, then build from there.";
  }

  if (/\b(challenge|task|mission)\b/.test(text)) {
    return "Here's your mission: spend 20 focused minutes practising one skill, then write down what you learned. Open Daily Challenges for more ideas.";
  }

  if (/\b(career|job|internship|future|profession)\b/.test(text)) {
    return `Your current career goal is ${data.profile.target || "not set yet"}. Build a strong foundation, make projects you can demonstrate, and practise explaining your work. Open Career Readiness to assess your next steps.`;
  }

  if (/\b(learn|study|skill|roadmap|python|machine learning|ai\/ml)\b/.test(text)) {
    return "A useful learning cycle is: understand one concept, practise it, build something small, and explain what you learned. Open Learning Path for your suggested roadmap.";
  }

  if (/\b(resume|cv|portfolio)\b/.test(text)) {
    return "Open Smart Resume to see your profile, career objective and recorded skills together. Keep your project descriptions specific and honest.";
  }

  if (/\b(plan|schedule|organize|organise|routine|todo|to-do)\b/.test(text)) {
    return "Let's make your plan manageable. Write down the most important task first, add two smaller tasks, and leave some time for review. Open Life Planner to record them.";
  }

  if (/\b(interview|question|practice|practise)\b/.test(text)) {
    return "Open Interview Arena to practise a question. Try answering in your own words, explaining why, and giving a practical example.";
  }

  if (/\b(profile|goal|know me|my skills)\b/.test(text)) {
    return `Your saved goal is "${data.profile.goals || "not set yet"}" and your target role is "${data.profile.target || "not set yet"}". You can update these in My Profile.`;
  }

  return "I can help you organize your goals, practise learning, prepare for interviews, and plan your next career steps. Try asking about learning, motivation, career, interviews, your resume, or your daily plan.";
}

function sendChat(event) {
  event.preventDefault();

  const input = $("#roscoe-chat-input");
  const message = input.value.trim();
  if (!message) return;

  const reply = respondToMessage(message);
  data.chatHistory.push({
    message,
    reply,
    timestamp: new Date().toISOString()
  });

  // Keep the saved chat history manageable.
  data.chatHistory = data.chatHistory.slice(-50);
  saveData();

  input.value = "";
  roscoeSay(reply);
}

function initializeApp() {
  showDate();

  $("#navigation").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (button) navigate(button.dataset.page);
  });

  $("#roscoe-chat-form").addEventListener("submit", sendChat);

  renderPage();
}

document.addEventListener("DOMContentLoaded", initializeApp);
