# Wingman AI

Wingman AI është një aplikacion web i ndërtuar me Next.js dhe Supabase që u lejon përdoruesve të krijojnë dhe menaxhojnë notes personale si dhe të përdorin një AI assistant për pyetje.

## Teknologjitë e përdorura

* Next.js
* Supabase (Authentication dhe Database)
* Vercel (Deployment)
* Groq API (AI)

## Funksionalitetet

* Regjistrim dhe login i përdoruesve
* Shtimi i notes (Create)
* Shfaqja e notes (Read)
* Filtrim i të dhënave sipas përdoruesit
* Siguri me Row Level Security (RLS)
* AI assistant për pyetje dhe përgjigje

## Siguria

Aplikacioni përdor Row Level Security (RLS) në Supabase, që siguron që çdo përdorues mund të shohë vetëm të dhënat e veta dhe jo të përdoruesve të tjerë.

## Deploy

Aplikacioni është deploy-uar në Vercel dhe mund të aksesohet këtu:

https://wingman-ai-git-main-elfijenimanis-projects.vercel.app/

## Përfundim

Ky projekt demonstron një aplikacion full-stack modern me authentication, database dhe AI integration.
