'use client';

import { useEffect, useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { archiveUrl } from '@/lib/actions';
import type { ArchiveState, ArchiveStatus } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Globe,
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader,
  ArrowRight,
  ClipboardCopy,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';

const initialState: ArchiveState = {
  result: 'idle',
  message: '',
};

const progressSteps: { name: ArchiveStatus; label: string; icon: React.ReactNode }[] = [
  { name: 'fetching', label: 'Fetching Content', icon: <Globe className="h-5 w-5" /> },
  { name: 'uploading', label: 'Uploading to IPFS', icon: <UploadCloud className="h-5 w-5" /> },
  { name: 'notarizing', label: 'Notarizing on Polygon', icon: <ShieldCheck className="h-5 w-5" /> },
  { name: 'complete', label: 'Archive Complete', icon: <CheckCircle2 className="h-5 w-5" /> },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Archiving...
        </>
      ) : (
        <>
          Archive URL
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export default function ArchiveForm() {
  const [state, formAction] = useFormState(archiveUrl, initialState);
  const { pending } = useFormStatus();
  const [currentProgress, setCurrentProgress] = useState<ArchiveStatus>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const auth = useAuth();

  // Sign in anonymously when the component mounts to allow writing to Firestore
  useEffect(() => {
    if (auth && !auth.currentUser) {
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in failed:", error);
      });
    }
  }, [auth]);

  useEffect(() => {
    if (pending) {
      setCurrentProgress('fetching');
      const timers = [
        setTimeout(() => setCurrentProgress('uploading'), 1500),
        setTimeout(() => setCurrentProgress('notarizing'), 3500),
        setTimeout(() => setCurrentProgress('complete'), 6000),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [pending]);

  useEffect(() => {
    if (state.result === 'success') {
      toast({
        title: 'Success!',
        description: state.message,
      });
      setCurrentProgress('idle');
      formRef.current?.reset();
    } else if (state.result === 'error') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
      setCurrentProgress('idle');
    }
  }, [state, toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: 'Copied to clipboard!' });
  };
  
  if (pending || currentProgress !== 'idle') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-center mb-6 text-primary">Archiving in Progress</h3>
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {progressSteps.map((step, index) => {
              const currentIndex = progressSteps.findIndex(p => p.name === currentProgress);
              const isCompleted = index < currentIndex;
              const isActive = index === currentIndex;

              return (
                <div key={step.name} className="flex flex-col items-center text-center">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                      isCompleted ? 'bg-primary text-primary-foreground border-primary' : 
                      isActive ? 'bg-accent text-accent-foreground border-accent' : 
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                  </div>
                  <p className={`mt-2 text-xs sm:text-sm font-medium ${
                      isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form ref={formRef} action={formAction} className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full">
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com/article-to-preserve"
              required
              className="h-12 text-base"
            />
          </div>
          <SubmitButton />
        </form>
        {state.result === 'error' && state.message && (
          <p className="mt-2 text-sm text-destructive">{state.message}</p>
        )}
      </CardContent>
      {state.result === 'success' && state.data && (
        <CardFooter>
            <Alert className="w-full bg-accent/30">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Archive Created!</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                 <div className="flex items-center justify-between">
                  <span className="text-sm font-mono truncate text-muted-foreground">IPFS: {state.data.ipfsUrl}</span>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(state.data.ipfsUrl)}>
                    <ClipboardCopy className="h-4 w-4"/>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono truncate text-muted-foreground">TX: {state.data.blockchainTx}</span>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(state.data.blockchainTx)}>
                    <ClipboardCopy className="h-4 w-4"/>
                  </Button>
                </div>
                <Link href={`/archives/${state.data.archiveId}`} passHref>
                  <Button variant="outline" className="mt-2 w-full">
                    View Archived Page <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
        </CardFooter>
      )}
    </Card>
  );
}
