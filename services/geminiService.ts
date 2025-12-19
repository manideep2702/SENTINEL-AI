import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult } from "../types";
import { SYSTEM_PROMPT } from "../constants";

// Initialize Gemini Client
// API key is optional - app will still work, but AI verification will fail gracefully
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

const isApiKeyValid = apiKey && apiKey !== 'PLACEHOLDER_API_KEY' && apiKey.trim() !== '';

if (!isApiKeyValid) {
  console.warn(
    '⚠️ GEMINI_API_KEY is missing or invalid!\n\n' +
    'AI verification features will not work.\n' +
    'To enable AI features:\n' +
    '1. Get your API key from: https://aistudio.google.com/apikey\n' +
    '2. Add VITE_GEMINI_API_KEY to your environment variables\n'
  );
}

// Create AI client only if key is valid
const ai = isApiKeyValid ? new GoogleGenAI({ apiKey }) : null;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    task_verified: { type: Type.BOOLEAN },
    focus_score: { type: Type.NUMBER },
    distractions_detected: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    ai_critique: { type: Type.STRING }
  },
  required: ["task_verified", "focus_score", "distractions_detected", "ai_critique"]
};

/**
 * Converts a File object to a Base64 string for the API.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes the video proof against the scheduled activity.
 */
export const analyzeProof = async (videoFile: File, scheduledActivity: string): Promise<VerificationResult> => {
  // Check if AI is available
  if (!ai) {
    console.warn('AI verification not available - API key not configured');
    return {
      task_verified: false,
      focus_score: 0,
      distractions_detected: ['API Key Not Configured'],
      ai_critique: '⚠️ AI verification is not available. Please configure your GEMINI_API_KEY in Vercel environment variables to enable AI-powered verification.'
    };
  }

  try {
    // Using gemini-3-flash-preview for robust multimodal (video/image) understanding
    const model = "gemini-3-flash-preview";

    const videoPart = await fileToGenerativePart(videoFile);

    // Balanced Prompt - Less aggressive trash detection
    const prompt = `
    The user is supposed to be performing: "${scheduledActivity}".
    
    Analyze the uploaded file (image or video) to verify they are doing this activity.
    
    ⚠️ ONLY REJECT AS TRASH if the input shows:
    - Completely black/blank screens with NO visible content at all
    - Memes, joke images, or screenshots of social media/entertainment
    - Random objects with ZERO connection to any productive activity (just a wall, ceiling, random food)
    - Intentionally fake or misleading content
    
    ✅ ACCEPT AND SCORE if you can see ANY genuine attempt at the activity:
    - Even if image quality is not perfect or lighting is poor
    - Even if it's a selfie showing them doing the activity
    - Even if the setup is casual or home-based
    - Even if the person is only partially visible
    - Even if the environment is not ideal
    - Give them the benefit of the doubt! We want to encourage, not discourage.
    
    FOR TRASH CONTENT ONLY (truly invalid), RETURN:
    {
      "task_verified": false,
      "focus_score": 0,
      "ai_critique": "Invalid submission. Please upload actual proof of your activity.",
      "distractions_detected": ["Invalid Submission", "Trash Content"]
    }
    
    ✅ FOR VALID SUBMISSIONS (be LENIENT and ENCOURAGING):
    
    1. **Activity Match**: Can you see ANY evidence of "${scheduledActivity}"?
       - For "Workout": ANY exercise, gym equipment, yoga mat, running, home workout, fitness activity
       - For "Study": Books, laptop, notes, desk, library, ANY study setup (even casual)
       - For "Class": Classroom, online class on screen, lecture, educational content
       - For "Walk": Outdoors, park, street, nature, walking path
       - Accept home setups, casual environments, and imperfect conditions
    
    2. **Focus & Engagement**: Is there evidence of actual engagement?
       - Person visible doing the activity (even if partially)
       - Equipment/materials being used or visible
       - Appropriate setting for the activity
       - Don't demand perfection - accept honest attempts!
    
    3. **Distractions**: Only flag OBVIOUS and SEVERE distractions:
       - Phone clearly in hand during focus time (not just visible nearby)
       - Person clearly sleeping during active tasks
       - Entertainment clearly active and being consumed
       - Don't penalize for normal home environment, background items, or casual setups
    
    📊 FOCUS SCORE (0-10) - Be GENEROUS and ENCOURAGING:
    - 9-10: Excellent execution, very focused, professional or near-professional setup
    - 7-8: Good attempt, clearly doing activity, mostly focused
    - 5-6: Acceptable effort, activity visible, some minor issues
    - 3-4: Minimal effort, activity barely visible, multiple issues
    - 1-2: Very poor attempt, unclear what they're doing
    - 0: ONLY for trash/invalid content
    
    DEFAULT TO HIGHER SCORES. Be ENCOURAGING. Accept genuine attempts even if not perfect.
    Most real attempts should score 5-8. Reserve 0-2 for truly bad submissions.
    
    Return ONLY valid JSON in this exact format:
    {
      "task_verified": boolean,
      "focus_score": number (0-10),
      "ai_critique": "Brief, constructive, encouraging feedback",
      "distractions_detected": ["list", "of", "distractions"] or []
    }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        role: "user",
        parts: [
          videoPart,
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    // Clean up potential markdown formatting (```json ... ```)
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText) as VerificationResult;

  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      task_verified: false,
      focus_score: 0,
      distractions_detected: ["System Error: Analysis Failed"],
      ai_critique: "Technical error occurred during verification. Please try again."
    };
  }
};