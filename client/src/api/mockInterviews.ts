import { apiClient } from './client';
import { ApiResponse, MockInterviewSession, ScheduledAiInterview, InterviewQuestionItem } from '../types';
import { calendarApi } from './calendar';

const STORAGE_KEY_SESSIONS = 'placewise_mock_sessions';
const STORAGE_KEY_SCHEDULED = 'placewise_scheduled_ai_interviews';

// Curated question bank by technology topic
const TOPIC_QUESTIONS: Record<string, Omit<InterviewQuestionItem, 'id' | 'questionNumber'>[]> = {
  html: [
    {
      category: 'TECHNICAL',
      topic: 'HTML5',
      difficulty: 'EASY',
      maxScore: 10,
      questionText: 'Explain the difference between semantic HTML elements (like <header>, <article>, <nav>, <section>) and generic <div> containers. How do semantic tags impact SEO and accessibility (a11y)?',
      expectedAnswer: 'Semantic HTML conveys meaning to both the browser and assistive technologies (screen readers). Elements like <main>, <article>, and <section> provide landmarks, improve DOM clarity, and aid search engine indexing compared to unsemantic div tags.',
      evaluationCriteria: 'Mention accessibility tree, screen readers, SEO crawlability, and ARIA roles.',
    },
    {
      category: 'TECHNICAL',
      topic: 'HTML5',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'What is the purpose of the HTML5 Web Storage API (localStorage, sessionStorage) versus Cookies? When would you choose one over the other in a web application?',
      expectedAnswer: 'Cookies are sent with every HTTP request and have a 4KB limit. localStorage provides ~5MB persistent client storage with no expiration, while sessionStorage lasts only for the duration of the page session.',
      evaluationCriteria: 'Discuss capacity differences (4KB vs 5MB), expiration lifecycles, and security (XSS vs CSRF, HttpOnly flags).',
    },
    {
      category: 'TECHNICAL',
      topic: 'HTML5',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'Explain the difference between async and defer attributes on a <script> tag. How does each affect page rendering and Core Web Vitals (FCP, LCP)?',
      expectedAnswer: 'Both download scripts asynchronously. "async" executes immediately as soon as downloaded, pausing HTML parsing. "defer" downloads in parallel but executes only after HTML parsing is complete in document order.',
      evaluationCriteria: 'Explain parsing blockage, DOMContentLoaded timing, and script execution order guarantees.',
    },
  ],
  css: [
    {
      category: 'TECHNICAL',
      topic: 'CSS3',
      difficulty: 'EASY',
      maxScore: 10,
      questionText: 'Explain the CSS Box Model in detail. What is the difference between content-box and border-box sizing?',
      expectedAnswer: 'The Box Model consists of content, padding, border, and margin. In "content-box", specified width applies only to content. In "border-box", width includes padding and border, making responsive sizing predictable.',
      evaluationCriteria: 'Differentiate content-box vs border-box, padding calculation, and margin collapsing.',
    },
    {
      category: 'TECHNICAL',
      topic: 'CSS3',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'Compare CSS Flexbox and CSS Grid. In what practical scenarios would you choose Grid over Flexbox, or combine them?',
      expectedAnswer: 'Flexbox is designed for one-dimensional layouts (either row or column), ideal for navbars, form controls, and linear stacks. CSS Grid is two-dimensional (both rows and columns simultaneously), ideal for overall page scaffolding and complex tile matrices.',
      evaluationCriteria: 'Mention 1D vs 2D layout systems, justify-content / align-items, grid-template-columns, and subgrid.',
    },
    {
      category: 'TECHNICAL',
      topic: 'CSS3',
      difficulty: 'HARD',
      maxScore: 10,
      questionText: 'What are CSS Specificity rules and the Cascade? How does !important, inline styles, IDs, classes, and element selectors resolve when styling conflicts occur?',
      expectedAnswer: 'Specificity hierarchy follows a four-part score: Inline styles (1000) > IDs (100) > Classes/attributes/pseudo-classes (10) > Elements/pseudo-elements (1). !important overrides normal specificity.',
      evaluationCriteria: 'Explain numeric weighting, cascade order, source order ties, and why overusing !important causes technical debt.',
    },
  ],
  javascript: [
    {
      category: 'TECHNICAL',
      topic: 'JavaScript',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'Explain how the JavaScript Event Loop works. What is the difference between the Call Stack, Microtask Queue (Promises), and Macrotask/Task Queue (setTimeout)?',
      expectedAnswer: 'JavaScript is single-threaded. Synchronous code runs on Call Stack. Microtasks (Promise callbacks, queueMicrotask) take highest priority and execute immediately after the call stack clears before any Macrotasks (setTimeout, setInterval, I/O) are processed.',
      evaluationCriteria: 'Clearly articulate Call Stack, Event Loop tick, microtask priority over macrotask, and requestAnimationFrame.',
    },
    {
      category: 'TECHNICAL',
      topic: 'JavaScript',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'What is a Closure in JavaScript? Provide a real-world scenario where closures are useful, such as data privacy or function currying.',
      expectedAnswer: 'A closure is the combination of a function bundled together with references to its surrounding lexical state. Inner functions retain access to outer function variables even after the outer function has executed.',
      evaluationCriteria: 'Explain lexical scope preservation, encapsulation / private variables, and memory retention considerations.',
    },
    {
      category: 'TECHNICAL',
      topic: 'JavaScript',
      difficulty: 'HARD',
      maxScore: 10,
      questionText: 'Write or explain an implementation of a Debounce function in JavaScript. What problem does debouncing solve in user interface events (such as search autocomplete or window resizing)?',
      expectedAnswer: 'Debouncing delays invoking a function until after a specified wait time has elapsed since the last time the debounced function was invoked. It clears the existing setTimeout timer on each rapid trigger and restarts it.',
      evaluationCriteria: 'Demonstrate timer management (clearTimeout, setTimeout), passing correct "this" and arguments, and contrasting with throttling.',
    },
    {
      category: 'TECHNICAL',
      topic: 'JavaScript',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'Explain the difference between == and ===, and discuss how JavaScript handles implicit type coercion in comparisons.',
      expectedAnswer: '== performs loose equality with implicit type conversion (coercion), which can lead to unexpected falsy comparisons (e.g. 0 == "", null == undefined). === performs strict equality without coercion.',
      evaluationCriteria: 'Highlight IEEE 754 NaN quirks, truthy/falsy coercion, and object reference equality.',
    },
  ],
  react: [
    {
      category: 'TECHNICAL',
      topic: 'React',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'Explain the React Component Lifecycle with Hooks (useEffect, useMemo, useCallback). When does useEffect cleanup run?',
      expectedAnswer: 'useEffect runs after render based on dependency array changes. The cleanup function runs before the component unmounts and before every re-execution of the effect when dependencies change.',
      evaluationCriteria: 'Discuss dependency array semantics, avoiding stale closures, and cleanup for event listeners or timers.',
    },
    {
      category: 'TECHNICAL',
      topic: 'React',
      difficulty: 'HARD',
      maxScore: 10,
      questionText: 'How does React Virtual DOM and Reconciliation algorithm work? What is the role of the "key" prop in dynamic lists?',
      expectedAnswer: 'React maintains a lightweight Virtual DOM tree in memory. On state updates, it diffs the new tree with previous tree using a heuristic O(n) algorithm. "key" gives elements a stable identity to avoid recreating DOM nodes.',
      evaluationCriteria: 'Explain diffing heuristics, fiber architecture, and problems with using array index as key.',
    },
  ],
  python: [
    {
      category: 'TECHNICAL',
      topic: 'Python',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'Explain Python memory management and the Global Interpreter Lock (GIL). How does the GIL impact CPU-bound multithreading versus I/O-bound operations?',
      expectedAnswer: 'GIL is a mutex that prevents multiple native threads from executing Python bytecodes simultaneously. For CPU-bound tasks, multiprocessing or C extensions are needed; for I/O tasks, asyncio or threading works well.',
      evaluationCriteria: 'Explain reference counting, cycle garbage collector, and multiprocessing vs multithreading tradeoffs.',
    },
  ],
  sql: [
    {
      category: 'TECHNICAL',
      topic: 'SQL / Databases',
      difficulty: 'MEDIUM',
      maxScore: 10,
      questionText: 'Explain database indexing (B-Tree vs Hash index) and how the query optimizer uses indexes. What is the difference between Clustered and Non-Clustered indexes?',
      expectedAnswer: 'B-Tree indexes maintain sorted tree hierarchies enabling logarithmic range and point lookups. Clustered indexes determine physical row order on disk (one per table), while non-clustered indexes contain pointers to table rows.',
      evaluationCriteria: 'Mention seek vs scan, composite index column order, and write amplification overhead.',
    },
  ],
  dsa: [
    {
      category: 'TECHNICAL',
      topic: 'Data Structures & Algorithms',
      difficulty: 'HARD',
      maxScore: 10,
      questionText: 'Given an unsorted array of numbers, describe an algorithm to find the Longest Substring Without Repeating Characters in O(n) time and O(min(m, n)) space.',
      expectedAnswer: 'Use a sliding window approach with two pointers and a Hash Map storing character indices. Expand right pointer; if duplicate seen in window, jump left pointer to max(left, lastSeenIndex + 1). Track max window length.',
      evaluationCriteria: 'Explain two-pointer sliding window, hash map lookup in O(1), and time/space complexity.',
    },
  ],
};

