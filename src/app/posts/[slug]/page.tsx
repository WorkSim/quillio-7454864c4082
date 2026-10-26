import { notFound } from "next/navigation";
import { getPublicPost } from "@/lib/posts";
import { seedPosts } from "@/lib/_smoke";

export default function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPublicPost(seedPosts, params.slug);
  if (!post) notFound();

  return (
    <main>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </main>
  );
}
