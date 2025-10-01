import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Icons } from '@/components/icons';
import { history, personalRecords, getExerciseName, routines } from '@/lib/data';
import { format, parseISO } from 'date-fns';

export default function DashboardPage() {
  const totalWorkouts = history.length;
  const totalRoutines = routines.length;
  const latestPr = personalRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <>
      <PageHeader title="Dashboard" description="Here's a summary of your progress.">
        <Button asChild>
          <Link href="/session">
            <Icons.Add />
            Start Workout
          </Link>
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total Workouts</span>
              <Icons.History className="size-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">sessions logged</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Custom Routines</span>
              <Icons.Routines className="size-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalRoutines}</p>
            <p className="text-xs text-muted-foreground">routines created</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Latest PR</span>
                <Icons.Progress className="size-5 text-muted-foreground" />
            </CardTitle>
            <CardDescription>
                {latestPr ? `on ${format(new Date(latestPr.date), 'MMMM do')}` : 'No records yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
             {latestPr ? (
                <>
                    <p className="text-3xl font-bold">{getExerciseName(latestPr.exerciseId)}</p>
                    <p className="text-lg text-muted-foreground">{latestPr.weight}kg for {latestPr.reps} reps</p>
                </>
            ) : (
                <p className="text-lg text-muted-foreground">Log a workout to set your first PR!</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Workouts</h2>
        <Card>
            <CardContent className="p-0">
                 <div className="divide-y divide-border">
                    {history.slice(0, 3).map((session) => (
                        <div key={session.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{session.name}</p>
                                <p className="text-sm text-muted-foreground">{session.exercises.length} exercises</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{format(parseISO(session.date), 'MMM d, yyyy')}</p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
