# Image Pre-loading Implementation Plan

## Problem Statement

Currently, the Hotlympics rating system fetches only 2 images at a time from the server. When a user rates a pair, the application must:
1. Submit the rating
2. Request 2 new images from the server
3. Wait for the signed URLs to be generated
4. Download the images from Firebase CDN
5. Display them to the user

This creates noticeable latency between ratings, disrupting the user experience.

## Solution Overview

Implement a dual-block image queue system that pre-loads images in the background, maintaining 20 images in memory (2 blocks of 10 images each) to provide seamless transitions between image pairs.

## Architecture Design

### Queue Structure
```
┌─────────────────────────────────────────┐
│           Image Queue Manager            │
├─────────────────────────────────────────┤
│  Active Block (10 images)                │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐                 │
│  │0│1│2│3│4│5│6│7│8│9│ <- Current pair  │
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘    (index 0-1)   │
│                                          │
│  Buffer Block (10 images)                │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐                 │
│  │0│1│2│3│4│5│6│7│8│9│ <- Pre-loaded    │
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘                  │
└─────────────────────────────────────────┘
```

### Data Flow

1. **Initial Load**
   - Fetch 2 blocks (20 images) from `/images/block?count=10`
   - Pre-load all images using browser's Image API
   - Display first pair (indices 0-1)

2. **User Rates Images**
   - Submit rating to server
   - Move to next pair in active block (indices 2-3, 4-5, etc.)
   - No network request needed - images already loaded

3. **Background Fetching**
   - When reaching index 6 (showing pair 6-7)
   - Fetch new block of 10 images in background
   - Pre-load new block while user continues rating

4. **Block Rotation**
   - When active block exhausted (after showing 8-9)
   - Swap buffer block to become active block
   - Previous active block gets replaced with newly fetched block

## Implementation Plan

### Phase 1: Create Core Services

#### 1.1 Image Pre-loader Utility
**File:** `src/utils/image-preloader.ts`
```typescript
interface PreloadResult {
    url: string;
    success: boolean;
    image?: HTMLImageElement;
    error?: Error;
}

// Pre-load single image
export const preloadImage = (url: string): Promise<PreloadResult>

// Pre-load multiple images with progress tracking
export const preloadImages = (urls: string[]): Promise<PreloadResult[]>
```

#### 1.2 Image Queue Manager Service
**File:** `src/services/core/image-queue-service.ts`
```typescript
class ImageQueueManager {
    private activeBlock: ImageData[] = [];
    private bufferBlock: ImageData[] = [];
    private currentIndex: number = 0;
    private preloadedImages: Map<string, HTMLImageElement> = new Map();
    
    // Initialize with 2 blocks
    async initialize(gender: "male" | "female"): Promise<void>
    
    // Get next pair from queue
    getNextPair(): ImageData[] | null
    
    // Check if we need to fetch more
    private shouldFetchNewBlock(): boolean
    
    // Fetch and pre-load new block
    private async fetchAndPreloadBlock(): Promise<void>
    
    // Rotate blocks when active is exhausted
    private rotateBlocks(): void
}
```

### Phase 2: Update Existing Services

#### 2.1 Modify Image Service
**File:** `src/services/core/image-service.ts`
```typescript
// Add new function
const fetchImageBlock = async (
    gender: "male" | "female",
    count: number = 10
): Promise<ImageData[] | null>

// Keep fetchImagePair for backward compatibility
// but internally use fetchImageBlock with count=2
```

### Phase 3: Create Enhanced Hook

#### 3.1 New Rating Hook with Queue
**File:** `src/hooks/rating/use-rating-queue.ts`
```typescript
export const useRatingQueue = () => {
    const [imagePair, setImagePair] = useState<ImageData[] | null>(null);
    const [loadingImages, setLoadingImages] = useState(true);
    const [preloadingStatus, setPreloadingStatus] = useState({
        isPreloading: false,
        progress: 0,
        total: 0
    });
    
    // Initialize queue manager
    // Get next pair from queue
    // Handle rating submission
    // Monitor pre-loading status
    
    return {
        imagePair,
        loadingImages,
        preloadingStatus,
        handleImageClick,
        isSeamless: true // Indicates pre-loading is active
    };
};
```

