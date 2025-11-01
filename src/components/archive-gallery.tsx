
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, startAfter, where, Query, DocumentData, QueryDocumentSnapshot, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import ArchiveCard from './archive-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader, Trash2 } from 'lucide-react';
import type { Archive } from '@/lib/types';
import { useInView } from 'react-intersection-observer';
import { clearAllArchives } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 6;

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-0">
            <Skeleton className="aspect-video w-full" />
          </CardContent>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-1/2 mt-4" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export default function ArchiveGallery() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Note: Pagination with onSnapshot is more complex, so we'll load all results for now
  // for a real-time experience, which is suitable for a hackathon.
  // A production app might combine getDocs for pagination and a limited onSnapshot for recent items.

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);


  useEffect(() => {
    if (!firestore) return;

    setIsLoading(true);

    let q = query(collection(firestore, 'archives'), orderBy('createdAt', 'desc'));

    // Apply search filter if there is a search term
    if (debouncedSearchTerm) {
      // This is a prefix search. For a full-text search, a third-party service like Algolia is recommended.
       q = query(q, 
          where('title', '>=', debouncedSearchTerm),
          where('title', '<=', debouncedSearchTerm + '\uf8ff')
      );
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newArchives = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Archive[];
      setArchives(newArchives);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time archives:", error);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestore, debouncedSearchTerm]);

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL archives? This action cannot be undone.')) {
      const result = await clearAllArchives();
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    }
  };


  return (
    <section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Recently Archived
            </h2>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11"
                  />
              </div>
              <form action={handleClearAll}>
                <Button variant="destructive" size="icon" type="submit" aria-label="Clear all archives">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
      </div>

      {isLoading && <GallerySkeleton />}
      
      {!isLoading && archives.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
          <h3 className="text-xl font-medium text-muted-foreground">
            {debouncedSearchTerm ? 'No results found.' : 'No archives yet.'}
          </h3>
          <p className="text-muted-foreground mt-2">
             {debouncedSearchTerm ? 'Try a different search term.' : 'Be the first to archive a page!'}
          </p>
        </div>
      )}

      {archives.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {archives.map((archive) => (
            <ArchiveCard key={archive.id} archive={archive} />
          ))}
        </div>
      )}
      
       {/* Since we're using onSnapshot to show all results in real-time, the 'Load More' feature is no longer needed. */}
    </section>
  );
}
