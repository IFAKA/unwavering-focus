import { UrlTypeInfo } from '../url-types';
import { 
  isGitLabMergeRequest, 
  isGitHubPullRequest, 
  isGitHubIssue, 
  isGitLabIssue 
} from './git-detector';

/**
 * Resolves Git platform URL types
 */
export function resolveGitUrl(url: string): UrlTypeInfo | null {
  // GitLab Merge Requests
  const gitlabMr = isGitLabMergeRequest(url);
  if (gitlabMr.isMatch) {
    return {
      type: 'merge-request',
      platform: 'GitLab',
      identifier: gitlabMr.mrId,
      color: '#FC6D26',
      icon: 'git-branch',
      description: `Merge Request #${gitlabMr.mrId}`
    };
  }

  // GitHub Pull Requests
  const githubPr = isGitHubPullRequest(url);
  if (githubPr.isMatch) {
    return {
      type: 'pull-request',
      platform: 'GitHub',
      identifier: githubPr.prId,
      color: '#24292F',
      icon: 'git-branch',
      description: `Pull Request #${githubPr.prId}`
    };
  }

  // GitHub Issues
  const githubIssue = isGitHubIssue(url);
  if (githubIssue.isMatch) {
    return {
      type: 'github-issue',
      platform: 'GitHub',
      identifier: githubIssue.issueId,
      color: '#24292F',
      icon: 'alert-circle',
      description: `Issue #${githubIssue.issueId}`
    };
  }

  // GitLab Issues
  const gitlabIssue = isGitLabIssue(url);
  if (gitlabIssue.isMatch) {
    return {
      type: 'gitlab-issue',
      platform: 'GitLab',
      identifier: gitlabIssue.issueId,
      color: '#FC6D26',
      icon: 'alert-circle',
      description: `Issue #${gitlabIssue.issueId}`
    };
  }

  return null;
}
