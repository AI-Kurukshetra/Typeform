"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

type AnswerValue = string;

type AnswersState = Record<string, AnswerValue>;

export default function FormPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string | undefined;

  const [form, setForm] = useState<FormRow | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!formId) return;

      console.log("[form-player] loading form", formId);

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

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("id,title,type,order_index")
        .eq("form_id", formId)
        .order("order_index", { ascending: true });

      if (!mounted) return;

      if (questionError) {
        setError(questionError.message);
      } else {
        setQuestions(questionData ?? []);
      }

      setForm(formData);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [formId]);

  const currentQuestion = questions[currentIndex];
  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!formId) return;
    setSubmitting(true);
    setError(null);

    const { data: responseData, error: responseError } = await supabase
      .from("responses")
      .insert({ form_id: formId })
      .select("id")
      .single();

    if (responseError) {
      setError(responseError.message);
      setSubmitting(false);
      return;
    }

    const payload = questions.map((question) => ({
      response_id: responseData.id,
      question_id: question.id,
      value: answers[question.id] ?? ""
    }));

    const { error: answersError } = await supabase.from("answers").insert(payload);

    if (answersError) {
      setError(answersError.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
          <div className="rounded-3xl border border-charcoal/10 bg-ivory px-6 py-4 text-sm text-charcoal/70 shadow-soft">
            Loading form...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
          <div className="rounded-3xl border border-charcoal/10 bg-ivory px-6 py-4 text-sm text-rust shadow-soft">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
          <div className="w-full max-w-xl rounded-3xl border border-charcoal/10 bg-ivory p-10 text-center shadow-soft">
            <p className="text-xs uppercase tracking-[0.3em] text-teal">Complete</p>
            <h1 className="mt-3 font-display text-3xl text-charcoal">Thanks for your response.</h1>
            <p className="mt-3 text-sm text-charcoal/70">
              Your answers have been recorded.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/"
                className="rounded-full bg-charcoal px-6 py-3 text-sm text-ivory"
              >
                Back home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
          <div className="w-full max-w-xl rounded-3xl border border-charcoal/10 bg-ivory p-10 text-center shadow-soft">
            <p className="text-xs uppercase tracking-[0.3em] text-teal">No questions</p>
            <h1 className="mt-3 font-display text-3xl text-charcoal">This form is empty.</h1>
            <p className="mt-3 text-sm text-charcoal/70">
              Add questions in the editor before sharing it.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href={`/forms/${formId}/edit`}
                className="rounded-full bg-charcoal px-6 py-3 text-sm text-ivory"
              >
                Open editor
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const answerValue = answers[currentQuestion.id] ?? "";
  const isLast = currentIndex === questions.length - 1;
  const canAdvance = answerValue.trim().length > 0 || currentQuestion.type === "mcq";

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
        <div className="w-full max-w-2xl rounded-3xl border border-charcoal/10 bg-ivory p-10 shadow-soft">
          <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-charcoal/50">
            <span>{form?.title ?? "Form"}</span>
            <span>
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="mb-6 h-1 w-full rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-teal transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h1 className="font-display text-3xl text-charcoal">
                {currentQuestion.title}
              </h1>

              {currentQuestion.type === "text" && (
                <input
                  type="text"
                  value={answerValue}
                  onChange={(event) => handleAnswerChange(event.target.value)}
                  placeholder="Type your answer"
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-base text-charcoal outline-none transition focus:border-teal"
                />
              )}

              {currentQuestion.type === "mcq" && (
                <div className="grid gap-3">
                  {[
                    "Option A",
                    "Option B",
                    "Option C"
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswerChange(option)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-base transition ${
                        answerValue === option
                          ? "border-teal bg-teal/10 text-teal"
                          : "border-charcoal/15 bg-white text-charcoal hover:border-charcoal/40"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="text-sm text-charcoal/60"
              disabled={currentIndex === 0}
            >
              Back
            </button>

            {!isLast ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance}
                className="rounded-full bg-charcoal px-6 py-3 text-sm text-ivory transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !canAdvance}
                className="rounded-full bg-teal px-6 py-3 text-sm text-ivory transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
