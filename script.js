/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CodeTrack – Student Coding Practice Tracker
 * Comprehensive, Single-Page Browser Architecture
 */

// Import Chart.js if bundled, or use global window.Chart from CDN
let ChartClass = window.Chart;
try {
  if (!ChartClass) {
    const chartModule = await import('chart.js/auto');
    ChartClass = chartModule.default || chartModule;
  }
} catch (e) {
  ChartClass = window.Chart;
}

/* ==========================================================================
   1. CONSTANTS & APPLICATION STATE
   ========================================================================== */

const STORAGE_KEYS = {
  PROBLEMS: 'codingProblems',
  SETTINGS: 'codeTrackSettings',
  TARGETS: 'codeTrackPlatformTargets',
};

// Standard Topics
const ALL_TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue',
  'Trees', 'Graphs', 'Recursion', 'Sorting', 'Searching',
  'Dynamic Programming', 'Greedy', 'Hashing', 'Mathematics', 'SQL', 'Other'
];

// Standard Platforms
const ALL_PLATFORMS = [
  'LeetCode', 'HackerRank', 'CodeChef', 'GeeksforGeeks', 'Codeforces', 'Other'
];

// Default Platform Targets
const DEFAULT_TARGETS = {
  LeetCode: 50,
  HackerRank: 30,
  CodeChef: 20,
  GeeksforGeeks: 40,
  Codeforces: 25,
  Other: 15
};

// Default Settings
const DEFAULT_SETTINGS = {
  studentName: 'Alex Chen',
  preferredPlatform: 'LeetCode',
  dailyGoal: 5,
  weeklyGoal: 25,
  monthlyGoal: 80,
  theme: 'dark'
};

// Sample Initial Problems (Section 13)
function getInitialSampleProblems() {
  const today = new Date();
  const formatDate = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'sample-1',
      problemName: 'Two Sum',
      platform: 'LeetCode',
      problemLink: 'https://leetcode.com/problems/two-sum/',
      topic: 'Arrays',
      difficulty: 'Easy',
      status: 'Solved',
      dateSolved: formatDate(0), // Today
      timeTaken: 15,
      notes: 'Optimal solution using Hash Map lookup in single pass O(n).'
    },
    {
      id: 'sample-2',
      problemName: 'Valid Parentheses',
      platform: 'LeetCode',
      problemLink: 'https://leetcode.com/problems/valid-parentheses/',
      topic: 'Stack',
      difficulty: 'Easy',
      status: 'Solved',
      dateSolved: formatDate(0), // Today
      timeTaken: 12,
      notes: 'Classic stack matching problem. Handle edge case of odd length.'
    },
    {
      id: 'sample-3',
      problemName: 'Binary Search',
      platform: 'HackerRank',
      problemLink: 'https://www.hackerrank.com/challenges/binary-search/problem',
      topic: 'Searching',
      difficulty: 'Medium',
      status: 'Solved',
      dateSolved: formatDate(1), // Yesterday
      timeTaken: 20,
      notes: 'Standard binary search with overflow prevention: mid = low + (high-low)/2.'
    },
    {
      id: 'sample-4',
      problemName: 'Reverse Linked List',
      platform: 'LeetCode',
      problemLink: 'https://leetcode.com/problems/reverse-linked-list/',
      topic: 'Linked List',
      difficulty: 'Easy',
      status: 'Solved',
      dateSolved: formatDate(2), // 2 days ago
      timeTaken: 18,
      notes: 'Iterative 3-pointer method (prev, curr, next) and recursive formulation.'
    },
    {
      id: 'sample-5',
      problemName: 'Longest Substring Without Repeating Characters',
      platform: 'LeetCode',
      problemLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      topic: 'Strings',
      difficulty: 'Medium',
      status: 'Solved',
      dateSolved: formatDate(3), // 3 days ago
      timeTaken: 35,
      notes: 'Sliding window technique using character index frequency array.'
    },
    {
      id: 'sample-6',
      problemName: 'Merge k Sorted Lists',
      platform: 'GeeksforGeeks',
      problemLink: 'https://practice.geeksforgeeks.org/problems/merge-k-sorted-arrays/1',
      topic: 'Queue',
      difficulty: 'Hard',
      status: 'Attempted',
      dateSolved: formatDate(0),
      timeTaken: 45,
      notes: 'Min-Heap priority queue approach. Still working on memory optimization.'
    },
    {
      id: 'sample-7',
      problemName: 'Climbing Stairs',
      platform: 'Codeforces',
      problemLink: 'https://codeforces.com/problemset/problem/1/A',
      topic: 'Dynamic Programming',
      difficulty: 'Easy',
      status: 'Solved',
      dateSolved: formatDate(4),
      timeTaken: 10,
      notes: 'Fibonacci state transition dp[i] = dp[i-1] + dp[i-2].'
    },
    {
      id: 'sample-8',
      problemName: 'Invert Binary Tree',
      platform: 'LeetCode',
      problemLink: 'https://leetcode.com/problems/invert-binary-tree/',
      topic: 'Trees',
      difficulty: 'Easy',
      status: 'Solved',
      dateSolved: formatDate(1),
      timeTaken: 14,
      notes: 'Recursive swap of left and right child pointers.'
    },
    {
      id: 'sample-9',
      problemName: 'Course Schedule',
      platform: 'LeetCode',
      problemLink: 'https://leetcode.com/problems/course-schedule/',
      topic: 'Graphs',
      difficulty: 'Medium',
      status: 'Solved',
      dateSolved: formatDate(5),
      timeTaken: 40,
      notes: 'Topological sort via Kahn Algorithm with in-degree array.'
    },
    {
      id: 'sample-10',
      problemName: 'Trapping Rain Water',
      platform: 'LeetCode',
      problemLink: 'https://leetcode.com/problems/trapping-rain-water/',
      topic: 'Arrays',
      difficulty: 'Hard',
      status: 'Solved',
      dateSolved: formatDate(6),
      timeTaken: 50,
      notes: 'Two pointer approach maintaining maxLeft and maxRight boundaries.'
    }
  ];
}

// In-Memory App State
let problems = [];
let settings = { ...DEFAULT_SETTINGS };
let platformTargets = { ...DEFAULT_TARGETS };
let currentView = 'dashboard';
let deleteTargetId = null;

// Chart references for cleanup and updating
const chartInstances = {
  weeklyPractice: null,
  platformDistribution: null,
  difficultyDistribution: null,
  topicDistribution: null,
  dailyProblems: null,
  weeklyProblems: null,
  monthlyProblems: null
};

/* ==========================================================================
   2. STORAGE & DATA MANAGEMENT
   ========================================================================== */

/**
 * Loads problems from localStorage. If none exist, initializes with sample data.
 */
function loadProblems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROBLEMS);
    if (raw) {
      problems = JSON.parse(raw);
    } else {
      problems = getInitialSampleProblems();
      saveProblems();
    }
  } catch (err) {
    console.error('Error loading problems from localStorage:', err);
    problems = getInitialSampleProblems();
  }

  // Load Settings
  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
    }
  } catch (err) {
    settings = { ...DEFAULT_SETTINGS };
  }

  // Load Platform Targets
  try {
    const rawTargets = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (rawTargets) {
      platformTargets = { ...DEFAULT_TARGETS, ...JSON.parse(rawTargets) };
    }
  } catch (err) {
    platformTargets = { ...DEFAULT_TARGETS };
  }
}

/**
 * Saves problems to localStorage
 */
function saveProblems() {
  try {
    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(problems));
  } catch (err) {
    console.error('Error saving problems to localStorage:', err);
    showToast('Failed to save problems to storage!', 'error');
  }
}

/**
 * Saves settings to localStorage
 */
function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

/**
 * Saves platform targets to localStorage
 */
function saveTargets() {
  try {
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(platformTargets));
  } catch (err) {
    console.error('Error saving platform targets:', err);
  }
}

/* ==========================================================================
   3. STREAK & STATISTICS CALCULATIONS (Dynamic, No Hardcoded Values)
   ========================================================================== */

/**
 * Calculates current streak, longest streak, and total unique practice days
 */
