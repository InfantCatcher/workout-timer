import { WorkoutPlanData } from './types';

export const DEFAULT_PRESETS: WorkoutPlanData[] = [
  {
    id: 'preset-tabata',
    title: 'Tabata Express (Full Body)',
    description: 'High-intensity 20s work / 10s rest format across 4 bodyweight exercises.',
    interExerciseRest: 30,
    isDefault: true,
    exercises: [
      { id: 'ex-t1', name: 'Jumping Jacks', sets: 4, workSeconds: 20, restSeconds: 10, orderIndex: 0 },
      { id: 'ex-t2', name: 'Push-ups', sets: 4, workSeconds: 20, restSeconds: 10, orderIndex: 1 },
      { id: 'ex-t3', name: 'Air Squats', sets: 4, workSeconds: 20, restSeconds: 10, orderIndex: 2 },
      { id: 'ex-t4', name: 'Mountain Climbers', sets: 4, workSeconds: 20, restSeconds: 10, orderIndex: 3 },
    ],
  },
  {
    id: 'preset-hiit',
    title: '30/15 HIIT Workout',
    description: 'Balanced interval training: 30s exertion with 15s quick recovery.',
    interExerciseRest: 45,
    isDefault: true,
    exercises: [
      { id: 'ex-h1', name: 'High Knees', sets: 3, workSeconds: 30, restSeconds: 15, orderIndex: 0 },
      { id: 'ex-h2', name: 'Burpees', sets: 3, workSeconds: 30, restSeconds: 15, orderIndex: 1 },
      { id: 'ex-h3', name: 'Plank Shoulder Taps', sets: 3, workSeconds: 30, restSeconds: 15, orderIndex: 2 },
      { id: 'ex-h4', name: 'Lunges', sets: 3, workSeconds: 30, restSeconds: 15, orderIndex: 3 },
      { id: 'ex-h5', name: 'Bicycle Crunches', sets: 3, workSeconds: 30, restSeconds: 15, orderIndex: 4 },
    ],
  },
  {
    id: 'preset-strength',
    title: 'Strength & Hypertrophy',
    description: 'Longer sets and adequate rest for muscle building and strength endurance.',
    interExerciseRest: 60,
    isDefault: true,
    exercises: [
      { id: 'ex-s1', name: 'Dumbbell Goblet Squats', sets: 4, workSeconds: 45, restSeconds: 45, orderIndex: 0 },
      { id: 'ex-s2', name: 'Dumbbell Floor Press', sets: 4, workSeconds: 45, restSeconds: 45, orderIndex: 1 },
      { id: 'ex-s3', name: 'Dumbbell Rows', sets: 4, workSeconds: 45, restSeconds: 45, orderIndex: 2 },
      { id: 'ex-s4', name: 'Overhead Shoulder Press', sets: 4, workSeconds: 45, restSeconds: 45, orderIndex: 3 },
    ],
  },
  {
    id: 'preset-core',
    title: 'Core Blaster',
    description: 'Abdominal and core endurance routine.',
    interExerciseRest: 25,
    isDefault: true,
    exercises: [
      { id: 'ex-c1', name: 'Plank Hold', sets: 3, workSeconds: 45, restSeconds: 15, orderIndex: 0 },
      { id: 'ex-c2', name: 'Russian Twists', sets: 3, workSeconds: 40, restSeconds: 15, orderIndex: 1 },
      { id: 'ex-c3', name: 'Leg Raises', sets: 3, workSeconds: 40, restSeconds: 15, orderIndex: 2 },
      { id: 'ex-c4', name: 'Superman Hold', sets: 3, workSeconds: 35, restSeconds: 15, orderIndex: 3 },
    ],
  },
];
