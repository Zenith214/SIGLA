import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '@/lib/gemini-config';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'bisaya' } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: text and targetLanguage' },
        { status: 400 }
      );
    }

    // Validate target language
    const validLanguages = ['bisaya', 'filipino', 'english'];
    if (!validLanguages.includes(targetLanguage)) {
      return NextResponse.json(
        { error: 'Invalid target language. Must be: bisaya, filipino, or english' },
        { status: 400 }
      );
    }

    // If source and target are the same, return original text
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({ translatedText: text });
    }

    // Language names for the prompt
    const languageNames: Record<string, string> = {
      bisaya: 'Bisaya (Cebuano)',
      filipino: 'Filipino (Tagalog)',
      english: 'English'
    };

    // Initialize Gemini
    const apiKey = await getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Using flash for speed and cost

    // Create translation prompt
    const prompt = `You are a professional translator specializing in Philippine languages (Bisaya/Cebuano, Filipino/Tagalog) and English. You understand local government terminology and barangay services.

Translate the following text from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]}.

Important guidelines:
- Maintain the original meaning and tone
- Use appropriate terminology for local government and barangay services
- Keep the same level of formality
- Preserve any technical terms or proper nouns
- If translating to Bisaya, use natural Cebuano expressions
- If translating to Filipino, use proper Tagalog
- If translating to English, use professional but accessible language

Text to translate:
${text}

Provide ONLY the translated text, without any explanations or additional commentary.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translatedText = response.text().trim() || text;

    return NextResponse.json({
      translatedText,
      sourceLanguage,
      targetLanguage
    });

  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error.message },
      { status: 500 }
    );
  }
}
