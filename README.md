# 🖥️ FoundShell v0.3
*An abandoned personal computer, still running...*

---

## 🧭 What Is This?

This isn't your typical portfolio website. 

You've stumbled upon **FoundShell** — what appears to be someone's personal computer, left running and unattended. The screen flickers to life with a boot sequence, recovering a previous session. Windows are scattered across the desktop. Files are corrupted. The owner is nowhere to be found.

**This is an interactive narrative disguised as a portfolio.**

Instead of "About Me" sections and polished project galleries, you explore a digital space that feels lived-in, mysterious, and slightly intrusive. You're not browsing a website — you're recovering someone's lost session.

---

## 🎭 The Experience

### **Boot Sequence**
- Watch the system initialize with authentic terminal-style output
- Hear typewriter sounds as the OS recovers corrupted files
- See windows being restored: `terminal [OK]`, `chat.app [OK]`, `projects/ [partial]`
- Experience the tension of a system that's broken but still functional

### **Desktop Environment**
- **Terminal**: Execute commands, explore the filesystem, discover hidden files
- **Chat Interface**: Interact with an AI that knows about the "owner" 
- **Settings**: Customize wallpapers, themes, and system preferences
- **Sound Effects**: Every click, hover, and interaction has tactile audio feedback

### **Narrative Elements**
- User profile: `[Sanatan_C]`
- Last login: `UNKNOWN`
- Status: `OFFLINE` 
- Corrupted logs and partial file recovery
- No explicit branding or "hire me" messaging

---

## 🏗️ Technical Architecture

### **Stack**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom retro aesthetics
- **AI Integration**: Google Gemini with tool calling
- **Audio**: Custom FX system with overlapping sound support
- **State Management**: React hooks with custom stores


#### **🤖 AI Chat Integration**
- Tool calling for calculations, time, and wallpaper search
- Context-aware responses that maintain the "found computer" narrative
- Integration with Unsplash API for dynamic wallpapers

#### **🎨 Theme System**
- Dynamic wallpaper changing
- Light/dark mode support
- CLI-generated color themes
- Retro CRT monitor effects

#### **📁 File System Simulation**
- Virtual filesystem with navigation
- Hidden files and easter eggs
- Command execution with realistic output
- File corruption simulation

---

## 🚀 Getting Started

### **Prerequisites**
```bash
Node.js 18+ 
npm or yarn
```

### **Installation**
```bash
git clone [repository-url]
cd portfolio
npm install
```

