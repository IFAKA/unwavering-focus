// Utility for generating hashed class names to avoid CSS conflicts
export function generateHashedClassName(baseName: string): string {
  // Simple hash function to generate unique class names
  let hash = 0;
  for (let i = 0; i < baseName.length; i++) {
    const char = baseName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive hex string and take first 6 characters
  const hashHex = Math.abs(hash).toString(16).padStart(6, '0').substring(0, 6);
  return `uf-${baseName}-${hashHex}`;
}

// Pre-generated class names for common elements
export const HASHED_CLASSES = {
  PINNED_TASK: generateHashedClassName('pinned-task'),
  PINNED_TASK_CONTAINER: generateHashedClassName('pinned-task-container'),
  PINNED_TASK_CONTENT: generateHashedClassName('pinned-task-content'),
  PINNED_TASK_CHECKBOX: generateHashedClassName('pinned-task-checkbox'),
  PINNED_TASK_TEXT: generateHashedClassName('pinned-task-text'),
  MODAL: generateHashedClassName('modal'),
  MODAL_INPUT: generateHashedClassName('modal-input'),
  MODAL_BUTTON: generateHashedClassName('modal-button'),
  COUNTDOWN_TIMER: generateHashedClassName('countdown-timer'),
  BREATHING_OVERLAY: generateHashedClassName('breathing-overlay'),
} as const;
