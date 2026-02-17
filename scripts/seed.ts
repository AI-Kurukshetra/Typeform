import "dotenv/config";

import { supabase } from "../src/lib/supabaseClient";

type QuestionSeed = {
  title: string;
  type: "text" | "mcq";
};

const demoUserId = process.env.DEMO_USER_ID;

if (!demoUserId) {
  throw new Error(
    "Missing DEMO_USER_ID. Set it to the auth.users id you will log in with."
  );
}

const questions: QuestionSeed[] = [
  { title: "What is your role?", type: "mcq" },
  { title: "What team do you work on?", type: "text" },
  { title: "What is your primary goal this quarter?", type: "text" },
  { title: "How did you hear about us?", type: "mcq" }
];

async function main() {
  const { data: formData, error: formError } = await supabase
    .from("forms")
    .insert({
      title: "Demo: Customer onboarding",
      user_id: demoUserId
    })
    .select("id")
    .single();

  if (formError || !formData) {
    throw new Error(formError?.message ?? "Failed to insert form.");
  }

  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .insert(
      questions.map((question, index) => ({
        form_id: formData.id,
        title: question.title,
        type: question.type,
        order_index: index
      }))
    )
    .select("id,title,type,order_index");

  if (questionError || !questionData) {
    throw new Error(questionError?.message ?? "Failed to insert questions.");
  }

  const orderedQuestions = [...questionData].sort(
    (a, b) => a.order_index - b.order_index
  );

  const { data: responseData, error: responseError } = await supabase
    .from("responses")
    .insert([{ form_id: formData.id }, { form_id: formData.id }])
    .select("id");

  if (responseError || !responseData) {
    throw new Error(responseError?.message ?? "Failed to insert responses.");
  }

  const [responseA, responseB] = responseData;

  const answersPayload = [
    {
      response_id: responseA.id,
      question_id: orderedQuestions[0].id,
      value: "Product"
    },
    {
      response_id: responseA.id,
      question_id: orderedQuestions[1].id,
      value: "Growth"
    },
    {
      response_id: responseA.id,
      question_id: orderedQuestions[2].id,
      value: "Increase activation by 20%"
    },
    {
      response_id: responseA.id,
      question_id: orderedQuestions[3].id,
      value: "Friend"
    },
    {
      response_id: responseB.id,
      question_id: orderedQuestions[0].id,
      value: "Marketing"
    },
    {
      response_id: responseB.id,
      question_id: orderedQuestions[1].id,
      value: "Lifecycle"
    },
    {
      response_id: responseB.id,
      question_id: orderedQuestions[2].id,
      value: "Improve onboarding clarity"
    },
    {
      response_id: responseB.id,
      question_id: orderedQuestions[3].id,
      value: "Search"
    }
  ];

  const { error: answersError } = await supabase
    .from("answers")
    .insert(answersPayload);

  if (answersError) {
    throw new Error(answersError.message);
  }

  console.log("Seed complete:", {
    formId: formData.id,
    questions: orderedQuestions.length,
    responses: responseData.length
  });
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
