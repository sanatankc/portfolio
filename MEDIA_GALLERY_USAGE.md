# MediaGallery Video Types

The MediaGallery component now supports multiple video types to give you more control over how videos are displayed and played.

## Video Types

### 1. Autoplay Video (Default)
```jsx
<MediaGallery 
  columns={1} 
  width="content"
  items={[
    {
      src: "/blog/videos/example.mp4",
      type: "video"  // Autoplays, loops, muted
    }
  ]} 
/>
```
- **Behavior**: Autoplays, loops continuously, muted
- **Use case**: Background videos, demonstrations, ambient content

### 2. Non-Autoplay Video (New)
```jsx
<MediaGallery 
  columns={1} 
  width="content"
  items={[
    {
      src: "/blog/videos/example.mp4",
      type: "video-no-autoplay",  // Shows controls, no autoplay
      alt: "Example video with controls"
    }
  ]} 
/>
```
- **Behavior**: Shows video controls, doesn't autoplay, user must click to play
- **Use case**: Tutorial videos, longer content, videos with audio

### 3. YouTube Embed (New)
```jsx
<MediaGallery 
  columns={1} 
  width="content"
  items={[
    {
      src: "",  // Not used for YouTube
      type: "youtube",
      youtubeId: "dQw4w9WgXcQ",  // YouTube video ID from URL
      alt: "Example YouTube video"
    }
  ]} 
/>
```
- **Behavior**: Embeds YouTube video with controls
- **Use case**: External videos, YouTube tutorials, shared content
- **Note**: Extract the video ID from YouTube URLs (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ` → `dQw4w9WgXcQ`)

## Getting YouTube Video ID

To get a YouTube video ID from a URL:
- Full URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Video ID: `dQw4w9WgXcQ`

## Modal Behavior

When you click on any video in the gallery:
- **Autoplay videos**: Continue to autoplay in the modal
- **Non-autoplay videos**: Show controls in the modal
- **YouTube videos**: Open in embedded player with autoplay enabled

## Examples

### Mixed Content Gallery
```jsx
<MediaGallery 
  columns={2} 
  width="wide"
  items={[
    {
      src: "/blog/images/screenshot.png",
      type: "image",
      alt: "Screenshot"
    },
    {
      src: "/blog/videos/demo.mp4",
      type: "video",  // Autoplay
      alt: "Demo video"
    },
    {
      src: "/blog/videos/tutorial.mp4",
      type: "video-no-autoplay",  // With controls
      alt: "Tutorial video"
    },
    {
      src: "",
      type: "youtube",
      youtubeId: "abc123",
      alt: "YouTube tutorial"
    }
  ]} 
/>
``` 