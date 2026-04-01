import imageCompression from 'browser-image-compression';

// ==========================================
// STORAGE OPTIMIZATION CONFIGURATION
// ==========================================

const STORAGE_CONFIG = {
  // Maximum file sizes
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxPdfSize: 10 * 1024 * 1024, // 10MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  
  // Compression settings
  imageCompression: {
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    maxIteration: 10,
  },
  
  // Cache control headers
  cacheControl: {
    images: 'public, max-age=31536000, immutable', // 1 year
    documents: 'public, max-age=86400', // 1 day
    static: 'public, max-age=31536000, immutable', // 1 year
  },
};

// ==========================================
// FILE COMPRESSION UTILITIES
// ==========================================

/**
 * OPTIMIZATION: Compress images before upload to reduce storage and egress
 * @param {File} file - Original image file
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file) => {
  // Skip compression for small images
  if (file.size < 500 * 1024) return file; // < 500KB
  
  // Skip if not an image
  if (!file.type.startsWith('image/')) return file;
  
  try {
    const options = {
      maxSizeMB: 1, // Target 1MB max
      maxWidthOrHeight: STORAGE_CONFIG.imageCompression.maxWidthOrHeight,
      useWebWorker: STORAGE_CONFIG.imageCompression.useWebWorker,
      maxIteration: STORAGE_CONFIG.imageCompression.maxIteration,
      fileType: file.type,
    };
    
    const compressedFile = await imageCompression(file, options);
    console.log(`[Storage Opt] Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);
    return compressedFile;
  } catch (error) {
    console.error('[Storage Opt] Image compression failed, using original:', error);
    return file;
  }
};

/**
 * OPTIMIZATION: Get optimal content type for cache headers
 */
export const getCacheControlHeader = (fileType) => {
  if (fileType.startsWith('image/')) return STORAGE_CONFIG.cacheControl.images;
  if (fileType.includes('pdf')) return STORAGE_CONFIG.cacheControl.documents;
  return STORAGE_CONFIG.cacheControl.static;
};

// ==========================================
// FILE VALIDATION UTILITIES
// ==========================================

/**
 * OPTIMIZATION: Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export const validateFileForUpload = (file) => {
  const errors = [];
  
  // Check file exists
  if (!file || file.size === 0) {
    return { valid: false, errors: ['File is empty or does not exist'] };
  }
  
  // Check by type
  if (file.type.startsWith('image/')) {
    if (file.size > STORAGE_CONFIG.maxImageSize) {
      errors.push(`Image too large. Max size: ${(STORAGE_CONFIG.maxImageSize / 1024 / 1024).toFixed(0)}MB`);
    }
  } else if (file.type.includes('pdf')) {
    if (file.size > STORAGE_CONFIG.maxPdfSize) {
      errors.push(`PDF too large. Max size: ${(STORAGE_CONFIG.maxPdfSize / 1024 / 1024).toFixed(0)}MB`);
    }
  } else if (file.type.startsWith('video/')) {
    if (file.size > STORAGE_CONFIG.maxVideoSize) {
      errors.push(`Video too large. Max size: ${(STORAGE_CONFIG.maxVideoSize / 1024 / 1024).toFixed(0)}MB`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    shouldCompress: file.type.startsWith('image/') && file.size > 500 * 1024,
  };
};

// ==========================================
// BROWSER STORAGE CACHE (REDUCE RE-DOWNLOADS)
// ==========================================

const STORAGE_CACHE_PREFIX = 'edusure_file_cache_';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * OPTIMIZATION: Cache file URLs in browser storage to reduce egress
 * @param {string} filePath - Storage file path
 * @param {string} url - Public URL
 */
export const cacheFileUrl = (filePath, url) => {
  try {
    const cacheData = {
      url,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${STORAGE_CACHE_PREFIX}${filePath}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('[Storage Opt] Failed to cache URL:', error);
  }
};

/**
 * OPTIMIZATION: Get cached file URL if still valid
 * @param {string} filePath - Storage file path
 * @returns {string|null} - Cached URL or null
 */
export const getCachedFileUrl = (filePath) => {
  try {
    const cached = localStorage.getItem(`${STORAGE_CACHE_PREFIX}${filePath}`);
    if (!cached) return null;
    
    const { url, timestamp } = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_MAX_AGE) {
      localStorage.removeItem(`${STORAGE_CACHE_PREFIX}${filePath}`);
      return null;
    }
    
    return url;
  } catch (error) {
    return null;
  }
};

/**
 * OPTIMIZATION: Clear expired cache entries
 */
