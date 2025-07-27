import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '../../lib/mdx';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="font-satoshi text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              ← Back to Blog
            </Link>
            <Link href="/" className="font-satoshi text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Portfolio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-12">
           
           <div>
             <div className="flex items justify-start gap-6 text-slate-600 dark:text-slate-400 mb-3 font-satoshi">
               <time dateTime={post.date} className="flex items-center gap-2">
                 {/* <span className="text-lg">📅</span> */}
                 {new Date(post.date).toLocaleDateString('en-US', {
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric'
                 })}
               </time>
               <span>•</span>
               <div className="flex items-center gap-2">
                 {/* <span className="text-lg">⏱️</span> */}
                 {post.readingTime}
               </div>
             </div>
             <h1 className="font-mono text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
               {post.title}
             </h1>
             
           </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none">
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Navigation */}
        <nav className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-satoshi"
            >
              ← All Posts
            </Link>
            
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-satoshi"
            >
              🏠 Portfolio
            </Link>
          </div>
        </nav>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-slate-500 dark:text-slate-500">
          <p className="font-satoshi">© 2024 - Made with ❤️ and lots of ☕</p>
        </div>
      </footer>
    </div>
  );
} 