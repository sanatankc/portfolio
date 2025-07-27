import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const blogsDirectory = path.join(process.cwd(), 'blogs');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  readingTime: string;
  tags?: string[];
  author?: string;
  coverImage?: string;
}

// This will run at build time for static generation
export function getAllPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(blogsDirectory)) {
      // Create directory if it doesn't exist
      fs.mkdirSync(blogsDirectory, { recursive: true });
      return [];
    }

    const fileNames = fs.readdirSync(blogsDirectory);
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.(md|mdx)$/, '');
        const fullPath = path.join(blogsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const readTime = readingTime(content);

        return {
          slug,
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString(),
          excerpt: data.excerpt || content.slice(0, 160) + '...',
          content,
          readingTime: readTime.text,
          tags: data.tags || [],
          author: data.author,
          coverImage: data.coverImage,
        } as BlogPost;
      })
      .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

    return allPostsData;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    if (!fs.existsSync(blogsDirectory)) {
      return null;
    }

    const possibleFiles = [`${slug}.md`, `${slug}.mdx`];
    let fullPath: string | null = null;
    
    for (const fileName of possibleFiles) {
      const testPath = path.join(blogsDirectory, fileName);
      if (fs.existsSync(testPath)) {
        fullPath = testPath;
        break;
      }
    }

    if (!fullPath) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const readTime = readingTime(content);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || content.slice(0, 160) + '...',
      content,
      readingTime: readTime.text,
      tags: data.tags || [],
      author: data.author,
      coverImage: data.coverImage,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
} 