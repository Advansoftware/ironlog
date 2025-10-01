
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
           <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-between mt-1.5">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-10 w-16 mb-2" />
             <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-10 w-16 mb-2" />
             <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-10 w-16 mb-2" />
             <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
      </div>

       <Card className="mt-8">
        <CardHeader>
            <Skeleton className="h-7 w-32" />
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-full" />
            </div>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div>
                    <Skeleton className="h-6 w-36 mb-2" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
