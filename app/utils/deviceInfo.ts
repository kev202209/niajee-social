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
    // @ts-ignore - Navigator connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return `${connection.effectiveType || 'unknown'} (${connection.downlink || 'unknown'}Mbps)`;
    }
    
    return 'Unknown';
  };
  
  // Get IP and location using multiple fallback services
  const getIPAndLocation = async (): Promise<{
    ip: string;
    country: string;
    city: string;
    location: string;
  }> => {
    const fallbackServices = [
      // Primary service - ipapi.co (free tier: 1000 requests/day)
      {
        url: 'https://ipapi.co/json/',
        parse: (data: any) => ({
          ip: data.ip,
          country: data.country_name,
          city: data.city,
          location: `${data.city}, ${data.region}, ${data.country_name}`
        })
      },
      // Fallback 1 - ip-api.com (free, no key required)
      {
        url: 'http://ip-api.com/json/',
        parse: (data: any) => ({
          ip: data.query,
          country: data.country,
          city: data.city,
          location: `${data.city}, ${data.regionName}, ${data.country}`
        })
      },
      // Fallback 2 - ipinfo.io (free tier: 50k requests/month)
      {
        url: 'https://ipinfo.io/json',
        parse: (data: any) => ({
          ip: data.ip,
          country: data.country,
          city: data.city,
          location: `${data.city}, ${data.region}, ${data.country}`
        })
      }
    ];
  
    for (const service of fallbackServices) {
      try {
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return service.parse(data);
        }
      } catch (error) {
        console.warn(`Failed to get location from ${service.url}:`, error);
        continue;
      }
    }
    
    // Final fallback
    return {
      ip: 'Unknown',
      country: 'Unknown',
      city: 'Unknown',
      location: 'Unknown Location'
    };
  };
  
  // Get precise geolocation coordinates
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
          timeout: 10000, // 10 seconds
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };
  
  export const getDeviceInfo = async (): Promise<DeviceInfo> => {
    try {
      // Get IP and location data
      const locationData = await getIPAndLocation();
      
      // Get precise geolocation (optional, requires user permission)
      const coordinates = await getGeolocation();
      
      // Collect comprehensive device information
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
        language: navigator.language,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        connectionType: getConnectionType(),
        // @ts-ignore - These are experimental APIs
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        referrer: document.referrer || 'Direct',
        coordinates: coordinates || undefined
      };
  
      return deviceInfo;
    } catch (error) {
      console.error('Error collecting device info:', error);
      
      // Return basic info if enhanced collection fails
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
        language: navigator.language,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        connectionType: 'Unknown',
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        referrer: document.referrer || 'Direct'
      };
    }
  };
  
  // Optional: Get device info with user-friendly loading state
  export const getDeviceInfoWithLoading = async (
    setLoading?: (loading: boolean) => void
  ): Promise<DeviceInfo> => {
    if (setLoading) setLoading(true);
    
    try {
      const deviceInfo = await getDeviceInfo();
      return deviceInfo;
    } finally {
      if (setLoading) setLoading(false);
    }
  };