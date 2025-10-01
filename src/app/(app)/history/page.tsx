import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { history, getExerciseName } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { Clock, Dumbbell, Repeat, Weight } from 'lucide-react';

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="Workout History"
        description="Review your past sessions and track consistency."
      />
      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {history.map((session) => (
              <AccordionItem value={session.id} key={session.id}>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left pr-4">
                    <span className="font-semibold text-lg">{session.name}</span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{format(parseISO(session.date), 'MMMM do, yyyy')}</span>
                        <div className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>{session.duration} min</span>
                        </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-4">
                    {session.exercises.map((exercise, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-md mb-2 flex items-center gap-2">
                           <Dumbbell className="size-4 text-primary" />
                           {getExerciseName(exercise.exerciseId)}
                        </h4>
                        <div className="space-y-1 pl-6">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="w-16">Set {setIndex + 1}</span>
                              <div className="flex items-center gap-1">
                                <Repeat className="size-3"/>
                                <span>{set.reps} reps</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Weight className="size-3"/>
                                <span>{set.weight} kg</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
}
