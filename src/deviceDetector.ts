export interface DeviceInfo {
  type: 'DESKTOP' | 'MOBILE' | 'TABLET';
  os: 'Windows' | 'macOS' | 'Android' | 'iOS (iPhone)' | 'iPadOS' | 'Linux' | 'Unknown OS';
  browser: string;
  details: string;
  width: number;
  height: number;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      type: 'DESKTOP',
      os: 'Unknown OS',
      browser: 'Unknown Browser',
      details: 'Unknown environment',
      width: 1920,
      height: 1080
    };
  }

  const ua = navigator.userAgent;
  let type: 'DESKTOP' | 'MOBILE' | 'TABLET' = 'DESKTOP';
  let os: DeviceInfo['os'] = 'Unknown OS';
  let browser = 'Unknown Browser';

  // 1. Detect OS
  if (/Windows/i.test(ua)) {
    os = 'Windows';
  } else if (/Macintosh/i.test(ua)) {
    // macOS or iPad Pro with touch capabilities acting as MacIntel
    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
      os = 'iPadOS';
      type = 'TABLET';
    } else {
      os = 'macOS';
    }
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    // If it contains "Android" and doesn't contain "Mobile", it is likely a tablet
    if (/Tablet/i.test(ua) || !/Mobile/i.test(ua)) {
      type = 'TABLET';
    } else {
      type = 'MOBILE';
    }
  } else if (/iPhone|iPod/i.test(ua)) {
    os = 'iOS (iPhone)';
    type = 'MOBILE';
  } else if (/iPad/i.test(ua)) {
    os = 'iPadOS';
    type = 'TABLET';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // 1b. Additional tablet/mobile detection heuristics
  if (type === 'DESKTOP') {
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      type = 'TABLET';
    } else if (/mobile|iphone|ipod|iemobile|blackberry/i.test(ua)) {
      type = 'MOBILE';
    }
  }

  // 2. Detect Browser Name
  if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/Edge|Edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Trident|MSIE/i.test(ua)) {
    browser = 'Internet Explorer';
  }

  const details = `${os} - ${browser} (${window.innerWidth}x${window.innerHeight})`;

  return {
    type,
    os,
    browser,
    details,
    width: window.innerWidth,
    height: window.innerHeight
  };
}
