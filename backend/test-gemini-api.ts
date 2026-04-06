import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env file');
    process.exit(1);
}

async function testGemini() {
    console.log('Testing Gemini AI API...');
    console.log('Using API Key: ' + apiKey.substring(0, 8) + '...');

    const genAI = new GoogleGenAI({ apiKey });

    try {
        console.log('Requesting content generation...');
        
        // Following the pattern in src/services/geminiService.ts
        const result = await genAI.models.generateContent({
            model: 'gemini-pro-latest',
            contents: 'Hello! If you are working, please reply with "Gemini API is active and functioning correctly."'
        });

        console.log('API Response received:');
        console.log('---------------------------');
        console.log(result.text);
        console.log('---------------------------');

        if (result.text && result.text.length > 0) {
            console.log('✅ SUCCESS: Gemini AI API is working correctly.');
        } else {
            console.log('⚠️ WARNING: Received an empty response from Gemini API.');
        }
    } catch (error: any) {
        console.error('❌ ERROR: Gemini API call failed.');
        console.error('Error details:', error.message || error);
        
        if (error.message && error.message.includes('API key not valid')) {
            console.error('Tip: Check if your API key in .env is correct and active.');
        } else if (error.message && (error.message.includes('quota') || error.message.includes('429'))) {
            console.error('Tip: You might have exceeded your API quota.');
        }
    }
}

testGemini();
