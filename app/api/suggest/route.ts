// app/api/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, content, cursor, languageId } = await req.json();

    // Create a more specific prompt for code completion
    const completionPrompt = `You are a helpful coding assistant. Complete the following ${languageId} code. Return ONLY the completion text without any explanations, markdown formatting, or code blocks:

${content}

Complete from cursor position. Return only the next logical code continuation:`;

    console.log("Request details:", { languageId, cursor, promptLength: prompt?.length });

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { 
            role: "user", 
            content: completionPrompt 
          }
        ],
        max_tokens: 150,
        temperature: 0.1,
        stop: ["\n\n", "```", "//", "/*"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      throw new Error(`OpenRouter request failed: ${response.status} ${errorText}`);
    }

    const openRouterResponse = await response.json();
    
    if (!openRouterResponse.choices || !openRouterResponse.choices[0]?.message?.content) {
      console.error("Invalid OpenRouter response:", openRouterResponse);
      return NextResponse.json({ completion: null });
    }

    const completion = openRouterResponse.choices[0].message.content.trim();
    console.log("Generated completion:", completion.substring(0, 100) + "...");
    
    return NextResponse.json({ 
      completion: completion || null 
    });

  } catch (error) {
    console.error("ERROR in suggest route:", error);
    return NextResponse.json(
      { 
        error: "Failed to get completion",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}