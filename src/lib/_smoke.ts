import type { Post } from "./posts";

export function ping(): string { return "pong"; }

// Minimal static seed data for the facade pages (src/app/*) — not used by
// any test. Keeps the app/ routes real without needing a database.
export const seedPosts: Post[] = [
  {
    id: "1",
    slug: "hello-world",
    title: "Hello World",
    body: "The first published post.",
    status: "published",
    createdAt: 1000,
    updatedAt: 2000,
  },
  {
    id: "2",
    slug: "work-in-progress",
    title: "Work In Progress",
    body: "Not ready yet.",
    status: "draft",
    createdAt: 1500,
    updatedAt: 1500,
  },
];
