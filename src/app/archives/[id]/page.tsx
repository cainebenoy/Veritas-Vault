import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArchiveById } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, Globe, ShieldCheck } from 'lucide-react';

type PageProps = {
  params: { id: string };
};

export default async function ArchivePage({ params }: PageProps) {
  const archive = await getArchiveById(params.id);

  if (!archive) {
    notFound();
  }

  const formattedDate = new Date(archive.createdAt as number).toLocaleString('en-US', {
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
      href: `https://ipfs.io/ipfs/${archive.ipfsUrl.replace('ipfs://', '')}`,
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: 'Polygon TX',
      value: archive.blockchainTx.substring(0, 20) + '...',
      href: `https://polygonscan.com/tx/${archive.blockchainTx}`,
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
          <Badge variant="secondary" className="mt-4">{archive.status === 'complete' ? 'Archive Complete' : 'Archive Failed'}</Badge>
        </header>

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
                  {metadataItems.map(item => (
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
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
