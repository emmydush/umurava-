import { ITalentProfile } from '../types';

/**
 * Complete Talent Profile Example
 * This represents a fully comprehensive talent profile with all fields populated
 */
export const completeTalentProfileExample: ITalentProfile = {
  _id: "507f1f77bcf86cd799439011",
  userId: "507f1f77bcf86cd799439012",
  
  // Basic Information
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  title: "Senior Full-Stack Developer",
  
  // Professional Summary
  summary: "Experienced Senior Full-Stack Developer with 8+ years of expertise in building scalable web applications. Specialized in React, Node.js, and cloud architectures. Passionate about creating efficient, user-centric solutions and leading development teams. Proven track record of delivering complex projects on time and within budget.",
  
  // Skills & Expertise
  skills: [
    // Frontend
    "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "HTML5", "CSS3", "SASS",
    // Backend
    "Node.js", "Express.js", "Python", "Django", "Java", "Spring Boot", "PHP", "Laravel",
    // Database
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch",
    // Cloud & DevOps
    "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "CI/CD", "Terraform",
    // Tools & Others
    "Git", "Jira", "Agile", "Scrum", "REST APIs", "GraphQL", "Microservices"
  ],
  
  specialties: [
    "Full-Stack Development",
    "Cloud Architecture",
    "API Design",
    "System Design",
    "Team Leadership",
    "Performance Optimization"
  ],
  
  // Work Experience
  experience: [
    {
      company: "Tech Innovations Inc.",
      position: "Senior Full-Stack Developer",
      startDate: new Date("2021-03-15"),
      endDate: new Date("2024-01-20"),
      description: "Led development of enterprise SaaS platform serving 10,000+ users. Architected microservices infrastructure, improved system performance by 40%, and mentored junior developers. Implemented CI/CD pipelines reducing deployment time by 60%."
    },
    {
      company: "Digital Solutions LLC",
      position: "Full-Stack Developer",
      startDate: new Date("2019-07-01"),
      endDate: new Date("2021-02-28"),
      description: "Developed and maintained multiple client projects using React and Node.js. Collaborated with cross-functional teams to deliver high-quality web applications. Integrated third-party APIs and implemented responsive designs."
    },
    {
      company: "StartUp Hub",
      position: "Junior Developer",
      startDate: new Date("2017-06-01"),
      endDate: new Date("2019-06-30"),
      description: "Built responsive web applications and gained experience in modern JavaScript frameworks. Participated in agile development processes and contributed to code reviews."
    }
  ],
  
  // Education
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: new Date("2013-09-01"),
      endDate: new Date("2017-05-30")
    },
    {
      institution: "Coursera",
      degree: "Professional Certificate",
      field: "Cloud Architecture",
      startDate: new Date("2020-01-15"),
      endDate: new Date("2020-04-30")
    }
  ],
  
  // Professional Links
  portfolio: "https://sarahjohnson.dev",
  linkedin: "https://linkedin.com/in/sarahjohnson",
  github: "https://github.com/sarahjohnson",
  
  // Resume Information
  resumeUrl: "https://example.com/resumes/sarah-johnson-resume.pdf",
  resumeText: `Sarah Johnson
Senior Full-Stack Developer
Email: sarah.johnson@example.com | Phone: +1 (555) 123-4567 | Location: San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Senior Full-Stack Developer with 8+ years of expertise in building scalable web applications...

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes...

EXPERIENCE
Tech Innovations Inc. - Senior Full-Stack Developer (2021-2024)
- Led development of enterprise SaaS platform...
- Improved system performance by 40%...

Digital Solutions LLC - Full-Stack Developer (2019-2021)
- Developed and maintained multiple client projects...

EDUCATION
UC Berkeley - BS Computer Science (2013-2017)...

CERTIFICATIONS
- AWS Certified Solutions Architect
- Google Cloud Professional Developer...`,
  
  resumeFile: {
    filename: "sarah-johnson-resume-2024.pdf",
    originalName: "Sarah_Johnson_Resume.pdf",
    mimeType: "application/pdf",
    size: 245760,
    uploadedAt: new Date("2024-01-15T10:30:00Z")
  },
  
  // Job Preferences
  availability: "2weeks",
  salaryExpectation: {
    min: 120000,
    max: 160000,
    currency: "USD"
  },
  workType: "both",
  
  // Profile Metadata
  source: "umurava_platform",
  isStructured: true,
  
  // Timestamps
  createdAt: new Date("2024-01-15T10:30:00Z"),
  updatedAt: new Date("2024-01-20T15:45:00Z")
};

/**
 * Mock Parsed Candidate Profile (AI-enhanced data)
 */
export const mockParsedCandidateProfile = {
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS"],
    soft: ["Leadership", "Communication", "Problem Solving", "Team Collaboration"],
    domain: ["FinTech", "E-commerce", "Healthcare Tech"]
  },
  experience: {
    totalYears: 8,
    relevantYears: 6,
    seniorityLevel: "senior" as const,
    managementExperience: true,
    teamSize: 5
  },
  education: {
    highestLevel: "bachelor",
    fieldOfStudy: "Computer Science",
    relevantDegree: true,
    additionalCertifications: ["AWS Solutions Architect", "Google Cloud Developer"]
  },
  preferences: {
    workEnvironment: "hybrid",
    teamSize: "5-20",
    companySize: "50-500",
    industry: ["Technology", "Finance", "Healthcare"]
  },
  strengths: [
    "Full-stack development expertise",
    "Cloud architecture knowledge",
    "Team leadership skills",
    "Problem-solving abilities"
  ],
  careerGoals: [
    "Lead development teams",
    "Architect scalable systems",
    "Mentor junior developers"
  ]
};

/**
 * Utility function to create a complete talent profile
 */
export function createCompleteTalentProfile(overrides: Partial<ITalentProfile> = {}): ITalentProfile {
  return {
    ...completeTalentProfileExample,
    ...overrides,
    _id: overrides._id || `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: overrides.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date()
  };
}

/**
 * Sample talent profiles for testing
 */
export const sampleTalentProfiles: ITalentProfile[] = [
  createCompleteTalentProfile({
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@example.com",
    title: "DevOps Engineer",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Python"],
    specialties: ["DevOps", "Cloud Infrastructure", "Automation"],
    salaryExpectation: { min: 130000, max: 170000, currency: "USD" }
  }),
  createCompleteTalentProfile({
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@example.com",
    title: "UX/UI Designer",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "Design Systems"],
    specialties: ["UX Design", "UI Design", "User Research", "Design Systems"],
    salaryExpectation: { min: 90000, max: 130000, currency: "USD" }
  }),
  createCompleteTalentProfile({
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@example.com",
    title: "Data Scientist",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Analysis", "Statistics"],
    specialties: ["Machine Learning", "Data Analysis", "Predictive Modeling"],
    salaryExpectation: { min: 110000, max: 150000, currency: "USD" }
  })
];
