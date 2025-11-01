import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
     <main className="flex min-h-screen w-full flex-col items-center bg-background">
      <div className="w-full max-w-7xl px-4 py-8 md:py-12">
        <header className="mb-8">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-3/4 mt-6" />
            <Skeleton className="h-6 w-28 mt-4" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="w-full h-[70vh] rounded-md" />
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-full mt-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </main>
  );
}
