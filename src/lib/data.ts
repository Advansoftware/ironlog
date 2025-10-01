import type { Exercise, WorkoutRoutine, WorkoutSession, PersonalRecord, MuscleGroup } from '@/lib/types';

export const exerciseLibrary: Exercise[] = [
  { id: 'ex1', name: 'Bench Press', muscleGroup: 'Chest' },
  { id: 'ex2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { id: 'ex3', name: 'Dumbbell Flyes', muscleGroup: 'Chest' },
  { id: 'ex4', name: 'Pull Ups', muscleGroup: 'Back' },
  { id: 'ex5', name: 'Bent Over Rows', muscleGroup: 'Back' },
  { id: 'ex6', name: 'Deadlift', muscleGroup: 'Back' },
  { id: 'ex7', name: 'Squat', muscleGroup: 'Legs' },
  { id: 'ex8', name: 'Leg Press', muscleGroup: 'Legs' },
  { id: 'ex9', name: 'Lunges', muscleGroup: 'Legs' },
  { id: 'ex10', name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { id: 'ex11', name: 'Lateral Raises', muscleGroup: 'Shoulders' },
  { id: 'ex12', name: 'Bicep Curls', muscleGroup: 'Arms' },
  { id: 'ex13', name: 'Tricep Pushdowns', muscleGroup: 'Arms' },
  { id: 'ex14', name: 'Plank', muscleGroup: 'Core' },
  { id: 'ex15', name: 'Crunches', muscleGroup: 'Core' },
];

export const routines: WorkoutRoutine[] = [
  {
    id: 'rt1',
    name: 'Push Day',
    exercises: [
      { exerciseId: 'ex1', targetSets: 3, targetReps: 5, targetWeight: 100 },
      { exerciseId: 'ex2', targetSets: 3, targetReps: 8, targetWeight: 30 },
      { exerciseId: 'ex10', targetSets: 3, targetReps: 8, targetWeight: 60 },
      { exerciseId: 'ex13', targetSets: 3, targetReps: 12, targetWeight: 20 },
    ],
  },
  {
    id: 'rt2',
    name: 'Pull Day',
    exercises: [
      { exerciseId: 'ex4', targetSets: 3, targetReps: 8 },
      { exerciseId: 'ex5', targetSets: 3, targetReps: 8 },
      { exerciseId: 'ex12', targetSets: 3, targetReps: 12 },
    ],
  },
  {
    id: 'rt3',
    name: 'Leg Day',
    exercises: [
      { exerciseId: 'ex7', targetSets: 3, targetReps: 5 },
      { exerciseId: 'ex8', targetSets: 3, targetReps: 10 },
      { exerciseId: 'ex9', targetSets: 3, targetReps: 12 },
    ],
  },
];

export const history: WorkoutSession[] = [
  {
    id: 'ws1',
    name: 'Push Day',
    date: '2024-07-15T10:00:00Z',
    duration: 60,
    exercises: [
      { exerciseId: 'ex1', sets: [{ reps: 5, weight: 100, completed: true }, { reps: 5, weight: 100, completed: true }, { reps: 5, weight: 100, completed: true }] },
      { exerciseId: 'ex2', sets: [{ reps: 8, weight: 30, completed: true }, { reps: 8, weight: 30, completed: true }, { reps: 7, weight: 30, completed: true }] },
    ],
  },
  {
    id: 'ws2',
    name: 'Push Day',
    date: '2024-07-22T10:00:00Z',
    duration: 65,
    exercises: [
      { exerciseId: 'ex1', sets: [{ reps: 5, weight: 102.5, completed: true }, { reps: 5, weight: 102.5, completed: true }, { reps: 4, weight: 102.5, completed: true }] },
      { exerciseId: 'ex2', sets: [{ reps: 8, weight: 32.5, completed: true }, { reps: 8, weight: 32.5, completed: true }, { reps: 8, weight: 32.5, completed: true }] },
    ],
  },
    {
    id: 'ws3',
    name: 'Leg Day',
    date: '2024-07-24T18:00:00Z',
    duration: 70,
    exercises: [
      { exerciseId: 'ex7', sets: [{ reps: 5, weight: 130, completed: true }, { reps: 5, weight: 130, completed: true }, { reps: 5, weight: 130, completed: true }] },
      { exerciseId: 'ex8', sets: [{ reps: 10, weight: 200, completed: true }, { reps: 10, weight: 200, completed: true }, { reps: 9, weight: 200, completed: true }] },
    ],
  },
];

export const personalRecords: PersonalRecord[] = [
    { exerciseId: 'ex1', weight: 102.5, reps: 5, date: '2024-07-22' },
    { exerciseId: 'ex7', weight: 130, reps: 5, date: '2024-07-24' },
    { exerciseId: 'ex2', weight: 32.5, reps: 8, date: '2024-07-22' },
];

export const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

export function getExerciseName(exerciseId: string) {
    return exerciseLibrary.find(ex => ex.id === exerciseId)?.name ?? 'Unknown Exercise';
}
