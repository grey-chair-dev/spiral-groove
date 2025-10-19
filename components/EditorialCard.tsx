export default function EditorialCard({ post }: { post: any }) {
  return (
    <article className="card overflow-hidden">
      <div className="aspect-[16/10] bg-neutral-100" />
      <div className="p-4">
        <h3 className="font-semibold">{post.title}</h3>
        <p className="text-sm text-neutral-600 mt-1">{post.excerpt}</p>
        <a className="link mt-3 inline-block" href="#">Read</a>
      </div>
    </article>
  );
}
