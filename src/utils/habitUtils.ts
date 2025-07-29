import { Habit, HabitEntry } from '../types';

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getDaysInPeriod(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function getHabitEntriesForPeriod(
  entries: HabitEntry[],
  habitId: string,
  days: number = 30
): HabitEntry[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return entries.filter(entry => {
    if (entry.habitId !== habitId) return false;
    
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

export function calculateConsistency(entries: HabitEntry[], days: number = 30): number {
  if (entries.length === 0) return 0;
  
  const completedEntries = entries.filter(entry => 
    entry.status === 'excellent' || entry.status === 'good'
  );
  
  return Math.round((completedEntries.length / days) * 100);
}

export function getHabitStatusForDate(
  entries: HabitEntry[],
  habitId: string,
  date: string
): 'excellent' | 'good' | 'not-done' | null {
  const entry = entries.find(e => e.habitId === habitId && e.date === date);
  return entry ? entry.status : null;
}

export function getHabitGridData(
  entries: HabitEntry[],
  habitId: string,
  days: number = 30
): Array<'excellent' | 'good' | 'not-done' | null> {
  const gridData: Array<'excellent' | 'good' | 'not-done' | null> = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = getDateString(date);
    
    const status = getHabitStatusForDate(entries, habitId, dateString);
    gridData.push(status);
  }
  
  return gridData;
}

export function calculateOverallMasteryScore(
  habits: Habit[],
  entries: HabitEntry[],
  days: number = 30
): number {
  if (habits.length === 0) return 0;
  
  const habitScores = habits.map(habit => {
    const habitEntries = getHabitEntriesForPeriod(entries, habit.id, days);
    return calculateConsistency(habitEntries, days);
  });
  
  const totalScore = habitScores.reduce((sum, score) => sum + score, 0);
  return Math.round(totalScore / habits.length);
}

export function getReinforcementMessage(
  masteryScore: number,
  messages: { high: string; medium: string; low: string }
): string {
  if (masteryScore >= 80) {
    return messages.high;
  } else if (masteryScore >= 50) {
    return messages.medium;
  } else {
    return messages.low;
  }
}

export function getStatusColor(status: 'excellent' | 'good' | 'not-done' | null): string {
  switch (status) {
    case 'excellent':
      return '#22c55e'; // Bright green
    case 'good':
      return '#4ade80'; // Light green
    case 'not-done':
      return '#ef4444'; // Red
    default:
      return '#9ca3af'; // Gray
  }
}

export function getStatusLabel(status: 'excellent' | 'good' | 'not-done'): string {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'not-done':
      return 'Not Done';
  }
} 