import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

interface FirebaseAdminServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

let adminServices: FirebaseAdminServices | null = null;

function getFirebase(): FirebaseAdminServices {
  if (adminServices) {
    return adminServices;
  }

  if (getApps().length > 0) {
    const app = getApp();
    adminServices = {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
    return adminServices;
  }

  const app = initializeApp({ projectId: firebaseConfig.projectId });

  adminServices = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
  
  return adminServices;
}

export { getFirebase };