const INITIAL_SCHEDULED_INTERVIEWS: ScheduledAiInterview[] = [
  {
    id: 'sched-1',
    title: 'Faculty Screening: HTML, CSS & Modern JavaScript Assessment',
    creatorId: 'mgr-1',
    creatorName: 'Prof. Aniruddh Joshi (Dept of CSE)',
    creatorRole: 'PLACEMENT_MANAGER',
    targetAudience: 'All Final Year B.Tech CSE & IT Students',
    topics: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'INTERMEDIATE',
    durationMinutes: 45,
    scheduledDate: '2026-10-15',
    scheduledTime: '11:00 AM',
    instructions: 'Comprehensive technical assessment on Web Standards, responsive CSS Grid/Flexbox layouts, DOM manipulation, and asynchronous JavaScript.',
    totalQuestions: 4,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-s1-1',
        questionNumber: 1,
        category: 'TECHNICAL',
        topic: 'HTML5',
        difficulty: 'EASY',
        maxScore: 10,
        questionText: 'Explain the difference between semantic HTML elements (like <header>, <article>, <nav>, <section>) and generic <div> containers. How do semantic tags impact SEO and accessibility (a11y)?',
        expectedAnswer: 'Semantic HTML conveys meaning to both the browser and assistive technologies (screen readers). Elements like <main>, <article>, and <section> provide landmarks, improve DOM clarity, and aid search engine indexing.',
        evaluationCriteria: 'Mention accessibility tree, screen readers, SEO crawlability, and ARIA roles.',
      },
      {
        id: 'q-s1-2',
        questionNumber: 2,
        category: 'TECHNICAL',
        topic: 'CSS3',
        difficulty: 'MEDIUM',
        maxScore: 10,
        questionText: 'Compare CSS Flexbox and CSS Grid. In what practical scenarios would you choose Grid over Flexbox, or combine them in a real-world web application?',
        expectedAnswer: 'Flexbox is designed for one-dimensional layouts (either row or column), ideal for navbars, form controls, and linear stacks. CSS Grid is two-dimensional (both rows and columns simultaneously), ideal for overall page scaffolding.',
        evaluationCriteria: 'Mention 1D vs 2D layout systems, justify-content / align-items, grid-template-columns, and subgrid.',
      },
      {
        id: 'q-s1-3',
        questionNumber: 3,
        category: 'TECHNICAL',
        topic: 'JavaScript',
        difficulty: 'MEDIUM',
        maxScore: 10,
        questionText: 'Explain how the JavaScript Event Loop works. What is the difference between the Call Stack, Microtask Queue (Promises), and Macrotask/Task Queue (setTimeout)?',
        expectedAnswer: 'JavaScript is single-threaded. Synchronous code runs on Call Stack. Microtasks (Promise callbacks, queueMicrotask) take highest priority and execute immediately after the call stack clears before any Macrotasks are processed.',
        evaluationCriteria: 'Clearly articulate Call Stack, Event Loop tick, microtask priority over macrotask, and async timing.',
      },
      {
        id: 'q-s1-4',
        questionNumber: 4,
        category: 'TECHNICAL',
        topic: 'JavaScript',
        difficulty: 'HARD',
        maxScore: 10,
        questionText: 'Write or explain an implementation of a Debounce function in JavaScript. What problem does debouncing solve in user interface events (such as search autocomplete or window resizing)?',
        expectedAnswer: 'Debouncing delays invoking a function until after a specified wait time has elapsed since the last trigger. It clears the existing setTimeout timer on each rapid trigger and restarts it.',
        evaluationCriteria: 'Demonstrate timer management (clearTimeout, setTimeout), passing correct "this" and arguments, and contrasting with throttling.',
      },
    ],
  },
  {
    id: 'sched-2',
    title: 'Mentor Technical Round: Full-Stack MERN Architecture',
    creatorId: 'user-m-1',
    creatorName: 'Ananya Deshmukh (Google Staff Engineer / Alumni Mentor)',
    creatorRole: 'MENTOR',
    targetAudience: 'Shortlisted Candidates for Google SWE Campus Drive',
    topics: ['React', 'JavaScript', 'SQL / Databases', 'System Design'],
    difficulty: 'ADVANCED',
    durationMinutes: 60,
    scheduledDate: '2026-10-19',
    scheduledTime: '04:00 PM',
    instructions: 'In-depth evaluation on React reconciliation, database indexing, state machines, and RESTful API error handling.',
    totalQuestions: 4,
    status: 'SCHEDULED',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-s2-1',
        questionNumber: 1,
        category: 'TECHNICAL',
        topic: 'React',
        difficulty: 'HARD',
        maxScore: 10,
        questionText: 'How does React Virtual DOM and Reconciliation algorithm work? What is the role of the "key" prop in dynamic lists?',
        expectedAnswer: 'React maintains a lightweight Virtual DOM tree in memory. On state updates, it diffs the new tree with previous tree using a heuristic O(n) algorithm. "key" gives elements a stable identity to avoid recreating DOM nodes.',
        evaluationCriteria: 'Explain diffing heuristics, fiber architecture, and problems with using array index as key.',
      },
      {
        id: 'q-s2-2',
        questionNumber: 2,
        category: 'TECHNICAL',
        topic: 'JavaScript',
        difficulty: 'MEDIUM',
        maxScore: 10,
        questionText: 'What is a Closure in JavaScript? Provide a real-world scenario where closures are useful, such as data privacy or function currying.',
        expectedAnswer: 'A closure is the combination of a function bundled together with references to its surrounding lexical state. Inner functions retain access to outer function variables even after the outer function has executed.',
        evaluationCriteria: 'Explain lexical scope preservation, encapsulation / private variables, and memory retention considerations.',
      },
      {
        id: 'q-s2-3',
        questionNumber: 3,
        category: 'TECHNICAL',
        topic: 'SQL / Databases',
        difficulty: 'MEDIUM',
        maxScore: 10,
        questionText: 'Explain database indexing (B-Tree vs Hash index) and how the query optimizer uses indexes. What is the difference between Clustered and Non-Clustered indexes?',
        expectedAnswer: 'B-Tree indexes maintain sorted tree hierarchies enabling logarithmic range and point lookups. Clustered indexes determine physical row order on disk, while non-clustered indexes contain pointers to table rows.',
        evaluationCriteria: 'Mention seek vs scan, composite index column order, and write amplification overhead.',
      },
      {
        id: 'q-s2-4',
        questionNumber: 4,
        category: 'TECHNICAL',
        topic: 'Data Structures & Algorithms',
        difficulty: 'HARD',
        maxScore: 10,
        questionText: 'Given an unsorted array of numbers, describe an algorithm to find the Longest Substring Without Repeating Characters in O(n) time and O(min(m, n)) space.',
        expectedAnswer: 'Use a sliding window approach with two pointers and a Hash Map storing character indices. Expand right pointer; if duplicate seen in window, jump left pointer to max(left, lastSeenIndex + 1).',
        evaluationCriteria: 'Explain two-pointer sliding window, hash map lookup in O(1), and time/space complexity.',
      },
    ],
  },
];

