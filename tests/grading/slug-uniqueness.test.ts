import { expect, test } from "vitest";
import { createPost } from "@/lib/posts";

test("creating a post with a duplicate slug is rejected", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  expect(() =>
    createPost(
      posts,
      { id: "2", slug: "hello-world", title: "Duplicate", body: "..." },
      1100
    )
  ).toThrow();
});

test("slug uniqueness is enforced case-insensitively", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "My-Post", title: "My Post", body: "..." },
    1000
  );
  expect(() =>
    createPost(
      posts,
      { id: "2", slug: "my-post", title: "Collides", body: "..." },
      1100
    )
  ).toThrow();
});

test("existing posts and unique slugs are unaffected", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  const next = createPost(
    posts,
    { id: "2", slug: "a-different-slug", title: "Different", body: "..." },
    1100
  );
  expect(next).toHaveLength(2);
  expect(next[0].slug).toBe("hello-world");
  expect(next[1].slug).toBe("a-different-slug");
});
