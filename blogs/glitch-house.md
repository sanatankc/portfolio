---
title: "Glitch.house: Building an AI-Powered Platform for DIY Hardware Projects"
date: "2024-01-20"
excerpt: "Glitch.house started with a simple but ambitious idea: **make it easy for anyone to discover, build, and enjoy DIY hardware projects**"
# tags: ["nextjs", "mdx", "react", "typescript", "tutorial"]
# author: "Your Name"
# coverImage: ""
---

<!-- # Glitch.house: Building an AI-Powered Platform for DIY Hardware Projects -->

<!-- ## Introduction, Problem, and Context -->

Glitch.house started with a simple but ambitious idea: **make it easy for anyone to discover, build, and enjoy DIY hardware projects**. There’s a ton of amazing content scattered across the internet—Instructables, Hackster, Adafruit, random blogs, YouTube—but it’s fragmented, inconsistent, and often hard to trust. We wanted to create a cohesive platform where:

- Anyone (even a total beginner) could find projects they’d love to build.
- Every project would have a trustworthy, complete list of components (from Raspberry Pi to obscure sensors).
- All the code, files, and instructions would be in one place.
- You could actually buy the parts you need, right from the project page.

Our big bet was that **LLMs (Large Language Models)** could help us wrangle all this messy, open-source content into something structured and useful. But when we started, we had no idea how far we could push LLMs, or what would actually work at scale. Over time, through a lot of trial and error, we figured out how to prompt, preprocess, and stack LLMs to get surprisingly good results.

We did all this with a tiny team: three frontend interns, me on backend and AI, and the founder (who did most of the prompting and product work). It was a crash course in building fast, iterating, and keeping everything working with minimal resources.

---

## Scraping and Preprocessing Phase

The first step was **scraping 100,000+ projects** from all over the web. This was a huge mess:

- We had to filter and clean up all the links.
- Download and organize every file and image.
- Handle weird edge cases (like zip files, GitHub repos, and third-party links).
- Categorize everything: tutorials, e-commerce, YouTube videos, etc.
- Even transcribe YouTube videos for extra data.

Some sites (like Thinkable) were a nightmare to scrape, but we powered through. It was a ton of work, but also kind of fun—like digital archaeology.

---

## Goose Library, Pipeline Dashboard, and CLI

To keep ourselves sane, I built some internal tooling:

- **Goose Library:** Our core set of scripts and utilities for scraping, processing, and managing data. The idea came from breaking down the workflow into repeatable steps.
- **Workflow Dashboard:** A JSON-table-based dashboard to track progress, spot errors, and iterate quickly.

These tools made it possible to experiment fast and keep the pipeline moving.

---

## Processing Images

Images were critical for everything from thumbnails to generating build guides. We processed images at multiple levels:

- Cheap models for quick tasks.
- More expensive models for detailed analysis (like checking visual appeal).

This let us balance speed and quality, and made sure we didn’t miss important visual info.

---

## Filtering Projects

With 100K+ projects, we needed to **filter ruthlessly**:

- Remove anything without code (since code = more interesting/complete).
- Separate builds from tutorials.
- Filter out non-English projects.
- Check if all critical files were present.
- Score projects for quality, breaking it down into attributes like novelty, utility, documentation depth, entertainment, and visual appeal.

We manually reviewed about 100 projects, iterated on our prompts and scoring, and eventually got down to about 5,000 high-quality, reproducible builds.

> This process taught me that even subjective things like “project quality” can be broken down into smaller, more objective pieces—just like how people actually judge things.

---

## Other Metadata Extraction

We also extracted tons of metadata:

- **Skill level** (so beginners don’t get overwhelmed).
- **30+ tags** per project (for better search and recommendations).
- Project overviews, catchy titles, “why you’ll love this” blurbs, etc.

Tags turned out to be super important for both discovery and recommendations.

---

## Extracting Components

Getting a complete, accurate list of components was surprisingly hard. We learned to:

- Use chunking to avoid missing components in long, messy text.
- Stack multiple LLM passes to extract, verify, and deduplicate components.

This was key for making sure people could actually build the projects.

---

## Build Guide: The Final Beast

Generating high-quality build guides was the hardest part:

- We had to handle long, complex guides without losing the author’s style or the fun vibe.
- Make sure all images and assets were included and linked in the right steps.
- Design multi-layered AI pipelines to generate, check, and refine each step.

This was a huge technical and creative challenge, but also the most rewarding part.

---

## Recommender System

Finally, we used all the AI-generated tags and metadata to build a **recommender system**. This matches users with projects they’ll actually enjoy, based on their interests and onboarding choices.

---

## Closing

Glitch.house is still a work in progress, but building it taught me a ton about LLMs, data wrangling, and product design. Most of all, it showed me that with the right tools and a lot of iteration, you can turn a chaotic mess of open-source content into something genuinely useful and fun.

---

**Next Steps:**  
- Expand each section with more details, stories, and technical specifics.  
- Add diagrams (Excalidraw), screenshots, and assets.  
- Clean up the writing and structure for clarity.

---

Let me know if you want to focus on any section in more detail, or need help with specific wording, diagrams, or technical explanations!