interface ShareData {
  title: string;
  text: string;
  url: string;
}

interface ShareRecord {
  count: number;
  firstShareTime: number;
  lastShareTime: number;
}

class ShareService {
  private static STORAGE_KEY = 'mosaic_share_records';
  private static MAX_SHARES_PER_PERIOD = 3;
  private static RATE_LIMIT_PERIOD = 30 * 60 * 1000; // 30 minutes in milliseconds
  private static NATIVE_SHARE_TIMEOUT = 3000; // 3 seconds to wait for native share

  // Get share records from localStorage
  private static getShareRecords(): Record<string, ShareRecord> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Save share records to localStorage
  private static saveShareRecords(records: Record<string, ShareRecord>): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.warn('Failed to save share records:', error);
    }
  }

  // Check if sharing is rate limited for a specific item
  private static isRateLimited(itemId: string): { limited: boolean; timeLeft?: number } {
    const records = this.getShareRecords();
    const record = records[itemId];

    if (!record) {
      return { limited: false };
    }

    const now = Date.now();
    const timeSinceFirst = now - record.firstShareTime;

    // If it's been more than 30 minutes since first share, reset the record
    if (timeSinceFirst > this.RATE_LIMIT_PERIOD) {
      delete records[itemId];
      this.saveShareRecords(records);
      return { limited: false };
    }

    // If user has shared 3 times within the period, they're rate limited
    if (record.count >= this.MAX_SHARES_PER_PERIOD) {
      const timeLeft = this.RATE_LIMIT_PERIOD - timeSinceFirst;
      return { limited: true, timeLeft };
    }

    return { limited: false };
  }

  // Record a successful share
  private static recordShare(itemId: string): void {
    const records = this.getShareRecords();
    const now = Date.now();

    if (records[itemId]) {
      // Update existing record
      records[itemId].count += 1;
      records[itemId].lastShareTime = now;
    } else {
      // Create new record
      records[itemId] = {
        count: 1,
        firstShareTime: now,
        lastShareTime: now
      };
    }

    this.saveShareRecords(records);
  }

  // Try native share with proper timeout
  private static async tryNativeShare(shareData: ShareData): Promise<{ success: boolean; userCancelled: boolean }> {
    if (!navigator.share) {
      return { success: false, userCancelled: false };
    }

    // Check if the data can be shared
    if (navigator.canShare && !navigator.canShare(shareData)) {
      return { success: false, userCancelled: false };
    }

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Native share timeout')), this.NATIVE_SHARE_TIMEOUT);
      });

      // Race between native share and timeout
      await Promise.race([
        navigator.share(shareData),
        timeoutPromise
      ]);

      return { success: true, userCancelled: false };
    } catch (error: unknown) {
      // Safely narrow unknown to check for AbortError
      if ((error instanceof DOMException && error.name === 'AbortError') || (error instanceof Error && error.name === 'AbortError')) {
        // User cancelled the share
        return { success: false, userCancelled: true };
      }
      // Native share failed or timed out
      return { success: false, userCancelled: false };
    }
  }

  // Update share count on backend
  private static async updateBackendShareCount(
    itemId: string, 
    contentType: 'video' | 'short'
  ): Promise<number | null> {
    try {
      const endpoint = contentType === 'short' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${itemId}/share`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${itemId}/share`;

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update share count');
      }

      const data = await response.json();
      return data.shareCount;
    } catch (error) {
      console.error('Error updating share count:', error);
      return null;
    }
  }

  // Format time remaining for user display
  private static formatTimeRemaining(milliseconds: number): string {
    const minutes = Math.ceil(milliseconds / (60 * 1000));
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  }

  // Main share function
  public static async share(
    itemId: string,
    title: string,
    contentType: 'video' | 'short' = 'video',
    customUrl?: string
  ): Promise<{
    success: boolean;
    showFallback: boolean;
    shareCount?: number;
    rateLimited?: boolean;
    timeLeft?: string;
    userCancelled?: boolean;
  }> {
    // Check rate limiting first
    const { limited, timeLeft } = this.isRateLimited(itemId);
    
    if (limited && timeLeft) {
      return {
        success: false,
        showFallback: false,
        rateLimited: true,
        timeLeft: this.formatTimeRemaining(timeLeft)
      };
    }

    const shareData: ShareData = {
      title,
      text: `Check out this ${contentType}: ${title}`,
      url: customUrl || window.location.href
    };

    // Try native share first
    const nativeResult = await this.tryNativeShare(shareData);

    if (nativeResult.success) {
      // Native share succeeded
      this.recordShare(itemId);
      const shareCount = await this.updateBackendShareCount(itemId, contentType);
      
      return {
        success: true,
        showFallback: false,
        shareCount: shareCount || undefined
      };
    }

    if (nativeResult.userCancelled) {
      // User cancelled native share, don't show fallback
      return {
        success: false,
        showFallback: false,
        userCancelled: true
      };
    }

    // Native share failed or timed out, show fallback modal
    return {
      success: false,
      showFallback: true
    };
  }

  // Record a successful manual share (from fallback modal)
  public static async recordManualShare(
    itemId: string,
    contentType: 'video' | 'short'
  ): Promise<number | null> {
    // Check rate limiting
    const { limited } = this.isRateLimited(itemId);
    
    if (limited) {
      return null; // Don't allow if rate limited
    }

    this.recordShare(itemId);
    return await this.updateBackendShareCount(itemId, contentType);
  }

  // Check if an item is rate limited (for UI feedback)
  public static checkRateLimit(itemId: string): { limited: boolean; timeLeft?: string } {
    const { limited, timeLeft } = this.isRateLimited(itemId);
    
    return {
      limited,
      timeLeft: timeLeft ? this.formatTimeRemaining(timeLeft) : undefined
    };
  }

  // Clear rate limit for an item (for admin/testing purposes)
  public static clearRateLimit(itemId: string): void {
    const records = this.getShareRecords();
    delete records[itemId];
    this.saveShareRecords(records);
  }
}

export default ShareService;