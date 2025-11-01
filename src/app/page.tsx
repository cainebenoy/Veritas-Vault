import { Suspense } from 'react';
import ArchiveForm from '@/components/archive-form';
import ArchiveGallery, { GallerySkeleton } from '@/components/archive-gallery';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center">
      <div className="w-full max-w-5xl px-4 py-8 md:py-16">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-headline">
            Veritas Vault
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Permanently archive any web page. Your safeguard against broken links and lost information.
          </p>
        </header>

        <section className="mb-16">
          <ArchiveForm />
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tight text-primary mb-8 font-headline">
            Recently Archived
          </h2>
          <Suspense fallback={<GallerySkeleton />}>
            <ArchiveGallery />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
