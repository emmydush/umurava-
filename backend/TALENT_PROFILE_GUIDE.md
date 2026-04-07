# Complete Talent Profile System Guide

This guide covers the comprehensive talent profile system implemented for the Umurava Talent Marketplace.

## Overview

The talent profile system provides a complete solution for managing candidate profiles with AI-powered analysis, comprehensive data structures, and flexible API endpoints.

## Features

### 1. Comprehensive Profile Data Structure

#### Basic Information
- Personal details (name, email, phone, location)
- Professional title and summary
- Professional links (portfolio, LinkedIn, GitHub)

#### Skills & Expertise
- Technical skills array
- Specialties array for areas of expertise
- AI-categorized skills (technical, soft, domain-specific)

#### Experience & Education
- Detailed work history with company, position, dates, and descriptions
- Educational background with institutions, degrees, and fields
- AI analysis of experience relevance and career progression

#### Resume Management
- Resume file upload with metadata
- Resume text extraction and parsing
- AI-powered profile enhancement from resume content

#### Job Preferences
- Availability timeline
- Salary expectations with currency
- Work type preferences (full-time, freelance, both)

### 2. AI-Powered Analysis

#### Profile Analysis Features
- **Skill Categorization**: Automatic categorization of technical, soft, and domain skills
- **Experience Assessment**: AI evaluation of relevance and career progression
- **Education Validation**: Verification of educational relevance to career goals
- **Career Trajectory Analysis**: Assessment of career growth and consistency

#### Parsed Profile Structure
```typescript
interface IParsedCandidateProfile {
  source: 'platform' | 'resume_upload' | 'ai_enhanced';
  skills: string[];
  yearsExp: number;
  titles: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: number;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year?: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  achievements: string[];
  careerGoals: string[];
  strengths: string[];
}
```

## API Endpoints

### Basic CRUD Operations

#### Create Talent Profile
```
POST /api/talents
Authorization: Bearer <token>
Roles: talent, admin
```

#### Get All Talent Profiles
```
GET /api/talents
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- skills: string[] (filter by skills)
- workType: string (filter by work type)
- availability: string (filter by availability)
- search: string (search in name, title, summary)
```

#### Get My Talent Profile
```
GET /api/talents/my-profile
Authorization: Bearer <token>
Roles: talent, admin
```

#### Update My Talent Profile
```
PUT /api/talents/profile
Authorization: Bearer <token>
Roles: talent, admin
```

#### Get Talent Profile by ID
```
GET /api/talents/:id
```

#### Update Talent Profile by ID
```
PUT /api/talents/:id
Authorization: Bearer <token>
Roles: talent, admin
```

### Enhanced Profile Operations

#### Create Complete Profile
```
POST /api/talents/complete
Authorization: Bearer <token>
Roles: talent, admin
```
Creates a comprehensive profile with all fields populated using smart defaults and AI analysis.

#### Get Profile with Analysis
```
GET /api/talents/:id/analysis
```
Retrieves profile with AI-powered analysis if not already performed.

## Usage Examples

### Creating a Complete Profile

```javascript
const profileData = {
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@example.com",
  title: "Senior Full-Stack Developer",
  summary: "Experienced developer with 8+ years in web development...",
  skills: ["JavaScript", "React", "Node.js", "Python"],
  experience: [
    {
      company: "Tech Corp",
      position: "Senior Developer",
      startDate: "2021-03-15",
      endDate: "2024-01-20",
      description: "Led development of enterprise applications..."
    }
  ],
  education: [
    {
      institution: "University of California",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2013-09-01",
      endDate: "2017-05-30"
    }
  ],
  availability: "2weeks",
  salaryExpectation: {
    min: 120000,
    max: 160000,
    currency: "USD"
  },
  workType: "both"
};

// Create complete profile with AI analysis
const response = await fetch('/api/talents/complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(profileData)
});
```

### Searching Talent Profiles

```javascript
// Search by skills
const response = await fetch('/api/talents?skills=React,Node.js&workType=fulltime');

// Search by keywords
const response = await fetch('/api/talents?search=senior%20developer');

// Paginated results
const response = await fetch('/api/talents?page=2&limit=20');
```

## Database Schema

### TalentProfile Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  location: String,
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
  portfolio: String,
  linkedin: String,
  github: String,
  resumeUrl: String,
  resumeText: String,
  resumeFile: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: Date
  },
  parsedProfile: Mixed, // IParsedCandidateProfile
  availability: String, // 'immediate', '2weeks', '1month', '2months', '3months'
  salaryExpectation: {
    min: Number,
    max: Number,
    currency: String
  },
  workType: String, // 'fulltime', 'freelance', 'both'
  source: String, // 'umurava_platform', 'resume_upload'
  isStructured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## AI Integration

### Candidate Analyzer Service

The `CandidateAnalyzerService` provides:

1. **Platform Profile Analysis**: Analyzes structured profiles from the platform
2. **Resume Parsing**: Extracts and structures information from uploaded resumes
3. **Profile Normalization**: Converts different profile formats to standard structure
4. **Skill Extraction**: Identifies and categorizes skills from text

### Analysis Process

1. **Input Validation**: Validates profile data completeness
2. **Skill Categorization**: Categorizes skills into technical, soft, and domain
3. **Experience Analysis**: Evaluates relevance and calculates total experience
4. **Education Assessment**: Validates educational background relevance
5. **Career Trajectory**: Analyzes career progression and consistency
6. **Profile Enhancement**: Adds AI-generated insights and recommendations

## Best Practices

### For Developers

1. **Always validate required fields** before creating profiles
2. **Use the complete profile endpoint** for comprehensive profile creation
3. **Implement proper error handling** for AI analysis failures
4. **Cache AI analysis results** to avoid redundant processing
5. **Use pagination** for profile listing endpoints

### For Users

1. **Provide detailed summaries** for better AI analysis
2. **Include comprehensive skill lists** for accurate matching
3. **Keep experience descriptions detailed** for relevance assessment
4. **Update profiles regularly** to maintain accuracy
5. **Upload current resumes** for enhanced analysis

## Error Handling

### Common Error Codes

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Profile not found
- **409 Conflict**: Profile already exists for user
- **500 Internal Server Error**: Server or AI service errors

### Error Response Format

```json
{
  "message": "Error description",
  "details": ["Specific error details"],
  "error": "error_code"
}
```

## Performance Considerations

1. **Indexing**: Database indexes on skills, specialties, workType, and availability
2. **Caching**: AI analysis results cached in parsedProfile field
3. **Pagination**: All listing endpoints support pagination
4. **Lazy Loading**: AI analysis performed on-demand for existing profiles

## Security

1. **Authentication**: All profile modification endpoints require authentication
2. **Authorization**: Role-based access control for different operations
3. **Data Validation**: Input validation for all profile fields
4. **File Upload**: Secure file upload with type and size validation

## Future Enhancements

1. **Video Profiles**: Support for video introduction uploads
2. **Skill Assessment**: Automated skill testing and verification
3. **Reference Checking**: Integration with professional reference services
4. **Portfolio Integration**: Enhanced portfolio project showcases
5. **Real-time Availability**: Calendar integration for availability tracking
