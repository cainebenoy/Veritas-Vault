
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getArchiveById } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, Globe, ShieldCheck, AlertTriangle, Tag } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { Archive } from '@/lib/types';
import ArchiveQRCode from '@/components/archive-qrcode';

type PageProps = {
  params: { id: string };
};

export default async function ArchivePage({ params }: PageProps) {
  const archive: Archive & { content: string } | undefined = await getArchiveById(params.id);

  if (!archive) {
    notFound();
  }

  const headersList = headers();
  const host = headersList.get('host') || '';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const pageUrl = `${protocol}://${host}/archives/${archive.id}`;
  
  // This function safely handles date conversion from various formats.
  const getDate = () => {
    if (!archive.createdAt) return null;

    // Handle Firestore Timestamp object (if it's not pre-serialized)
    if (typeof archive.createdAt === 'object' && 'toMillis' in archive.createdAt && typeof archive.createdAt.toMillis === 'function') {
      return new Date(archive.createdAt.toMillis());
    }
    // Handle number (milliseconds from server action)
    if (typeof archive.createdAt === 'number') {
        return new Date(archive.createdAt);
    }
    // Handle ISO string
    if (typeof archive.createdAt === 'string') {
        const date = new Date(archive.createdAt);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    return null; // Return null if format is unrecognized
  };
  
  const date = getDate();
  const formattedDate = date ? date.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    }) : 'Date not available';
  
  const metadataItems = [
    {
      icon: <Globe className="h-4 w-4" />,
      label: 'Original URL',
      value: archive.originalUrl,
      href: archive.originalUrl,
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
      label: 'IPFS Link',
      value: archive.ipfsUrl,
      href: archive.ipfsUrl ? `https://ipfs.io/ipfs/${archive.ipfsUrl.replace('ipfs://', '')}` : undefined,
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: 'Polygon Amoy TX',
      value: archive.blockchainTx ? archive.blockchainTx.substring(0, 20) + '...' : undefined,
      href: archive.blockchainTx ? `https://www.oklink.com/amoy/tx/${archive.blockchainTx}` : undefined,
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: 'Archived On',
      value: formattedDate,
    },
  ];

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background">
      <div className="w-full max-w-7xl px-4 py-8 md:py-12">
        <header className="mb-8">
            <Button variant="outline" asChild>
                <Link href="/">&larr; Back to Gallery</Link>
            </Button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mt-6 font-headline break-words">
            {archive.title}
          </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4">
                {archive.archiveStatus === 'complete' && <Badge variant="secondary">Archive Complete</Badge>}
                {archive.archiveStatus === 'failed' && <Badge variant="destructive">Archive Failed</Badge>}
                {archive.archiveStatus === 'pending' && <Badge variant="outline">Archive In Progress...</Badge>}
                
                {archive.tags && archive.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                        {archive.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="font-normal">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </header>

        {archive.archiveStatus === 'failed' && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Archiving Failed</AlertTitle>
            <AlertDescription>
              {archive.failureReason || 'An unknown error occurred during the archiving process.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Archived Content</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  srcDoc={archive.content}
                  className="w-full h-[70vh] rounded-md border bg-white"
                  sandbox="allow-same-origin"
                  title="Archived Content"
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Archive Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {metadataItems.map(item => item.value ? (
                    <li key={item.label}>
                      <div className="flex items-center text-sm font-semibold text-muted-foreground">
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </div>
                      {item.href ? (
                         <Link href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center group">
                            <p className="mt-1 text-sm text-foreground break-all group-hover:underline">{item.value}</p>
                            <ExternalLink className="h-4 w-4 ml-2 text-muted-foreground shrink-0"/>
                        </Link>
                      ) : (
                        <p className="mt-1 text-sm text-foreground break-all">{item.value}</p>
                      )}
                    </li>
                  ) : null)}
                </ul>
              </CardContent>
            </Card>

            <ArchiveQRCode url={pageUrl} />
            
          </div>
        </div>
      </div>
    </main>
  );
}
