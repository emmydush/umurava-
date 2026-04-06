# API Documentation - Umurava AI Talent Screening Tool

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "message": "Success message",
  "data": { ... }
}
```

Error responses:
```json
{
  "message": "Error description"
}
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "recruiter" // or "talent", "admin"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "recruiter"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "recruiter"
  }
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

---

## Job Management Endpoints

### Create Job
```http
POST /api/jobs
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for a senior full stack developer...",
  "requirements": [
    "5+ years of experience",
    "React expertise",
    "Node.js expertise"
  ],
  "responsibilities": [
    "Develop web applications",
    "Write clean code"
  ],
  "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
  "experience": "5+ years",
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "workType": "fulltime",
  "location": "Remote"
}
```

### Get Jobs
```http
GET /api/jobs?page=1&limit=10&workType=fulltime&isActive=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `workType`: Filter by work type
- `isActive`: Filter by active status

### Get Job by ID
```http
GET /api/jobs/:id
```

### Update Job
```http
PUT /api/jobs/:id
Authorization: Bearer <token>
```

### Delete Job
```http
DELETE /api/jobs/:id
Authorization: Bearer <token>
```

---

## Talent Profile Endpoints

### Create Talent Profile
```http
POST /api/talents
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "title": "Full Stack Developer",
  "summary": "Experienced full stack developer with 6 years of experience...",
  "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
  "specialties": ["Web Development", "API Design"],
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Full Stack Developer",
      "startDate": "2020-01-01",
      "description": "Led development of multiple web applications..."
    }
  ],
  "education": [
    {
      "institution": "University of Technology",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "2016-01-01",
      "endDate": "2020-01-01"
    }
  ],
  "workType": "fulltime",
  "availability": "immediate",
  "portfolio": "https://janesmith.dev",
  "linkedin": "https://linkedin.com/in/janesmith",
  "github": "https://github.com/janesmith"
}
```

### Get Talent Profiles
```http
GET /api/talents?page=1&limit=10&skills=React&workType=fulltime&search=developer
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `skills`: Filter by skills (comma-separated)
- `workType`: Filter by work type
- `availability`: Filter by availability
- `search`: Search in name, title, summary

### Get My Talent Profile
```http
GET /api/talents/my-profile
Authorization: Bearer <token>
```

### Get Talent Profile by ID
```http
GET /api/talents/:id
```

### Update Talent Profile
```http
PUT /api/talents/:id
Authorization: Bearer <token>
```

---

## Screening Endpoints

### Initiate Screening
```http
POST /api/screening/initiate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "jobId": "job_id_here"
}
```

**Response:**
```json
{
  "message": "Screening initiated successfully",
  "session": {
    "_id": "session_id",
    "jobId": "job_id",
    "recruiterId": "recruiter_id",
    "totalCandidates": 25,
    "shortlistedCount": 0,
    "status": "processing",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Screening Results
```http
GET /api/screening/results/:sessionId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Screening results retrieved successfully",
  "results": {
    "_id": "session_id",
    "jobId": "job_id",
    "status": "completed",
    "totalCandidates": 25,
    "shortlistedCount": 15,
    "results": [
      {
        "_id": "result_id",
        "jobId": "job_id",
        "talentId": "talent_id",
        "score": 92,
        "ranking": 1,
        "shortlisted": true,
        "reasoning": {
          "overall": "Excellent match with strong technical skills...",
          "skills": [
            {
              "skill": "React",
              "matched": true,
              "relevance": 0.95
            }
          ],
          "experience": {
            "relevance": 0.9,
            "explanation": "6 years of relevant experience..."
          },
          "education": {
            "relevance": 0.85,
            "explanation": "Computer Science degree..."
          }
        },
        "talentId": {
          "firstName": "Jane",
          "lastName": "Smith",
          "title": "Full Stack Developer",
          "skills": ["React", "Node.js", "MongoDB"]
        }
      }
    ]
  }
}
```

### Get Shortlisted Candidates
```http
GET /api/screening/shortlisted/:jobId?limit=20
Authorization: Bearer <token>
```

### Get Screening Sessions
```http
GET /api/screening/sessions
Authorization: Bearer <token>
```

---

## Health Check

### Server Health
```http
GET /health
```

**Response:**
```json
{
  "message": "Server is running"
}
```

---

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production use.

---

## Example Workflow

1. **Register as Recruiter**
   ```bash
   POST /api/auth/register
   ```

2. **Login**
   ```bash
   POST /api/auth/login
   ```

3. **Create Job Posting**
   ```bash
   POST /api/jobs
   ```

4. **Initiate Screening**
   ```bash
   POST /api/screening/initiate
   ```

5. **Check Results**
   ```bash
   GET /api/screening/results/:sessionId
   ```

6. **Get Shortlisted Candidates**
   ```bash
   GET /api/screening/shortlisted/:jobId
   ```

---

## Testing

The server runs in demo mode without MongoDB. All endpoints are available for testing, but database operations will return errors. This is perfect for frontend development and API testing.
