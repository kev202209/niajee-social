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
  userAgentData?: {
    brands: Array<{ brand: string; version: string }>;
    mobile: boolean;
    platform: string;
  };
}

export interface DeviceInfo {
  deviceName: string;
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  osVersion: string;
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
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  colorDepth: number;
  pixelRatio: number;
}

const getBrowserInfo = (): { name: string; version: string } => {
  const userAgent = navigator.userAgent;
  const nav = navigator as NavigatorExtended;
  
  // Try using the new User-Agent Client Hints API first (more accurate)
  if (nav.userAgentData) {
    const mainBrand = nav.userAgentData.brands.find(
      b => !b.brand.includes('Not') && !b.brand.includes('Brand')
    );
    if (mainBrand) {
      return { name: mainBrand.brand, version: mainBrand.version };
    }
  }

  // Fallback to user agent string parsing
  let name = 'Unknown Browser';
  let version = 'Unknown';

  // Order matters - check most specific first
  if (userAgent.includes('Edg/')) {
    name = 'Microsoft Edge';
    version = userAgent.match(/Edg\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg')) {
    name = 'Google Chrome';
    version = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    version = userAgent.match(/Version\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Firefox/')) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('SamsungBrowser/')) {
    name = 'Samsung Internet';
    version = userAgent.match(/SamsungBrowser\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
    name = 'Opera';
    version = userAgent.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    name = 'Internet Explorer';
    version = userAgent.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || 'Unknown';
  }

  return { name, version };
};

const getOSInfo = (): { name: string; version: string } => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const nav = navigator as NavigatorExtended;
  
  let name = 'Unknown OS';
  let version = 'Unknown';

  // Use User-Agent Client Hints if available
  if (nav.userAgentData?.platform) {
    name = nav.userAgentData.platform;
  }

  // Windows
  if (/Windows NT 10.0/.test(userAgent)) {
    name = 'Windows';
    version = '10/11'; // Can't distinguish between 10 and 11 from user agent
  } else if (/Windows NT 6.3/.test(userAgent)) {
    name = 'Windows';
    version = '8.1';
  } else if (/Windows NT 6.2/.test(userAgent)) {
    name = 'Windows';
    version = '8';
  } else if (/Windows NT 6.1/.test(userAgent)) {
    name = 'Windows';
    version = '7';
  } else if (/Windows/.test(userAgent)) {
    name = 'Windows';
    version = 'Unknown';
  }
  // macOS
  else if (/Mac OS X (10[._]\d+)/.test(userAgent)) {
    name = 'macOS';
    const versionMatch = userAgent.match(/Mac OS X (10[._]\d+)/);
    version = versionMatch ? versionMatch[1].replace('_', '.') : 'Unknown';
  } else if (/Mac/.test(userAgent)) {
    name = 'macOS';
  }
  // iOS
  else if (/iPhone OS ([\d_]+)/.test(userAgent)) {
    name = 'iOS';
    const versionMatch = userAgent.match(/iPhone OS ([\d_]+)/);
    version = versionMatch ? versionMatch[1].replace(/_/g, '.') : 'Unknown';
  } else if (/iPad.*OS ([\d_]+)/.test(userAgent)) {
    name = 'iPadOS';
    const versionMatch = userAgent.match(/OS ([\d_]+)/);
    version = versionMatch ? versionMatch[1].replace(/_/g, '.') : 'Unknown';
  }
  // Android
  else if (/Android ([\d.]+)/.test(userAgent)) {
    name = 'Android';
    const versionMatch = userAgent.match(/Android ([\d.]+)/);
    version = versionMatch ? versionMatch[1] : 'Unknown';
  }
  // Linux
  else if (/Linux/.test(userAgent)) {
    name = 'Linux';
  }
  // ChromeOS
  else if (/CrOS/.test(userAgent)) {
    name = 'Chrome OS';
  }

  return { name, version };
};

const getDeviceType = (): {
  deviceName: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} => {
  const userAgent = navigator.userAgent;
  const nav = navigator as NavigatorExtended;
  
  // Check User-Agent Client Hints first
  if (nav.userAgentData?.mobile !== undefined) {
    const isMobile = nav.userAgentData.mobile;
    if (isMobile) {
      // Check if it's a tablet
      const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent) || 
                       (window.innerWidth >= 768 && window.innerHeight >= 1024);
      return {
        deviceName: isTablet ? 'Tablet' : 'Mobile Phone',
        isMobile: true,
        isTablet,
        isDesktop: false
      };
    }
    return {
      deviceName: 'Desktop Computer',
      isMobile: false,
      isTablet: false,
      isDesktop: true
    };
  }

  // Fallback to user agent detection
  const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent) ||
    (!/Mobi|Android/i.test(userAgent) && 'ontouchstart' in window && window.innerWidth < 1024);
  
  const isMobile = /Mobi|Android|iPhone/i.test(userAgent) && !isTablet;

  let deviceName = 'Desktop Computer';
  if (isTablet) {
    if (/iPad/.test(userAgent)) deviceName = 'iPad';
    else if (/Android/i.test(userAgent)) deviceName = 'Android Tablet';
    else deviceName = 'Tablet';
  } else if (isMobile) {
    if (/iPhone/.test(userAgent)) deviceName = 'iPhone';
    else if (/Android/i.test(userAgent)) deviceName = 'Android Phone';
    else deviceName = 'Mobile Phone';
  } else {
    // Try to detect specific desktop types
    if (/Mac/i.test(userAgent)) deviceName = 'Mac';
    else if (/Windows/i.test(userAgent)) deviceName = 'Windows PC';
    else if (/Linux/i.test(userAgent)) deviceName = 'Linux Computer';
  }

  return {
    deviceName,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };
};

