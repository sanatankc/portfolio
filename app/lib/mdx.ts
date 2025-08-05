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
  isMDX?: boolean;
  showIntroduction?: boolean;
}

export function getAllPosts(): BlogPost[] {
  try {
    // Ensure the blogs directory exists
    if (!fs.existsSync(blogsDirectory)) {
      fs.mkdirSync(blogsDirectory, { recursive: true });
      return [];
    }

    const fileNames = fs.readdirSync(blogsDirectory);
    const allPostsData = fileNames
      .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
      .map(fileName => {
        const slug = fileName.replace(/\.(md|mdx)$/, '');
        const fullPath = path.join(blogsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        const readingTimeResult = readingTime(matterResult.content);

        return {
          slug,
          title: matterResult.data.title || 'Untitled',
          date: matterResult.data.date || new Date().toISOString(),
          excerpt: matterResult.data.excerpt || '',
          content: matterResult.content,
          readingTime: readingTimeResult.text,
          tags: matterResult.data.tags || [],
          author: matterResult.data.author,
          coverImage: matterResult.data.coverImage,
          isMDX: fileName.endsWith('.mdx'),
          showIntroduction: matterResult.data.showIntroduction || false,
        };
      });

    return allPostsData.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    // Try both .md and .mdx extensions
    let fullPath = path.join(blogsDirectory, `${slug}.mdx`);
    let isMDX = true;
    
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(blogsDirectory, `${slug}.md`);
      isMDX = false;
      
      if (!fs.existsSync(fullPath)) {
        return null;
      }
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    const readingTimeResult = readingTime(matterResult.content);

    return {
      slug,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || new Date().toISOString(),
      excerpt: matterResult.data.excerpt || '',
      content: matterResult.content,
      readingTime: readingTimeResult.text,
      tags: matterResult.data.tags || [],
      author: matterResult.data.author,
      showIntroduction: matterResult.data.showIntroduction || false,
      coverImage: matterResult.data.coverImage,
      isMDX,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
} 