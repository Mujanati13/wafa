import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI client
let genAI = null;
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Generate explanation for a question using Google Gemini AI
 * @param {Object} questionData - Question data including text and options
 * @param {string} language - Language for explanation (default: 'fr')
 * @returns {Promise<string>} - Generated explanation text
 */
export const generateExplanation = async (questionData, language = 'fr') => {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    const { text, options, correctAnswers } = questionData;

    // Build the prompt
    const prompt = language === 'fr' 
        ? buildFrenchPrompt(text, options, correctAnswers)
        : buildEnglishPrompt(text, options, correctAnswers);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Extract generated text from Gemini response
        const generatedText = response.text();
        
        if (!generatedText) {
            throw new Error('No explanation generated from Gemini API');
        }

        return generatedText.trim();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Failed to generate explanation: ${error.message}`);
    }
};

/**
 * Build French prompt for Gemini
 */
function buildFrenchPrompt(questionText, options, correctAnswers) {
    const optionsText = options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx); // A, B, C, D...
        const isCorrect = correctAnswers.includes(idx) ? ' ✓' : '';
        return `${letter}. ${opt.text}${isCorrect}`;
    }).join('\n');

    return `Tu es un assistant médical expert qui aide les étudiants en médecine à comprendre les questions d'examen.

Question:
${questionText}

Options:
${optionsText}

Instructions:
1. Explique pourquoi la/les réponse(s) correcte(s) est/sont juste(s)
2. Explique pourquoi les autres options sont incorrectes
3. Fournis un contexte médical pertinent
4. Utilise un langage clair et pédagogique
5. Structure ta réponse avec des paragraphes et des points clés

Génère une explication complète et détaillée:`;
}

/**
 * Build English prompt for Gemini
 */
function buildEnglishPrompt(questionText, options, correctAnswers) {
    const optionsText = options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const isCorrect = correctAnswers.includes(idx) ? ' ✓' : '';
        return `${letter}. ${opt.text}${isCorrect}`;
    }).join('\n');

    return `You are an expert medical assistant helping medical students understand exam questions.

Question:
${questionText}

Options:
${optionsText}

Instructions:
1. Explain why the correct answer(s) is/are right
2. Explain why the other options are incorrect
3. Provide relevant medical context
4. Use clear and pedagogical language
5. Structure your response with paragraphs and key points

Generate a complete and detailed explanation:`;
}

/**
 * Generate multiple explanations in batch
 * @param {Array} questions - Array of question objects
 * @param {string} language - Language for explanations
 * @returns {Promise<Array>} - Array of generated explanations
 */
export const generateBatchExplanations = async (questions, language = 'fr') => {
    const results = [];
    
    for (const question of questions) {
        try {
            const explanation = await generateExplanation(question, language);
            results.push({
                questionId: question._id,
                success: true,
                explanation
            });
            
            // Add delay to respect API rate limits (if any)
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            results.push({
                questionId: question._id,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
};

/**
 * Check if Gemini API is configured and accessible
 * @returns {Promise<boolean>}
 */
export const testGeminiConnection = async () => {
    if (!GEMINI_API_KEY) {
        console.error('Gemini connection test failed: API key not configured');
        return false;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent("Hello, this is a test.");
        const response = await result.response;
        const text = response.text();
        
        console.log('Gemini connection test response:', text ? 'Success' : 'No text');
        return text && text.length > 0;
    } catch (error) {
        console.error('Gemini connection test failed:', error);
        return false;
    }
};

export default {
    generateExplanation,
    generateBatchExplanations,
    testGeminiConnection
};
