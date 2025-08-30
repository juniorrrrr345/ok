'use client';
import { useState } from 'react';

interface MediaDisplayProps {
  url: string;
  alt?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function MediaDisplay({ 
  url, 
  alt = '', 
  className = '', 
  controls = true,
  autoPlay = false,
  loop = false,
  muted = true
}: MediaDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!url) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Aucun média</span>
      </div>
    );
  }

  // Détecter si c'est une vidéo basé sur l'extension ou le type MIME
  const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv)(\?|$)/i.test(url) || 
                  url.includes('video/') ||
                  url.includes('/videos/');

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-red-500">Erreur de chargement</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {isVideo ? (
        <video
          src={url}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          onLoadedData={handleLoad}
          onError={handleError}
          preload="metadata"
        >
          <source src={url} />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      ) : (
        <img
          src={url}
          alt={alt}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}