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
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

type ArchiveCardProps = {
  archive: Archive;
};

export default function ArchiveCard({ archive }: ArchiveCardProps) {
  const formattedDate = new Date(archive.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/archives/${archive.id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="aspect-video w-full overflow-hidden relative">
            <Image
              src={archive.screenshotUrl}
              alt={`Screenshot of ${archive.title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="website screenshot"
            />
          </div>
        </CardContent>
        <CardHeader className="flex-grow">
          <CardTitle className="leading-tight group-hover:text-primary">{archive.title}</CardTitle>
          <CardDescription className="mt-2 truncate">{archive.originalUrl}</CardDescription>
        </CardHeader>
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
