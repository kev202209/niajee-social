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
  location: string;
  country: string;
  city: string;
  ipAddress: string;
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
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
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

type LocationResult = {
  ip: string;
  country: string;
  city: string;
  location: string;
};

type ServiceDef = {
  url: string;
  parse: (data: unknown) => LocationResult;
};

const safeString = (v: unknown, fallback = 'Unknown'): string =>
  typeof v === 'string' && v.trim() ? v : fallback;

const getIPAndLocation = async (): Promise<LocationResult> => {
  const services: ServiceDef[] = [
    {
      url: 'https://ipapi.co/json/',
      parse: (data: unknown) => {
        const d = data as Record<string, unknown>;
        return {
          ip: safeString(d.ip),
          country: safeString(d.country_name),
            city: safeString(d.city),
          location: `${safeString(d.city)}, ${safeString(d.region)}, ${safeString(d.country_name)}`
        };
      }
    },
    {
      url: 'http://ip-api.com/json/',
      parse: (data: unknown) => {
        const d = data as Record<string, unknown>;
        return {
          ip: safeString(d.query),
          country: safeString(d.country),
          city: safeString(d.city),
          location: `${safeString(d.city)}, ${safeString(d.regionName)}, ${safeString(d.country)}`
        };
      }
    },
    {
      url: 'https://ipinfo.io/json',
      parse: (data: unknown) => {
        const d = data as Record<string, unknown>;
        return {
          ip: safeString(d.ip),
          country: safeString(d.country),
          city: safeString(d.city),
          location: `${safeString(d.city)}, ${safeString(d.region)}, ${safeString(d.country)}`
        };
      }
    }
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (response.ok) {
        const data: unknown = await response.json();
        return service.parse(data);
      }
    } catch (err) {
      console.warn(`Failed to get location from ${service.url}:`, err);
      continue;
    }
  }

  return {
    ip: 'Unknown',
    country: 'Unknown',
    city: 'Unknown',
    location: 'Unknown Location'
  };
};

const getGeolocation = (): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
} | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.warn('Geolocation failed:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
};

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const locationData = await getIPAndLocation();
    const coordinates = await getGeolocation();
    const nav = navigator as NavigatorExtended;

    const deviceInfo: DeviceInfo = {
      deviceName: getDeviceType(),
      browser: getBrowserName(),
      operatingSystem: getOSName(),
      location: locationData.location,
      country: locationData.country,
      city: locationData.city,
      ipAddress: locationData.ip,
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
      coordinates: coordinates || undefined
    };
    return deviceInfo;
  } catch (err) {
    console.error('Error collecting device info:', err);
    const nav = navigator as NavigatorExtended;
    return {
      deviceName: getDeviceType(),
      browser: getBrowserName(),
      operatingSystem: getOSName(),
      location: 'Unknown Location',
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