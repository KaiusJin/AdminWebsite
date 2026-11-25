# Website Admin

Private React/Vite administration interface for portfolio content stored in Supabase.

## Managed content

- Projects
- Work, club/design-team, and volunteer experience
- Awards (title, organization, year, credential URL) and skills
- Profile and contact details
- Personal journal and journey scene descriptions
- Public media uploads

Content is written directly to the live tables. There is no draft, publish-status, visibility, translation, or content-preview workflow.

## Source organization

- `src/App.jsx` owns the session gate and routes; `src/pages/` composes the login and dashboard pages.
- `src/cms/collections.js` defines navigation order, content labels, collection limits, and form defaults.
- `src/cms/content/` owns content lists, editing forms, and content API operations.
- `src/cms/media/` owns media uploads, selection, asset loading, and media-specific styles.
- `src/components/` contains reusable UI such as `ArrayEditor`.
- `src/lib/supabase.js` initializes the shared Supabase client.
- `src/index.css` contains shared layout, form, and feedback styles and is loaded by `src/main.jsx`.

## Local development

Create `.env` with:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Then run:

```bash
npm install
npm run dev
```

Run `npm run lint`, `npm test`, and `npm run build` before deployment.

The live Supabase project is the database source of truth. See
[the database documentation](https://github.com/KaiusJin/Website_Public/blob/main/supabase/README.md)
for the current content model. Applied SQL migrations are retained in
[Website_Public/supabase/migrations](https://github.com/KaiusJin/Website_Public/tree/main/supabase/migrations).
Use the live database and its recorded migration history when planning future changes.
