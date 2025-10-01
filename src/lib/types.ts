export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
};

export type RoutineExercise = {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
};

export type WorkoutRoutine = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
};

export type LoggedSet = {
  reps: number;
  weight: number;
  completed: boolean;
};

export type LoggedExercise = {
  exerciseId: string;
  sets: LoggedSet[];
};

export type WorkoutSession = {
  id: string;
  routineId?: string;
  name: string;
  date: string; // ISO string
  exercises: LoggedExercise[];
  duration: number; // in minutes
};

export type PersonalRecord = {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
};
