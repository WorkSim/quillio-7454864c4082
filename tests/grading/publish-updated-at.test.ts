import { expect, test } from "vitest";
import { createPost, publishPost, updatePost, listPublished } from "@/lib/posts";

test("publishing a post sets updatedAt to the publish time", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  const published = publishPost(posts, "1", 5000);
  expect(published[0].updatedAt).toBe(5000);
  expect(published[0].status).toBe("published");
});

test("editing a post sets updatedAt to the edit time", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  const edited = updatePost(posts, "1", { title: "Updated Title" }, 6000);
  expect(edited[0].updatedAt).toBe(6000);
});

test("the feed sorts newest-updated first, reflecting a later edit", () => {
  let posts = createPost([], { id: "1", slug: "a", title: "A", body: "..." }, 1000);
  posts = createPost(posts, { id: "2", slug: "b", title: "B", body: "..." }, 1100);
  posts = publishPost(posts, "1", 2000);
  posts = publishPost(posts, "2", 3000);

  // Post 1 was published first (updatedAt 2000), but a later edit should
  // bump it back to the top of the feed.
  posts = updatePost(posts, "1", { title: "A, revised" }, 4000);

  const feed = listPublished(posts);
  expect(feed.map((p) => p.id)).toEqual(["1", "2"]);
});

test("a post that is never touched keeps its original updatedAt", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  expect(posts[0].updatedAt).toBe(1000);
});
