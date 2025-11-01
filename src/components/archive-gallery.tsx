'use client';

import { useState } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import ArchiveCard from './archive-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  
  const archivesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'archives'), orderBy('createdAt', 'desc'), limit(50));
  }, [firestore]);

  const { data: archives, isLoading } = useCollection<Archive>(archivesQuery);
  
  const filteredArchives = archives?.filter(archive => 
    archive.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    archive.originalUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Recently Archived
            </h2>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title or URL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
      </div>

      {isLoading && <GallerySkeleton />}
      
      {!isLoading && (!filteredArchives || filteredArchives.length === 0) && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-medium text-muted-foreground">
            {archives && archives.length > 0 ? 'No results found.' : 'No archives yet.'}
          </h3>
          <p className="text-muted-foreground mt-2">
             {archives && archives.length > 0 ? 'Try a different search term.' : 'Be the first to archive a page!'}
          </p>
        </div>
      )}

      {!isLoading && filteredArchives && filteredArchives.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArchives.map((archive) => (
            <ArchiveCard key={archive.id} archive={archive} />
          ))}
        </div>
      )}
    </section>
  );
}
