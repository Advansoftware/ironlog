import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Icons } from '@/components/icons';
import { routines } from '@/lib/data';

export default function RoutinesPage() {
  return (
    <>
      <PageHeader title="Routines" description="Create and manage your workout routines.">
        <Button>
          <Icons.Add />
          Create Routine
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <Card key={routine.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{routine.name}</CardTitle>
              <CardDescription>{routine.exercises.length} exercises</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <Button asChild className="w-full">
                <Link href="/session">
                  <Icons.Add />
                  Start Workout
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
