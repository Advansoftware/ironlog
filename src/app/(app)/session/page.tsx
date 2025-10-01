import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { routines, getExerciseName } from '@/lib/data';
import { Check, Dumbbell, X } from 'lucide-react';

export default function SessionPage() {
  // Use the first routine as an example
  const routine = routines[0];

  return (
    <>
      <PageHeader title={routine.name} description="Log your workout session.">
        <div className="flex gap-2">
            <Button variant="outline">
                <X className="mr-2 size-4" />
                Cancel Workout
            </Button>
            <Button>
                <Check className="mr-2 size-4" />
                Finish Workout
            </Button>
        </div>
      </PageHeader>
      
      <div className="space-y-6">
        {routine.exercises.map((exercise) => {
            const exerciseInfo = getExerciseName(exercise.exerciseId);
            return (
                <Card key={exercise.exerciseId}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Dumbbell className="size-5 text-primary" />
                            {exerciseInfo}
                        </CardTitle>
                        <CardDescription>
                            Target: {exercise.targetSets} sets of {exercise.targetReps} reps
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-4 text-sm text-muted-foreground font-medium">
                            <span>Set</span>
                            <span>Prev</span>
                            <Label>Weight (kg)</Label>
                            <Label>Reps</Label>
                            <span>Done</span>
                        </div>
                        
                        {Array.from({ length: exercise.targetSets }).map((_, i) => (
                            <div key={i} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-4">
                                <span className="font-bold text-lg text-foreground">{i + 1}</span>
                                <span className="text-muted-foreground text-sm">-- kg x --</span>
                                <Input type="number" placeholder="Weight" defaultValue={exercise.targetWeight} />
                                <Input type="number" placeholder="Reps" defaultValue={exercise.targetReps} />
                                <Checkbox />
                            </div>
                        ))}

                        <Button variant="secondary" className="w-full">
                            Add Set
                        </Button>
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </>
  );
}