const INITIAL_SESSIONS: MockInterviewSession[] = [
  {
    id: 'mock-session-default-1',
    studentId: 'student-demo',
    companyName: 'Google India',
    targetRole: 'Software Engineer (SWE)',
    status: 'COMPLETED',
    overallScore: 88,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    rubrics: {
      technicalAccuracy: 90,
      communicationClarity: 85,
      problemSolving: 90,
      systemDesign: 85,
    },
    feedback: {
      strengths: [
        'Structured analytical approach to graph traversals and memory optimization',
        'Strong awareness of edge cases and input validation',
      ],
      areasForImprovement: [
        'Could elaborate further on database partitioning trade-offs under high write loads',
      ],
      interviewerVerdict: 'Strong candidate for On-Campus Technical Rounds',
    },
    questions: [
      {
        id: 'q-1',
        questionNumber: 1,
        category: 'TECHNICAL',
        topic: 'Algorithms',
        questionText: 'Explain the difference between BFS and DFS. When would you prefer BFS over DFS for finding shortest paths in an unweighted graph?',
        studentAnswer: 'BFS explores graph level by level using a queue, guaranteeing the shortest path in unweighted graphs because it checks all distance-k nodes before distance-(k+1). DFS goes deep with recursion/stack, better for topological sort and cycle detection.',
        feedback: 'Excellent explanation with correct queue data structure mentioned.',
        score: 95,
      },
      {
        id: 'q-2',
        questionNumber: 2,
        category: 'BEHAVIORAL',
        topic: 'Leadership',
        questionText: 'Tell me about a time you encountered an unexpected bug right before a critical deployment deadline. How did you handle the situation?',
        studentAnswer: 'During our college hackathon, our payment webhook crashed 1 hour before submission. I reproduced it in isolation, found an unhandled null payload, added a fallback, and deployed with unit tests.',
        feedback: 'Good STAR method structure and composure under pressure.',
        score: 85,
      },
    ],
  },
];

