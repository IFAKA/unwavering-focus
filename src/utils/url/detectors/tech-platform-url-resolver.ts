import { UrlTypeInfo } from '../url-types';
import { 
  isNpmUrl, 
  isDockerHubUrl, 
  isKubernetesDocsUrl, 
  isAwsDocsUrl, 
  isGoogleCloudDocsUrl, 
  isAzureDocsUrl, 
  isGenericDocsUrl, 
  isApiDocsUrl 
} from './tech-platform-detector';

/**
 * Resolves tech platform URL types
 */
export function resolveTechPlatformUrl(url: string): UrlTypeInfo | null {
  // NPM
  if (isNpmUrl(url)) {
    return {
      type: 'npm-package',
      platform: 'NPM',
      color: '#CB3837',
      icon: 'package',
      description: 'NPM Package'
    };
  }

  // Docker Hub
  if (isDockerHubUrl(url)) {
    return {
      type: 'docker-hub',
      platform: 'Docker Hub',
      color: '#2496ED',
      icon: 'box',
      description: 'Docker Image'
    };
  }

  // Kubernetes Documentation
  if (isKubernetesDocsUrl(url)) {
    return {
      type: 'kubernetes-docs',
      platform: 'Kubernetes',
      color: '#326CE5',
      icon: 'book',
      description: 'K8s Documentation'
    };
  }

  // AWS Documentation
  if (isAwsDocsUrl(url)) {
    return {
      type: 'aws-docs',
      platform: 'AWS',
      color: '#FF9900',
      icon: 'cloud',
      description: 'AWS Documentation'
    };
  }

  // Google Cloud Documentation
  if (isGoogleCloudDocsUrl(url)) {
    return {
      type: 'google-cloud',
      platform: 'Google Cloud',
      color: '#4285F4',
      icon: 'cloud',
      description: 'GCP Documentation'
    };
  }

  // Azure Documentation
  if (isAzureDocsUrl(url)) {
    return {
      type: 'azure-docs',
      platform: 'Azure',
      color: '#0078D4',
      icon: 'cloud',
      description: 'Azure Documentation'
    };
  }

  // Generic documentation sites
  if (isGenericDocsUrl(url)) {
    return {
      type: 'documentation',
      platform: 'Documentation',
      color: '#6B7280',
      icon: 'book',
      description: 'Documentation'
    };
  }

  // API documentation
  if (isApiDocsUrl(url)) {
    return {
      type: 'api-docs',
      platform: 'API Docs',
      color: '#059669',
      icon: 'code',
      description: 'API Documentation'
    };
  }

  return null;
}
