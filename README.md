# Conversational Form Builder

AI-assisted Typeform-style form builder with Supabase auth, manual editor, live form player, and responses viewer. Built with Next.js App Router, TypeScript, and Tailwind, and designed for Vercel deployment.

## Features
- Email magic-link auth (Supabase)
- Manual form builder (title + questions + ordering)
- Typeform-style form player (one question at a time)
- Responses viewer for form owners
- AI form generation via OpenAI

## Tech Stack
- Next.js (App Router) + TypeScript
- Supabase (auth + Postgres)
- OpenAI (form generation)
- Tailwind CSS
- Vercel (deployment)

## Local Setup
```bash
npm install
npm run dev
```

## Environment Variables
Create `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Supabase Setup
1. Create a new Supabase project.
2. Enable email auth in Authentication settings.
3. Run the SQL schema (forms, questions, responses, answers) in the Supabase SQL editor.
4. Copy your project URL and anon key into `.env`.

## Demo Data (Manual)
1. Log in.
2. Create a form in the dashboard.
3. Add a few questions in the editor.
4. Open `/form/{id}` and submit a response.
5. View submissions in `/forms/{id}/responses`.

## Deployment (Vercel)
1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Add the environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Deploy.

## Demo Flow
1. Log in via magic link.
2. Generate a form with AI or create one manually.
3. Edit questions and order.
4. Share `/form/{id}` and submit responses.
5. Review submissions in `/forms/{id}/responses`.
