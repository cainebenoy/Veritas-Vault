import Link from 'next/link';
import Image from 'next/image';
import type { Archive } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Tag } from 'lucide-react';
import { Badge } from './ui/badge';

type ArchiveCardProps = {
  archive: Archive;
  onTagClick?: (tag: string) => void;
};

export default function ArchiveCard({ archive, onTagClick }: ArchiveCardProps) {
    const getDate = () => {
    if (!archive.createdAt) return new Date();
    // Check if it's a Firestore Timestamp
    if (typeof archive.createdAt === 'object' && 'toMillis' in archive.createdAt) {
      return new Date(archive.createdAt.toMillis());
    }
    // Assume it's already a number (milliseconds) if passed from server action
    if (typeof archive.createdAt === 'number') {
        return new Date(archive.createdAt);
    }
    // Handle string date
    if (typeof archive.createdAt === 'string') {
        const date = new Date(archive.createdAt);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    return null;
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    if (onTagClick) {
        e.preventDefault(); // Prevent navigating to the archive page
        e.stopPropagation(); // Stop the event from bubbling up to the Link
        onTagClick(tag);
    }
  }

  const date = getDate();
  const formattedDate = date ? date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : 'Invalid Date';


  return (
    <Link href={`/archives/${archive.id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="aspect-video w-full overflow-hidden relative">
            {archive.screenshotUrl ? (
              <Image
                src={archive.screenshotUrl}
                alt={`Screenshot of ${archive.title}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="website screenshot"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                 <Skeleton className="h-full w-full" />
              </div>
            )}
            <div className="absolute top-2 right-2">
                {archive.archiveStatus === 'pending' && <Badge variant="outline">Pending</Badge>}
                {archive.archiveStatus === 'failed' && <Badge variant="destructive">Failed</Badge>}
            </div>
          </div>
        </CardContent>
        <CardHeader className="flex-grow pb-2">
          <CardTitle className="leading-tight group-hover:text-primary">{archive.title}</CardTitle>
          <CardDescription className="mt-2 truncate">{archive.originalUrl}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            {archive.tags && archive.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {archive.tags.map(tag => (
                        <Badge 
                            key={tag} 
                            variant="secondary"
                            className={onTagClick ? "cursor-pointer hover:bg-primary/20" : ""}
                            onClick={onTagClick ? (e) => handleTagClick(e, tag) : undefined}
                        >
                          <Tag className="mr-1 h-3 w-3"/>
                          {tag}
                        </Badge>
                    ))}
                </div>
            )}
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
