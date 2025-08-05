'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import Image from 'next/image';

// Global context for managing all images in a blog post
interface GlobalImageContextType {
  allImages: MediaItem[];
  registerImages: (images: MediaItem[]) => void;
  openGlobalModal: (startIndex: number) => void;
}

const GlobalImageContext = createContext<GlobalImageContextType | null>(null);

export const GlobalImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allImages, setAllImages] = useState<MediaItem[]>([]);
  const [globalModalIndex, setGlobalModalIndex] = useState<number | null>(null);

  const registerImages = useCallback((images: MediaItem[]) => {
    setAllImages(prev => {
      const newImages = [...prev];
      let hasChanges = false;
      
      images.forEach(img => {
        if (!newImages.find(existing => existing.src === img.src)) {
          newImages.push(img);
          hasChanges = true;
        }
      });
      
      // Only return new array if there are actual changes
      return hasChanges ? newImages : prev;
    });
  }, []);

  const openGlobalModal = useCallback((startIndex: number) => {
    setGlobalModalIndex(startIndex);
  }, []);

  const closeGlobalModal = useCallback(() => {
    setGlobalModalIndex(null);
  }, []);

  const nextGlobalItem = useCallback(() => {
    if (globalModalIndex !== null) {
      setGlobalModalIndex((globalModalIndex + 1) % allImages.length);
    }
  }, [globalModalIndex, allImages.length]);

  const prevGlobalItem = useCallback(() => {
    if (globalModalIndex !== null) {
      setGlobalModalIndex(globalModalIndex === 0 ? allImages.length - 1 : globalModalIndex - 1);
    }
  }, [globalModalIndex, allImages.length]);

  const contextValue = useMemo(() => ({
    allImages,
    registerImages,
    openGlobalModal
  }), [allImages, registerImages, openGlobalModal]);

  return (
    <GlobalImageContext.Provider value={contextValue}>
      {children}
      {globalModalIndex !== null && (
        <MediaModal
          items={allImages}
          currentIndex={globalModalIndex}
          isOpen={true}
          onClose={closeGlobalModal}
          onNext={nextGlobalItem}
          onPrev={prevGlobalItem}
        />
      )}
    </GlobalImageContext.Provider>
  );
};

interface MediaItem {
  src: string;
  type: 'image' | 'video' | 'video-no-autoplay' | 'youtube';
  alt?: string;
  youtubeId?: string; // For YouTube embeds
}

interface MediaGalleryProps {
  items: MediaItem[];
  columns?: 1 | 2 | 3;
  width?: 'content' | 'wide' | 'full' | 'contain';
  className?: string;
  sizing?: 'fixed' | 'auto' | 'aspect-ratio';
  objectFit?: 'cover' | 'contain';
  aspectRatio?: string; // e.g., '16/9', '4/3', '1/1'
}

