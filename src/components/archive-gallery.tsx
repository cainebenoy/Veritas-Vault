
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import ArchiveCard from './archive-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Tag } from 'lucide-react';
import type { Archive } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

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
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.toLowerCase());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);


  useEffect(() => {
    if (!firestore) return;

    setIsLoading(true);

    let q = query(collection(firestore, 'archives'), orderBy('createdAt', 'desc'));

    // Apply active tag filter
    if (activeTag) {
      q = query(q, where('tags', 'array-contains', activeTag));
    }

    // Apply search filter (works on top of tag filter)
    if (debouncedSearchTerm) {
      // For a more robust search, this would ideally search multiple fields.
      // Firestore doesn't support OR queries on different fields easily, so we
      // search title OR tags. A common solution is a dedicated search field in the doc
      // that aggregates searchable content. For this hackathon, we'll keep it simple.
      // We will filter client-side after the Firestore query.
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let newArchives = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Archive[];

      // Client-side filtering for search term (title or tags)
      if (debouncedSearchTerm) {
        newArchives = newArchives.filter(archive =>
          archive.title.toLowerCase().includes(debouncedSearchTerm) ||
          (archive.tags && archive.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm)))
        );
      }

      setArchives(newArchives);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time archives:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, debouncedSearchTerm, activeTag]);

  const handleTagClick = (tag: string) => {
    setSearchTerm(''); // Clear search when a tag is clicked
    setDebouncedSearchTerm('');
    setActiveTag(currentTag => currentTag === tag ? null : tag); // Toggle tag filter
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setActiveTag(null);
  }

  const isFiltering = !!activeTag || !!debouncedSearchTerm;

  return (
    <section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
                Recently Archived
            </h2>
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search titles & tags..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setActiveTag(null); // Clear active tag when user starts typing
                    }}
                    className="pl-10 h-11"
                />
            </div>
      </div>
      
      {isFiltering && (
        <div className="mb-6 flex items-center gap-4">
          <h3 className="text-sm font-medium text-muted-foreground">Filtering by:</h3>
          {activeTag && (
             <Badge variant="secondary" className="text-base">
                <Tag className="mr-2 h-4 w-4"/>
                {activeTag}
            </Badge>
          )}
          {debouncedSearchTerm && (
             <Badge variant="secondary" className="text-base">
                <Search className="mr-2 h-4 w-4"/>
                &quot;{debouncedSearchTerm}&quot;
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary">
            <X className="mr-2 h-4 w-4"/>
            Clear
          </Button>
        </div>
      )}

      {isLoading && <GallerySkeleton />}
      
      {!isLoading && archives.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
          <h3 className="text-xl font-medium text-muted-foreground">
            {isFiltering ? 'No results found.' : 'No archives yet.'}
          </h3>
          <p className="text-muted-foreground mt-2">
             {isFiltering ? 'Try clearing the filters or searching for something else.' : 'Be the first to archive a page!'}
          </p>
        </div>
      )}

      {archives.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {archives.map((archive) => (
            <ArchiveCard key={archive.id} archive={archive} onTagClick={handleTagClick} />
          ))}
        </div>
      )}
    </section>
  );
}
