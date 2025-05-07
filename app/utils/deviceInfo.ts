export const getDeviceInfo = async () => {
    try {
      // Get device and OS info using modern APIs
      const userAgent = window.navigator.userAgent;
      const userAgentData = (navigator as any).userAgentData;
      
      // Get device name using modern or fallback methods
      const deviceName = userAgentData?.platform || 
        /Mobile|Tablet|iPad|iPhone|Android/.test(userAgent) ? 'Mobile Device' : 'Desktop';
  
      // Get OS using modern or fallback methods
      const operatingSystem = userAgentData?.platform || 
        detectOS(userAgent);
      
      const browser = getBrowserInfo(userAgent);
  
      // Get IP address from a service
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip;
  
      return {
        deviceName,
        operatingSystem,
        browser,
        ipAddress,
        location: undefined
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        deviceName: 'Unknown Device',
        operatingSystem: 'Unknown OS',
        browser: getBrowserInfo(window.navigator.userAgent),
        ipAddress: '0.0.0.0',
        location: undefined
      };
    }
  };
  
  // Helper function to detect OS from user agent
  function detectOS(userAgent: string): string {
    const os = [
      { name: 'Windows', pattern: 'Win' },
      { name: 'macOS', pattern: 'Mac' },
      { name: 'iOS', pattern: 'iPhone|iPad|iPod' },
      { name: 'Android', pattern: 'Android' },
      { name: 'Linux', pattern: 'Linux|X11' }
    ];
  
    for (const system of os) {
      if (new RegExp(system.pattern).test(userAgent)) {
        return system.name;
      }
    }
    
    return 'Unknown OS';
  }
  
  // Helper function to get browser info
  function getBrowserInfo(userAgent: string): string {
    const browsers = [
      { name: 'Chrome', value: 'Chrome' },
      { name: 'Firefox', value: 'Firefox' },
      { name: 'Safari', value: 'Safari' },
      { name: 'Opera', value: 'Opera' },
      { name: 'Edge', value: 'Edge' },
      { name: 'IE', value: 'MSIE' }
    ];
  
    for (const browser of browsers) {
      if (userAgent.includes(browser.value)) {
        return browser.name;
      }
    }
    
    return 'Unknown Browser';
  }