import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

interface FirebaseAdminServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

function getFirebase(): FirebaseAdminServices {
  if (getApps().length > 0) {
    const app = getApp();
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }

  const app = initializeApp({ projectId: firebaseConfig.projectId });

  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}

export { getFirebase };
