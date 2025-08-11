// URL type definitions and interfaces

export interface UrlTypeInfo {
  type: 'merge-request' | 'pull-request' | 'jira-ticket' | 'confluence-page' | 'stackoverflow' | 'github-issue' | 'gitlab-issue' | 'notion-page' | 'figma-design' | 'linear-ticket' | 'asana-task' | 'trello-card' | 'slack-channel' | 'discord-channel' | 'youtube-video' | 'medium-article' | 'dev-post' | 'hackernews' | 'reddit-post' | 'twitter-post' | 'linkedin-post' | 'documentation' | 'api-docs' | 'npm-package' | 'docker-hub' | 'kubernetes-docs' | 'aws-docs' | 'google-cloud' | 'azure-docs' | 'databricks' | 'snowflake' | 'tableau' | 'powerbi' | 'jupyter-notebook' | 'kaggle' | 'leetcode' | 'hackerrank' | 'codewars' | 'udemy' | 'coursera' | 'edx' | 'copy-link-highlight' | 'ai-chatbot' | 'ai-chatbot-highlight' | 'other';
  platform: string;
  identifier?: string;
  title?: string;
  color: string;
  icon: string;
  description: string;
}

export interface UrlPattern {
  pattern: RegExp;
  type: UrlTypeInfo['type'];
  platform: string;
  color: string;
  icon: string;
  description: string;
  extractIdentifier?: (url: string) => string | undefined;
  extractTitle?: (url: string) => string | undefined;
}

export interface SearchEngine {
  name: string;
  url: string;
  queryParam: string;
}

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export interface DomainInfo {
  domain: string;
  isDistracting: boolean;
  isHomepage: boolean;
  isSpecificContent: boolean;
  shouldRedirect: boolean;
}
