import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'NeuralHubDB';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initLocalDb = async () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const stores = [
                    'channels', 'users', 'discussions', 'blogs', 'blog_posts', 
                    'groups', 'bookings', 'cards', 'checks', 'notebooks', 
                    'code_projects', 'feedback', 'cloud_files', 'receipts', 'invitations',
                    'activity_logs', 'transactions', 'custom_books', 'job_postings', 'career_applications',
                    'recordings', 'chat_channels', 'mock_interviews', 'badges',
                    'system_book_metadata', 'lecture_cache', 'neural_audio_ledger', 'whiteboards',
                    'icons', 'shipping', 'coin_transactions', 'bible_ledger', 'signed_documents',
                    'public_channels', 'user_channels', 'public_groups', 'app_state'
                ];
                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store, { keyPath: 'id' });
                    }
                });
            },
        });
    }
    return dbPromise;
};

export const localDb = {
    async get(store: string, id: string) {
        const db = await initLocalDb();
        return db.get(store, id);
    },
    async set(store: string, data: any) {
        const db = await initLocalDb();
        if (!data.id) throw new Error("Data must have an id");
        return db.put(store, data);
    },
    async getAll(store: string) {
        const db = await initLocalDb();
        return db.getAll(store);
    },
    async delete(store: string, id: string) {
        const db = await initLocalDb();
        return db.delete(store, id);
    }
};
