// app/api/suggest/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Use environment variables for your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { content, languageId, cursor } = await req.json();

    // 1. Create a clear prompt for the AI model
    const prompt = `
      You are an expert programmer. Provide an inline code suggestion for the following code snippet.
      The user is editing a file in ${languageId}.
      The current code is:
      \`\`\`${languageId}
      ${content}
      \`\`\`
      The user's cursor is at position ${cursor}.
      Return only the code suggestion that should be inserted at the cursor. Do not add any explanation or markdown formatting.
    `;

    // 2. Call the AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestion = response.text();

    // 3. Return the suggestion in the expected format
    return NextResponse.json({ suggestion });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate suggestion." },
      { status: 500 }
    );
  }
}