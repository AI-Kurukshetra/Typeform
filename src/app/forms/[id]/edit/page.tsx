"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type QuestionRow = {
  id: string;
  title: string;
  type: string;
  order_index: number;
};

type FormRow = {
  id: string;
  title: string;
};

export default function FormEditorPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string | undefined;

  const [form, setForm] = useState<FormRow | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      if (!formId) return;

      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("id,title")
        .eq("id", formId)
        .single();

      if (!mounted) return;

      if (formError) {
        setError(formError.message);
        setLoading(false);
        return;
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("id,title,type,order_index")
        .eq("form_id", formId)
        .order("order_index", { ascending: true });

      if (!mounted) return;

      if (questionsError) {
        setError(questionsError.message);
      } else {
        setQuestions(questionsData ?? []);
      }

      setForm(formData);
      setLoading(false);
    };

    load();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [formId, router]);

  const nextOrderIndex = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.max(...questions.map((q) => q.order_index)) + 1;
  }, [questions]);

  const handleAddQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formId || !title.trim()) return;

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("questions")
      .insert({
        form_id: formId,
        title: title.trim(),
        type,
        order_index: nextOrderIndex
      })
      .select("id,title,type,order_index")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setQuestions((prev) => [...prev, data]);
    setTitle("");
    setType("text");
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6">
          <div className="rounded-3xl border border-charcoal/10 bg-ivory px-6 py-4 text-sm text-charcoal/70 shadow-soft">
            Loading editor...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal">Form editor</p>
            <h1 className="font-display text-3xl text-charcoal">
              {form?.title ?? "Untitled form"}
            </h1>
            <p className="mt-2 text-sm text-charcoal/70">Build a conversational flow.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/80 transition hover:border-charcoal hover:text-charcoal"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            {formId && (
              <Link
                className="rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/80 transition hover:border-charcoal hover:text-charcoal"
                href={`/forms/${formId}/responses`}
              >
                View Responses
              </Link>
            )}
            {formId && (
              <Link
                className="rounded-full bg-charcoal px-4 py-2 text-sm text-ivory"
                href={`/form/${formId}`}
              >
                Preview form
              </Link>
            )}
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-charcoal/10 bg-ivory p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-charcoal">Questions</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-charcoal/50">
                {questions.length} total
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {questions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-charcoal/20 bg-sand px-4 py-6 text-sm text-charcoal/60">
                  Add your first question to shape the conversation.
                </div>
              )}
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between rounded-2xl border border-charcoal/10 bg-sand px-4 py-4"
                >
                  <div>
                    <p className="font-medium text-charcoal">{question.title}</p>
                    <p className="text-xs text-charcoal/60">Type: {question.type}</p>
                  </div>
                  <span className="text-xs text-charcoal/50">#{question.order_index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-charcoal/10 bg-sand p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.3em] text-rust">Add question</p>
            <h3 className="mt-3 font-display text-2xl text-charcoal">New prompt</h3>
            <p className="mt-2 text-sm text-charcoal/70">
              Keep it short. You can add multiple choice or free response.
            </p>

            <form onSubmit={handleAddQuestion} className="mt-6 space-y-4">
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Question title"
                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition focus:border-teal"
                required
              />
              <div className="flex items-center gap-3">
                <label className="text-sm text-charcoal/70" htmlFor="type">
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="rounded-xl border border-charcoal/15 bg-white px-4 py-2 text-sm text-charcoal"
                >
                  <option value="text">Text</option>
                  <option value="mcq">Multiple choice</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-charcoal px-4 py-3 text-sm font-medium text-ivory transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Adding..." : "Add question"}
              </button>
            </form>

            {error && <p className="mt-4 text-sm text-rust">{error}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
