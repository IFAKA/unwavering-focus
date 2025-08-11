import { UrlTypeInfo } from '../url-types';
import { 
  isJiraUrl, 
  isConfluenceUrl, 
  isLinearUrl, 
  isAsanaUrl, 
  isTrelloUrl 
} from './project-management-detector';

/**
 * Resolves project management platform URL types
 */
export function resolveProjectManagementUrl(url: string): UrlTypeInfo | null {
  // Jira
  const jira = isJiraUrl(url);
  if (jira.isMatch) {
    return {
      type: 'jira-ticket',
      platform: 'Jira',
      identifier: jira.ticketId,
      color: '#0052CC',
      icon: 'ticket',
      description: jira.ticketId ? `Ticket ${jira.ticketId}` : 'Jira Page'
    };
  }

  // Confluence
  if (isConfluenceUrl(url)) {
    return {
      type: 'confluence-page',
      platform: 'Confluence',
      color: '#172B4D',
      icon: 'document',
      description: 'Documentation Page'
    };
  }

  // Linear
  const linear = isLinearUrl(url);
  if (linear.isMatch) {
    return {
      type: 'linear-ticket',
      platform: 'Linear',
      identifier: linear.ticketId,
      color: '#5E6AD2',
      icon: 'ticket',
      description: `Ticket ${linear.ticketId}`
    };
  }

  // Asana
  if (isAsanaUrl(url)) {
    return {
      type: 'asana-task',
      platform: 'Asana',
      color: '#F06A6A',
      icon: 'check-square',
      description: 'Task'
    };
  }

  // Trello
  if (isTrelloUrl(url)) {
    return {
      type: 'trello-card',
      platform: 'Trello',
      color: '#0079BF',
      icon: 'credit-card',
      description: 'Card'
    };
  }

  return null;
}
