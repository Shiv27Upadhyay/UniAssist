/**
 * Representative university mock knowledge base for PS-3 MVS
 * Grounded in university guidelines, academic regulations, and IEEE Student Branch documents.
 * NOTE: This is pre-configured demo data for testing and offline evaluation.
 */

export const MOCK_KNOWLEDGE_BASE = [];

/**
 * Fallback response when a query is out-of-scope or not found in the knowledge base
 */
export const OUT_OF_SCOPE_FALLBACK = {
  response: `This information is not available in the current demo knowledge base. UniAssist does not guess or generate unsupported university information.

### What you can do:
1. Reach out directly to the **Student Affairs Desk** at \`helpdesk@university.edu\` or visit Room 102, Admin Building.
2. Search official notices on the university student portal.
3. Try asking one of the verified university topics below.`,
  is_grounded: false,
  confidence: 0.12,
  sources: [],
  suggested_questions: [
    "What are the attendance requirements?",
    "What are the examination rules?",
    "What are the library policies?"
  ]
};

/**
 * 6 High-impact starter prompt cards for the Welcome Screen
 */
export const STARTER_PROMPTS = [
  {
    id: "prompt-academics",
    category: "Academics",
    tag: "Grading & Credits",
    icon: "GraduationCap",
    title: "B.Tech Credit & Grading System",
    query: "What are the credit requirements and grading criteria for B.Tech?"
  },
  {
    id: "prompt-exams",
    category: "Examinations",
    tag: "Exam Rules",
    icon: "FileCheck",
    title: "Attendance & Exam Eligibility",
    query: "What is the minimum attendance requirement for semester exams?"
  },
  {
    id: "prompt-facilities",
    category: "Facilities",
    tag: "Campus Life",
    icon: "BookOpen",
    title: "Library Hours & Book Borrowing",
    query: "What are the central library working hours and book borrowing limits?"
  },
  {
    id: "prompt-fee",
    category: "Finance",
    tag: "Fee Schedule",
    icon: "Building2",
    title: "Semester Fee & Installment Dates",
    query: "What are the installment dates for semester fee payment?"
  },
  {
    id: "prompt-ieee",
    category: "IEEE & Events",
    tag: "Hackathon 2026",
    icon: "Sparkles",
    title: "IEEE Hackathon 2026 & Branch Info",
    query: "How do I participate in the IEEE Day Hackathon 2026 and join the student branch?"
  },
  {
    id: "prompt-contacts",
    category: "Directory",
    tag: "Official Helpdesk",
    icon: "PhoneCall",
    title: "Admin Contacts & Support Desks",
    query: "Who should I contact for fee payment issues or scholarship queries?"
  }
];
