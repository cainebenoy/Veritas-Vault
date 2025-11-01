
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, where, Query, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import ArchiveCard from './archive-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader } from 'lucide-react';
import type { Archive } from '@/lib/types';
import { useInView } from 'react-intersection-observer';

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
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1 });
  
  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchArchives = useCallback(async (isInitialLoad = false) => {
    if (!firestore) return;

    if (isInitialLoad) {
      setIsLoading(true);
      setArchives([]);
      setLastDoc(null);
      setHasMore(true);
    } else {
      if (isFetchingMore || !hasMore) return;
      setIsFetchingMore(true);
    }
    
    let q: Query<DocumentData> = query(collection(firestore, 'archives'), orderBy('createdAt', 'desc'));

    if (debouncedSearchTerm) {
      // This is a prefix search. For a full-text search, a third-party service like Algolia is recommended.
      q = query(q, 
          where('title', '>=', debouncedSearchTerm),
          where('title', '<=', debouncedSearchTerm + '\uf8ff')
      );
    }

    const cursor = isInitialLoad ? null : lastDoc;
    if (cursor) {
      q = query(q, startAfter(cursor));
    }

    q = query(q, limit(PAGE_SIZE));

    try {
      const documentSnapshots = await getDocs(q);
      const newArchives = documentSnapshots.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Archive[];
      const newLastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1] || null;

      setArchives(prev => isInitialLoad ? newArchives : [...prev, ...newArchives]);
      setLastDoc(newLastDoc);
      setHasMore(newArchives.length === PAGE_SIZE);

    } catch (error) {
      console.error("Error fetching archives:", error);
    } finally {
      if (isInitialLoad) setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [firestore, debouncedSearchTerm, isFetchingMore, hasMore, lastDoc]);

  // Effect for initial load and when search term changes
  useEffect(() => {
    if (firestore) {
      fetchArchives(true);
    }
    // We only want this to run when the debounced search term changes, or on initial load.
  }, [debouncedSearchTerm, firestore]);

  // Effect for infinite scroll
  useEffect(() => {
    if (inView && !isLoading && !isFetchingMore && hasMore) {
      fetchArchives(false);
    }
  }, [inView, isLoading, isFetchingMore, hasMore, fetchArchives]);

  return (
    <section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Recently Archived
            </h2>
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                />
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
      
      {/* This div is the trigger for infinite scrolling */}
      <div ref={ref} className="h-8 flex justify-center items-center mt-8">
        {isFetchingMore && <Loader className="h-6 w-6 animate-spin text-primary" />}
        {!hasMore && !isLoading && archives.length > 0 && (
          <p className="text-muted-foreground text-sm">You've reached the end.</p>
        )}
      </div>
    </section>
  );
}
