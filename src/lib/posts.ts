export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  slug: string;
  title: string;
  body: string;
  status: PostStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePostInput {
  id: string;
  slug: string;
  title: string;
  body: string;
}

export type UpdatePostPatch = Partial<
  Pick<Post, "title" | "body" | "slug" | "status">
>;

function slugCollides(posts: Post[], slug: string): boolean {
  const target = slug.toLowerCase();
  return posts.some((p) => p.slug.toLowerCase() === target);
}

function findIndexById(posts: Post[], id: string): number {
  return posts.findIndex((p) => p.id === id);
}

function matchesSlugOrId(post: Post, slugOrId: string): boolean {
  return (
    post.id === slugOrId || post.slug.toLowerCase() === slugOrId.toLowerCase()
  );
}

/**
 * Create a new draft post.
 *
 * Enforces case-insensitive slug uniqueness across the whole post list —
 * throws Error("slug already exists") if any existing post (of any status)
 * already has the same slug, ignoring case.
 *
 * status is always "draft"; createdAt and updatedAt are both set to `now`.
 */
export function createPost(
  posts: Post[],
  input: CreatePostInput,
  now: number
): Post[] {
  const post: Post = {
    id: input.id,
    slug: input.slug,
    title: input.title,
    body: input.body,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  return [...posts, post];
}

/**
 * Publish a post: sets status to "published" and touches updatedAt to `now`.
 * No-op (returns the list unchanged) if the id doesn't exist.
 */
export function publishPost(posts: Post[], id: string, now: number): Post[] {
  const idx = findIndexById(posts, id);
  if (idx === -1) return posts;
  return posts.map((p, i) =>
    i === idx ? { ...p, status: "published" as const } : p
  );
}

/**
 * Apply a partial edit to a post and touch updatedAt to `now`.
 * No-op (returns the list unchanged) if the id doesn't exist.
 */
export function updatePost(
  posts: Post[],
  id: string,
  patch: UpdatePostPatch,
  now: number
): Post[] {
  const idx = findIndexById(posts, id);
  if (idx === -1) return posts;
  return posts.map((p, i) =>
    i === idx ? { ...p, ...patch } : p
  );
}

/**
 * Public feed: only "published" posts, sorted by updatedAt descending
 * (most recently published/edited first).
 */
export function listPublished(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Public detail lookup by slug or id. Returns null for drafts (and for
 * anything that doesn't match) — anonymous readers never see unpublished
 * content.
 */
export function getPublicPost(posts: Post[], slugOrId: string): Post | null {
  const post = posts.find((p) => matchesSlugOrId(p, slugOrId));
  return post ?? null;
}

/**
 * Authoring feed: every post regardless of status, sorted by updatedAt
 * descending.
 */
export function listForAuthor(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Authoring detail lookup by slug or id — includes drafts.
 */
export function getAuthorPost(posts: Post[], slugOrId: string): Post | null {
  return posts.find((p) => matchesSlugOrId(p, slugOrId)) ?? null;
}
