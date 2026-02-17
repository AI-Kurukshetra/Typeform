"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type FormRow = {
  id: string;
  title: string;
  user_id: string;
};

type ResponseRow = {
  id: string;
  created_at: string;
};

type AnswerRow = {
  id: string;
  response_id: string;
  value: unknown;
  question:
    | {
        id: string;
        title: string;
      }[]
    | null;
};

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string | undefined;

  const [form, setForm] = useState<FormRow | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!formId) return;

      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("id,title,user_id")
        .eq("id", formId)
        .single();

      if (!mounted) return;

      if (formError) {
        setError(formError.message);
        setLoading(false);
        return;
      }

      if (formData.user_id !== sessionData.session.user.id) {
        router.replace("/dashboard");
        return;
      }

      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .select("id,created_at")
        .eq("form_id", formId)
        .order("created_at", { ascending: true });

      if (!mounted) return;

      if (responseError) {
        setError(responseError.message);
        setLoading(false);
        return;
      }

      if (!responseData || responseData.length === 0) {
        setForm(formData);
        setResponses([]);
        setAnswers([]);
        setLoading(false);
        return;
      }

      const { data: answerData, error: answerError } = await supabase
        .from("answers")
        .select("id,response_id,value,question:question_id(id,title)")
        .in(
          "response_id",
          responseData.map((response) => response.id)
        );

      if (!mounted) return;

      if (answerError) {
        setError(answerError.message);
      } else {
        setAnswers(answerData ?? []);
      }

      setForm(formData);
      setResponses(responseData ?? []);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [formId, router]);

  const answersByResponse = useMemo(() => {
    const grouped = new Map<string, AnswerRow[]>();
    for (const answer of answers) {
      const existing = grouped.get(answer.response_id) ?? [];
      existing.push(answer);
      grouped.set(answer.response_id, existing);
    }
    return grouped;
  }, [answers]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6">
          <div className="rounded-3xl border border-charcoal/10 bg-ivory px-6 py-4 text-sm text-charcoal/70 shadow-soft">
            Loading responses...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6">
          <div className="rounded-3xl border border-sand bg-ivory px-6 py-4 text-sm text-teal shadow-soft">
            {error}
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
            <p className="text-xs uppercase tracking-[0.3em] text-teal">Responses</p>
            <h1 className="font-display text-3xl text-charcoal">{form?.title}</h1>
            <p className="mt-2 text-sm text-charcoal/70">
              {responses.length} submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/80 transition hover:border-charcoal hover:text-charcoal"
              href={`/forms/${formId}/edit`}
            >
              Back to editor
            </Link>
            <Link
              className="rounded-full bg-teal px-4 py-2 text-sm text-ivory transition hover:bg-teal/90"
              href={`/form/${formId}`}
            >
              Open form
            </Link>
          </div>
        </header>

        <section className="mt-10 space-y-6">
          {responses.length === 0 && (
            <div className="rounded-3xl border border-dashed border-charcoal/20 bg-sand px-6 py-10 text-sm text-charcoal/60">
              No responses yet. Share the form to start collecting submissions.
            </div>
          )}

          {responses.map((response) => {
            const responseAnswers = answersByResponse.get(response.id) ?? [];

            return (
              <div
                key={response.id}
                className="rounded-3xl border border-charcoal/10 bg-ivory p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">
                    Submission
                  </p>
                  <p className="text-sm text-charcoal/70">
                    {new Date(response.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="mt-6 space-y-4">
                  {responseAnswers.length === 0 && (
                    <p className="text-sm text-charcoal/60">No answers recorded.</p>
                  )}
                  {responseAnswers.map((answer) => (
                    <div key={answer.id} className="rounded-2xl bg-sand px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">
                        {answer.question?.[0]?.title ?? "Question"}
                      </p>
                      <p className="mt-2 text-sm text-charcoal">
                        {typeof answer.value === "string"
                          ? answer.value
                          : JSON.stringify(answer.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
