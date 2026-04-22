import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let serviceAccount: any;
const LOCAL_CRED_PATH = resolve(process.cwd(), 'service-account.json');

let pDb: any = null;

try {
    if (existsSync(LOCAL_CRED_PATH)) {
        // En desarrollo local
        serviceAccount = JSON.parse(readFileSync(LOCAL_CRED_PATH, 'utf8'));
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // En producción / Railway 
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
        throw new Error("No se encontraron credenciales de Firebase.");
    }

    if (!admin.apps?.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ [Database] Géo CORE conectado a Firebase (Firestore)');
    }
    pDb = admin.firestore();
} catch (error) {
    console.error('❌ [Database] Error inicializando Firebase:', error);
}

export const db = pDb;
