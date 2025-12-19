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
  // Fitness & Health
  WORKOUT = 'Workout',
  GYM = 'Gym',
  YOGA = 'Yoga',
  WALK = 'Walk',
  RUNNING = 'Running',
  SPORTS = 'Sports',

  // Learning & Education  
  CLASS = 'Class',
  LECTURE = 'Lecture',
  STUDY = 'Study',
  DEEP_STUDY = 'Deep Study',
  READING = 'Reading',
  HOMEWORK = 'Homework',
  EXAM_PREP = 'Exam Prep',
  ONLINE_COURSE = 'Online Course',

  // Work & Productivity
  WORK = 'Work',
  MEETING = 'Meeting',
  CODING = 'Coding',
  WRITING = 'Writing',
  PROJECT = 'Project',
  RESEARCH = 'Research',
  OFFICE = 'Office',

  // Personal & Daily
  MORNING_ROUTINE = 'Morning Routine',
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  BREAK = 'Break',
  NAP = 'Nap',
  MEDITATION = 'Meditation',
  COMMUTE = 'Commute',

  // Creative & Hobbies
  MUSIC = 'Music',
  ART = 'Art',
  GAMING = 'Gaming',
  SIDE_PROJECT = 'Side Project',

  // Social & Family
  FAMILY_TIME = 'Family Time',
  SOCIAL = 'Social',
  PHONE_CALLS = 'Phone Calls',

  // Other
  OTHER = 'Other',
  CUSTOM = 'Custom'
}

export interface ScheduleBlock {
  id: string;
  start: string; // HH:MM
  end: string; // HH:MM
  activity: string; // Can be any custom activity name
  type?: ActivityType; // Optional - for categorization
  color?: string; // Optional custom color
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