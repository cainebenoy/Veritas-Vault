'use client';

import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import ArchiveCard from './archive-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Archive } from '@/lib/types';

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-0">
            <Skeleton className="h-48 w-full" />
          </CardContent>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export default function ArchiveGallery() {
  const firestore = useFirestore();
  
  const archivesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'archives'), orderBy('createdAt', 'desc'), limit(20));
  }, [firestore]);

  const { data: archives, isLoading } = useCollection<Archive>(archivesQuery);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (!archives || archives.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-medium text-muted-foreground">No archives yet.</h3>
        <p className="text-muted-foreground mt-2">Be the first to archive a page!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {archives.map((archive) => (
        <ArchiveCard key={archive.id} archive={archive} />
      ))}
    </div>
  );
}
