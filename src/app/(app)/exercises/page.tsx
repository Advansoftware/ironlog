import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { exerciseLibrary, muscleGroups } from '@/lib/data';
import type { MuscleGroup } from '@/lib/types';
import { Weight } from 'lucide-react';

export default function ExercisesPage() {
  return (
    <>
      <PageHeader
        title="Exercise Library"
        description="Browse exercises by muscle group."
      />

      <Tabs defaultValue={muscleGroups[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-4">
          {muscleGroups.map((group) => (
            <TabsTrigger key={group} value={group}>
              {group}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {muscleGroups.map((group) => (
          <TabsContent key={group} value={group}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {exerciseLibrary
                .filter((ex) => ex.muscleGroup === group)
                .map((exercise) => (
                  <Card key={exercise.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        {exercise.name}
                      </CardTitle>
                      <Weight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        {exercise.muscleGroup}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
