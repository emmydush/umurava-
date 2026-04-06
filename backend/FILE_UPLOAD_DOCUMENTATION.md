# File Upload Documentation - Resume Parsing

## Overview

The file upload system allows users to upload PDF and CSV resumes, which are automatically parsed to extract relevant information and update their talent profiles. This feature bridges the gap between unstructured resume documents and structured profile data.

## Features

### ✅ Supported File Types
- **PDF Files** - Standard resume format with full text extraction
- **CSV Files** - Structured data format for bulk imports

### ✅ Automatic Data Extraction
- **Contact Information** - Name, email, phone number
- **Skills** - Technical skills and competencies
- **Work Experience** - Company, position, duration
- **Education** - Institution, degree, field of study
- **Full Text** - Complete resume text for AI analysis

### ✅ Smart Parsing
- **Skill Recognition** - Identifies technical skills from resume content
- **Experience Detection** - Extracts work history with date parsing
- **Education Parsing** - Recognizes academic institutions and degrees
- **Contact Extraction** - Finds email addresses and phone numbers

## API Endpoints

### Upload Resume (Update Profile)
```http
POST /api/files/upload-resume
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
- `resume` (file) - PDF or CSV file (max 5MB)

**Response:**
```json
{
  "message": "Resume uploaded and parsed successfully",
  "profile": {
    "id": "profile_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
    "resumeUrl": "/uploads/resume-1234567890.pdf",
    "extractedData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
      "experience": [
        {
          "company": "Tech Corp",
          "position": "Senior Developer",
          "duration": "2020-2023"
        }
      ],
      "education": [
        {
          "institution": "University of Technology",
          "degree": "Bachelor of Science",
          "field": "Computer Science"
        }
      ]
    }
  }
}
```

### Parse Resume Only (Preview)
```http
POST /api/files/parse-resume
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
- `resume` (file) - PDF or CSV file (max 5MB)

**Response:**
```json
{
  "message": "Resume parsed successfully",
  "data": {
    "text": "Full resume text content...",
    "extractedData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "skills": ["React", "Node.js", "MongoDB"],
      "experience": [...],
      "education": [...]
    }
  }
}
```

## File Processing Pipeline

### 1. Upload Validation
- File type validation (PDF/CSV only)
- File size limit (5MB maximum)
- Authentication and authorization checks

### 2. Text Extraction
- **PDF**: Uses pdf-parse library for text extraction
- **CSV**: Parses structured data and converts to text

### 3. Data Extraction
- **Contact Info**: Regex-based email and phone detection
- **Skills**: Pattern matching against common technical skills
- **Experience**: Date pattern recognition for work history
- **Education**: Institution and degree keyword matching

### 4. Profile Integration
- Merges extracted data with existing profile
- Avoids duplicates in skills and experience
- Updates resume text and file URL
- Saves changes to database

### 5. File Cleanup
- Temporary files are automatically deleted
- Only resume URL is stored in database

## Parsing Capabilities

### Skills Recognition
The system recognizes over 50 common technical skills including:

**Programming Languages:**
- JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby

**Frameworks & Libraries:**
- React, Angular, Vue, Node.js, Express, Django, Flask, Spring

**Databases:**
- MongoDB, MySQL, PostgreSQL, Oracle, SQL, NoSQL

**Cloud & DevOps:**
- AWS, Azure, GCP, Docker, Kubernetes, Jenkins, Git

**Frontend:**
- HTML, CSS, Sass, Webpack, Babel, REST, GraphQL

**Data Science:**
- Machine Learning, AI, Data Science, Analytics

### Experience Extraction
- Identifies date patterns (2020-2023, 2020-present, etc.)
- Extracts company names and job titles
- Handles various date formats
- Limits to 5 most recent positions

### Education Parsing
- Recognizes education keywords (university, college, institute)
- Identifies degree types (bachelor, master, PhD, diploma)
- Extracts field of study information
- Limits to 3 most recent education entries

## Usage Examples

### Upload Resume via curl
```bash
curl -X POST http://localhost:5000/api/files/upload-resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@/path/to/resume.pdf"
```

### Parse Resume via curl
```bash
curl -X POST http://localhost:5000/api/files/parse-resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@/path/to/resume.pdf"
```

### JavaScript Example
```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

fetch('/api/files/upload-resume', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## Error Handling

### Common Errors
- **400 Bad Request** - No file uploaded or invalid file type
- **401 Unauthorized** - Invalid or missing authentication token
- **404 Not Found** - Talent profile doesn't exist
- **413 Payload Too Large** - File exceeds 5MB limit
- **500 Internal Server Error** - Parsing or processing failure

### Error Response Format
```json
{
  "message": "Error description"
}
```

## Security Considerations

### File Upload Security
- File type validation prevents malicious uploads
- File size limits prevent resource exhaustion
- Temporary files are automatically cleaned up
- Uploaded files are stored in secure directory

### Data Privacy
- Resume text is stored securely in database
- File access requires authentication
- Parsed data is only accessible to profile owner
- Files are served via secure static routes

## Performance Considerations

### Processing Time
- PDF parsing: ~1-3 seconds per file
- CSV parsing: ~0.5-1 second per file
- Data extraction: ~0.5 seconds
- Total processing: ~2-5 seconds per resume

### Resource Usage
- Memory usage scales with file size
- Temporary storage during processing
- Automatic cleanup prevents disk space issues
- Concurrent processing supported

## Integration with AI Screening

### Resume Text Integration
- Parsed resume text is stored in `resumeText` field
- AI screening uses this text for candidate analysis
- Improves matching accuracy with complete information
- Enables semantic understanding of candidate qualifications

### Enhanced Candidate Profiles
- Structured data improves searchability
- Skills extraction enhances matching algorithms
- Experience data provides context for evaluation
- Comprehensive profiles lead to better screening results

## Future Enhancements

### Planned Features
1. **Advanced PDF Parsing** - Table and layout recognition
2. **Image OCR** - Text extraction from scanned documents
3. **Bulk Processing** - Multiple file upload support
4. **Template Recognition** - Industry-specific resume formats
5. **Validation Rules** - Data quality and consistency checks

### Integration Opportunities
1. **LinkedIn Import** - Direct profile synchronization
2. **ATS Integration** - Applicant tracking system connectivity
3. **Verification Services** - Education and employment verification
4. **Skill Assessment** - Automated skill testing and validation

## Troubleshooting

### Common Issues
- **PDF parsing fails**: Check if PDF is text-based (not scanned images)
- **CSV parsing errors**: Ensure CSV format is valid with proper headers
- **Missing skills**: Verify skill names match recognized patterns
- **Incomplete data**: Check resume format and structure

### Debug Tips
- Use `/api/files/parse-resume` to preview parsing results
- Check extracted data before profile updates
- Verify file format and size requirements
- Review error messages for specific issues

This file upload system significantly enhances the talent screening platform by bridging the gap between traditional resume documents and structured candidate data, enabling more accurate and comprehensive AI-powered screening.
