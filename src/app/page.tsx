import { listPublished } from "@/lib/posts";
import { seedPosts } from "@/lib/_smoke";

export default function FeedPage() {
  const feed = listPublished(seedPosts);
  return (
    <main>
      <h1>Quillio</h1>
      <ul>
        {feed.map((post) => (
          <li key={post.id}>
            <span>{post.title}</span>
            <span> — updated {new Date(post.updatedAt).toISOString()}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