const getConnectionType = (): string => {
  const nav = navigator as NavigatorExtended;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  if (connection) {
    const type = connection.effectiveType || 'unknown';
    const downlink = connection.downlink !== undefined 
      ? `${connection.downlink.toFixed(1)} Mbps` 
      : 'unknown';
    
    // Map effective types to user-friendly names
    const typeMap: Record<string, string> = {
      'slow-2g': 'Slow 2G',
      '2g': '2G',
      '3g': '3G',
      '4g': '4G/LTE',
      '5g': '5G'
    };
    
    return `${typeMap[type] || type} (${downlink})`;
  }
  
  return 'Unknown';
};

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const nav = navigator as NavigatorExtended;
    const browserInfo = getBrowserInfo();
    const osInfo = getOSInfo();
    const deviceType = getDeviceType();

    const deviceInfo: DeviceInfo = {
      deviceName: deviceType.deviceName,
      browser: browserInfo.name,
      browserVersion: browserInfo.version,
      operatingSystem: osInfo.name,
      osVersion: osInfo.version,
      screenResolution: `${screen.width}×${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language,
      userAgent: nav.userAgent,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      connectionType: getConnectionType(),
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: nav.hardwareConcurrency,
      cookieEnabled: nav.cookieEnabled,
      onlineStatus: nav.onLine,
      referrer: document.referrer || 'Direct',
      isMobile: deviceType.isMobile,
      isTablet: deviceType.isTablet,
      isDesktop: deviceType.isDesktop,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    };

    return deviceInfo;
  } catch (err) {
    console.error('Error collecting device info:', err);
    
    // Minimal fallback
    const browserInfo = getBrowserInfo();
    const osInfo = getOSInfo();
    const deviceType = getDeviceType();
    const nav = navigator as NavigatorExtended;

    return {
      deviceName: deviceType.deviceName,
      browser: browserInfo.name,
      browserVersion: browserInfo.version,
      operatingSystem: osInfo.name,
      osVersion: osInfo.version,
      screenResolution: `${screen.width}×${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language,
      userAgent: nav.userAgent,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      connectionType: 'Unknown',
      cookieEnabled: nav.cookieEnabled,
      onlineStatus: nav.onLine,
      referrer: document.referrer || 'Direct',
      isMobile: deviceType.isMobile,
      isTablet: deviceType.isTablet,
      isDesktop: deviceType.isDesktop,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
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