function calculateStreak() {
  // Extract all unique dates on which at least one problem was recorded
  const datesSet = new Set();
  problems.forEach(p => {
    if (p.dateSolved) {
      datesSet.add(p.dateSolved);
    }
  });

  const sortedDates = Array.from(datesSet).sort();
  const totalPracticeDays = sortedDates.length;

  if (totalPracticeDays === 0) {
    return { currentStreak: 0, longestStreak: 0, totalPracticeDays: 0 };
  }

  // Calculate streaks
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate = null;

  for (let i = 0; i < sortedDates.length; i++) {
    const curr = new Date(sortedDates[i] + 'T00:00:00');
    if (prevDate) {
      const diffTime = curr - prevDate;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else {
        currentRun = 1;
      }
    } else {
      currentRun = 1;
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    prevDate = curr;
  }

  // Determine current active streak
  // A streak is active if the student solved something today or yesterday
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  const lastActiveDate = sortedDates[sortedDates.length - 1];

  if (lastActiveDate === todayStr || lastActiveDate === yesterdayStr) {
    // Count backwards consecutively
    let checkDate = new Date(lastActiveDate + 'T00:00:00');
    currentStreak = 1;

    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const prev = new Date(sortedDates[i] + 'T00:00:00');
      const diffDays = Math.round((checkDate - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
        checkDate = prev;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalPracticeDays
  };
}

/**
 * Calculates global dashboard and tracker statistics
 */
function calculateStatistics() {
  const total = problems.length;
  let solved = 0;
  let attempted = 0;
  let unsolved = 0;

  let easy = 0;
  let medium = 0;
  let hard = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  let solvedToday = 0;

  // Platform breakdown
  const platformsData = {};
  ALL_PLATFORMS.forEach(p => {
    platformsData[p] = { solved: 0, attempted: 0, unsolved: 0, total: 0 };
  });

  // Topics breakdown
  const topicsData = {};
  ALL_TOPICS.forEach(t => {
    topicsData[t] = { solved: 0, attempted: 0, unsolved: 0, total: 0 };
  });

  problems.forEach(p => {
    // Status
    if (p.status === 'Solved') solved++;
    else if (p.status === 'Attempted') attempted++;
    else unsolved++;

    // Difficulty
    if (p.difficulty === 'Easy') easy++;
    else if (p.difficulty === 'Medium') medium++;
    else if (p.difficulty === 'Hard') hard++;

    // Today's solved
    if (p.dateSolved === todayStr && p.status === 'Solved') {
      solvedToday++;
    }

    // Platform
    const platKey = ALL_PLATFORMS.includes(p.platform) ? p.platform : 'Other';
    platformsData[platKey].total++;
    if (p.status === 'Solved') platformsData[platKey].solved++;
    else if (p.status === 'Attempted') platformsData[platKey].attempted++;
    else platformsData[platKey].unsolved++;

    // Topic
    const topicKey = ALL_TOPICS.includes(p.topic) ? p.topic : 'Other';
    topicsData[topicKey].total++;
    if (p.status === 'Solved') topicsData[topicKey].solved++;
    else if (p.status === 'Attempted') topicsData[topicKey].attempted++;
    else topicsData[topicKey].unsolved++;
  });

  const overallProgress = total > 0 ? Math.round((solved / total) * 100) : 0;
  const streakStats = calculateStreak();

  return {
    total,
    solved,
    attempted,
    unsolved,
    easy,
    medium,
    hard,
    overallProgress,
    solvedToday,
    streak: streakStats,
    platformsData,
    topicsData
  };
}

/* ==========================================================================
   4. RENDER FUNCTIONS
   ========================================================================== */

/**
 * Updates the user's name, theme, and streak everywhere in the chrome
 */
function renderHeaderAndSidebar() {
  const stats = calculateStatistics();
  const streak = stats.streak.currentStreak;

  // Student name
  const name = settings.studentName || 'Student';
  const nameEl = document.getElementById('sidebar-student-name');
  if (nameEl) nameEl.textContent = name;

  // Avatar initials
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CS';
  const avatarEl = document.getElementById('sidebar-user-avatar');
  if (avatarEl) avatarEl.textContent = initials;

  // Streak indicators
  const sidebarStreak = document.getElementById('sidebar-streak-text');
  if (sidebarStreak) sidebarStreak.textContent = `🔥 ${streak}-day streak`;

  const headerStreakCount = document.getElementById('header-streak-count');
  if (headerStreakCount) headerStreakCount.textContent = streak;

  // Header date display
  const headerDateEl = document.getElementById('header-today-date');
  if (headerDateEl) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    headerDateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // Active theme
  applyTheme(settings.theme);
}

/**
 * Renders the primary dashboard view (Section 5, 6, 7, 8)
 */
function renderDashboard() {
  const stats = calculateStatistics();

  // 1. Metric Cards
  document.getElementById('dash-total-problems').textContent = stats.total;
  document.getElementById('dash-solved-problems').textContent = stats.solved;
  document.getElementById('dash-attempted-problems').textContent = stats.attempted;
  document.getElementById('dash-unsolved-problems').textContent = stats.unsolved;
  document.getElementById('dash-current-streak').textContent = stats.streak.currentStreak;
  document.getElementById('dash-longest-streak-meta').textContent = `Best: ${stats.streak.longestStreak} days`;
  document.getElementById('dash-practice-days').textContent = stats.streak.totalPracticeDays;

  // Solved Percentage Meta
  const solvedPercent = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;
  document.getElementById('dash-solved-percentage').textContent = `${solvedPercent}% of total solved`;

  // Overall Progress
  document.getElementById('dash-overall-percent-badge').textContent = `${stats.overallProgress}%`;
  document.getElementById('dash-overall-progress-bar').style.width = `${stats.overallProgress}%`;
  document.getElementById('dash-overall-solved-text').textContent = `${stats.solved} / ${stats.total} Solved`;
  document.getElementById('dash-daily-today-mini').textContent = `Today: ${stats.solvedToday} solved`;

  // 2. Difficulty Breakdown (Section 6)
  document.getElementById('dash-easy-count').textContent = stats.easy;
  document.getElementById('dash-medium-count').textContent = stats.medium;
  document.getElementById('dash-hard-count').textContent = stats.hard;

  const totalDiff = Math.max(stats.total, 1);
  document.getElementById('dash-easy-bar').style.width = `${Math.round((stats.easy / totalDiff) * 100)}%`;
  document.getElementById('dash-medium-bar').style.width = `${Math.round((stats.medium / totalDiff) * 100)}%`;
  document.getElementById('dash-hard-bar').style.width = `${Math.round((stats.hard / totalDiff) * 100)}%`;

  // 3. Platform Progress Cards (Section 5)
  const platformGrid = document.getElementById('dash-platform-grid');
  platformGrid.innerHTML = '';

  ALL_PLATFORMS.forEach(platform => {
    const pData = stats.platformsData[platform] || { solved: 0, total: 0 };
    const target = platformTargets[platform] || DEFAULT_TARGETS[platform] || 20;
    const percent = Math.min(100, Math.round((pData.solved / target) * 100));

    const card = document.createElement('div');
    card.className = 'platform-card';
    card.innerHTML = `
      <div class="platform-card-header">
        <div class="platform-brand">
          <span class="platform-icon-pill" style="background-color: var(--platform-${platform.toLowerCase() === 'geeksforgeeks' ? 'gfg' : platform.toLowerCase()}, #3b82f6)">
            ${platform.slice(0, 2).toUpperCase()}
          </span>
          <span class="platform-name">${platform}</span>
        </div>
        <span class="platform-ratio tabular-nums">${pData.solved} / ${target}</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill bg-blue" style="width: ${percent}%;"></div>
      </div>
      <div class="platform-progress-meta">
        <span>${percent}% of target</span>
        <span>${pData.total} logged</span>
      </div>
    `;
    platformGrid.appendChild(card);
  });

  // 4. Recent Problems Table (Section 7)
  const recentTbody = document.getElementById('dash-recent-tbody');
  const emptyState = document.getElementById('dash-empty-state');
  const tableContainer = document.getElementById('dash-recent-table-container');

  recentTbody.innerHTML = '';
  if (problems.length === 0) {
    tableContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
  } else {
    tableContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Show 6 most recent problems
    const sorted = [...problems].sort((a, b) => new Date(b.dateSolved || 0) - new Date(a.dateSolved || 0));
    const recent = sorted.slice(0, 6);

    recent.forEach(prob => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="cell-name" title="${escapeHtml(prob.problemName)}">${escapeHtml(prob.problemName)}</td>
        <td>${escapeHtml(prob.platform)}</td>
        <td>${escapeHtml(prob.topic)}</td>
        <td><span class="diff-name diff-${prob.difficulty.toLowerCase()}">${prob.difficulty}</span></td>
        <td><span class="badge-status-${prob.status.toLowerCase()}">${prob.status}</span></td>
        <td class="tabular-nums text-muted text-xs">${prob.dateSolved || '—'}</td>
        <td>
          ${prob.problemLink ? `<a href="${escapeHtml(prob.problemLink)}" target="_blank" rel="noopener noreferrer" class="link-btn text-xs">Open ↗</a>` : '<span class="text-muted">—</span>'}
        </td>
        <td class="text-right">
          <div class="table-actions">
            <button class="btn-icon-action edit-btn" data-id="${prob.id}" title="Edit problem" aria-label="Edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon-action delete delete-btn" data-id="${prob.id}" title="Delete problem" aria-label="Delete">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      recentTbody.appendChild(tr);
    });
  }

  // 5. Update Weekly Practice Chart
  renderWeeklyChart();
}

/**
 * Renders the Weekly Practice Chart (Monday to Sunday) from actual stored data (Section 8)
 */
function renderWeeklyChart() {
  const canvas = document.getElementById('weeklyPracticeChart');
  if (!canvas || !ChartClass) return;

  // Calculate problems solved Mon-Sun for current week
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailyCounts = [0, 0, 0, 0, 0, 0, 0];

  // Map dates of this week
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  // Count problems with status 'Solved' on these dates
  problems.forEach(p => {
    if (p.status === 'Solved' && p.dateSolved) {
      const idx = weekDates.indexOf(p.dateSolved);
      if (idx !== -1) {
        dailyCounts[idx]++;
      }
    }
  });

  const totalThisWeek = dailyCounts.reduce((acc, c) => acc + c, 0);
  const totalLabel = document.getElementById('weekly-chart-total');
  if (totalLabel) totalLabel.textContent = `${totalThisWeek} solved this week`;

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  if (chartInstances.weeklyPractice) {
    chartInstances.weeklyPractice.destroy();
  }

  chartInstances.weeklyPractice = new ChartClass(canvas, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Problems Solved',
        data: dailyCounts,
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        hoverBackgroundColor: '#2563eb'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.raw} problems solved`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            stepSize: 1,
            font: { family: 'JetBrains Mono', size: 11 }
          }
        }
      }
    }
  });
}

/**
 * Renders the Problem Tracker with search, multi-filters, and sorting (Section 14-17)
 */
function renderProblems() {
  const searchVal = (document.getElementById('tracker-search-input')?.value || '').toLowerCase().trim();
  const platformVal = document.getElementById('filter-platform')?.value || 'ALL';
  const diffVal = document.getElementById('filter-difficulty')?.value || 'ALL';
  const topicVal = document.getElementById('filter-topic')?.value || 'ALL';
  const statusVal = document.getElementById('filter-status')?.value || 'ALL';
  const dateVal = document.getElementById('filter-date')?.value || 'ALL';
  const sortVal = document.getElementById('filter-sort')?.value || 'newest';

  // Clear search button visibility
  const clearBtn = document.getElementById('tracker-clear-search');
  if (clearBtn) {
    if (searchVal) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of this week (Monday)
  const currentDay = now.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter problems
  let filtered = problems.filter(p => {
    // Search
    if (searchVal) {
      const matchName = (p.problemName || '').toLowerCase().includes(searchVal);
      const matchPlat = (p.platform || '').toLowerCase().includes(searchVal);
      const matchTopic = (p.topic || '').toLowerCase().includes(searchVal);
      const matchNotes = (p.notes || '').toLowerCase().includes(searchVal);
      if (!matchName && !matchPlat && !matchTopic && !matchNotes) {
        return false;
      }
    }

    // Platform
    if (platformVal !== 'ALL' && p.platform !== platformVal) return false;

    // Difficulty
    if (diffVal !== 'ALL' && p.difficulty !== diffVal) return false;

    // Topic
    if (topicVal !== 'ALL' && p.topic !== topicVal) return false;

    // Status
    if (statusVal !== 'ALL' && p.status !== statusVal) return false;

    // Date
    if (dateVal !== 'ALL' && p.dateSolved) {
      const pDate = new Date(p.dateSolved + 'T00:00:00');
      if (dateVal === 'TODAY' && p.dateSolved !== todayStr) return false;
      if (dateVal === 'THIS_WEEK' && pDate < monday) return false;
      if (dateVal === 'THIS_MONTH' && pDate < startOfMonth) return false;
    }

    return true;
  });

  // Sorting (Section 17)
  const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
  filtered.sort((a, b) => {
    switch (sortVal) {
      case 'newest':
        return new Date(b.dateSolved || 0) - new Date(a.dateSolved || 0);
      case 'oldest':
        return new Date(a.dateSolved || 0) - new Date(b.dateSolved || 0);
      case 'easy-hard':
        return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
      case 'hard-easy':
        return (diffOrder[b.difficulty] || 0) - (diffOrder[a.difficulty] || 0);
      case 'highest-time':
        return (Number(b.timeTaken) || 0) - (Number(a.timeTaken) || 0);
      case 'lowest-time':
        return (Number(a.timeTaken) || 0) - (Number(b.timeTaken) || 0);
      default:
        return 0;
    }
  });

  // Update Result Count Meta
  const countEl = document.getElementById('tracker-results-count');
  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${problems.length} problems`;

  const tbody = document.getElementById('tracker-tbody');
  const mobileList = document.getElementById('tracker-mobile-list');
  const emptyState = document.getElementById('tracker-empty-state');
  const tableContainer = document.getElementById('tracker-table-container');

  tbody.innerHTML = '';
  mobileList.innerHTML = '';

  if (filtered.length === 0) {
    tableContainer.classList.add('hidden');
    mobileList.classList.add('hidden');
    emptyState.classList.remove('hidden');
  } else {
    tableContainer.classList.remove('hidden');
    mobileList.classList.remove('hidden');
    emptyState.classList.add('hidden');

    filtered.forEach(prob => {
      // 1. Desktop Table Row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="cell-name" title="${escapeHtml(prob.problemName)}">
          <strong>${escapeHtml(prob.problemName)}</strong>
          ${prob.notes ? `<div class="text-xs text-muted truncate max-w-xs">${escapeHtml(prob.notes)}</div>` : ''}
        </td>
        <td>${escapeHtml(prob.platform)}</td>
        <td>${escapeHtml(prob.topic)}</td>
        <td><span class="diff-name diff-${prob.difficulty.toLowerCase()}">${prob.difficulty}</span></td>
        <td><span class="badge-status-${prob.status.toLowerCase()}">${prob.status}</span></td>
        <td class="tabular-nums text-muted text-xs">${prob.dateSolved || '—'}</td>
        <td class="tabular-nums text-xs">${prob.timeTaken ? `${prob.timeTaken}m` : '—'}</td>
        <td>
          ${prob.problemLink ? `<a href="${escapeHtml(prob.problemLink)}" target="_blank" rel="noopener noreferrer" class="link-btn text-xs">Open ↗</a>` : '<span class="text-muted">—</span>'}
        </td>
        <td class="text-right">
          <div class="table-actions">
            <button class="btn-icon-action edit-btn" data-id="${prob.id}" title="Edit problem" aria-label="Edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon-action delete delete-btn" data-id="${prob.id}" title="Delete problem" aria-label="Delete">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);

      // 2. Mobile Responsive Card
      const card = document.createElement('div');
      card.className = 'problem-mobile-card';
      card.innerHTML = `
        <div class="mobile-card-header">
          <span class="mobile-card-title">${escapeHtml(prob.problemName)}</span>
          <span class="diff-name diff-${prob.difficulty.toLowerCase()} text-xs">${prob.difficulty}</span>
        </div>
        <div class="mobile-card-meta">
          <span>${escapeHtml(prob.platform)}</span>
          <span>·</span>
          <span>${escapeHtml(prob.topic)}</span>
          <span>·</span>
          <span class="badge-status-${prob.status.toLowerCase()}">${prob.status}</span>
        </div>
        ${prob.notes ? `<p class="text-xs text-muted">${escapeHtml(prob.notes)}</p>` : ''}
        <div class="mobile-card-footer">
          <span class="text-muted tabular-nums">${prob.dateSolved || ''} ${prob.timeTaken ? `(${prob.timeTaken}m)` : ''}</span>
          <div class="table-actions">
            ${prob.problemLink ? `<a href="${escapeHtml(prob.problemLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Open ↗</a>` : ''}
            <button class="btn-icon-action edit-btn" data-id="${prob.id}" title="Edit problem" aria-label="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon-action delete delete-btn" data-id="${prob.id}" title="Delete problem" aria-label="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
      mobileList.appendChild(card);
    });
  }
}

/**
 * Renders the Topics View (Section 20)
 */
function renderTopics() {
  const grid = document.getElementById('topics-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const stats = calculateStatistics();

  ALL_TOPICS.forEach(topic => {
    const data = stats.topicsData[topic] || { solved: 0, attempted: 0, unsolved: 0, total: 0 };
    const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'topic-card';
    card.innerHTML = `
      <div class="topic-header">
        <span class="topic-title">${topic}</span>
        <span class="topic-solved-badge tabular-nums">${data.solved} solved</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill bg-blue" style="width: ${pct}%;"></div>
      </div>
      <div class="topic-meta-row">
        <span>${pct}% solved (${data.total} total)</span>
        <button class="link-btn text-xs topic-filter-link" data-topic="${topic}">Filter Tracker →</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * Renders the Platforms View (Section 21)
 */
function renderPlatforms() {
  const grid = document.getElementById('platforms-page-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const stats = calculateStatistics();

  ALL_PLATFORMS.forEach(platform => {
    const data = stats.platformsData[platform] || { solved: 0, attempted: 0, unsolved: 0, total: 0 };
    const target = platformTargets[platform] || DEFAULT_TARGETS[platform] || 20;
    const pct = Math.min(100, Math.round((data.solved / target) * 100));

    const card = document.createElement('div');
    card.className = 'platform-card';
    card.innerHTML = `
      <div class="platform-card-header">
        <div class="platform-brand">
          <span class="platform-icon-pill" style="background-color: var(--platform-${platform.toLowerCase() === 'geeksforgeeks' ? 'gfg' : platform.toLowerCase()}, #3b82f6)">
            ${platform.slice(0, 2).toUpperCase()}
          </span>
          <span class="platform-name">${platform}</span>
        </div>
        <span class="platform-ratio tabular-nums">${data.solved} / ${target}</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill bg-blue" style="width: ${pct}%;"></div>
      </div>
      <div class="platform-progress-meta">
        <span>Target: ${target} (${pct}%)</span>
        <span>${data.total} recorded</span>
      </div>
      <div class="flex-between mt-2 pt-2 border-t text-xs">
        <button class="link-btn platform-filter-link" data-platform="${platform}">View Problems</button>
        <button class="btn btn-outline btn-sm platform-target-btn" data-platform="${platform}">Edit Target</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * Renders the Daily Practice View and GitHub-Style Calendar (Section 22-24)
 */
function renderDailyPractice() {
  const stats = calculateStatistics();
  const dailyGoal = settings.dailyGoal || 5;
  const solvedToday = stats.solvedToday;
  const pct = Math.min(100, Math.round((solvedToday / dailyGoal) * 100));

  // Goal values
  document.getElementById('daily-goal-heading').textContent = `Today's Goal: ${dailyGoal} Problems`;
  document.getElementById('daily-completed-count').textContent = `${solvedToday} / ${dailyGoal}`;
  document.getElementById('daily-percent-text').textContent = `${pct}%`;
  document.getElementById('daily-progress-fill').style.width = `${pct}%`;

  // Goal Completed celebratory banner
  const banner = document.getElementById('daily-goal-completed-banner');
  if (solvedToday >= dailyGoal) {
    banner.classList.remove('hidden');
    document.getElementById('daily-goal-status-text').textContent = 'Outstanding achievement! You have achieved your daily goal!';
  } else {
    banner.classList.add('hidden');
    const remaining = dailyGoal - solvedToday;
    document.getElementById('daily-goal-status-text').textContent = `Solve ${remaining} more problem${remaining === 1 ? '' : 's'} today to reach your target and maintain your streak.`;
  }

  // Streak cards
  document.getElementById('daily-current-streak').textContent = `${stats.streak.currentStreak} days`;
  document.getElementById('daily-longest-streak').textContent = `${stats.streak.longestStreak} days`;
  document.getElementById('daily-total-days').textContent = `${stats.streak.totalPracticeDays} days`;

  // GitHub-Style Activity Calendar (Section 24)
  renderPracticeCalendar();

  // Problems solved today list
  renderTodayProblemsList();
}

/**
 * Renders the GitHub-Style Practice Calendar with 5 visual intensity levels
 */
function renderPracticeCalendar() {
  const container = document.getElementById('practice-calendar-heatmap');
  if (!container) return;
  container.innerHTML = '';

  // Aggregate problems solved per date
  const dateCounts = {};
  problems.forEach(p => {
    if (p.dateSolved && p.status === 'Solved') {
      dateCounts[p.dateSolved] = (dateCounts[p.dateSolved] || 0) + 1;
    }
  });

  // Generate matrix for past 16 weeks (112 days)
  const totalWeeks = 16;
  const now = new Date();
  const currentDay = now.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

  // Find Monday of the current week
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - distanceToMonday);

  // Start date = thisMonday minus (totalWeeks - 1) weeks
  const startDate = new Date(thisMonday);
  startDate.setDate(thisMonday.getDate() - ((totalWeeks - 1) * 7));

  for (let w = 0; w < totalWeeks; w++) {
    const col = document.createElement('div');
    col.className = 'cal-col';

    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + (w * 7) + d);
      const dateStr = cellDate.toISOString().split('T')[0];

      // Don't render future dates past today
      const isFuture = cellDate > now;
      const count = dateCounts[dateStr] || 0;

      // Intensity level mapping (Section 24)
      // 0 problems, 1 problem, 2-3 problems, 4-5 problems, 6+ problems
      let level = 'level-0';
      if (count === 1) level = 'level-1';
      else if (count >= 2 && count <= 3) level = 'level-2';
      else if (count >= 4 && count <= 5) level = 'level-3';
      else if (count >= 6) level = 'level-4';

      const cell = document.createElement('div');
      cell.className = `cal-day-cell ${level}`;
      cell.dataset.date = dateStr;
      cell.dataset.count = count;
      cell.title = `${dateStr}: ${count} problems solved`;

      if (isFuture) {
        cell.style.opacity = '0.2';
        cell.style.pointerEvents = 'none';
      } else {
        cell.addEventListener('click', () => {
          document.querySelectorAll('.cal-day-cell.selected').forEach(el => el.classList.remove('selected'));
          cell.classList.add('selected');
          showCalendarDateDetails(dateStr, count);
        });
      }

      col.appendChild(cell);
    }
    container.appendChild(col);
  }
}

/**
 * Shows details when clicking a calendar day square
 */
function showCalendarDateDetails(dateStr, count) {
  const detailBox = document.getElementById('calendar-date-details');
  if (!detailBox) return;

  const matched = problems.filter(p => p.dateSolved === dateStr);
  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (matched.length === 0) {
    detailBox.innerHTML = `<strong>${formattedDate}</strong>: No practice problems recorded on this day.`;
  } else {
    detailBox.innerHTML = `
      <div class="mb-2"><strong>${formattedDate}</strong>: ${count} problems solved (${matched.length} total logged)</div>
      <ul style="padding-left: 1.25rem; font-size: 0.8125rem;">
        ${matched.map(p => `
          <li>
            <strong>${escapeHtml(p.problemName)}</strong> (${p.platform} · ${p.difficulty} · <span class="badge-status-${p.status.toLowerCase()}">${p.status}</span>)
          </li>
        `).join('')}
      </ul>
    `;
  }
}

/**
 * Lists all problems logged for today
 */
function renderTodayProblemsList() {
  const container = document.getElementById('today-problems-container');
  const countLabel = document.getElementById('today-solved-count-label');
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayProbs = problems.filter(p => p.dateSolved === todayStr);

  if (countLabel) countLabel.textContent = `${todayProbs.length} problems today`;

  if (todayProbs.length === 0) {
    container.innerHTML = `
      <div class="text-xs text-muted py-2">No problems logged today yet. Click "+ Log Problem Today" to keep your streak going!</div>
    `;
  } else {
    container.innerHTML = `
      <div class="mobile-cards-list" style="display: flex;">
        ${todayProbs.map(p => `
          <div class="problem-mobile-card">
            <div class="mobile-card-header">
              <span class="mobile-card-title">${escapeHtml(p.problemName)}</span>
              <span class="diff-name diff-${p.difficulty.toLowerCase()} text-xs">${p.difficulty}</span>
            </div>
            <div class="mobile-card-meta">
              <span>${p.platform}</span> · <span>${p.topic}</span> · <span class="badge-status-${p.status.toLowerCase()}">${p.status}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/**
 * Renders the Analytics Charts (Section 25)
 */
function renderAnalytics() {
  if (!ChartClass) return;

  const stats = calculateStatistics();
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // 1. Platform Distribution Chart
  const platCanvas = document.getElementById('platformDistributionChart');
  if (platCanvas) {
    if (chartInstances.platformDistribution) chartInstances.platformDistribution.destroy();
    const platLabels = ALL_PLATFORMS;
    const platCounts = platLabels.map(pl => (stats.platformsData[pl] ? stats.platformsData[pl].total : 0));

    chartInstances.platformDistribution = new ChartClass(platCanvas, {
      type: 'doughnut',
      data: {
        labels: platLabels,
        datasets: [{
          data: platCounts,
          backgroundColor: ['#ffa116', '#2ec866', '#b97a57', '#2f8d46', '#318ce7', '#8b5cf6'],
          borderWidth: 2,
          borderColor: isDark ? '#131b2e' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        }
      }
    });
  }

  // 2. Difficulty Distribution Chart
  const diffCanvas = document.getElementById('difficultyDistributionChart');
  if (diffCanvas) {
    if (chartInstances.difficultyDistribution) chartInstances.difficultyDistribution.destroy();

    chartInstances.difficultyDistribution = new ChartClass(diffCanvas, {
      type: 'pie',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
          data: [stats.easy, stats.medium, stats.hard],
          backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
          borderWidth: 2,
          borderColor: isDark ? '#131b2e' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        }
      }
    });
  }

  // 3. Top Topics Chart (Horizontal Bar)
  const topicCanvas = document.getElementById('topicDistributionChart');
  if (topicCanvas) {
    if (chartInstances.topicDistribution) chartInstances.topicDistribution.destroy();

    // Sort topics by total count descending, pick top 8
    const sortedTopics = [...ALL_TOPICS].sort((a, b) => {
      const cntA = stats.topicsData[a] ? stats.topicsData[a].total : 0;
      const cntB = stats.topicsData[b] ? stats.topicsData[b].total : 0;
      return cntB - cntA;
    }).slice(0, 8);

    chartInstances.topicDistribution = new ChartClass(topicCanvas, {
      type: 'bar',
      data: {
        labels: sortedTopics,
        datasets: [{
          label: 'Total Problems',
          data: sortedTopics.map(t => stats.topicsData[t]?.total || 0),
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 1, font: { family: 'JetBrains Mono', size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        }
      }
    });
  }

  // 4. Daily Problems Solved (Last 14 Days)
  const dailyCanvas = document.getElementById('dailyProblemsChart');
  if (dailyCanvas) {
    if (chartInstances.dailyProblems) chartInstances.dailyProblems.destroy();

    const last14Labels = [];
    const last14Counts = [];
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const str = d.toISOString().split('T')[0];
      last14Labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      const count = problems.filter(p => p.dateSolved === str && p.status === 'Solved').length;
      last14Counts.push(count);
    }

    chartInstances.dailyProblems = new ChartClass(dailyCanvas, {
      type: 'line',
      data: {
        labels: last14Labels,
        datasets: [{
          label: 'Solved',
          data: last14Counts,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#10b981',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 1, font: { family: 'JetBrains Mono', size: 10 } }
          }
        }
      }
    });
  }

  // 5. Weekly Problems Solved (Last 8 Weeks)
  const weeklyCanvas = document.getElementById('weeklyProblemsChart');
  if (weeklyCanvas) {
    if (chartInstances.weeklyProblems) chartInstances.weeklyProblems.destroy();

    const weekLabels = [];
    const weekCounts = [];
    const now = new Date();

    for (let w = 7; w >= 0; w--) {
      const startW = new Date(now);
      startW.setDate(now.getDate() - (w * 7) - 6);
      const endW = new Date(now);
      endW.setDate(now.getDate() - (w * 7));

      weekLabels.push(`W-${w === 0 ? 'Now' : w}`);

      const count = problems.filter(p => {
        if (!p.dateSolved || p.status !== 'Solved') return false;
        const pDate = new Date(p.dateSolved + 'T00:00:00');
        return pDate >= startW && pDate <= endW;
      }).length;

      weekCounts.push(count);
    }

    chartInstances.weeklyProblems = new ChartClass(weeklyCanvas, {
      type: 'bar',
      data: {
        labels: weekLabels,
        datasets: [{
          label: 'Weekly Solved',
          data: weekCounts,
          backgroundColor: '#8b5cf6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 1, font: { family: 'JetBrains Mono', size: 10 } }
          }
        }
      }
    });
  }

  // 6. Monthly Problems Solved (Last 6 Months)
  const monthlyCanvas = document.getElementById('monthlyProblemsChart');
  if (monthlyCanvas) {
    if (chartInstances.monthlyProblems) chartInstances.monthlyProblems.destroy();

    const monthLabels = [];
    const monthCounts = [];
    const now = new Date();

    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const mName = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const monthIndex = d.getMonth();

      monthLabels.push(mName);

      const count = problems.filter(p => {
        if (!p.dateSolved || p.status !== 'Solved') return false;
        const pDate = new Date(p.dateSolved + 'T00:00:00');
        return pDate.getFullYear() === year && pDate.getMonth() === monthIndex;
      }).length;

      monthCounts.push(count);
    }

    chartInstances.monthlyProblems = new ChartClass(monthlyCanvas, {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'Monthly Solved',
          data: monthCounts,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 1, font: { family: 'JetBrains Mono', size: 10 } }
          }
        }
      }
    });
  }
}

