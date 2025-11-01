'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, where, Query, DocumentData } from 'firebase/firestore';
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
  const [archives, setArchives] = useState<Archive[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { ref, inView } = useInView({ threshold: 0 });

  const buildQuery = useCallback((startAfterDoc: any = null) => {
    if (!firestore) return null;

    let q: Query<DocumentData> = query(collection(firestore, 'archives'), orderBy('createdAt', 'desc'));

    if (searchTerm) {
        // Firestore doesn't support case-insensitive 'contains' queries.
        // This query performs a "starts with" search, which is a reasonable compromise.
        q = query(q, 
            where('title', '>=', searchTerm),
            where('title', '<=', searchTerm + '\uf8ff')
        );
    }
    
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    return query(q, limit(PAGE_SIZE));
  }, [firestore, searchTerm]);


  const fetchArchives = useCallback(async (isInitial = false) => {
    if (!firestore || (!hasMore && !isInitial) || isFetchingMore) return;

    if (isInitial) {
        setIsLoading(true);
        setArchives([]);
        setLastDoc(null);
        setHasMore(true);
    } else {
        setIsFetchingMore(true);
    }

    const q = buildQuery(isInitial ? null : lastDoc);
    if (!q) {
      setIsLoading(false);
      setIsFetchingMore(false);
      return
    };

    try {
      const documentSnapshots = await getDocs(q);
      const newArchives = documentSnapshots.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Archive[];
      
      setArchives(prev => isInitial ? newArchives : [...prev, ...newArchives]);
      setLastDoc(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setHasMore(newArchives.length === PAGE_SIZE);

    } catch (error) {
      console.error("Error fetching archives:", error);
    } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
    }
  }, [firestore, hasMore, isFetchingMore, buildQuery]);

  // Initial fetch and search fetch
  useEffect(() => {
    const handler = setTimeout(() => {
        if(firestore) {
            fetchArchives(true);
        }
    }, 300); // Debounce search
    return () => clearTimeout(handler);
  }, [searchTerm, firestore]);

  // Infinite scroll
  useEffect(() => {
    if (inView && !isFetchingMore && hasMore && !isLoading) {
      fetchArchives();
    }
  }, [inView, fetchArchives, isFetchingMore, hasMore, isLoading]);

  return (
    <section>
        <div className="flex justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Recently Archived
            </h2>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
      </div>

      {isLoading && <GallerySkeleton />}
      
      {!isLoading && archives.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-medium text-muted-foreground">
            {searchTerm ? 'No results found.' : 'No archives yet.'}
          </h3>
          <p className="text-muted-foreground mt-2">
             {searchTerm ? 'Try a different search term.' : 'Be the first to archive a page!'}
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

       <div ref={ref} className="flex justify-center mt-8">
            {isFetchingMore ? (
                <Button disabled variant="outline">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                </Button>
            ) : hasMore && !isLoading && archives.length > 0 ? (
                 <div className="h-8"></div>
            ) : (
                !isLoading && archives.length > 0 && <p className="text-muted-foreground text-sm">You've reached the end.</p>
            )}
        </div>
    </section>
  );
}