### **Environment Setup**
```bash
# Create .env.local
GOOGLE_API_KEY=your_gemini_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

### **Development**
```bash
npm run dev
# Visit http://localhost:3000
# Watch the boot sequence, then explore!
```

### **Production Build**
```bash
npm run build
npm start
```

---

## 🎮 Customization

### **Boot Sequence Speed**
```typescript
// In app/components/BootScreen.tsx
const boot_complete_time = 2000; // Milliseconds
```

### **Boot Messages**
```typescript
const bootLines = [
  ":: FoundShell v0.3 ::",
  ":: Initializing...",
  "✓ User profile detected: [YOUR_NAME]",
  // Customize the narrative...
];
```

### **Sound Effects**
Add your own sounds to `public/fx/`:
- `type.mp3` - Typewriter keystroke
- `click.wav` - Button clicks
- `hover.mp3` - UI hover sounds
- `close.mp3` - Window closing

### **Desktop Apps**
```typescript
// In app/lib/apps.ts
const apps: App[] = [
  {
    id: 'your-app',
    name: 'Your App',
    component: YourComponent,
    icon: YourIcon,
  },
];
```

---

## 🎯 Design Philosophy

### **Narrative Over Navigation**
Instead of traditional portfolio structure, everything serves the story:
- No obvious "About" or "Contact" sections
- Information discovered through exploration
- Interactions feel like using someone else's computer

### **Atmospheric Immersion**
- CRT monitor effects and scanlines
- Authentic terminal aesthetics  
- Glitch animations and audio feedback
- Realistic timing and system responses

### **Mystery and Discovery**
- Hidden files and easter eggs
- Corrupted data adds authenticity
- No explicit calls-to-action
- Let visitors piece together the story

---

## 📁 Project Structure

portfolio/
├── app/
│ ├── components/ # UI components
│ │ ├── BootScreen.tsx # Boot sequence
│ │ ├── Desktop.tsx # Main OS interface
│ │ ├── Terminal.tsx # Command line
│ │ ├── Chat.tsx # AI conversation
│ │ └── Window.tsx # Draggable windows
│ ├── lib/ # Core systems
│ │ ├── fx.ts # Audio management
│ │ ├── apps.ts # Application registry
│ │ ├── commands.ts # Terminal commands
│ │ └── filesystem.ts # Virtual file system
│ ├── api/ # Backend endpoints
│ └── globals.css # Retro styling
├── public/
│ └── fx/ # Sound effects
└── README.md


---

## 🎨 Aesthetic Choices

### **Visual Design**
- **Phosphor green on black** - Classic terminal aesthetic
- **Pixel-perfect fonts** - Chicago and Geneva typefaces
- **CRT effects** - Scanlines, curvature, and glow
- **Monospace layouts** - Everything feels like code

### **Interaction Design**
- **Tactile feedback** - Every action has sound and visual response
- **Realistic timing** - No instant transitions, everything loads
- **Organic randomness** - Typing speeds vary, glitches happen
- **Discoverable depth** - Reward exploration and experimentation

---

## 🔮 Future Enhancements

- **Email simulation** with fictional correspondence
- **Browser within browser** for nested exploration
- **File system persistence** across sessions
- **Multiple user profiles** with different narratives
- **Time-based events** (system logs, scheduled tasks)
- **Network simulation** (ping commands, connection status)

---

## 🤝 Contributing

This project explores the intersection of web development and interactive storytelling. Contributions that enhance the narrative, improve the technical implementation, or add new layers of discovery are welcome.

### **Ideas for contributions:**
- New terminal commands
- Additional sound effects
- Enhanced glitch animations  
- Hidden file content
- UI polish and accessibility
- Performance optimizations

---

## 📄 License

MIT License - Feel free to fork and create your own "found computer" narrative.

---

## 🎭 Credits

**Inspiration**: Old computer boot sequences, vintage terminal interfaces, and the feeling of discovering someone's abandoned digital workspace.

**Technical**: Built with modern web technologies but designed to feel like forgotten technology.

**Narrative**: Every technical decision serves the story of discovery and digital archaeology.

---

*Status: OFFLINE • Last login: UNKNOWN • System recovering...*

---

# Portfolio

A retro-inspired desktop environment built with Next.js, featuring a blog system with MDX support.

## Features

### Desktop Environment
- Retro desktop interface with draggable windows
- Pixelated design aesthetic
- Terminal emulator
- Settings panel
- File system simulation

### Blog System
- **Separate blog environment** outside the desktop interface
- **Markdown support** with custom React components
- **Beautiful typography** using cohesive font system
- **Responsive design** that works on all devices
- **Tag system** for organizing posts
- **Reading time calculation**
- **SEO optimization** with metadata
- **Dark/light mode support**

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to see the portfolio
4. Visit [http://localhost:3000/blog](http://localhost:3000/blog) to see the blog

## Blog System Usage

### Adding New Blog Posts

1. Create a new `.md` file in the `blogs/` directory
2. Add frontmatter with post metadata:

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
excerpt: "A brief description of your post"
tags: ["tag1", "tag2", "tag3"]
author: "Your Name"
coverImage: "/path/to/image.jpg" # optional
---

# Your Post Content

Write your blog post content here using markdown.

You can also use custom React components:

<Alert type="info">
This is an info alert component!
</Alert>
```

### Available Custom Components

The blog supports several custom components that you can use in your markdown:

#### Alert Component
```markdown
<Alert type="info">Info message</Alert>
<Alert type="warning">Warning message</Alert>
<Alert type="error">Error message</Alert>
<Alert type="success">Success message</Alert>
```

#### Typography
- Headers (`#`, `##`, `###`) use the Chicago Plain font for cohesiveness
- Body text uses Geist Sans for readability
- Code blocks have syntax highlighting
- Tables are automatically styled

#### Features
- **Responsive images** with automatic optimization
- **Code syntax highlighting** for multiple languages
- **Responsive tables** with horizontal scrolling
- **Accessible design** with proper contrast and focus states

### Blog Structure

```
blogs/
├── welcome-to-my-blog.md
├── building-with-nextjs-and-mdx.md
├── design-principles-for-developers.md
└── your-new-post.md
```

### Frontmatter Options

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title |
| `date` | Yes | Publication date (YYYY-MM-DD) |
| `excerpt` | Yes | Brief description for listing page |
| `tags` | No | Array of tags for categorization |
| `author` | No | Author name |
| `coverImage` | No | URL to cover image |

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Gray Matter** - Frontmatter parsing
- **Reading Time** - Automatic reading time calculation

## Design Philosophy

The blog maintains design cohesiveness with the portfolio while being optimized for reading:

- **Headers**: Chicago Plain font (matches desktop aesthetic)
- **Body**: Geist Sans (optimized for readability)
- **Code**: Monospace fonts with proper syntax highlighting
- **Colors**: Consistent with the portfolio's design system
- **Responsive**: Mobile-first approach with touch-friendly interactions

## Development

The blog system is designed to be:
- **Performance-focused**: Static generation at build time
- **SEO-optimized**: Proper metadata and semantic HTML
- **Accessible**: WCAG-compliant contrast and keyboard navigation
- **Maintainable**: Clean separation of content and presentation

## Deployment

The blog system works with any Next.js deployment platform:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker containers

Static generation ensures fast loading times and excellent SEO performance.

---

Built with ❤️ and lots of ☕