/**
 * Updates all active charts with fresh data
 */
function updateCharts() {
  renderWeeklyChart();
  if (currentView === 'analytics') {
    renderAnalytics();
  }
}

/**
 * Renders the Goals View (Section 26)
 */
function renderGoals() {
  const stats = calculateStatistics();
  const dGoal = settings.dailyGoal || 5;
  const wGoal = settings.weeklyGoal || 25;
  const mGoal = settings.monthlyGoal || 80;

  // Daily
  const dSolved = stats.solvedToday;
  const dPct = Math.min(100, Math.round((dSolved / dGoal) * 100));
  document.getElementById('goal-daily-target-text').textContent = `Target: ${dGoal} Problems / day`;
  document.getElementById('goal-daily-progress-metric').textContent = `${dSolved} / ${dGoal}`;
  document.getElementById('goal-daily-bar').style.width = `${dPct}%`;

  let dMotivation = 'Start your first problem today!';
  if (dSolved >= dGoal) dMotivation = 'Daily goal completed! 🎉';
  else if (dSolved >= dGoal * 0.7) dMotivation = "You're almost there! Keep pushing!";
  else if (dSolved > 0) dMotivation = 'Great job! Keep going.';
  document.getElementById('goal-daily-motivation').textContent = dMotivation;

  // Weekly (solved in current week Mon-Sun)
  const now = new Date();
  const currentDay = now.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const wSolved = problems.filter(p => {
    if (!p.dateSolved || p.status !== 'Solved') return false;
    return new Date(p.dateSolved + 'T00:00:00') >= monday;
  }).length;

  const wPct = Math.min(100, Math.round((wSolved / wGoal) * 100));
  document.getElementById('goal-weekly-target-text').textContent = `Target: ${wGoal} Problems / week`;
  document.getElementById('goal-weekly-progress-metric').textContent = `${wSolved} / ${wGoal}`;
  document.getElementById('goal-weekly-bar').style.width = `${wPct}%`;

  let wMotivation = 'Every week counts towards mastery.';
  if (wSolved >= wGoal) wMotivation = 'Weekly target achieved! Outstanding dedication! 🚀';
  else if (wSolved >= wGoal * 0.75) wMotivation = 'Phenomenal progress this week, finish strong!';
  document.getElementById('goal-weekly-motivation').textContent = wMotivation;

  // Monthly (solved in current month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const mSolved = problems.filter(p => {
    if (!p.dateSolved || p.status !== 'Solved') return false;
    return new Date(p.dateSolved + 'T00:00:00') >= startOfMonth;
  }).length;

  const mPct = Math.min(100, Math.round((mSolved / mGoal) * 100));
  document.getElementById('goal-monthly-target-text').textContent = `Target: ${mGoal} Problems / month`;
  document.getElementById('goal-monthly-progress-metric').textContent = `${mSolved} / ${mGoal}`;
  document.getElementById('goal-monthly-bar').style.width = `${mPct}%`;

  let mMotivation = "You're making steady progress this month.";
  if (mSolved >= mGoal) mMotivation = 'Monthly goal conquered! You are on fire! 🔥';
  document.getElementById('goal-monthly-motivation').textContent = mMotivation;

  // Platform Goals List
  const platGoalsList = document.getElementById('goals-platform-list');
  if (platGoalsList) {
    platGoalsList.innerHTML = '';
    ALL_PLATFORMS.forEach(pl => {
      const pData = stats.platformsData[pl] || { solved: 0 };
      const pTarget = platformTargets[pl] || DEFAULT_TARGETS[pl] || 20;
      const percent = Math.min(100, Math.round((pData.solved / pTarget) * 100));

      const item = document.createElement('div');
      item.className = 'platform-card';
      item.innerHTML = `
        <div class="flex-between">
          <strong>${pl}</strong>
          <span class="tabular-nums text-xs">${pData.solved} / ${pTarget}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill bg-blue" style="width: ${percent}%;"></div>
        </div>
      `;
      platGoalsList.appendChild(item);
    });
  }
}

