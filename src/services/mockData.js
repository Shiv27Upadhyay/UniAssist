/**
 * Representative university mock knowledge base for PS-3 MVS
 * Grounded in university guidelines, academic regulations, and IEEE Student Branch documents.
 * NOTE: This is pre-configured demo data for testing and offline evaluation.
 */

export const MOCK_KNOWLEDGE_BASE = [
  {
    id: "kb-attendance",
    topic: "Attendance & Exam Eligibility",
    requiredTokens: [/\battendance\b/i, /\battendence\b/i, /\bcondonation\b/i, /\bshortage\b/i],
    patterns: [
      /\b(minimum|exam|semester|class|lecture)\s+attendance\b/i,
      /\battendance\s+(requirement|criteria|rule|percentage|policy|shortage)\b/i,
      /\b(eligible|eligibility)\s+for\s+(exam|examination)\b/i,
      /\bmedical\s+(leave|certificate|condonation)\b/i
    ],
    negativeTokens: [/\bsmartphone\b/i, /\bmobile phone\b/i],
    question: "What is the minimum attendance requirement for semester exams?",
    response: `According to the demo academic regulations, students must maintain a **minimum of 75% attendance** in each registered theory and practical course to be eligible to appear for the End-Semester Examinations.

### Attendance Rules Summary:
| Attendance Range | Status | Action Required |
| :--- | :--- | :--- |
| **75% & Above** | ✅ Eligible | Direct Hall Ticket issuance |
| **65% to 74%** | ⚠️ Condonation Eligible | Submit medical certificates to Dean's Office |
| **Below 65%** | ❌ Ineligible | Course repeat / Grade 'W' (Withdrawn) |

> **Important Rule:** Medical certificates and condonation applications must be submitted to the Academic Section within **7 working days** of returning to campus.`,
    is_grounded: true,
    confidence: 0.96,
    sources: [
      {
        id: "doc_acad_01",
        title: "Academic Regulations 2026 — DEMO",
        section: "Section 8.2: Attendance Requirements",
        page: 12,
        snippet: "A student shall be considered to have satisfied the attendance requirement if he/she has attended at least 75% of the total number of periods scheduled in that course."
      }
    ],
    suggested_questions: [
      "What happens if attendance is below the requirement?",
      "How is attendance calculated?",
      "What are the credit requirements and grading criteria for B.Tech?"
    ]
  },
  {
    id: "kb-credits",
    topic: "B.Tech Credit & Grading System",
    requiredTokens: [/\bcredits?\b/i, /\bgrading\b/i, /\bcgpa\b/i, /\bsgpa\b/i, /\bcbcs\b/i],
    patterns: [
      /\b(credit|grading|grade|cgpa|sgpa)\s+(system|criteria|scale|requirement|policy)\b/i,
      /\bhow\s+many\s+credits\b/i,
      /\b10[- ]point\s+grading\b/i,
      /\bpass(ing)?\s+(marks|criteria|grade)\b/i
    ],
    negativeTokens: [/\bfee\b/i, /\binstallments?\b/i],
    question: "What are the credit requirements and grading criteria for B.Tech?",
    response: `For the **4-Year B.Tech Programme**, the university follows the **Choice Based Credit System (CBCS)**:

### 1. Credit Requirements
* **Total Credits for Degree:** 160 Credits
* **Minimum Credits per Semester:** 18 Credits
* **Maximum Credits per Semester:** 26 Credits

### 2. 10-Point Letter Grading Scale
| Letter Grade | Grade Point | Percentage Range | Performance Description |
| :--- | :--- | :--- | :--- |
| **O** | 10.0 | 90% – 100% | Outstanding |
| **A+** | 9.0 | 80% – 89% | Excellent |
| **A** | 8.0 | 70% – 79% | Very Good |
| **B+** | 7.0 | 60% – 69% | Good |
| **B** | 6.0 | 50% – 59% | Above Average |
| **C** | 5.0 | 40% – 49% | Pass |
| **F** | 0.0 | < 40% | Fail / Re-appear |

A minimum Cumulative Grade Point Average (**CGPA of 5.0**) is required for the final degree award.`,
    is_grounded: true,
    confidence: 0.94,
    sources: [
      {
        id: "doc_curric_02",
        title: "Undergraduate Curriculum Regulations 2026 — DEMO",
        section: "Section 5.1: Credit Structure & CBCS Grading",
        page: 18,
        snippet: "The curriculum allocates 160 credits for 4-year B.Tech degree programs with CBCS letter grading from O (10.0) to F (0.0)."
      }
    ],
    suggested_questions: [
      "What is the policy for supplementary examinations?",
      "How is SGPA calculated?",
      "What is the minimum attendance requirement for semester exams?"
    ]
  },
  {
    id: "kb-library",
    topic: "Central Library Hours & Borrowing",
    requiredTokens: [/\blibrary\b/i, /\blibrarian\b/i, /\breading hall\b/i],
    patterns: [
      /\blibrary\s+(hours|timing|timings|open|close|schedule)\b/i,
      /\b(borrow|return|renew|issue)\s+(book|books)\b/i,
      /\bhow\s+many\s+books\b/i,
      /\blibrary\s+fine(s)?\b/i
    ],
    negativeTokens: [/\bsmartphone\b/i],
    question: "What are the central library working hours and book borrowing limits?",
    response: `The **University Central Library & Knowledge Resource Centre** provides comprehensive physical and digital lending facilities:

### 1. Operating Timings:
* **Monday to Friday:** 8:00 AM – 10:00 PM
* **Saturdays & Sundays:** 9:00 AM – 6:00 PM
* **During Examination Weeks:** 24/7 Open Reading Hall (Ground Floor)

### 2. Book Lending Rules:
* **Undergraduate Students (B.Tech):** Up to **4 books** for **14 days**
* **Postgraduate / Ph.D. Scholars:** Up to **6 books** for **21 days**
* **Online Renewals:** Up to 2 consecutive renewals permitted via Student Portal.
* **Overdue Fine:** ₹ 2.00 per book per day.`,
    is_grounded: true,
    confidence: 0.98,
    sources: [
      {
        id: "doc_lib_03",
        title: "Campus Facilities & Library Guide 2026 — DEMO",
        section: "Section 3.1: Library Hours & Circulation Policy",
        page: 8,
        snippet: "Undergraduate students can borrow 4 books for 14 calendar days. The 24/7 reading hall remains operational during mid-term and end-term exams."
      }
    ],
    suggested_questions: [
      "How do I access IEEE Xplore digital library?",
      "Where can I pay overdue library fines?",
      "What are the attendance requirements?"
    ]
  },
  {
    id: "kb-fee-installments",
    topic: "Semester Fee Payment & Installment Dates",
    requiredTokens: [/\b(installment|installments|due date|due dates|deadlines?|schedule)\b/i],
    patterns: [
      /\b(installment|installments)\s+(date|dates|schedule|details)\b/i,
      /\bfee\s+(installment|installments|deadline|deadlines|due\s+date)\b/i,
      /\bsemester\s+fee\s+(schedule|dates|installments?)\b/i,
      /\bwhen\s+to\s+pay\s+(fees?|tuition)\b/i
    ],
    negativeTokens: [/\bsmartphone\b/i],
    question: "What are the installment dates for semester fee payment?",
    response: `According to the **University Fee Regulations & Academic Calendar 2026 (Demo)**, tuition and semester fees are divided into two equal installments:

### Semester Fee Payment Schedule (2026):
| Installment | Due Date | Grace Period | Late Fine |
| :--- | :--- | :--- | :--- |
| **1st Installment (50%)** | **July 31, 2026** | Up to August 10 | ₹ 100 / day after grace period |
| **2nd Installment (50%)** | **December 15, 2026** | Up to December 24 | ₹ 100 / day after grace period |

### Payment Modes:
* **Online Portal:** Pay via Net Banking / UPI / Credit Card through **ERP > Fee Desk**.
* **Bank Challan:** Collect challan from Accounts Section (Room 102) and deposit at State Bank of India campus branch.`,
    is_grounded: true,
    confidence: 0.95,
    sources: [
      {
        id: "doc_fee_07",
        title: "University Fee Regulations & Schedule 2026 — DEMO",
        section: "Section 3.2: Semester Fee Installment Deadlines",
        page: 7,
        snippet: "Semester fee must be remitted in two equal installments by July 31 and December 15 respectively. A daily late fee applies after the grace period."
      }
    ],
    suggested_questions: [
      "Who should I contact for fee payment issues or scholarships?",
      "How to download the fee payment receipt from ERP?",
      "What are the credit requirements and grading criteria for B.Tech?"
    ]
  },
  {
    id: "kb-ieee",
    topic: "IEEE Student Branch & Hackathon 2026",
    requiredTokens: [/\bieee\b/i, /\bhackathon\b/i],
    patterns: [
      /\bieee\s+(day|branch|student branch|membership|event|hackathon)\b/i,
      /\b(join|participate|register)\s+in?\s*(the)?\s*ieee\b/i,
      /\bproblem\s+statement\s*3\b/i,
      /\b(ps3|ps-3|uniassist)\b/i
    ],
    negativeTokens: [/\bsmartphone\b/i],
    question: "How do I participate in the IEEE Day Hackathon 2026 and join the student branch?",
    response: `Welcome to the **IEEE Student Branch & IEEE Day Hackathon 2026**!

### 1. IEEE Day Hackathon 2026 Details:
* **Date:** October 2026
* **Problem Statements:**
  1. *PS-1:* University Repository Management System
  2. *PS-2:* Smart Student Career Profile
  3. *PS-3:* **AI-Powered Student Chatbot (UniAssist)**
* **Deliverable:** Working functional prototype + live architecture presentation.

### 2. Joining the IEEE Student Branch:
1. Visit **ieee.org** or the university student branch coordinator desk.
2. Enter University Branch Code: **STB-GSFC-2026**.
3. **Member Benefits:**
   - Free access to IEEE Xplore digital papers
   - Discounts on IEEE conferences & certifications
   - Hackathon mentorship & technical workshop access.`,
    is_grounded: true,
    confidence: 0.99,
    sources: [
      {
        id: "doc_ieee_04",
        title: "IEEE Student Branch Charter 2026 — DEMO",
        section: "Section 1.2: Hackathon Tracks & Membership Process",
        page: 4,
        snippet: "IEEE Student Branch coordinates coding hackathons, technical symposiums, and innovation challenges for undergraduate students."
      }
    ],
    suggested_questions: [
      "What are the judging criteria for PS-3 AI Chatbot?",
      "Who are the IEEE Student Branch faculty coordinators?",
      "What is the minimum attendance requirement for semester exams?"
    ]
  },
  {
    id: "kb-hostel",
    topic: "Hostel Leave Pass & Bonafide Certificates",
    requiredTokens: [/\bhostel\b/i, /\bbonafide\b/i, /\boutstation\b/i, /\bwarden\b/i],
    patterns: [
      /\bhostel\s+(leave|pass|night pass|outing|curfew|rules|mess)\b/i,
      /\b(apply|request)\s+for\s+(a\s+)?(hostel\s+leave|bonafide\s+certificate)\b/i,
      /\bbonafide\s+(certificate|doc|letter)\b/i
    ],
    negativeTokens: [/\bsmartphone\b/i],
    question: "How do I apply for a hostel leave pass or bonafide certificate?",
    response: `Student administrative services are managed digitally through the **Student ERP Portal**:

### 1. Hostel Outing & Night Leave Pass:
1. Log in to **ERP Portal > Hostel Services > Outstation Pass**.
2. Submit your departure date, reason, and destination.
3. System sends OTP/email consent to registered parents.
4. **Timelines:** Submit at least **24 hours in advance**.
5. **Curfew In-Time:** 9:30 PM on weekdays, 10:00 PM on Sundays.

### 2. Bonafide Certificate Application:
* Navigate to **ERP > Student Desk > Certificates**.
* Select purpose (*Education Loan, Passport, or Internship Verification*).
* Processing turnaround: **2 business days** with digital verified signature.`,
    is_grounded: true,
    confidence: 0.93,
    sources: [
      {
        id: "doc_admin_05",
        title: "Student Welfare & Hostel Regulations 2026 — DEMO",
        section: "Section 6.3: Digital Leave Applications & Verification",
        page: 22,
        snippet: "Night leave applications require parent authentication and Chief Warden digital signoff through the ERP portal."
      }
    ],
    suggested_questions: [
      "What are the hostel mess timings?",
      "Who is the Chief Warden?",
      "Who should I contact for fee payment issues or scholarships?"
    ]
  },
  {
    id: "kb-contacts",
    topic: "University Administrative Contacts & Helpdesk Directory",
    requiredTokens: [/\b(contact|contacts|phone numbers?|helpline|helpdesk|directory|whom to contact|who should i contact|who to contact)\b/i],
    patterns: [
      /\bwho\s+(should|do|can)\s+i\s+contact\b/i,
      /\b(phone\s+number|email\s+address|helpline|helpdesk|directory)\b/i,
      /\b(accounts|scholarships?|grievance|anti[- ]ragging)\s+(office|room|contact|email|phone)\b/i
    ],
    negativeTokens: [/\bsmartphone\b/i, /\bmobile phone\b/i, /\bbuy\b/i, /\bshop\b/i],
    question: "Who should I contact for fee payment issues or scholarship queries?",
    response: `For administrative queries, fee dues, and scholarship verifications, contact the respective university departments:

### Key University Contacts:
* 💳 **Accounts & Fee Section:**
  * **Email:** \`accounts@university.edu\`
  * **Phone:** +91 (0265) 234-5678 (Ext: 104)
  * **Office:** Admin Block, Room 102 (Mon–Fri, 9:30 AM – 4:30 PM)
* 🎓 **Scholarships & Financial Aid Desk:**
  * **Email:** \`scholarships@university.edu\`
  * **Officer:** Assistant Registrar (Student Welfare)
* 💻 **IT Helpdesk & ERP Support:**
  * **Email:** \`erp-support@university.edu\` | Ext: 301
* 🛡️ **Anti-Ragging / Student Grievance Helpline:**
  * **Toll-Free 24x7:** 1800-180-5522 | \`grievance@university.edu\``,
    is_grounded: true,
    confidence: 0.95,
    sources: [
      {
        id: "doc_dir_06",
        title: "University Administrative Directory 2026 — DEMO",
        section: "Section 12.1: Departmental Contacts & Support Desks",
        page: 42,
        snippet: "Accounts, scholarship, and student grievance desks operate on all official working days from 9:30 AM to 4:30 PM."
      }
    ],
    suggested_questions: [
      "What are the installment dates for semester fee payment?",
      "Which government scholarships are accepted?",
      "What is the minimum attendance requirement for semester exams?"
    ]
  },
  {
    id: "kb-sports",
    topic: "Campus Sports & Gymnasium Facilities",
    requiredTokens: [/\b(sports|gym|gymnasium|badminton|cricket|swimming|stadium|courts?)\b/i],
    patterns: [
      /\b(sports|gym|gymnasium|badminton|cricket)\s+(facility|facilities|timings?|hours?|booking)\b/i,
      /\bhow\s+to\s+book\s+(the\s+)?(badminton|gym|court)\b/i
    ],
    negativeTokens: [/\bsmartphone\b/i],
    question: "What sports and gymnasium facilities are available on campus?",
    response: `The **University Sports Complex** provides indoor and outdoor athletic facilities for students and faculty:

### Facilities Available:
* 🏋️ **Campus Gymnasium:** 6:00 AM – 9:00 AM & 4:30 PM – 8:30 PM (Separate trainer slots for male/female students).
* 🏸 **Indoor Badminton Courts:** 3 synthetic wooden courts (Booking via Sports ERP).
* 🏏 **Cricket & Football Grounds:** Floodlit grounds with coach supervision.
* 🏀 **Basketball & Volleyball Courts:** Open daily until 9:00 PM.

> **Access Note:** Students must present their valid University Smart ID Card and wear non-marking sports shoes inside indoor courts.`,
    is_grounded: true,
    confidence: 0.91,
    sources: [
      {
        id: "doc_sports_07",
        title: "Campus Sports & Recreation Guidelines 2026 — DEMO",
        section: "Section 2.4: Sports Complex Access & Booking Rules",
        page: 15,
        snippet: "Gymnasium and badminton courts are open morning and evening sessions with mandatory student ID card check-in."
      }
    ],
    suggested_questions: [
      "How to book the indoor badminton court?",
      "What are the central library working hours and book borrowing limits?",
      "What is the minimum attendance requirement for semester exams?"
    ]
  }
];

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
