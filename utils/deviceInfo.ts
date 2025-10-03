// Add supporting experimental interfaces instead of ts-ignore
interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
}
interface NavigatorExtended extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  deviceMemory?: number;
  hardwareConcurrency: number;
}

interface DeviceInfo {
  deviceName: string;
  browser: string;
  operatingSystem: string;
  location: string;  // Will be set to 'Unknown'
  country: string;   // Will be set to 'Unknown'
  city: string;      // Will be set to 'Unknown'
  ipAddress: string; // Will be set to 'Unknown'
  screenResolution: string;
  timezone: string;
  language: string;
  userAgent: string;
  viewport: string;
  connectionType: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  cookieEnabled: boolean;
  onlineStatus: boolean;
  referrer: string;
  // Removed coordinates (no geolocation)
}

const getBrowserName = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('SamsungBrowser')) return 'Samsung Internet';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  if (userAgent.includes('Edge')) return 'Microsoft Edge';
  if (userAgent.includes('Chrome')) return 'Google Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  return 'Unknown Browser';
};

const getOSName = (): string => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  if (/Windows NT 10.0/.test(userAgent)) return 'Windows 10';
  if (/Windows NT 6.3/.test(userAgent)) return 'Windows 8.1';
  if (/Windows NT 6.2/.test(userAgent)) return 'Windows 8';
  if (/Windows NT 6.1/.test(userAgent)) return 'Windows 7';
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Mac OS X 10[._](\d+)/.test(userAgent)) {
    const version = userAgent.match(/Mac OS X 10[._](\d+)/)?.[1];
    return `macOS ${version}`;
  }
  if (/Mac/.test(userAgent)) return 'macOS';
  if (/Linux/.test(userAgent) && /Android/.test(userAgent)) return 'Android';
  if (/Linux/.test(userAgent)) return 'Linux';
  if (/iPhone/.test(userAgent)) return 'iOS';
  if (/iPad/.test(userAgent)) return 'iPadOS';
  return platform || 'Unknown OS';
};

const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/Mobi|Android/i.test(userAgent)) {
    if (/iPad/.test(userAgent)) return 'Tablet (iPad)';
    if (/Android.*(?:Mobile|Phone)/i.test(userAgent)) return 'Mobile Phone (Android)';
    if (/iPhone/.test(userAgent)) return 'Mobile Phone (iPhone)';
    return 'Mobile Device';
  }
  if (/Tablet|iPad/i.test(userAgent)) return 'Tablet';
  return 'Desktop Computer';
};

const getConnectionType = (): string => {
  const nav = navigator as NavigatorExtended;
  const connection =
    nav.connection || nav.mozConnection || nav.webkitConnection;
  if (connection) {
    const eff = connection.effectiveType || 'unknown';
    const down = connection.downlink != null ? `${connection.downlink}Mbps` : 'unknown';
    return `${eff} (${down})`;
  }
  return 'Unknown';
};

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const nav = navigator as NavigatorExtended;

    const deviceInfo: DeviceInfo = {
      deviceName: getDeviceType(),
      browser: getBrowserName(),
      operatingSystem: getOSName(),
      location: 'Unknown',  // Static value, no external API or geolocation
      country: 'Unknown',
      city: 'Unknown',
      ipAddress: 'Unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language,
      userAgent: nav.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: getConnectionType(),
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: nav.hardwareConcurrency,
      cookieEnabled: nav.cookieEnabled,
      onlineStatus: nav.onLine,
      referrer: document.referrer || 'Direct',
      // Removed coordinates
    };
    return deviceInfo;
  } catch (err) {
    console.error('Error collecting device info:', err);
    const nav = navigator as NavigatorExtended;
    return {
      deviceName: getDeviceType(),
      browser: getBrowserName(),
      operatingSystem: getOSName(),
      location: 'Unknown',
      country: 'Unknown',
      city: 'Unknown',
      ipAddress: 'Unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language,
      userAgent: nav.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: 'Unknown',
      cookieEnabled: nav.cookieEnabled,
      onlineStatus: nav.onLine,
      referrer: document.referrer || 'Direct'
    };
  }
};

export const getDeviceInfoWithLoading = async (
  setLoading?: (loading: boolean) => void
): Promise<DeviceInfo> => {
  if (setLoading) setLoading(true);
  try {
    return await getDeviceInfo();
  } finally {
    if (setLoading) setLoading(false);
  }
};