/**
 * Renders the Settings View with stored configuration (Section 27)
 */
function renderSettings() {
  const nameInput = document.getElementById('settings-student-name');
  if (nameInput) nameInput.value = settings.studentName || '';

  const platSelect = document.getElementById('settings-preferred-platform');
  if (platSelect) platSelect.value = settings.preferredPlatform || 'LeetCode';

  const dailyInput = document.getElementById('settings-daily-goal');
  if (dailyInput) dailyInput.value = settings.dailyGoal || 5;

  const weeklyInput = document.getElementById('settings-weekly-goal');
  if (weeklyInput) weeklyInput.value = settings.weeklyGoal || 25;

  const monthlyInput = document.getElementById('settings-monthly-goal');
  if (monthlyInput) monthlyInput.value = settings.monthlyGoal || 80;

  // Theme radios
  const currentTheme = settings.theme || 'dark';
  document.querySelectorAll('input[name="settings-theme"]').forEach(radio => {
    radio.checked = radio.value === currentTheme;
  });
}

/**
 * Refreshes all UI views based on the current data state
 */
function renderAllViews() {
  renderHeaderAndSidebar();
  renderDashboard();
  renderProblems();
  renderTopics();
  renderPlatforms();
  renderDailyPractice();
  renderGoals();
  renderSettings();
  if (currentView === 'analytics') {
    renderAnalytics();
  }
}

