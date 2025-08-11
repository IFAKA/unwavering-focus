/**
 * Detects NPM URLs
 */
export function isNpmUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('npmjs.com');
  } catch {
    return false;
  }
}

/**
 * Detects Docker Hub URLs
 */
export function isDockerHubUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('hub.docker.com');
  } catch {
    return false;
  }
}

/**
 * Detects Kubernetes Documentation URLs
 */
export function isKubernetesDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('kubernetes.io');
  } catch {
    return false;
  }
}

/**
 * Detects AWS Documentation URLs
 */
export function isAwsDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('docs.aws.amazon.com');
  } catch {
    return false;
  }
}

/**
 * Detects Google Cloud Documentation URLs
 */
export function isGoogleCloudDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('cloud.google.com');
  } catch {
    return false;
  }
}

/**
 * Detects Azure Documentation URLs
 */
export function isAzureDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    return hostname.includes('docs.microsoft.com') && pathname.includes('/azure/');
  } catch {
    return false;
  }
}

/**
 * Detects generic documentation URLs
 */
export function isGenericDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    return pathname.includes('/docs/') || pathname.includes('/documentation/');
  } catch {
    return false;
  }
}

/**
 * Detects API documentation URLs
 */
export function isApiDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    return pathname.includes('/api/') || pathname.includes('/swagger/') || pathname.includes('/openapi/');
  } catch {
    return false;
  }
}
