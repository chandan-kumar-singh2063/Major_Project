export const imageCache = new Map<string, string>();

export function preloadOptimizedImage(
  src: string,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.7
): void {
  const cacheKey = `${src}_${maxWidth}_${maxHeight}_${quality}`;

  if (imageCache.has(cacheKey)) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxWidth;
          height = Math.round(maxWidth / aspectRatio);
        } else {
          height = maxHeight;
          width = Math.round(maxHeight * aspectRatio);
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      imageCache.set(cacheKey, dataUrl);
    } catch (err) {
      console.warn('Preload optimization failed:', src, err);
    }
  };
  img.src = src;
}

export function clearImageCache(): void {
  imageCache.clear();
}