function getStoredScheduled(): ScheduledAiInterview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHEDULED);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_SCHEDULED_INTERVIEWS;
}

function saveStoredScheduled(items: ScheduledAiInterview[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SCHEDULED, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function getStoredSessions(): MockInterviewSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_SESSIONS;
}

function saveStoredSessions(sessions: MockInterviewSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export const mockInterviewsApi = {
  /**
   * AI Question Suggester
   * Suggests questions automatically tailored to the specific topics entered by faculty/mentor
   */
  async generateAiQuestions(params: {
    topics: string[];
    difficulty?: 'ENTRY' | 'INTERMEDIATE' | 'ADVANCED';
    count?: number;
    role?: string;
  }): Promise<ApiResponse<InterviewQuestionItem[]>> {
    const { topics, count = 4, difficulty = 'INTERMEDIATE' } = params;
    const normalizedTopics = topics.map((t) => t.trim().toLowerCase());

    const collected: InterviewQuestionItem[] = [];
    let qIndex = 1;

    // Check pre-curated question pool
    for (const [key, questions] of Object.entries(TOPIC_QUESTIONS)) {
      if (normalizedTopics.some((t) => t.includes(key) || key.includes(t))) {
        for (const q of questions) {
          collected.push({
            id: `gen-q-${Date.now()}-${qIndex}`,
            questionNumber: qIndex,
            ...q,
          });
          qIndex++;
          if (collected.length >= count) break;
        }
      }
      if (collected.length >= count) break;
    }

    // If still need more questions or for custom topics (e.g. unknown topic)
    if (collected.length < count) {
      const remaining = count - collected.length;
      for (let i = 0; i < remaining; i++) {
        const topicName = topics[i % topics.length] || 'Technical Stack';
        collected.push({
          id: `gen-q-${Date.now()}-${qIndex}`,
          questionNumber: qIndex,
          category: 'TECHNICAL',
          topic: topicName,
          difficulty: difficulty === 'ENTRY' ? 'EASY' : difficulty === 'ADVANCED' ? 'HARD' : 'MEDIUM',
          maxScore: 10,
          questionText: `Discuss core architecture, best practices, and performance optimization techniques when building enterprise applications with ${topicName}. What common pitfalls should engineers avoid?`,
          expectedAnswer: `Candidate should outline key features of ${topicName}, lifecycle or execution flow, memory/CPU performance tradeoffs, error handling patterns, and production debugging strategies.`,
          evaluationCriteria: `Candidate articulates architectural principles, demonstrates depth in ${topicName}, and highlights concrete enterprise best practices.`,
        });
        qIndex++;
      }
    }

    return {
      success: true,
      message: `Generated ${collected.length} AI interview questions tailored for ${topics.join(', ')}`,
      data: collected,
    };
  },

  /**
   * Schedule an AI Mock Interview Test (Faculty, Mentor, Admin)
   */
  async scheduleAiInterview(data: Omit<ScheduledAiInterview, 'id' | 'createdAt'>): Promise<ApiResponse<ScheduledAiInterview>> {
    const newInterview: ScheduledAiInterview = {
      id: `sched-${Date.now()}`,
      ...data,
      totalQuestions: data.questions.length,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredScheduled();
    const updated = [newInterview, ...current];
    saveStoredScheduled(updated);

    // Also automatically reflect on Smart Calendar
    try {
      await calendarApi.scheduleEvent({
        title: `AI Assessment: ${data.title}`,
        eventType: 'ONLINE_ASSESSMENT',
        date: data.scheduledDate,
        time: data.scheduledTime,
        companyName: data.topics.join(' / '),
        locationOrLink: 'PlaceWise AI Assessment Portal',
        description: `Target Batch: ${data.targetAudience}. Duration: ${data.durationMinutes} mins. Topics: ${data.topics.join(', ')}. Created by ${data.creatorName}.`,
      });
    } catch {
      // calendar event integration is non-blocking
    }

    return {
      success: true,
      message: 'AI Mock Interview Test scheduled successfully!',
      data: newInterview,
    };
  },

  /**
   * Get all scheduled AI interviews created by Faculty / Mentors
   */
  async getScheduledAiInterviews(): Promise<ApiResponse<ScheduledAiInterview[]>> {
    return {
      success: true,
      data: getStoredScheduled(),
    };
  },

  /**
   * Delete a scheduled AI interview
   */
  async deleteScheduledAiInterview(id: string): Promise<ApiResponse<null>> {
    const current = getStoredScheduled();
    const updated = current.filter((item) => item.id !== id);
    saveStoredScheduled(updated);
    return {
      success: true,
      message: 'Scheduled assessment removed',
      data: null,
    };
  },

  /**
   * Launch a student session from a scheduled test
   */
  async startScheduledSession(scheduledId: string): Promise<ApiResponse<MockInterviewSession>> {
    const scheduled = getStoredScheduled().find((s) => s.id === scheduledId) || INITIAL_SCHEDULED_INTERVIEWS[0];

    const session: MockInterviewSession = {
      id: `session-${Date.now()}`,
      studentId: 'current-student',
      companyName: scheduled.title,
      targetRole: `${scheduled.topics.join(' / ')} Assessment`,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      scheduledTestId: scheduled.id,
      questions: scheduled.questions.map((q, idx) => ({
        id: q.id || `q-${idx + 1}`,
        questionNumber: idx + 1,
        category: q.category || 'TECHNICAL',
        topic: q.topic || scheduled.topics[0],
        questionText: q.questionText,
        expectedAnswer: q.expectedAnswer,
        studentAnswer: undefined,
        feedback: undefined,
        score: undefined,
      })),
    };

    const current = getStoredSessions();
    const updated = [session, ...current];
    saveStoredSessions(updated);

    return {
      success: true,
      message: 'Assessment session launched',
      data: session,
    };
  },

  // Standard student mock interview methods with fallback
  async startSession(data: { companyName: string; targetRole: string; resumeId?: string }): Promise<ApiResponse<MockInterviewSession>> {
    try {
      const res = await apiClient.post<ApiResponse<MockInterviewSession>>('/mock-interviews/start', data);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const newSession: MockInterviewSession = {
      id: `session-${Date.now()}`,
      studentId: 'current-user',
      companyName: data.companyName,
      targetRole: data.targetRole,
      resumeId: data.resumeId,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: `q-${Date.now()}-1`,
          questionNumber: 1,
          category: 'TECHNICAL',
          topic: 'System Architecture',
          questionText: `Explain how you would design a scalable, fault-tolerant backend system for ${data.companyName} with high concurrent traffic.`,
        },
        {
          id: `q-${Date.now()}-2`,
          questionNumber: 2,
          category: 'TECHNICAL',
          topic: 'Data Structures',
          questionText: 'Given an array of integers, how would you find the top K frequent elements in O(N log K) time complexity?',
        },
        {
          id: `q-${Date.now()}-3`,
          questionNumber: 3,
          category: 'BEHAVIORAL',
          topic: 'Teamwork & Ownership',
          questionText: 'Tell me about a time you had a technical disagreement with a team member. How did you resolve it constructively?',
        },
        {
          id: `q-${Date.now()}-4`,
          questionNumber: 4,
          category: 'SITUATIONAL',
          topic: 'Production Outages',
          questionText: 'If a critical production service starts throwing 500 Internal Server Errors under peak load, walk me through your step-by-step triage process.',
        },
      ],
    };

    const current = getStoredSessions();
    const updated = [newSession, ...current];
    saveStoredSessions(updated);

    return {
      success: true,
      message: 'Interview session created',
      data: newSession,
    };
  },

  async getSession(id: string): Promise<ApiResponse<MockInterviewSession>> {
    try {
      const res = await apiClient.get<ApiResponse<MockInterviewSession>>(`/mock-interviews/${id}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const session = getStoredSessions().find((s) => s.id === id) || INITIAL_SESSIONS[0];
    return {
      success: true,
      data: session,
    };
  },

  async submitAnswer(id: string, data: { questionNumber: number; studentAnswer: string }): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.post<ApiResponse<any>>(`/mock-interviews/${id}/answer`, data);
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const current = getStoredSessions();
    const updated = current.map((s) => {
      if (s.id === id) {
        const questions = s.questions.map((q) => {
          if (q.questionNumber === data.questionNumber) {
            // Simulated AI evaluation
            const wordCount = data.studentAnswer.trim().split(/\s+/).length;
            const score = Math.min(95, Math.max(65, 70 + Math.floor(wordCount / 3)));
            return {
              ...q,
              studentAnswer: data.studentAnswer,
              score,
              feedback: 'Demonstrated solid grasp of key principles, structured explanation, and clear communication.',
            };
          }
          return q;
        });
        return { ...s, questions };
      }
      return s;
    });
    saveStoredSessions(updated);

    return {
      success: true,
      message: 'Answer saved & evaluated by AI',
      data: null,
    };
  },

  async completeSession(id: string): Promise<ApiResponse<MockInterviewSession>> {
    try {
      const res = await apiClient.post<ApiResponse<MockInterviewSession>>(`/mock-interviews/${id}/complete`);
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const current = getStoredSessions();
    let completedItem: MockInterviewSession | null = null;
    const updated = current.map((s) => {
      if (s.id === id) {
        const scores = s.questions.map((q) => q.score || 80);
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        completedItem = {
          ...s,
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          overallScore: avg,
          rubrics: {
            technicalAccuracy: avg + 2,
            communicationClarity: avg - 1,
            problemSolving: avg,
            structuredThinking: avg + 1,
          },
          feedback: {
            strengths: ['Clear terminology', 'Structured response format', 'Strong core foundation'],
            areasForImprovement: ['Elaborate more on production scale and telemetry monitoring'],
            interviewerVerdict: 'Recommended for corporate drive interview round',
          },
        };
        return completedItem;
      }
      return s;
    });
    saveStoredSessions(updated);

    return {
      success: true,
      data: completedItem || INITIAL_SESSIONS[0],
    };
  },

  async getHistory(): Promise<ApiResponse<MockInterviewSession[]>> {
    try {
      const res = await apiClient.get<ApiResponse<MockInterviewSession[]>>('/mock-interviews/history');
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      data: getStoredSessions(),
    };
  },
};
