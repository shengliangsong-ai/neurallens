
import { initializeApp, getApps } from '/services/mockApp';
import type { FirebaseApp } from '/services/mockApp';
import { getAuth, setPersistence, browserLocalPersistence } from '/services/mockAuth';
import type { Auth } from '/services/mockAuth';
import { initializeFirestore, getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from '/services/localFirestoreAdapter';
import type { Firestore } from '/services/localFirestoreAdapter';
import { getStorage } from '/services/mockStorage';
import type { FirebaseStorage } from '/services/mockStorage';
// Import config safely using import.meta.glob to avoid build errors if the file is missing (e.g. on GitHub)
const configModules = import.meta.glob('../firebase-applet-config.json', { eager: true });
const configKey = Object.keys(configModules)[0];

const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID
};

const firebaseConfig = configKey ? (configModules[configKey] as any).default : envConfig;

/**
 * Standard Firebase Initialization
 */
const initializeFirebase = (): FirebaseApp | null => {
    try {
        const existingApps = getApps();
        if (existingApps.length > 0) {
            return existingApps[0];
        }

        if (firebaseConfig && firebaseConfig.apiKey) {
            return initializeApp(firebaseConfig);
        }
    } catch (err) {
        console.error("[Firebase] Initialization failed:", err);
    }
    return null;
};

const appInstance = initializeFirebase();

/**
 * CRITICAL CONNECTIVITY FIX:
 * Forces long-polling and disables fetch streams to bypass environment-level WebSocket blocking.
 */
const initDb = (): Firestore | null => {
    if (!appInstance) return null;
    
    let firestore: Firestore;
    try {
        // initializeFirestore MUST be called before any other getFirestore call
        firestore = initializeFirestore(appInstance, {
            experimentalForceLongPolling: true,
            cacheSizeBytes: CACHE_SIZE_UNLIMITED
        }, firebaseConfig.firestoreDatabaseId);
        console.log("[Firestore] Relational Plane: Long-Polling Force Engaged.");
    } catch (e) {
        console.warn("[Firestore] Re-initialization skipped, falling back to existing instance.");
        firestore = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
    }

    enableIndexedDbPersistence(firestore).catch((err) => {
        if (err.code !== 'failed-precondition') {
            console.warn("[Firestore] Persistence fault:", err.message);
        }
    });

    return firestore;
};

const authInstance: Auth | null = appInstance ? getAuth(appInstance) : null;

if (authInstance) {
    setPersistence(authInstance, browserLocalPersistence).catch(console.error);
}

export const auth = authInstance;
export const db: Firestore | any = initDb() || { __isLocal: true };
export const storage: FirebaseStorage | any = appInstance ? getStorage(appInstance, firebaseConfig.storageBucket) : { __isLocal: true };

export const getFirebaseDiagnostics = () => {
    return {
        isInitialized: !!appInstance,
        hasAuth: !!auth,
        hasFirestore: !!db,
        projectId: firebaseConfig?.projectId || "Missing",
        configSource: 'Static Config'
    };
};

export default appInstance;
