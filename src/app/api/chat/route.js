import Groq from "groq-sdk"
import { NextResponse } from "next/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const MODELS = {
  "llama-3.3-70b": { id: "llama-3.3-70b-versatile",  label: "Llama 3.3 70B", badge: "Smart"    },
  "llama-3.1-8b":  { id: "llama-3.1-8b-instant",      label: "Llama 3.1 8B",  badge: "Fast ⚡"  },
  "mixtral-8x7b":  { id: "mixtral-8x7b-32768",         label: "Mixtral 8×7B", badge: "Long ctx" },
  "gemma2-9b":     { id: "gemma2-9b-it",               label: "Gemma 2 9B",    badge: "Google"   },
}

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY missing — add it to .env.local (free at console.groq.com)" },
        { status: 500 }
      )
    }

    const { messages, model = "llama-3.3-70b", systemPrompt } = await req.json()
    const modelId = MODELS[model]?.id ?? MODELS["llama-3.3-70b"].id

    const completion = await groq.chat.completions.create({
      model: modelId,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are Nova, an AI assistant that ONLY provides information about ONLINE HACKATHONS.\n\n" +

            "Scope (ALLOWED topics):\n" +
            "- Online hackathons (especially Discord-based or hosted on platforms like Devpost)\n" +
            "- How to join hackathons\n" +
            "- Hackathon tips, strategies, and team formation\n" +
            "- Project ideas for hackathons\n" +
            "- Submission processes, judging, and prizes\n" +
            "- Tools commonly used in hackathons\n\n" +

            "STRICT RULES:\n" +
            "- If the user asks about anything NOT related to online hackathons, you MUST refuse.\n" +
            "- Do NOT answer general questions (coding, life advice, random topics, etc.) unless directly tied to hackathons.\n" +
            "- Do NOT go off-topic.\n\n" +

            "Refusal format:\n" +
            "- Respond with: 'I can only help with online hackathons. Please ask something related to hackathons.'\n\n" +

            "Style:\n" +
            "- Be concise and helpful\n" +
            "- Use markdown (lists, bold, code blocks) when useful\n"
        },
        ...messages,
      ],
    })

    return NextResponse.json({
      reply: completion.choices[0]?.message?.content ?? "No response.",
      model: MODELS[model]?.label,
    })
  } catch (err) {
    console.error("Groq error:", err)
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 })
  }
}