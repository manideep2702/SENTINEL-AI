import React from 'react';

// Augment React's JSX namespace correctly to add custom elements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          icon?: string;
          width?: string | number;
          className?: string;
      };
    }
  }
}

export enum ActivityType {
  WORKOUT = 'Workout',
  CLASS = 'Class',
  DEEP_STUDY = 'Deep Study',
  STUDY = 'Study',
  WALK = 'Park Walk',
  OTHER = 'Other'
}

export interface ScheduleBlock {
  id: string;
  start: string; // HH:MM
  end: string; // HH:MM
  activity: string;
  type: ActivityType;
}

export interface VerificationResult {
  task_verified: boolean;
  focus_score: number; // 1-10
  distractions_detected: string[];
  ai_critique: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  blockId: string;
  videoUrl?: string; // Local object URL for preview
  result: VerificationResult | null;
  status: 'pending' | 'verified' | 'failed';
}

export interface DailyStats {
  consistencyScore: number;
  totalFocusPoints: number;
  completedBlocks: number;
  totalBlocks: number;
}