/* ==========================================================================
   5. NAVIGATION & VIEW SWITCHING (Section 4)
   ========================================================================== */

/**
 * Switches the active view
 * @param {string} viewName - Name of the view to activate
 */
function switchView(viewName) {
  // If user clicks "+ Add Problem" navigation item, open the universal modal
  if (viewName === 'add-problem') {
    openAddProblemForm();
    return;
  }

  currentView = viewName;

  // Update hash without triggering redundant events
  if (window.location.hash !== `#${viewName}`) {
    window.location.hash = `#${viewName}`;
  }

  // Update active sidebar nav item
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
    if (link.dataset.view === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update mobile bottom nav items
  document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(link => {
    if (link.dataset.view === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Toggle view sections
  document.querySelectorAll('.view-section').forEach(sec => {
    if (sec.id === `view-${viewName}`) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  // Update page title
  const titleMap = {
    dashboard: 'Dashboard',
    tracker: 'Problem Tracker',
    topics: 'Topic Mastery',
    platforms: 'Coding Platforms',
    daily: 'Daily Practice',
    analytics: 'Coding Analytics',
    goals: 'Goals & Targets',
    settings: 'Settings & Data'
  };
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = titleMap[viewName] || 'CodeTrack';

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger view-specific rendering
  if (viewName === 'dashboard') renderDashboard();
  else if (viewName === 'tracker') renderProblems();
  else if (viewName === 'topics') renderTopics();
  else if (viewName === 'platforms') renderPlatforms();
  else if (viewName === 'daily') renderDailyPractice();
  else if (viewName === 'analytics') renderAnalytics();
  else if (viewName === 'goals') renderGoals();
  else if (viewName === 'settings') renderSettings();
}

function openMobileSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebar-backdrop')?.classList.add('open');
}

function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-backdrop')?.classList.remove('open');
}

/* ==========================================================================
   6. UNIVERSAL ADD & EDIT FORM (Sections 9, 10, 11, 18, 33)
   ========================================================================== */

/**
 * Opens the universal modal form for either adding a new problem or editing an existing one
 * @param {string|null} problemId - If provided, opens in Edit mode; otherwise, Add mode
 */
function openAddProblemForm(problemId = null) {
  const modal = document.getElementById('problem-modal');
  const titleEl = document.getElementById('modal-problem-title');
  const subtitleEl = document.getElementById('modal-problem-subtitle');
  const submitBtn = document.getElementById('modal-problem-submit');
  const idInput = document.getElementById('modal-edit-id');

  // Clear previous errors
  clearFormErrors();

  if (problemId) {
    // EDIT MODE
    const prob = problems.find(p => p.id === problemId);
    if (!prob) {
      showToast('Problem not found!', 'error');
      return;
    }

    idInput.value = prob.id;
    titleEl.textContent = 'Edit Coding Problem';
    subtitleEl.textContent = 'Modify information and update your practice log';
    submitBtn.textContent = 'Update Problem';

    // Populate inputs
    document.getElementById('modal-problem-name').value = prob.problemName || '';
    document.getElementById('modal-platform').value = prob.platform || 'LeetCode';
    document.getElementById('modal-difficulty').value = prob.difficulty || 'Easy';
    document.getElementById('modal-topic').value = prob.topic || 'Arrays';
    document.getElementById('modal-status').value = prob.status || 'Solved';
    document.getElementById('modal-date').value = prob.dateSolved || new Date().toISOString().split('T')[0];
    document.getElementById('modal-time').value = prob.timeTaken !== undefined ? prob.timeTaken : '';
    document.getElementById('modal-link').value = prob.problemLink || '';
    document.getElementById('modal-notes').value = prob.notes || '';
  } else {
    // ADD MODE
    idInput.value = '';
    titleEl.textContent = 'Add Coding Problem';
    subtitleEl.textContent = 'Enter details to record this practice problem';
    submitBtn.textContent = 'Save Problem';

    // Reset fields
    document.getElementById('modal-problem-name').value = '';
    document.getElementById('modal-platform').value = settings.preferredPlatform || 'LeetCode';
    document.getElementById('modal-difficulty').value = 'Easy';
    document.getElementById('modal-topic').value = 'Arrays';
    document.getElementById('modal-status').value = 'Solved';
    document.getElementById('modal-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-time').value = '';
    document.getElementById('modal-link').value = '';
    document.getElementById('modal-notes').value = '';
  }

  modal.classList.remove('hidden');
  document.getElementById('modal-problem-name').focus();
}

/**
 * Closes the problem modal
 */
function closeProblemModal() {
  document.getElementById('problem-modal')?.classList.add('hidden');
  clearFormErrors();
}

/**
 * Clears form validation error labels
 */
function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

/**
 * Validates problem form inputs (Section 33)
 */
function validateProblemInputs(name, link, time) {
  clearFormErrors();
  let isValid = true;

  // 1. Problem Name Check
  if (!name || !name.trim()) {
    const err = document.getElementById('modal-error-name');
    if (err) {
      err.textContent = 'Please enter a problem name.';
      err.classList.add('visible');
    }
    document.getElementById('modal-problem-name')?.classList.add('error');
    isValid = false;
  }

  // 2. URL Check (if provided)
  if (link && link.trim()) {
    try {
      new URL(link.trim());
    } catch (_) {
      const err = document.getElementById('modal-error-link');
      if (err) {
        err.textContent = 'Please enter a valid problem URL.';
        err.classList.add('visible');
      }
      document.getElementById('modal-link')?.classList.add('error');
      isValid = false;
    }
  }

  // 3. Time Taken Check
  if (time !== '' && time !== null && time !== undefined) {
    const num = Number(time);
    if (isNaN(num) || num < 0) {
      const err = document.getElementById('modal-error-time');
      if (err) {
        err.textContent = 'Time taken cannot be negative.';
        err.classList.add('visible');
      }
      document.getElementById('modal-time')?.classList.add('error');
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Adds a new problem to the store
 */
function addProblem(problemObj) {
  problems.unshift(problemObj);
  saveProblems();
  renderAllViews();
  showToast('Problem added successfully! 🎉', 'success');
}

/**
 * Updates an existing problem
 */
function editProblem(id, updatedFields) {
  const index = problems.findIndex(p => p.id === id);
  if (index !== -1) {
    problems[index] = { ...problems[index], ...updatedFields };
    saveProblems();
    renderAllViews();
    showToast('Problem updated successfully! ✓', 'success');
  }
}

/**
 * Handles submission of the universal Add/Edit form
 */
function handleProblemFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('modal-edit-id').value;
  const name = document.getElementById('modal-problem-name').value;
  const platform = document.getElementById('modal-platform').value;
  const difficulty = document.getElementById('modal-difficulty').value;
  const topic = document.getElementById('modal-topic').value;
  const status = document.getElementById('modal-status').value;
  const date = document.getElementById('modal-date').value || new Date().toISOString().split('T')[0];
  const time = document.getElementById('modal-time').value;
  const link = document.getElementById('modal-link').value;
  const notes = document.getElementById('modal-notes').value;

  if (!validateProblemInputs(name, link, time)) {
    return;
  }

  const problemData = {
    problemName: name.trim(),
    platform,
    difficulty,
    topic,
    status,
    dateSolved: date,
    timeTaken: time !== '' ? Number(time) : null,
    problemLink: link.trim(),
    notes: notes.trim()
  };

  if (id) {
    editProblem(id, problemData);
  } else {
    const newId = 'prob-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    addProblem({ id: newId, ...problemData });
  }

  closeProblemModal();
}

/**
 * Resets the standalone form
 */
function resetForm() {
  document.getElementById('standalone-problem-form')?.reset();
  const dateInput = document.getElementById('form-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  clearFormErrors();
}

/* ==========================================================================
   7. DELETE MODAL & ACTIONS (Section 19)
   ========================================================================== */

/**
 * Opens delete confirmation dialog
 */
function openDeleteModal(id) {
  deleteTargetId = id;
  const prob = problems.find(p => p.id === id);
  const textEl = document.getElementById('delete-modal-text');
  if (prob && textEl) {
    textEl.textContent = `Are you sure you want to delete "${prob.problemName}"? This action cannot be undone.`;
  }
  document.getElementById('delete-modal')?.classList.remove('hidden');
}

/**
 * Closes delete confirmation dialog
 */
function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal')?.classList.add('hidden');
}

/**
 * Confirms deletion of the problem
 */
function deleteProblem(id) {
  const index = problems.findIndex(p => p.id === id);
  if (index !== -1) {
    problems.splice(index, 1);
    saveProblems();
    renderAllViews();
    showToast('Problem deleted successfully.', 'info');
  }
}

/* ==========================================================================
   8. PLATFORM TARGETS MODAL (Section 21)
   ========================================================================== */

function openPlatformTargetsModal() {
  const container = document.getElementById('target-modal-inputs');
  if (!container) return;
  container.innerHTML = '';

  ALL_PLATFORMS.forEach(platform => {
    const current = platformTargets[platform] || DEFAULT_TARGETS[platform] || 20;
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `
      <label class="form-label">${platform} Target</label>
      <input type="number" class="form-input platform-target-input" data-platform="${platform}" value="${current}" min="1" max="10000" required />
    `;
    container.appendChild(group);
  });

  document.getElementById('target-modal')?.classList.remove('hidden');
}

function closePlatformTargetsModal() {
  document.getElementById('target-modal')?.classList.add('hidden');
}

function handlePlatformTargetsSubmit(e) {
  e.preventDefault();
  document.querySelectorAll('.platform-target-input').forEach(input => {
    const plat = input.dataset.platform;
    const val = Number(input.value);
    if (plat && val > 0) {
      platformTargets[plat] = val;
    }
  });

  saveTargets();
  renderAllViews();
  closePlatformTargetsModal();
  showToast('Platform targets updated! ✓', 'success');
}

/* ==========================================================================
   9. SETTINGS, BACKUP, EXPORT, IMPORT & CLEAR (Section 27-30)
   ========================================================================== */

/**
 * Applies the requested visual theme
 */
function applyTheme(themeName) {
  const html = document.documentElement;
  if (themeName === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
  }
}

/**
 * Handles settings form submission
 */
function handleSettingsSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('settings-student-name').value.trim();
  const pref = document.getElementById('settings-preferred-platform').value;
  const dGoal = Number(document.getElementById('settings-daily-goal').value) || 5;
  const wGoal = Number(document.getElementById('settings-weekly-goal').value) || 25;
  const mGoal = Number(document.getElementById('settings-monthly-goal').value) || 80;

  const selectedTheme = document.querySelector('input[name="settings-theme"]:checked')?.value || 'dark';

  settings = {
    studentName: name || 'Student',
    preferredPlatform: pref,
    dailyGoal: dGoal,
    weeklyGoal: wGoal,
    monthlyGoal: mGoal,
    theme: selectedTheme
  };

  saveSettings();
  applyTheme(selectedTheme);
  renderAllViews();
  showToast('Settings updated successfully! ✓', 'success');
}

/**
 * Exports data as codetrack-data.json (Section 28)
 */
function exportData() {
  const exportPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings,
    platformTargets,
    problems
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'codetrack-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Data exported successfully! 📁', 'info');
}

/**
 * Imports JSON data into localStorage (Section 29)
 */
function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // Validate schema
      if (!data || (!Array.isArray(data.problems) && !Array.isArray(data))) {
        throw new Error('Invalid JSON format for CodeTrack');
      }

      if (Array.isArray(data.problems)) {
        problems = data.problems;
        if (data.settings) settings = { ...DEFAULT_SETTINGS, ...data.settings };
        if (data.platformTargets) platformTargets = { ...DEFAULT_TARGETS, ...data.platformTargets };
      } else if (Array.isArray(data)) {
        problems = data;
      }

      saveProblems();
      saveSettings();
      saveTargets();
      renderAllViews();
      showToast('Data imported successfully! 🎉', 'success');
    } catch (err) {
      console.error('Import error:', err);
      showToast('Error importing file: Invalid JSON format.', 'error');
    }
  };
  reader.readAsText(file);
}

/**
 * Clears all coding data with confirmation (Section 30)
 */
function clearAllData() {
  const confirmed = confirm('Are you sure you want to delete all coding data? This cannot be undone.');
  if (confirmed) {
    problems = [];
    localStorage.removeItem(STORAGE_KEYS.PROBLEMS);
    saveProblems();
    renderAllViews();
    showToast('All coding data cleared.', 'info');
  }
}

/* ==========================================================================
   10. TOAST NOTIFICATIONS (Section 34)
   ========================================================================== */

/**
 * Shows small floating toast notification
 * @param {string} message - Notification text
 * @param {'success'|'error'|'info'} type - Severity
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  let icon = 'ℹ️';
  if (type === 'success') icon = '✓';
  if (type === 'error') icon = '✕';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => {
      toast.remove();
    }, 200);
  }, 3500);
}

/**
 * Escapes HTML to prevent injection
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   11. EVENT LISTENERS & INITIALIZATION
   ========================================================================== */

function setupEventListeners() {
  // Navigation clicks (Desktop and Mobile)
  document.querySelectorAll('[data-view]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = elem.dataset.view;
      if (targetView) {
        switchView(targetView);
      }
    });
  });

  // Mobile sidebar controls
  document.getElementById('mobile-menu-toggle')?.addEventListener('click', openMobileSidebar);
  document.getElementById('mobile-sidebar-close')?.addEventListener('click', closeMobileSidebar);
  document.getElementById('sidebar-backdrop')?.addEventListener('click', closeMobileSidebar);

  // Theme toggle button in header
  document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    settings.theme = next;
    saveSettings();
    applyTheme(next);
    renderSettings();
    updateCharts();
  });

  // All "+ Add Problem" buttons across the application (Sections 9 & 10)
  const addProblemTriggers = [
    '#btn-sidebar-add-problem',
    '#btn-header-add-problem',
    '#mobile-nav-add-btn',
    '#btn-tracker-add-problem',
    '#btn-daily-add-problem',
    '.btn-dash-add-problem',
    '.btn-empty-add-problem',
    '.btn-topics-add-problem'
  ];

  document.addEventListener('click', (e) => {
    const target = e.target;
    // Check if clicked element or parent matches any trigger
    for (const selector of addProblemTriggers) {
      if (target.matches(selector) || target.closest(selector)) {
        e.preventDefault();
        openAddProblemForm();
        return;
      }
    }

    // Dynamic Edit button on tables or cards
    const editBtn = target.closest('.edit-btn');
    if (editBtn) {
      e.preventDefault();
      const id = editBtn.dataset.id;
      if (id) openAddProblemForm(id);
      return;
    }

    // Dynamic Delete button on tables or cards
    const deleteBtn = target.closest('.delete-btn');
    if (deleteBtn) {
      e.preventDefault();
      const id = deleteBtn.dataset.id;
      if (id) openDeleteModal(id);
      return;
    }

    // Topic quick-filter click in Topics page
    const topicFilterLink = target.closest('.topic-filter-link');
    if (topicFilterLink) {
      e.preventDefault();
      const topic = topicFilterLink.dataset.topic;
      const topicSelect = document.getElementById('filter-topic');
      if (topicSelect) topicSelect.value = topic;
      switchView('tracker');
      renderProblems();
      return;
    }

    // Platform quick-filter click in Platforms page
    const platformFilterLink = target.closest('.platform-filter-link');
    if (platformFilterLink) {
      e.preventDefault();
      const platform = platformFilterLink.dataset.platform;
      const platSelect = document.getElementById('filter-platform');
      if (platSelect) platSelect.value = platform;
      switchView('tracker');
      renderProblems();
      return;
    }

    // Platform edit target button in Platforms page
    const platformTargetBtn = target.closest('.platform-target-btn');
    if (platformTargetBtn) {
      e.preventDefault();
      openPlatformTargetsModal();
      return;
    }
  });

  // Universal Modal Problem Form Submit & Cancel
  document.getElementById('modal-problem-form')?.addEventListener('submit', handleProblemFormSubmit);
  document.getElementById('modal-problem-close')?.addEventListener('click', closeProblemModal);
  document.getElementById('modal-problem-cancel')?.addEventListener('click', closeProblemModal);

  // Standalone Add Problem Page form submission
  document.getElementById('standalone-problem-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-problem-name').value;
    const platform = document.getElementById('form-platform').value;
    const difficulty = document.getElementById('form-difficulty').value;
    const topic = document.getElementById('form-topic').value;
    const status = document.getElementById('form-status').value;
    const date = document.getElementById('form-date').value || new Date().toISOString().split('T')[0];
    const time = document.getElementById('form-time').value;
    const link = document.getElementById('form-link').value;
    const notes = document.getElementById('form-notes').value;

    if (!validateProblemInputs(name, link, time)) return;

    const newId = 'prob-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    addProblem({
      id: newId,
      problemName: name.trim(),
      platform,
      difficulty,
      topic,
      status,
      dateSolved: date,
      timeTaken: time !== '' ? Number(time) : null,
      problemLink: link.trim(),
      notes: notes.trim()
    });

    resetForm();
    switchView('tracker');
  });

  document.getElementById('btn-reset-problem-form')?.addEventListener('click', resetForm);

  // Delete Modal Confirmation
  document.getElementById('delete-modal-confirm')?.addEventListener('click', () => {
    if (deleteTargetId) {
      deleteProblem(deleteTargetId);
      closeDeleteModal();
    }
  });
  document.getElementById('delete-modal-cancel')?.addEventListener('click', closeDeleteModal);
  document.getElementById('delete-modal-close')?.addEventListener('click', closeDeleteModal);

  // Platform Targets Form & Buttons
  document.getElementById('btn-edit-platform-targets')?.addEventListener('click', openPlatformTargetsModal);
  document.getElementById('btn-platforms-edit-targets')?.addEventListener('click', openPlatformTargetsModal);
  document.getElementById('btn-edit-cadence-goals')?.addEventListener('click', () => switchView('settings'));
  document.getElementById('target-modal-close')?.addEventListener('click', closePlatformTargetsModal);
  document.getElementById('target-modal-cancel')?.addEventListener('click', closePlatformTargetsModal);
  document.getElementById('platform-targets-form')?.addEventListener('submit', handlePlatformTargetsSubmit);

  // Tracker Filter & Search inputs (Instant reactive updates)
  const trackerSearch = document.getElementById('tracker-search-input');
  if (trackerSearch) {
    trackerSearch.addEventListener('input', renderProblems);
  }

  document.getElementById('tracker-clear-search')?.addEventListener('click', () => {
    if (trackerSearch) {
      trackerSearch.value = '';
      renderProblems();
    }
  });

  const filterSelects = [
    'filter-platform', 'filter-difficulty', 'filter-topic', 'filter-status', 'filter-date', 'filter-sort'
  ];
  filterSelects.forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderProblems);
  });

  // Reset Filters Button
  const resetFiltersAction = () => {
    if (trackerSearch) trackerSearch.value = '';
    document.getElementById('filter-platform').value = 'ALL';
    document.getElementById('filter-difficulty').value = 'ALL';
    document.getElementById('filter-topic').value = 'ALL';
    document.getElementById('filter-status').value = 'ALL';
    document.getElementById('filter-date').value = 'ALL';
    document.getElementById('filter-sort').value = 'newest';
    renderProblems();
  };
  document.getElementById('btn-reset-filters')?.addEventListener('click', resetFiltersAction);
  document.getElementById('btn-empty-reset-filters')?.addEventListener('click', resetFiltersAction);

  // Settings Form
  document.getElementById('settings-form')?.addEventListener('submit', handleSettingsSubmit);

  // Data Export, Import, Clear
  document.getElementById('btn-export-data')?.addEventListener('click', exportData);

  document.getElementById('import-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file);
      e.target.value = ''; // Allow re-uploading same file if desired
    }
  });

  document.getElementById('btn-clear-all-data')?.addEventListener('click', clearAllData);

  // Keyboard accessibility: Escape closes open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProblemModal();
      closeDeleteModal();
      closePlatformTargetsModal();
      closeMobileSidebar();
      closeNativeChatDrawer();
    }
  });

  // Hash change routing
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (hash !== currentView) {
      switchView(hash);
    }
  });
}

