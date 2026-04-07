# Umurava AI Talent Screening Tool - Backend API

## Overview

This is the backend API for the Umurava AI Talent Profile Screening Tool, built for the 15-day AI Hackathon. The system automates the screening of both structured platform profiles and unstructured resumes (PDFs/CSVs), providing recruiters with a ranked, explainable shortlist of the top 10-20 candidates using the Gemini API.

## Features

### ✅ Completed Features

1. **Authentication System**
   - JWT-based authentication
   - Role-based access control (recruiter, talent, admin)
   - User registration and login

2. **Talent Profile Management**
   - CRUD operations for talent profiles
   - Skills, experience, education tracking
   - Work preferences and availability

3. **Job Posting Management**
   - Create, update, delete job postings
   - Skills and requirements specification
   - Work type and salary ranges

4. **Resume Upload & Parsing**
   - PDF and CSV file upload support
   - Automatic text extraction and data parsing
   - Skills extraction from resume content
   - Experience and education parsing
   - Profile integration with extracted data

5. **AI-Powered Screening**
   - Integration with Google Gemini API
   - Automated candidate analysis and scoring
   - Skill matching and relevance assessment
   - Experience and education evaluation

6. **Ranking & Shortlisting**
   - Automatic ranking of candidates (0-100 score)
   - Top 10-20 candidate shortlist generation
   - Detailed reasoning for each candidate

7. **Explainability**
   - AI-generated explanations for shortlisting decisions
   - Skill-by-skill matching analysis
   - Experience relevance explanations

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Job Management
- `POST /api/jobs` - Create job posting (recruiter/admin only)
- `GET /api/jobs` - Get job listings
- `GET /api/jobs/:id` - Get specific job
- `PUT /api/jobs/:id` - Update job (recruiter/admin only)
- `DELETE /api/jobs/:id` - Delete job (recruiter/admin only)

### Talent Profiles
- `POST /api/talents` - Create talent profile (talent/admin only)
- `GET /api/talents` - Get talent profiles (with filtering)
- `GET /api/talents/my-profile` - Get own talent profile
- `GET /api/talents/:id` - Get specific talent profile
- `PUT /api/talents/:id` - Update talent profile (talent/admin only)

### File Upload & Resume Parsing
- `POST /api/files/upload-resume` - Upload and parse resume (updates profile)
- `POST /api/files/parse-resume` - Parse resume only (preview extraction)

### Screening System
- `POST /api/screening/initiate` - Start screening process for a job
- `GET /api/screening/results/:sessionId` - Get screening results
- `GET /api/screening/shortlisted/:jobId` - Get shortlisted candidates
- `GET /api/screening/sessions` - Get all screening sessions

### Health Check
- `GET /health` - Server health check

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication tokens
- **Google Gemini API** - AI-powered candidate analysis
- **Multer** - File upload handling
- **pdf-parse** - PDF document parsing
- **mammoth** - DOCX document parsing
- **csv-parser** - CSV file processing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

## Environment Variables

Create a `.env` file in the root directory:

```env
# Required
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/umurava-prod
JWT_SECRET=your-super-secure-jwt-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Optional
PORT=5000
CORS_ORIGINS=https://your-frontend-domain.com
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

```env
MONGO_URI=mongodb://localhost:27017/umurava-ai-hackathon
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here_change_this_in_production
PORT=5000
```

## Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **Docker** (optional, for containerized deployment)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Using Docker Compose (Recommended)

1. **Set environment variables:**
   ```bash
   export MONGO_URI="your-mongodb-connection-string"
   export JWT_SECRET="your-secure-jwt-secret"
   export GEMINI_API_KEY="your-gemini-api-key"
   export CORS_ORIGINS="https://your-frontend-domain.com"
   ```

2. **Deploy:**
   ```bash
   docker-compose up -d
   ```

#### Manual Production Deployment

1. **Install dependencies:**
   ```bash
   npm ci --only=production
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

### Health Check

- **Endpoint**: `GET /health`
- **Docker Health Check**: Built into container configuration

## Security Features

- ✅ **Rate Limiting**: Different limits for auth, uploads, and AI calls
- ✅ **Security Headers**: HSTS, XSS protection, CSP
- ✅ **Input Validation**: File type and size validation
- ✅ **Error Sanitization**: No sensitive data in production responses
- ✅ **CORS Configuration**: Configurable allowed origins
- ✅ **Environment Validation**: Required variables checking on startup

## Demo Accounts

After running the database initialization, you can use these accounts:

### Recruiter Account
- **Email**: `recruiter@company.com`
- **Password**: `password123`
- **Role**: Can create jobs and initiate screening

### Talent Accounts
- **Email**: `talent1@example.com` (Jane Developer)
- **Email**: `talent2@example.com` (Mike Engineer)  
- **Email**: `talent3@example.com` (Sarah Designer)
- **Password**: `password123`
- **Role**: Can create profiles and apply for jobs

### Admin Account
- **Email**: `admin@umurava.com`
- **Password**: `password123`
- **Role**: Full system access

## Database Schema

### Users
- Email, password, role (recruiter/talent/admin)
- First name, last name
- Timestamps

### Talent Profiles
- Personal information (name, email, location)
- Professional summary
- Skills array
- Work experience history
- Education history
- Portfolio links
- Work preferences (type, availability, salary)

### Job Postings
- Job title and description
- Requirements and responsibilities
- Required skills
- Experience level
- Salary range
- Work type (fulltime/freelance/both)

### Screening Results
- Job and candidate references
- Overall score (0-100)
- Ranking position
- Detailed reasoning (skills, experience, education)
- Shortlist status

### Screening Sessions
- Job and recruiter references
- Total candidates processed
- Shortlisted count
- Processing status
- Results references

## AI Screening Process

1. **Initiation**: Recruiter starts screening for a specific job
2. **Candidate Analysis**: Gemini API analyzes each candidate against job requirements
3. **Scoring**: Candidates scored 0-100 based on:
   - Skills matching
   - Experience relevance
   - Education alignment
   - Overall fit
4. **Ranking**: Candidates sorted by score
5. **Shortlisting**: Top 10-20 candidates automatically selected
6. **Explanation**: AI generates reasoning for shortlisting decisions

## Demo Mode

The server can run in demo mode without MongoDB:
- API endpoints are available for testing
- Database operations will return errors
- Perfect for API testing and frontend development

## Next Steps (Pending Features)

1. **File Upload System**
   - PDF/CSV resume parsing
   - Document text extraction
   - Integration with talent profiles

2. **Frontend Development**
   - Next.js dashboard
   - Recruiter interface
   - Candidate visualization

3. **Enhanced AI Features**
   - Multiple AI model comparison
   - Custom scoring weights
   - Bias detection and mitigation

## API Usage Examples

### Register a Recruiter
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@company.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "recruiter"
  }'
```

### Create Job Posting
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Senior Full Stack Developer",
    "description": "We are looking for a senior developer...",
    "skills": ["React", "Node.js", "MongoDB"],
    "experience": "5+ years",
    "workType": "fulltime"
  }'
```

### Start Screening
```bash
curl -X POST http://localhost:5000/api/screening/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobId": "JOB_ID_HERE"
  }'
```

## Contributing

This project was developed for the Umurava AI Hackathon. The codebase demonstrates:

- Production-ready API architecture
- AI integration for talent screening
- Comprehensive error handling
- Type-safe development with TypeScript
- Scalable database design
- Security best practices

## License

MIT License - Feel free to use and modify for your own projects.
