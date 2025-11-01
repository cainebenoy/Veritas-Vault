import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

interface FirebaseServices {
  app: FirebaseApp;
  firestore: Firestore;
}

let services: FirebaseServices | null = null;

// This function initializes and returns the Firebase Client SDK services for server-side use.
// It ensures that initialization only happens once.
function getFirebase(): FirebaseServices {
  if (services) {
    return services;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  services = {
    app,
    firestore,
  };

  return services;
}

export { getFirebase };