/* ==========================================================================
   10. N8N CHATBOT INTEGRATION
   ========================================================================== */

const N8N_CHAT_WEBHOOK_URL = 'https://pavyasri.app.n8n.cloud/webhook/af471ff1-5b12-41ce-840d-184250ad59bb/chat';
let n8nOfficialChatInitialized = false;

/**
 * Formats a chat message with basic code blocks, inline code, and line breaks
 */
function formatChatMessage(text) {
  if (!text) return '';
  let escaped = escapeHtml(text);

  // Triple backticks code blocks
  escaped = escaped.replace(/```([a-zA-Z0-9]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Single backtick inline code
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert line breaks
  escaped = escaped.replace(/\n/g, '<br>');

  return escaped;
}

/**
 * Opens the native chat drawer
 */
function openNativeChatDrawer() {
  const backdrop = document.getElementById('n8n-chat-backdrop');
  if (backdrop) {
    backdrop.classList.remove('hidden');
    document.getElementById('n8n-chat-input')?.focus();
  }
}

/**
 * Closes the native chat drawer
 */
function closeNativeChatDrawer() {
  const backdrop = document.getElementById('n8n-chat-backdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
  }
}

/**
 * Sends a message to the n8n webhook and updates UI
 */
async function handleNativeChatSubmit(e) {
  if (e) e.preventDefault();
  const inputEl = document.getElementById('n8n-chat-input');
  const messagesContainer = document.getElementById('n8n-chat-messages');
  if (!inputEl || !messagesContainer) return;

  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = '';

  // Append user bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
  messagesContainer.appendChild(userMsg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Append typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'chat-message bot';
  typingIndicator.id = 'chat-typing-indicator';
  typingIndicator.innerHTML = `
    <div class="chat-bubble chat-typing-indicator">
      <div class="chat-typing-dot"></div>
      <div class="chat-typing-dot"></div>
      <div class="chat-typing-dot"></div>
    </div>
  `;
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Get or initialize persistent session ID
  let sessionId = sessionStorage.getItem('n8n_chat_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem('n8n_chat_session_id', sessionId);
  }

  try {
    const payload = {
      action: 'sendMessage',
      sessionId: sessionId,
      chatInput: text,
      message: text
    };

    const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    typingIndicator.remove();

    let botReply = '';
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (typeof data === 'string') {
        botReply = data;
      } else if (data.output) {
        botReply = typeof data.output === 'string' ? data.output : JSON.stringify(data.output, null, 2);
      } else if (data.text) {
        botReply = data.text;
      } else if (data.message) {
        botReply = data.message;
      } else {
        botReply = JSON.stringify(data, null, 2);
      }
    } else {
      botReply = await response.text();
    }

    if (!botReply || botReply.trim() === '') {
      botReply = "I received your message! How else can I assist with your coding practice?";
    }

    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot';
    botMsg.innerHTML = `<div class="chat-bubble">${formatChatMessage(botReply)}</div>`;
    messagesContainer.appendChild(botMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (err) {
    console.error('Error communicating with n8n chatbot webhook:', err);
    typingIndicator.remove();

    const errorMsg = document.createElement('div');
    errorMsg.className = 'chat-message bot';
    errorMsg.innerHTML = `
      <div class="chat-bubble" style="color: var(--color-unsolved); border-color: rgba(239, 68, 68, 0.3);">
        Could not connect to the n8n chatbot webhook. Please verify that your n8n workflow is active and CORS allows requests from this domain.
      </div>
    `;
    messagesContainer.appendChild(errorMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

/**
 * Initializes n8n Chat Widget (Official library + Native Fallback)
 */
async function initN8nChat() {
  // 1. Try loading official @n8n/chat bundle
  try {
    const { createChat } = await import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js');
    if (typeof createChat === 'function') {
      createChat({
        webhookUrl: N8N_CHAT_WEBHOOK_URL,
        webhookConfig: {
          method: 'POST',
          headers: {}
        },
        showWelcomeScreen: false,
        defaultLanguage: 'en',
        initialMessages: [
          'Hi there! 👋 I am your CodeTrack AI Practice Assistant.',
          'Ask me any questions about algorithmic problems, time complexity, or debugging hints!'
        ],
        i18n: {
          en: {
            title: 'CodeTrack AI Mentor',
            subtitle: 'Powered by n8n Workflow',
            footer: '',
            getStarted: 'New Conversation',
            inputPlaceholder: 'Ask a coding question...',
          }
        }
      });
      n8nOfficialChatInitialized = true;
    }
  } catch (err) {
    console.log('Official @n8n/chat bundle loading via native drawer mode:', err);
  }

  // 2. Setup click triggers
  const triggerChat = () => {
    const officialToggle = document.querySelector('.chat-window-toggle, [class*="chat-window-toggle"], .chat-toggle, button[class*="toggle"]');
    if (officialToggle) {
      officialToggle.click();
      return;
    }
    openNativeChatDrawer();
  };

  document.getElementById('btn-open-ai-chat')?.addEventListener('click', triggerChat);
  document.getElementById('nav-ai-mentor')?.addEventListener('click', (e) => {
    e.preventDefault();
    triggerChat();
    closeMobileSidebar();
  });

  document.getElementById('n8n-chat-close')?.addEventListener('click', closeNativeChatDrawer);
  document.getElementById('n8n-chat-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'n8n-chat-backdrop') {
      closeNativeChatDrawer();
    }
  });

  document.getElementById('n8n-chat-form')?.addEventListener('submit', handleNativeChatSubmit);
}

/**
 * Bootstraps the application on document load
 */
function initApp() {
  loadProblems();
  setupEventListeners();
  initN8nChat();

  // Route to hash if valid or default to dashboard
  const initialHash = window.location.hash.replace('#', '') || 'dashboard';
  switchView(initialHash);

  renderAllViews();
}

// Attach functions to window for explicit debugging or verification access
window.loadProblems = loadProblems;
window.saveProblems = saveProblems;
window.renderDashboard = renderDashboard;
window.renderProblems = renderProblems;
window.renderTopics = renderTopics;
window.renderPlatforms = renderPlatforms;
window.renderAnalytics = renderAnalytics;
window.updateCharts = updateCharts;
window.addProblem = addProblem;
window.editProblem = editProblem;
window.deleteProblem = deleteProblem;
window.calculateStreak = calculateStreak;
window.calculateStatistics = calculateStatistics;
window.openAddProblemForm = openAddProblemForm;
window.resetForm = resetForm;

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
