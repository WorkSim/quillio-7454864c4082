import { expect, test } from "vitest";
import {
  createPost,
  publishPost,
  updatePost,
  listPublished,
  getPublicPost,
  listForAuthor,
  getAuthorPost,
} from "@/lib/posts";

test("createPost creates a draft with matching createdAt/updatedAt", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  expect(posts).toHaveLength(1);
  expect(posts[0].status).toBe("draft");
  expect(posts[0].createdAt).toBe(1000);
  expect(posts[0].updatedAt).toBe(1000);
});

test("createPost rejects a case-insensitive duplicate slug", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "Hello-World", title: "Hello World", body: "..." },
    1000
  );
  expect(() =>
    createPost(
      posts,
      { id: "2", slug: "hello-world", title: "Another", body: "..." },
      1100
    )
  ).toThrow("slug already exists");
});

test("createPost allows a unique slug alongside existing posts", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  const next = createPost(
    posts,
    { id: "2", slug: "second-post", title: "Second Post", body: "..." },
    1100
  );
  expect(next).toHaveLength(2);
});

test("publishPost sets status to published and touches updatedAt", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  const published = publishPost(posts, "1", 2000);
  expect(published[0].status).toBe("published");
  expect(published[0].updatedAt).toBe(2000);
  expect(published[0].createdAt).toBe(1000);
});

test("updatePost applies the patch and touches updatedAt", () => {
  const posts = createPost(
    [],
    { id: "1", slug: "hello-world", title: "Hello World", body: "..." },
    1000
  );
  const updated = updatePost(posts, "1", { title: "New Title" }, 3000);
  expect(updated[0].title).toBe("New Title");
  expect(updated[0].updatedAt).toBe(3000);
});

test("listPublished only returns published posts, newest-updated first", () => {
  let posts = createPost(
    [],
    { id: "1", slug: "a", title: "A", body: "..." },
    1000
  );
  posts = createPost(posts, { id: "2", slug: "b", title: "B", body: "..." }, 1100);
  posts = publishPost(posts, "1", 2000);
  posts = publishPost(posts, "2", 3000);

  const feed = listPublished(posts);
  expect(feed.map((p) => p.id)).toEqual(["2", "1"]);
});

test("getPublicPost returns null for a draft but the post for a published one", () => {
  let posts = createPost(
    [],
    { id: "1", slug: "draft-post", title: "Draft", body: "..." },
    1000
  );
  posts = createPost(
    posts,
    { id: "2", slug: "live-post", title: "Live", body: "..." },
    1100
  );
  posts = publishPost(posts, "2", 2000);

  expect(getPublicPost(posts, "draft-post")).toBeNull();
  expect(getPublicPost(posts, "live-post")?.id).toBe("2");
});

test("author views include drafts", () => {
  let posts = createPost(
    [],
    { id: "1", slug: "draft-post", title: "Draft", body: "..." },
    1000
  );
  expect(listForAuthor(posts)).toHaveLength(1);
  expect(getAuthorPost(posts, "draft-post")?.status).toBe("draft");
});
