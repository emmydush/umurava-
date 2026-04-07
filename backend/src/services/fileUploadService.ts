import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import * as pdfParse from 'pdf-parse';
import csv from 'csv-parser';
import { Readable } from 'stream';

export interface ParsedResume {
  text: string;
  extractedData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: Array<{
      company?: string;
      position?: string;
      duration?: string;
    }>;
    education?: Array<{
      institution?: string;
      degree?: string;
      field?: string;
    }>;
  };
}

export class FileUploadService {
  private uploadDir = 'uploads';

  constructor() {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedTypes = ['.pdf', '.csv'];
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and CSV files are allowed'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      }
    });
  }

  async parseResume(filePath: string, originalName: string): Promise<ParsedResume> {
    const ext = path.extname(originalName).toLowerCase();
    
    try {
      let text = '';
      
      if (ext === '.pdf') {
        text = await this.parsePDF(filePath);
      } else if (ext === '.csv') {
        text = await this.parseCSV(filePath);
      }

      const extractedData = this.extractStructuredData(text);
      
      return {
        text,
        extractedData
      };
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error('Failed to parse resume file');
    }
  }

  async parseResumeText(text: string): Promise<ParsedResume> {
    try {
      const extractedData = this.extractStructuredData(text);
      return {
        text,
        extractedData
      };
    } catch (error) {
      console.error('Error parsing resume text:', error);
      throw new Error('Failed to parse resume text');
    }
  }

  private async parsePDF(filePath: string): Promise<string> {
    const dataBuffer = await fs.readFile(filePath);
    const data = await (pdfParse as any)(dataBuffer);
    return data.text;
  }

  private async parseCSV(filePath: string): Promise<string> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from([fileContent]);
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          const text = results.map(row => Object.values(row).join(' ')).join('\n');
          resolve(text);
        })
        .on('error', reject);
    });
  }

  private extractStructuredData(text: string): ParsedResume['extractedData'] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const data: ParsedResume['extractedData'] = {
      skills: this.extractSkills(text),
      experience: this.extractExperience(text),
      education: this.extractEducation(text)
    };

    // Extract basic contact information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      data.email = emails[0];
    }

    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      data.phone = phones[0];
    }

    // Try to extract name from first lines
    if (lines.length > 0) {
      const firstLine = lines[0];
      const nameParts = firstLine.split(' ').filter(part => part.length > 1);
      if (nameParts.length >= 2) {
        data.firstName = nameParts[0];
        data.lastName = nameParts.slice(1).join(' ');
      }
    }

    return data;
  }

  private extractSkills(text: string): string[] {
    const commonSkills = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby',
      'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring',
      'mongodb', 'mysql', 'postgresql', 'oracle', 'sql', 'nosql',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
      'html', 'css', 'sass', 'webpack', 'babel', 'rest', 'graphql',
      'machine learning', 'ai', 'data science', 'analytics', 'devops'
    ];

    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    commonSkills.forEach(skill => {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    // Look for capitalized technical terms
    const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || [];
    capitalizedWords.forEach(word => {
      if (word.length > 2 && !foundSkills.includes(word) && !this.isCommonWord(word)) {
        foundSkills.push(word);
      }
    });

    return [...new Set(foundSkills)].slice(0, 20); // Limit to 20 skills
  }

  private extractExperience(text: string): Array<{company?: string, position?: string, duration?: string}> {
    const experience: Array<{company?: string, position?: string, duration?: string}> = [];
    
    // Look for experience patterns
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for dates (experience duration)
      const dateRegex = /\b(19|20)\d{2}\s*(-|–|to)\s*(19|20)\d{2}|\b(19|20)\d{2}\s*(-|–|to)\s*(present|current)\b/gi;
      if (dateRegex.test(line)) {
        const duration = line.match(dateRegex)?.[0];
        const position = lines[i - 1]?.trim();
        const company = lines[i + 1]?.trim();
        
        if (position && position.length > 3) {
          experience.push({
            position,
            company: company && company.length > 3 ? company : undefined,
            duration: duration || undefined
          });
        }
      }
    }

    return experience.slice(0, 5); // Limit to 5 most recent experiences
  }

  private extractEducation(text: string): Array<{institution?: string, degree?: string, field?: string}> {
    const education: Array<{institution?: string, degree?: string, field?: string}> = [];
    
    const educationKeywords = ['university', 'college', 'institute', 'school', 'academy'];
    const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma', 'certificate'];
    
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      if (educationKeywords.some(keyword => line.includes(keyword))) {
        const institution = lines[i]?.trim();
        const nextLine = lines[i + 1]?.trim();
        
        let degree = '';
        let field = '';
        
        if (nextLine) {
          const degreeMatch = degreeKeywords.find(keyword => nextLine.toLowerCase().includes(keyword));
          if (degreeMatch) {
            degree = nextLine;
            field = lines[i + 2]?.trim() || '';
          } else {
            field = nextLine;
          }
        }
        
        education.push({
          institution,
          degree: degree || undefined,
          field: field || undefined
        });
      }
    }

    return education.slice(0, 3); // Limit to 3 most recent education entries
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'The', 'And', 'For', 'Are', 'But', 'Not', 'You', 'All', 'Can', 'Had', 'Her', 'Was', 'One', 'Our', 'Out', 'Day',
      'Get', 'Has', 'Him', 'His', 'How', 'Man', 'New', 'Now', 'Old', 'See', 'Two', 'Way', 'Who', 'Boy', 'Did', 'Its',
      'Let', 'Put', 'Say', 'She', 'Too', 'Use', 'Her', 'Per', 'Ltd', 'Inc', 'Corp', 'LLC', 'Company', 'Team'
    ];
    return commonWords.includes(word);
  }

  async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}
