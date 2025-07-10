interface ViewRecord {
  lastViewed: number;
}

class ViewTrackingService {
  private static STORAGE_KEY = 'mosaic_view_records';
  private static VIEW_RECORD_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get view records from localStorage
  private static getViewRecords(): Record<string, ViewRecord> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Save view records to localStorage
  private static saveViewRecords(records: Record<string, ViewRecord>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.warn('Failed to save view records:', error);
    }
  }

  // Check if a view has already been recorded for this item recently
  private static hasBeenViewedRecently(itemId: string): boolean {
    const records = this.getViewRecords();
    const record = records[itemId];

    if (!record) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastView = now - record.lastViewed;

    if (timeSinceLastView < this.VIEW_RECORD_EXPIRATION) {
      return true; // Viewed within the last 24 hours
    }

    // It's been over 24 hours, so this view can be counted again.
    // We don't need to delete the old record, just overwrite it upon a new view.
    return false;
  }

  // The main function to record a view if conditions are met
  public static async recordView(
    itemId: string,
    contentType: 'video' | 'short'
  ): Promise<{ viewRecorded: boolean; newViewCount?: number }> {
    if (this.hasBeenViewedRecently(itemId)) {
      return { viewRecorded: false };
    }

    try {
      const endpoint = contentType === 'short'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${itemId}/view`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${itemId}/view`;

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to record view on the backend');
      }

      const data = await response.json();
      
      // If successful, update localStorage with the new view timestamp
      const records = this.getViewRecords();
      records[itemId] = { lastViewed: Date.now() };
      this.saveViewRecords(records);

      return { viewRecorded: true, newViewCount: data.viewCount };
    } catch (error) {
      console.error('Error recording view:', error);
      return { viewRecorded: false };
    }
  }
}

export default ViewTrackingService;