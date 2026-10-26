import { expect, test } from "vitest";
import {
  createPost,
  publishPost,
  listPublished,
  getPublicPost,
  listForAuthor,
  getAuthorPost,
} from "@/lib/posts";

test("the public list excludes draft posts", () => {
  let posts = createPost([], { id: "1", slug: "draft-post", title: "Draft", body: "..." }, 1000);
  posts = createPost(posts, { id: "2", slug: "live-post", title: "Live", body: "..." }, 1100);
  posts = publishPost(posts, "2", 2000);

  const feed = listPublished(posts);
  expect(feed.map((p) => p.id)).toEqual(["2"]);
});

test("the public detail lookup returns null for a draft's id or slug", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "draft-post", title: "Draft", body: "..." },
    1000
  );
  expect(getPublicPost(posts, "draft-post")).toBeNull();
  expect(getPublicPost(posts, "1")).toBeNull();
});

test("the authoring endpoint still returns drafts", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "draft-post", title: "Draft", body: "..." },
    1000
  );
  expect(listForAuthor(posts)).toHaveLength(1);
  expect(getAuthorPost(posts, "draft-post")?.status).toBe("draft");
});