export const clearExpiredCache = () => {
  try {
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_CACHE_PREFIX)) {
        try {
          const { timestamp } = JSON.parse(localStorage.getItem(key));
          if (now - timestamp > CACHE_MAX_AGE) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn('[Storage Opt] Failed to clear cache:', error);
  }
};

// ==========================================
// LAZY LOADING UTILITIES
// ==========================================

/**
 * OPTIMIZATION: Intersection Observer for lazy loading images
 * @param {HTMLElement} element - Element to observe
 * @param {Function} callback - Callback when element enters viewport
 * @returns {IntersectionObserver} - Observer instance
 */
export const createLazyLoader = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px', // Start loading 50px before viewport
    threshold: 0.01,
    ...options,
  };
  
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, defaultOptions);
};

// ==========================================
// FILE UPLOAD OPTIMIZATION
// ==========================================

/**
 * OPTIMIZATION: Prepare file for upload with compression
 * @param {File} file - Original file
 * @returns {Promise<{file: File, meta: Object}>}
 */
export const prepareFileForUpload = async (file) => {
  const validation = validateFileForUpload(file);
  
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  let processedFile = file;
  
  // Compress images
  if (validation.shouldCompress) {
    processedFile = await compressImage(file);
  }
  
  return {
    file: processedFile,
    meta: {
      originalSize: file.size,
      compressedSize: processedFile.size,
      compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(1),
      contentType: processedFile.type,
      cacheControl: getCacheControlHeader(processedFile.type),
    },
  };
};

// ==========================================
// BATCH OPERATIONS (REDUCE API CALLS)
// ==========================================

/**
 * OPTIMIZATION: Batch multiple file uploads
 * @param {Array<{file: File, metadata: Object}>} files - Files to upload
 * @param {Function} uploadFn - Upload function
 * @returns {Promise<Array>} - Upload results
 */
export const batchUploadFiles = async (files, uploadFn, options = {}) => {
  const { batchSize = 3, onProgress } = options;
  const results = [];
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async ({ file, metadata }) => {
        try {
          const result = await uploadFn(file, metadata);
          return { success: true, result, file: file.name };
        } catch (error) {
          return { success: false, error: error.message, file: file.name };
        }
      })
    );
    
    results.push(...batchResults);
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, files.length), files.length);
    }
  }
  
  return results;
};

// ==========================================
// PREFETCHING UTILITIES
// ==========================================

const prefetchCache = new Set();

/**
 * OPTIMIZATION: Prefetch file URL (but don't download content yet)
 * @param {string} filePath - Storage path
 * @param {Function} getUrlFn - Function to get URL
 */
export const prefetchFileUrl = async (filePath, getUrlFn) => {
  if (prefetchCache.has(filePath)) return;
  
  // Check browser cache first
  const cached = getCachedFileUrl(filePath);
  if (cached) {
    prefetchCache.add(filePath);
    return;
  }
  
  // Schedule prefetch when browser is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(async () => {
      try {
        const url = await getUrlFn(filePath);
        cacheFileUrl(filePath, url);
        prefetchCache.add(filePath);
      } catch (error) {
        console.warn('[Storage Opt] Prefetch failed:', error);
      }
    });
  }
};

// ==========================================
// SERVICE WORKER CACHE INTEGRATION (Optional)
// ==========================================

/**
 * OPTIMIZATION: Check if service worker caching is available
 */
export const isServiceWorkerCacheAvailable = () => {
  return 'caches' in window && 'serviceWorker' in navigator;
};

/**
 * OPTIMIZATION: Cache file in service worker cache
 * @param {string} url - File URL
 * @param {Blob} blob - File blob
 */
export const cacheInServiceWorker = async (url, blob) => {
  if (!isServiceWorkerCacheAvailable()) return;
  
  try {
    const cache = await caches.open('edusure-files-v1');
    const response = new Response(blob, {
      headers: {
        'Content-Type': blob.type,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
    await cache.put(url, response);
  } catch (error) {
    console.warn('[Storage Opt] Service worker cache failed:', error);
  }
};

/**
 * OPTIMIZATION: Get file from service worker cache
 * @param {string} url - File URL
 * @returns {Promise<Response|null>}
 */
export const getFromServiceWorkerCache = async (url) => {
  if (!isServiceWorkerCacheAvailable()) return null;
  
  try {
    const cache = await caches.open('edusure-files-v1');
    const response = await cache.match(url);
    return response;
  } catch (error) {
    return null;
  }
};
