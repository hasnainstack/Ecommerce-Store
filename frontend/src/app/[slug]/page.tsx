import { Metadata } from "next";
import { notFound } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

async function getPage(slug: string): Promise<PageData | null> {
  try {
    const res = await fetch(`${API_BASE}/pages/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page Not Found" };

  return {
    title: `${page.title} — Store`,
    description: page.meta_description || undefined,
  };
}

export default async function CMSPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold text-text mb-8">
        {page.title}
      </h1>
      <div
        className="prose prose-lg max-w-none text-text-secondary
          [&_h1]:text-text [&_h2]:text-text [&_h3]:text-text
          [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary-hover
          [&_img]:rounded-[var(--radius-lg)] [&_img]:max-w-full
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic
          [&_ul]:list-disc [&_ul]:pl-6
          [&_ol]:list-decimal [&_ol]:pl-6
          [&_code]:bg-border/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-[var(--radius-sm)] [&_code]:text-sm"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
