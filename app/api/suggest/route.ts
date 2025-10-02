// app/api/code-completion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Copilot, type CompletionRequestBody } from "monacopilot";

const copilot = new Copilot(process.env.OPENROUTER_API_KEY!, {
  // provider: 'huggingface', You don't need to set the provider if you are using a custom model.
  model: {  
    config: (apiKey, prompt) => ({
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: {
        model: "mistralai/mistral-7b-instruct:free", // A popular free model on OpenRouter
        messages: [
          { role: "user", content: prompt.user }, // The prompt from the editor
        ],
      },
    }),
    transformResponse: (response) => {
      if (response.error) {
        return {
          completion: null,
          error: response.error,
        };
      }

      return {
        completion: response.choices[0].message.content,
      };
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const body: CompletionRequestBody = await req.json();
    const completion = await copilot.complete({ body });
    console.log("Completions : ", completion);
    

    return NextResponse.json(completion, { status: 200 });
  } catch (error) {
    console.error("ERROR in POST route:", error);
    return NextResponse.json(
      { error: "Failed to get completion." },
      { status: 500 }
    );
  }
}