### Phase 4: Update Components

#### 4.1 Update Rating Arena
**File:** `src/components/rating/rating-arena.tsx`
- Replace `useRating` with `useRatingQueue`
- Add optional pre-loading status indicator
- Remove loading state between pairs (seamless transitions)

#### 4.2 Optional: Pre-loading Status Component
**File:** `src/components/rating/preload-status.tsx`
```typescript
// Small indicator showing background loading
// Only visible during actual pre-loading
// Shows: "Pre-loading next batch... 7/10"
```

## Technical Specifications

### Pre-loading Strategy
```javascript
// Browser Image API usage
const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ url, success: true, image: img });
        img.onerror = (error) => resolve({ url, success: false, error });
        img.src = url;
    });
};
```

### Queue Management Logic
```
Current Index | Action
-------------|------------------
0-1          | Show pair, no action
2-3          | Show pair, no action
4-5          | Show pair, no action
6-7          | Show pair, trigger background fetch
8-9          | Show pair, ensure buffer ready
10 (wrap)    | Rotate blocks, reset index to 0
```

### Memory Management
- Maximum 20 images in memory at any time
- Each pre-loaded image stored as HTMLImageElement
- Clear old images when rotating blocks
- Use WeakMap for automatic garbage collection if needed

### Error Handling
1. **Network Failures**
   - Retry failed image pre-loads (max 3 attempts)
   - Fall back to on-demand loading if pre-loading fails
   - Continue with successfully loaded images

2. **Insufficient Images**
   - Handle case where server returns < 10 images
   - Adjust queue size dynamically
   - Maintain functionality with degraded performance

3. **Memory Constraints**
   - Monitor memory usage
   - Implement cleanup for old images
   - Provide fallback for low-memory devices

## Testing Plan

### Unit Tests
1. Image pre-loader utility
   - Test successful pre-loading
   - Test error handling
   - Test batch operations

2. Queue Manager
   - Test initialization
   - Test pair retrieval
   - Test block rotation
   - Test background fetching triggers

### Integration Tests
1. Full flow from initialization to block rotation
2. Error recovery scenarios
3. Performance benchmarks

### Manual Testing
1. Network throttling tests
2. Rapid rating to test queue exhaustion
3. Memory usage monitoring
4. Cross-browser compatibility

## Success Metrics

1. **Latency Reduction**
   - Target: < 50ms between image pairs (from current ~500-1000ms)
   - Measure: Time from rating click to next pair display

2. **User Experience**
   - Seamless transitions (no loading indicators between pairs)
   - Smooth image display without flicker
   - Consistent performance across sessions

3. **Technical Performance**
   - Memory usage < 50MB for image cache
   - Network efficiency (batch fetching)
   - CPU usage minimal during pre-loading

## Implementation Timeline

1. **Day 1: Core Services** (4 hours)
   - Image pre-loader utility
   - Queue manager service
   - Unit tests

2. **Day 2: Integration** (3 hours)
   - Update image service
   - Create new hook
   - Update components

3. **Day 3: Testing & Optimization** (3 hours)
   - Performance testing
   - Error scenario testing
   - Memory optimization

## Rollback Plan

If issues arise:
1. Keep original `useRating` hook intact
2. Use feature flag to toggle between old and new implementation
3. Monitor error rates and performance metrics
4. Quick revert capability via single hook swap

## Future Enhancements

1. **Adaptive Pre-loading**
   - Adjust block size based on user rating speed
   - Predictive fetching based on rating patterns

2. **Smart Caching**
   - IndexedDB for persistent cache
   - Service Worker for offline capability

3. **Performance Optimizations**
   - WebP format support with fallback
   - Progressive image loading
   - Lazy loading for non-critical images

## Conclusion

This implementation will transform the user experience from noticeable delays between ratings to seamless, instant transitions. The dual-block queue system provides optimal balance between performance and resource usage, while the pre-loading strategy ensures images are ready before users need them.