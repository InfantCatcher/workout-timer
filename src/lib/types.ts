export interface ExerciseItem {
  id?: string;
  name: string;
  sets: number;
  workSeconds: number;
  restSeconds: number;
  orderIndex?: number;
}

export interface WorkoutPlanData {
  id?: string;
  userId?: string | null;
  title: string;
  description?: string | null;
  interExerciseRest: number;
  isDefault?: boolean;
  exercises: ExerciseItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
}

export type TimerPhaseType = 'PREPARE' | 'WORK' | 'REST' | 'EXERCISE_REST' | 'FINISHED';

export interface TimerStep {
  stepIndex: number;
  phase: TimerPhaseType;
  exerciseIndex: number;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  durationSeconds: number;
  nextStepPreview?: string;
}

export interface AudioSettings {
  speechEnabled: boolean;
  chimesEnabled: boolean;
  volume: number; // 0 to 1
  voiceURI: string | null;
  speechRate: number; // 0.8 to 1.5
  speechPitch: number; // 0.8 to 1.5
}
