import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// En entorno de pruebas si no existe una llave real, generamos una aleatoria de 32 bytes (NO SEGURO PARA PROD: se perderían los datos al reiniciar)
// En producción, ENCRYPTION_KEY debe estar en .env como una cadena base64 o hex de 32 bytes.
const RAW_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
// Asegurar buffer de 32 bytes
const ENCRYPTION_KEY = Buffer.from(RAW_KEY, 'hex').subarray(0, 32); 

export interface EncryptedData {
    iv: string;
    authTag: string;
    encryptedText: string;
}

export function encryptString(text: string): EncryptedData {
    const iv = crypto.randomBytes(12); // GCM recomendado: 12 bytes
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
        iv: iv.toString('hex'),
        authTag: authTag,
        encryptedText: encrypted
    };
}

export function decryptString(encryptedData: EncryptedData): string {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}
