import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type GeneratedQuestion = {
  title: string;
  type: "text" | "mcq";
};

type GeneratedForm = {
  title: string;
  questions: GeneratedQuestion[];
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "questions"],
  properties: {
    title: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "type"],
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["text", "mcq"] }
        }
      }
    }
  }
};

function extractOutputText(payload: any) {
  const message = payload?.choices?.[0]?.message;
  if (typeof message?.content === "string") return message.content;
  return null;
}

function sanitizeForm(value: any): GeneratedForm | null {
  if (!value || typeof value !== "object") return null;

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const questions = Array.isArray(value.questions) ? value.questions : [];

  const cleaned = questions
    .map((question: any) => {
      const questionTitle =
        typeof question?.title === "string" ? question.title.trim() : "";
      const questionType = question?.type === "mcq" ? "mcq" : "text";

      if (!questionTitle) return null;

      return {
        title: questionTitle,
        type: questionType
      } as GeneratedQuestion;
    })
    .filter(Boolean) as GeneratedQuestion[];

  if (!title || cleaned.length === 0) return null;

  return {
    title,
    questions: cleaned
  };
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY." }, { status: 500 });
  }

  let prompt = "";
  try {
    const body = await request.json();
    prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  } catch {
    prompt = "";
  }

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Missing Supabase environment variables." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[generate-form] auth error", userError?.message);
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let aiPayload: any = null;
  let outputText: string | null = null;

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You generate JSON for a conversational form. Return JSON only that matches the schema. Output must be valid JSON."
          },
          {
            role: "user",
            content: `Create a concise conversational form from the description below.\n\nDescription: ${prompt}\n\nReturn JSON only.`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "form_schema",
            schema,
            strict: true
          }
        },
        temperature: 0.2
      })
    });

    const responseText = await aiResponse.text();

    if (!aiResponse.ok) {
      console.error("[generate-form] openai error", aiResponse.status, responseText);
      return NextResponse.json(
        {
          error: "AI request failed.",
          details: responseText
        },
        { status: 502 }
      );
    }

    aiPayload = responseText ? JSON.parse(responseText) : null;
    outputText = extractOutputText(aiPayload);
  } catch (err) {
    console.error("[generate-form] openai exception", err);
    return NextResponse.json(
      {
        error: "AI request failed.",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 502 }
    );
  }

  if (!outputText) {
    console.error("[generate-form] empty output", aiPayload);
    return NextResponse.json(
      { error: "No AI output returned.", details: aiPayload },
      { status: 502 }
    );
  }

  let parsed: GeneratedForm | null = null;
  try {
    parsed = sanitizeForm(JSON.parse(outputText));
  } catch {
    parsed = null;
  }

  if (!parsed) {
    console.error("[generate-form] invalid output", outputText);
    return NextResponse.json(
      { error: "Invalid AI output.", details: outputText },
      { status: 422 }
    );
  }

  const { data: formData, error: formError } = await supabase
    .from("forms")
    .insert({
      title: parsed.title,
      user_id: user.id
    })
    .select("id")
    .single();

  if (formError || !formData) {
    console.error("[generate-form] form insert error", formError?.message);
    return NextResponse.json(
      { error: formError?.message ?? "Insert failed." },
      { status: 500 }
    );
  }

  const questionsPayload = parsed.questions.map((question, index) => ({
    form_id: formData.id,
    title: question.title,
    type: question.type,
    order_index: index
  }));

  const { error: questionsError } = await supabase
    .from("questions")
    .insert(questionsPayload);

  if (questionsError) {
    console.error("[generate-form] questions insert error", questionsError.message);
    return NextResponse.json({ error: questionsError.message }, { status: 500 });
  }

  console.info("[generate-form] success", {
    formId: formData.id,
    questionCount: questionsPayload.length,
    durationMs: Date.now() - startedAt
  });

  return NextResponse.json({ formId: formData.id });
}
