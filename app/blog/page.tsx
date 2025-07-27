import React from 'react';
import Link from 'next/link';
import { getAllPosts, BlogPost } from '../lib/mdx';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-satoshi text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              ← Back to Portfolio
            </Link>
            <h1 className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100">
              Blog
            </h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="font-mono text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to my Blog
          </h2>
          <p className="font-satoshi text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Thoughts, ideas, and stories about technology, design, and the craft of building digital experiences.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post: BlogPost) => (
              <article 
                key={post.slug} 
                className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-mono text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                        {post.title}
                      </h3>
                      <p className="font-satoshi text-slate-600 dark:text-slate-400 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-500">
                    <div className="flex items-center gap-4 font-satoshi">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span>•</span>
                      <span>{post.readingTime}</span>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2">
                        {post.tags.map((tag: string) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs font-medium font-satoshi"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <h3 className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                No posts yet
              </h3>
              <p className="font-satoshi text-slate-600 dark:text-slate-400">
                Check back soon for new content!
              </p>
            </div>
          )}
        </div>
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