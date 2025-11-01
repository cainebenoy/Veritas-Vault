
import { initializeApp, getApps, getApp, type FirebaseApp, deleteApp } from 'firebase/app';
import { getFirestore, type Firestore, terminate, enableNetwork } from 'firebase/firestore';
import { firebaseConfig } from './config';

interface FirebaseServices {
  app: FirebaseApp;
  firestore: Firestore;
}

let services: FirebaseServices | null = null;

// This function initializes and returns the Firebase Client SDK services for server-side use.
// It ensures that initialization only happens once per request cycle.
export async function getFirebase(): Promise<FirebaseServices> {
    if (services && !services.firestore.INTERNAL.isTerminated) {
        try {
            // Attempt a quick operation to check if the connection is truly alive.
            // This is a bit of a workaround for environments where connections can go stale.
            await enableNetwork(services.firestore);
            return services;
        } catch (e) {
            // If enableNetwork fails, it suggests the instance is bad. Let's re-initialize.
            if (services.app) {
                await terminate(services.firestore);
                await deleteApp(services.app);
                services = null;
            }
        }
    }

    // If services don't exist or were terminated, create a new instance.
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const firestore = getFirestore(app);

    services = {
        app,
        firestore,
    };

    return services;
}