interface MediaModalProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const MediaModal: React.FC<MediaModalProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !items[currentIndex]) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/90 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 text-white hover:text-gray-300 transition-colors"
        aria-label="Close modal"
      >
        <i className="hn hn-times-solid text-2xl"></i>
      </button>

      {/* Previous button */}
      {items.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 text-white hover:text-gray-300 transition-colors"
          aria-label="Previous media"
        >
          <i className="hn hn-angle-left text-3xl"></i>
        </button>
      )}

      {/* Next button */}
      {items.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 text-white hover:text-gray-300 transition-colors"
          aria-label="Next media"
        >
          <i className="hn hn-angle-right text-3xl"></i>
        </button>
      )}

      {/* Media content */}
      <div className="max-w-7xl max-h-full flex flex-col items-center">
        {currentItem.type === 'image' ? (
          <img
            src={currentItem.src}
            alt={currentItem.alt || ''}
            className="max-w-full max-h-[90vh] object-contain"
          />
        ) : currentItem.type === 'youtube' && currentItem.youtubeId ? (
          <div className="flex items-center justify-center w-full">
            <iframe
              src={`https://www.youtube.com/embed/${currentItem.youtubeId}?autoplay=1&rel=0`}
              title={currentItem.alt || 'YouTube video'}
              className="aspect-video"
              style={{ maxWidth: '80vw', maxHeight: '80vh' }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            src={currentItem.src}
            controls
            autoPlay={currentItem.type === 'video'}
            muted
            loop={currentItem.type === 'video'}
            playsInline
            className="max-w-full max-h-[90vh] object-contain"
          />
        )}
        
        {/* Counter */}
        {items.length > 1 && (
          <div className="mt-4 text-center text-white">
            <p className="font-satoshi text-sm text-gray-300">
              {currentIndex + 1} of {items.length}
            </p>
          </div>
        )}
      </div>

      {/* Click overlay to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close modal"
      />
    </div>
  );
};

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  columns = 1,
  width = 'content',
  className = '',
  sizing = 'fixed',
  objectFit = 'cover',
  aspectRatio = '16/9',
}) => {
  const context = useContext(GlobalImageContext);
  
  useEffect(() => {
    if (context) {
      context.registerImages(items);
    }
  }, [items, context?.registerImages]); // Only depend on the registerImages function, not the entire context

  const openModal = (index: number) => {
    if (context) {
      // Find the global index of this item
      const globalIndex = context.allImages.findIndex(img => img.src === items[index].src);
      if (globalIndex !== -1) {
        context.openGlobalModal(globalIndex);
      }
    }
  };

  // Width-specific classes
  const widthClasses = {
    content: 'my-8', // Normal width within content
    wide: 'media-breakout-wide', // Break out significantly beyond container
    full: 'media-breakout-full', // Full viewport width breakout
    contain: 'my-8' // Contained width within content
  };

  const galleryClasses = [
    `grid gap-2`,
    columns === 1 ? 'grid-cols-1' : '',
    columns === 2 ? 'grid-cols-1 md:grid-cols-2' : '',
    columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : '',
    widthClasses[width],
    className
  ].filter(Boolean).join(' ');

  // Get container styling based on sizing mode
  const getImageContainerClass = () => {
    // If objectFit is 'contain' and sizing is 'fixed', automatically use 'auto' to prevent letterboxing
    const effectiveSizing = (objectFit === 'contain' && sizing === 'fixed') ? 'auto' : sizing;
    
    switch (effectiveSizing) {
      case 'auto':
        return 'relative'; // Let image determine its own height
      case 'aspect-ratio':
        return `relative w-full aspect-[${aspectRatio}]`;
      case 'fixed':
      default:
        // Original fixed height behavior
        if (width === 'full') {
          return 'relative w-full h-80 md:h-96 lg:h-[32rem]';
        }
        if (width === 'wide') {
          return 'relative w-full h-72 md:h-80 lg:h-96';
        }
        return 'relative w-full h-64 md:h-80';
    }
  };

  const containerClass = getImageContainerClass();
  const effectiveSizing = (objectFit === 'contain' && sizing === 'fixed') ? 'auto' : sizing;

  return (
    <div className={galleryClasses}>
      {items.map((item, index) => (
        <div
          key={index}
          className="cursor-pointer transition-all duration-300"
          onClick={() => openModal(index)}
        >
          {item.type === 'image' ? (
            <div className={containerClass}>
              {effectiveSizing === 'auto' ? (
                <img
                  src={item.src}
                  alt={item.alt || ''}
                  className={`w-full h-auto object-${objectFit}`}
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt || ''}
                  fill
                  className={`object-${objectFit}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>
          ) : item.type === 'youtube' && item.youtubeId ? (
            <div className={containerClass}>
              <div className="w-full h-full flex items-center justify-center">
                <iframe
                  src={`https://www.youtube.com/embed/${item.youtubeId}?rel=0`}
                  title={item.alt || 'YouTube video'}
                  className="aspect-video"
                  style={{ 
                    width: width === 'content' || width === 'contain' ? '70%' : width === 'wide' ? '90%' : '70%',
                    maxHeight: '100%'
                  }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className={containerClass}>
              <video
                src={item.src}
                autoPlay={item.type === 'video'}
                muted
                loop={item.type === 'video'}
                playsInline
                controls={item.type === 'video-no-autoplay'}
                className={`w-full ${effectiveSizing === 'auto' ? 'h-auto' : 'h-full'} object-${objectFit}`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MediaGallery; 