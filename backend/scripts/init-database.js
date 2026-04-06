const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017').then(() => {
  console.log('Connected to MongoDB');
  initializeDatabase();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define schemas (simplified versions for initialization)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const talentProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  title: String,
  summary: String,
  skills: [String],
  specialties: [String],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date
  }],
  workType: String,
  availability: String,
  portfolio: String,
  linkedin: String,
  github: String,
  resumeText: String,
  resumeUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const jobPostingSchema = new mongoose.Schema({
  recruiterId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  experience: String,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  workType: String,
  location: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const screeningSessionSchema = new mongoose.Schema({
  jobId: mongoose.Schema.Types.ObjectId,
  recruiterId: mongoose.Schema.Types.ObjectId,
  totalCandidates: { type: Number, default: 0 },
  shortlistedCount: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const screeningResultSchema = new mongoose.Schema({
  sessionId: mongoose.Schema.Types.ObjectId,
  jobId: mongoose.Schema.Types.ObjectId,
  talentId: mongoose.Schema.Types.ObjectId,
  score: { type: Number, default: 0 },
  ranking: { type: Number, default: 0 },
  shortlisted: { type: Boolean, default: false },
  reasoning: {
    overall: String,
    skills: [{
      skill: String,
      matched: Boolean,
      relevance: Number
    }],
    experience: {
      relevance: Number,
      explanation: String
    },
    education: {
      relevance: Number,
      explanation: String
    }
  },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const TalentProfile = mongoose.model('TalentProfile', talentProfileSchema);
const JobPosting = mongoose.model('JobPosting', jobPostingSchema);
const ScreeningSession = mongoose.model('ScreeningSession', screeningSessionSchema);
const ScreeningResult = mongoose.model('ScreeningResult', screeningResultSchema);

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Clear existing data
    await User.deleteMany({});
    await TalentProfile.deleteMany({});
    await JobPosting.deleteMany({});
    await ScreeningSession.deleteMany({});
    await ScreeningResult.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const recruiter = await User.create({
      email: 'recruiter@company.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Recruiter',
      role: 'recruiter'
    });

    const talent1 = await User.create({
      email: 'talent1@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Developer',
      role: 'talent'
    });

    const talent2 = await User.create({
      email: 'talent2@example.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Engineer',
      role: 'talent'
    });

    const talent3 = await User.create({
      email: 'talent3@example.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Designer',
      role: 'talent'
    });

    const admin = await User.create({
      email: 'admin@umurava.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    console.log('Created sample users');

    // Create sample talent profiles
    await TalentProfile.create({
      userId: talent1._id,
      firstName: 'Jane',
      lastName: 'Developer',
      email: 'talent1@example.com',
      title: 'Senior Full Stack Developer',
      summary: 'Experienced full stack developer with 6 years of expertise in React, Node.js, and cloud technologies.',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'Docker'],
      specialties: ['Web Development', 'API Design', 'Cloud Architecture'],
      experience: [{
        company: 'Tech Corp',
        position: 'Senior Full Stack Developer',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-12-31'),
        description: 'Led development of multiple web applications using React and Node.js'
      }, {
        company: 'StartupXYZ',
        position: 'Full Stack Developer',
        startDate: new Date('2018-06-01'),
        endDate: new Date('2019-12-31'),
        description: 'Developed RESTful APIs and responsive web applications'
      }],
      education: [{
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2014-09-01'),
        endDate: new Date('2018-05-31')
      }],
      workType: 'fulltime',
      availability: 'immediate',
      portfolio: 'https://janedev.dev',
      linkedin: 'https://linkedin.com/in/janedev',
      github: 'https://github.com/janedev',
      resumeText: 'Jane Developer - Senior Full Stack Developer with 6 years of experience...',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await TalentProfile.create({
      userId: talent2._id,
      firstName: 'Mike',
      lastName: 'Engineer',
      email: 'talent2@example.com',
      title: 'DevOps Engineer',
      summary: 'DevOps engineer specializing in cloud infrastructure and automation.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Python', 'Terraform'],
      specialties: ['Cloud Infrastructure', 'CI/CD', 'Automation'],
      experience: [{
        company: 'Cloud Solutions Inc',
        position: 'DevOps Engineer',
        startDate: new Date('2019-03-01'),
        endDate: new Date('2023-12-31'),
        description: 'Managed cloud infrastructure and implemented CI/CD pipelines'
      }],
      education: [{
        institution: 'Tech University',
        degree: 'Bachelor of Engineering',
        field: 'Software Engineering',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-05-31')
      }],
      workType: 'fulltime',
      availability: '2-weeks',
      github: 'https://github.com/mikeeng',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await TalentProfile.create({
      userId: talent3._id,
      firstName: 'Sarah',
      lastName: 'Designer',
      email: 'talent3@example.com',
      title: 'UI/UX Designer',
      summary: 'Creative UI/UX designer with expertise in user research and interface design.',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'CSS', 'JavaScript', 'User Research'],
      specialties: ['UI Design', 'UX Research', 'Prototyping'],
      experience: [{
        company: 'Design Studio',
        position: 'Senior UI/UX Designer',
        startDate: new Date('2019-08-01'),
        endDate: new Date('2023-12-31'),
        description: 'Led design projects for multiple clients and conducted user research'
      }],
      education: [{
        institution: 'Art Institute',
        degree: 'Bachelor of Fine Arts',
        field: 'Graphic Design',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-05-31')
      }],
      workType: 'freelance',
      availability: 'immediate',
      portfolio: 'https://sarahdesign.com',
      linkedin: 'https://linkedin.com/in/sarahdesign',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Created sample talent profiles');

    // Create sample job postings
    const job1 = await JobPosting.create({
      recruiterId: recruiter._id,
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced full stack developer to join our growing team. You will work on cutting-edge projects using modern technologies.',
      requirements: [
        '5+ years of full stack development experience',
        'Strong experience with React and Node.js',
        'Experience with cloud platforms (AWS preferred)',
        'Excellent problem-solving skills'
      ],
      responsibilities: [
        'Develop and maintain web applications',
        'Design and implement RESTful APIs',
        'Collaborate with cross-functional teams',
        'Participate in code reviews and architectural decisions'
      ],
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
      experience: '5+ years',
      salary: {
        min: 80000,
        max: 120000,
        currency: 'USD'
      },
      workType: 'fulltime',
      location: 'Remote',
      isActive: true,
      createdAt: new Date()
    });

    const job2 = await JobPosting.create({
      recruiterId: recruiter._id,
      title: 'DevOps Engineer',
      description: 'Seeking a skilled DevOps engineer to manage our cloud infrastructure and improve our deployment processes.',
      requirements: [
        '3+ years of DevOps experience',
        'Strong knowledge of AWS services',
        'Experience with containerization technologies',
        'Familiarity with CI/CD pipelines'
      ],
      responsibilities: [
        'Manage cloud infrastructure',
        'Implement CI/CD pipelines',
        'Monitor system performance',
        'Automate deployment processes'
      ],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Python'],
      experience: '3+ years',
      salary: {
        min: 90000,
        max: 130000,
        currency: 'USD'
      },
      workType: 'fulltime',
      location: 'Remote',
      isActive: true,
      createdAt: new Date()
    });

    const job3 = await JobPosting.create({
      recruiterId: recruiter._id,
      title: 'UI/UX Designer',
      description: 'We need a creative UI/UX designer to help us create amazing user experiences for our products.',
      requirements: [
        '3+ years of UI/UX design experience',
        'Strong portfolio demonstrating design skills',
        'Proficiency in design tools',
        'Experience with user research'
      ],
      responsibilities: [
        'Create wireframes and mockups',
        'Conduct user research and testing',
        'Collaborate with development team',
        'Maintain design system'
      ],
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      experience: '3+ years',
      salary: {
        min: 70000,
        max: 100000,
        currency: 'USD'
      },
      workType: 'both',
      location: 'Remote',
      isActive: true,
      createdAt: new Date()
    });

    console.log('Created sample job postings');

    // Create sample screening sessions
    const session1 = await ScreeningSession.create({
      jobId: job1._id,
      recruiterId: recruiter._id,
      totalCandidates: 3,
      shortlistedCount: 2,
      status: 'completed',
      createdAt: new Date()
    });

    const session2 = await ScreeningSession.create({
      jobId: job2._id,
      recruiterId: recruiter._id,
      totalCandidates: 2,
      shortlistedCount: 1,
      status: 'completed',
      createdAt: new Date()
    });

    console.log('Created sample screening sessions');

    // Create sample screening results
    await ScreeningResult.create({
      sessionId: session1._id,
      jobId: job1._id,
      talentId: talent1._id,
      score: 92,
      ranking: 1,
      shortlisted: true,
      reasoning: {
        overall: 'Excellent match with strong technical skills and relevant experience',
        skills: [
          { skill: 'React', matched: true, relevance: 0.95 },
          { skill: 'Node.js', matched: true, relevance: 0.90 },
          { skill: 'MongoDB', matched: true, relevance: 0.85 },
          { skill: 'TypeScript', matched: true, relevance: 0.88 },
          { skill: 'AWS', matched: true, relevance: 0.82 }
        ],
        experience: {
          relevance: 0.90,
          explanation: '6 years of relevant full stack development experience'
        },
        education: {
          relevance: 0.85,
          explanation: 'Computer Science degree from reputable university'
        }
      },
      createdAt: new Date()
    });

    await ScreeningResult.create({
      sessionId: session1._id,
      jobId: job1._id,
      talentId: talent2._id,
      score: 78,
      ranking: 2,
      shortlisted: true,
      reasoning: {
        overall: 'Good match with strong DevOps skills but less frontend experience',
        skills: [
          { skill: 'React', matched: false, relevance: 0.30 },
          { skill: 'Node.js', matched: true, relevance: 0.75 },
          { skill: 'MongoDB', matched: true, relevance: 0.70 },
          { skill: 'TypeScript', matched: true, relevance: 0.65 },
          { skill: 'AWS', matched: true, relevance: 0.95 }
        ],
        experience: {
          relevance: 0.75,
          explanation: '4 years of experience with focus on DevOps'
        },
        education: {
          relevance: 0.80,
          explanation: 'Software Engineering degree'
        }
      },
      createdAt: new Date()
    });

    await ScreeningResult.create({
      sessionId: session1._id,
      jobId: job1._id,
      talentId: talent3._id,
      score: 65,
      ranking: 3,
      shortlisted: false,
      reasoning: {
        overall: 'Partial match with strong design skills but limited development experience',
        skills: [
          { skill: 'React', matched: false, relevance: 0.40 },
          { skill: 'Node.js', matched: false, relevance: 0.20 },
          { skill: 'MongoDB', matched: false, relevance: 0.25 },
          { skill: 'TypeScript', matched: false, relevance: 0.35 },
          { skill: 'AWS', matched: false, relevance: 0.30 }
        ],
        experience: {
          relevance: 0.50,
          explanation: '4 years of design experience, limited development'
        },
        education: {
          relevance: 0.70,
          explanation: 'Design degree, some technical knowledge'
        }
      },
      createdAt: new Date()
    });

    await ScreeningResult.create({
      sessionId: session2._id,
      jobId: job2._id,
      talentId: talent2._id,
      score: 88,
      ranking: 1,
      shortlisted: true,
      reasoning: {
        overall: 'Excellent match for DevOps position with relevant cloud experience',
        skills: [
          { skill: 'AWS', matched: true, relevance: 0.95 },
          { skill: 'Docker', matched: true, relevance: 0.90 },
          { skill: 'Kubernetes', matched: true, relevance: 0.85 },
          { skill: 'Jenkins', matched: true, relevance: 0.80 },
          { skill: 'Python', matched: true, relevance: 0.75 }
        ],
        experience: {
          relevance: 0.92,
          explanation: '4+ years of DevOps experience with cloud infrastructure'
        },
        education: {
          relevance: 0.80,
          explanation: 'Software Engineering degree with relevant coursework'
        }
      },
      createdAt: new Date()
    });

    await ScreeningResult.create({
      sessionId: session2._id,
      jobId: job2._id,
      talentId: talent1._id,
      score: 72,
      ranking: 2,
      shortlisted: false,
      reasoning: {
        overall: 'Good match with some DevOps experience but primarily focused on development',
        skills: [
          { skill: 'AWS', matched: true, relevance: 0.70 },
          { skill: 'Docker', matched: true, relevance: 0.65 },
          { skill: 'Kubernetes', matched: false, relevance: 0.40 },
          { skill: 'Jenkins', matched: false, relevance: 0.35 },
          { skill: 'Python', matched: false, relevance: 0.30 }
        ],
        experience: {
          relevance: 0.60,
          explanation: 'Some DevOps experience but primarily development focused'
        },
        education: {
          relevance: 0.75,
          explanation: 'Computer Science degree with some relevant knowledge'
        }
      },
      createdAt: new Date()
    });

    console.log('Created sample screening results');

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📊 Created collections:');
    console.log('   - Users: 4 (recruiter, 3 talents, 1 admin)');
    console.log('   - Talent Profiles: 3');
    console.log('   - Job Postings: 3');
    console.log('   - Screening Sessions: 2');
    console.log('   - Screening Results: 5');
    
    console.log('\n🔑 Demo Accounts:');
    console.log('   Recruiter: recruiter@company.com / password123');
    console.log('   Talent 1: talent1@example.com / password123');
    console.log('   Talent 2: talent2@example.com / password123');
    console.log('   Talent 3: talent3@example.com / password123');
    console.log('   Admin: admin@umurava.com / password123');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}
