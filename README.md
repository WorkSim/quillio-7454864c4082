# Quillio

Quillio is a minimal headless-CMS-style application used as a **debugging sandbox** within the WorkSim platform. It demonstrates a small publishing core (drafts, publishing, editing, public feed, author view) with intentional, documented bugs planted for candidate learning and assessment.

## Overview

**What it is:** A lightweight Next.js app with:
- A pure, deterministic post-management core (`src/lib/posts.ts`) — no wall clock, `now` is always passed in explicitly
- Draft/publish workflow with slug uniqueness
- A public feed (published only, sorted by recency) and an authoring view (everything, including drafts)
- Intentional seeded bugs (via patches) that candidates must fix

**What it's for:** WorkSim uses Quillio to test problem-solving skills across common CMS workflows — keeping timestamps honest, enforcing uniqueness constraints, and keeping unpublished content private.

**Key constraint:** This is a standalone template repo. `main` here is the correct, unmodified baseline implementation. At provision time, the platform plants every bug in the sprint into a student's own copy of the repo's root commit — so while this template's `main` stays clean, a student's `main` carries all of the sprint's known defects from the start. The assigned ticket names the one in scope; unrelated failures are other tickets' bugs, not something to fix.

## Quick Start

### Prerequisites
- Node.js 24+
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Run all tests (visible + grading)
npm test

# Run only grading tests (authoritative test suite)
npm run test:grading

# Build for production
npm run build
```

## Project Structure

```
quillio/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Public feed page
│   │   └── posts/[slug]/page.tsx  # Public post detail page
│   └── lib/
│       ├── posts.ts             # Post core (create/publish/update/list/get)
│       └── _smoke.ts            # Smoke test data + static seed posts
├── tests/
│   ├── visible/                 # VISIBLE tests (develop against these)
│   │   ├── _smoke.test.ts       # Basic app smoke test
│   │   └── posts.test.ts        # Happy-path post workflow tests
│   └── grading/                 # GRADING tests (restored from baseline in CI)
│       ├── publish-updated-at.test.ts  # updatedAt on publish/edit + feed order
│       ├── slug-uniqueness.test.ts     # Case-insensitive slug collision
│       └── draft-visibility.test.ts    # Public vs. authoring visibility
├── .github/workflows/
│   └── grade.yml                # CI grading workflow
├── package.json
├── tsconfig.json
├── next.config.ts
└── vitest.config.ts
```

## The `posts.ts` API

All times are `number` (epoch millis or any consistent unit) passed explicitly as `now` — there is no wall-clock read anywhere in this module, so every test is deterministic.

- `createPost(posts, input, now)` — creates a `draft` post with `createdAt = updatedAt = now`. Throws `Error("slug already exists")` if any existing post (of any status) has the same slug, compared case-insensitively.
- `publishPost(posts, id, now)` — sets `status: "published"` and `updatedAt: now`.
- `updatePost(posts, id, patch, now)` — applies a partial edit and sets `updatedAt: now`.
- `listPublished(posts)` — public feed: only `published` posts, sorted `updatedAt` descending.
- `getPublicPost(posts, slugOrId)` — public detail lookup: returns `null` for drafts (and for no match).
- `listForAuthor(posts)` — authoring feed: every post regardless of status.
- `getAuthorPost(posts, slugOrId)` — authoring detail lookup: includes drafts.

**Design decision — reject vs. auto-suffix on duplicate slugs:** this template **rejects** (throws) on a duplicate slug rather than auto-suffixing. This keeps the contract simple and unambiguous for both the candidate and the grading tests (a thrown error is trivial to assert with `.toThrow()`, whereas auto-suffix behavior would require the tests to encode a specific suffix scheme). It also mirrors ShopForge's `addToCart` pattern, which throws `Error("out of stock")` rather than silently clamping.

## Testing Strategy

Quillio uses the same **two-tier test split** as ShopForge:

### Visible Tests (`tests/visible/`)
- **Purpose:** For candidates to develop and validate their fixes
- **Run:** `npm test` (includes both visible + grading)
- **Edit:** Safe to edit and experiment with

### Grading Tests (`tests/grading/`)
- **Purpose:** Authoritative test suite for final assessment
- **Run:** `npm run test:grading` or included in full test run
- **Edit:** Do not edit — these are restored from the baseline in CI
- **Coverage:** One file per seeded bug
  - `publish-updated-at.test.ts` — `updatedAt` is touched on publish/edit; feed sort order
  - `slug-uniqueness.test.ts` — duplicate/case-insensitive slug rejection
  - `draft-visibility.test.ts` — public list/detail exclude drafts; authoring endpoint unaffected

**This template repo's own `main` is the correct baseline.** A student's provisioned repo ships with the sprint's known defects already committed to `main`; the assigned ticket names the one in scope. Running `npm test` in a student's repo may show unrelated failures among the 19 tests (9 visible + 10 grading) — those are other tickets' bugs, not something to fix.

## CI Grading Workflow

The `.github/workflows/grade.yml` workflow runs on every pull request targeting `main`:

1. Checks out the PR's merge ref (candidate code + grading baseline merged)
2. Restores `tests/grading`, `package.json`, `vitest.config.ts`, and `.github/grading-map.json` from the base branch — so a PR cannot fake a pass by editing those files
3. **Scopes the run to the ticket the PR is for**, then installs with `npm ci` and runs `npm run test:grading`

### Why scoping matters

Every one of the sprint's bugs is planted in your repo's root commit from day one. An
unscoped run therefore fails on the tickets you have not been assigned yet, so a
perfectly correct day-1 PR would show a red check. That is noise, not signal.

The workflow finds the ticket id in your **branch name**, then the **PR title**, then the
**PR body** — first match wins — and removes the other tickets' grading files before
running. Name your branch after the ticket and the check grades only your work:

```
git checkout -b cms-401-short-description
```

If no ticket id is found anywhere, the workflow runs everything and says so in the job
summary rather than pretending the result is meaningful.

## Environment Variables

Quillio uses no external APIs or environment variables. All data is in-memory arrays for determinism (see `src/lib/_smoke.ts` for the static seed posts used by the facade pages).

## Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Vitest Docs:** https://vitest.dev
- **React Docs:** https://react.dev
