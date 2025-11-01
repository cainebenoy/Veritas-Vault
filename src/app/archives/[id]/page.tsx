
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArchiveById } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, Globe, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type PageProps = {
  params: { id: string };
};

export default async function ArchivePage({ params }: PageProps) {
  const archive = await getArchiveById(params.id);

  if (!archive) {
    notFound();
  }
  
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
    return new Date(); // Fallback
  };

  const formattedDate = getDate().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  
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
            {archive.status === 'complete' && <Badge variant="secondary" className="mt-4">Archive Complete</Badge>}
            {archive.status === 'failed' && <Badge variant="destructive" className="mt-4">Archive Failed</Badge>}
            {archive.status === 'pending' && <Badge variant="outline" className="mt-4">Archive In Progress...</Badge>}
        </header>

        {archive.status === 'failed' && (
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
          <div>
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
          </div>
        </div>
      </div>
    </main>
  );
}
