import { localDb } from './localDb';

export const collection = (d: any, path: string) => {
    return { __isLocal: true, path, type: 'collection' };
};

export const doc = (d: any, path: string, ...segments: string[]) => {
    const fullPath = segments.length ? `${path}/${segments.join('/')}` : path;
    return { __isLocal: true, path: fullPath, type: 'doc' };
};

export const getDoc = async (docRef: any) => {
    const parts = docRef.path.split('/');
    const store = parts[0];
    const id = parts.slice(1).join('/') || 'default';
    const data = await localDb.get(store, id);
    return {
        exists: () => !!data,
        data: () => data,
        id
    };
};

export const getDocs = async (queryRef: any) => {
    const store = queryRef.path;
    let data = await localDb.getAll(store);
    
    // Naive local query filtering
    if (queryRef.filters) {
        for (const filter of queryRef.filters) {
            data = data.filter(item => {
                const val = item[filter.field];
                if (filter.op === '==') return val === filter.value;
                if (filter.op === 'in') return filter.value.includes(val);
                if (filter.op === 'array-contains') return Array.isArray(val) && val.includes(filter.value);
                return true;
            });
        }
    }
    
    if (queryRef.limitCount) {
        data = data.slice(0, queryRef.limitCount);
    }

    return {
        empty: data.length === 0,
        docs: data.map(item => ({
            exists: () => true,
            data: () => item,
            id: item.id
        }))
    };
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
    const parts = docRef.path.split('/');
    const store = parts[0];
    const id = parts.slice(1).join('/') || 'default';
    
    let finalData = data;
    if (options?.merge) {
        const existing = await localDb.get(store, id);
        finalData = { ...existing, ...data };
    }
    finalData.id = id;
    await localDb.set(store, finalData);
};

export const updateDoc = async (docRef: any, data: any) => {
    const parts = docRef.path.split('/');
    const store = parts[0];
    const id = parts.slice(1).join('/') || 'default';
    const existing = await localDb.get(store, id);
    if (existing) {
        await localDb.set(store, { ...existing, ...data });
    }
};

export const deleteDoc = async (docRef: any) => {
    const parts = docRef.path.split('/');
    const store = parts[0];
    const id = parts.slice(1).join('/') || 'default';
    await localDb.delete(store, id);
};

export const addDoc = async (collectionRef: any, data: any) => {
    const store = collectionRef.path;
    const id = Math.random().toString(36).substring(2, 15);
    data.id = id;
    await localDb.set(store, data);
    return { id, __isLocal: true, path: `${store}/${id}` };
};

export const query = (collectionRef: any, ...constraints: any[]) => {
    const filters = constraints.filter(c => c.type === 'where');
    const limitCount = constraints.find(c => c.type === 'limit')?.value;
    return { ...collectionRef, filters, limitCount };
};

export const where = (field: string, op: string, value: any) => {
    return { type: 'where', field, op, value, _firestore: null };
};

export const orderBy = (field: string, dir?: string) => {
    return { type: 'orderBy', field, dir };
};

export const limit = (count: number) => {
    return { type: 'limit', value: count };
};

export const onSnapshot = (ref: any, callback: any) => {
    let active = true;
    let lastData = '';
    
    const poll = async () => {
        if (!active) return;
        try {
            if (ref.type === 'doc') {
                const docData = await getDoc(ref);
                const currentData = JSON.stringify(docData.data());
                if (currentData !== lastData) {
                    lastData = currentData;
                    callback(docData);
                }
            } else {
                const docsData = await getDocs(ref);
                const currentData = JSON.stringify(docsData.docs.map(d => d.data()));
                if (currentData !== lastData) {
                    lastData = currentData;
                    callback(docsData);
                }
            }
        } catch (e) {}
        setTimeout(poll, 2000);
    };
    poll();
    
    return () => { active = false; };
};

export const runTransaction = async (db: any, updateFunction: any) => {
    const tx = {
        get: async (ref: any) => getDoc(ref),
        set: (ref: any, data: any) => { setDoc(ref, data); },
        update: (ref: any, data: any) => { updateDoc(ref, data); },
        delete: (ref: any) => { deleteDoc(ref); }
    };
    await updateFunction(tx);
};

export const writeBatch = (db: any) => {
    const ops: any[] = [];
    return {
        set: (ref: any, data: any) => { ops.push(() => setDoc(ref, data)); return this; },
        update: (ref: any, data: any) => { ops.push(() => updateDoc(ref, data)); return this; },
        delete: (ref: any) => { ops.push(() => deleteDoc(ref)); return this; },
        commit: async () => { for (const op of ops) await op(); }
    };
};

export const increment = (n: number) => n;
export const arrayUnion = (...elements: any[]) => elements;
export const arrayRemove = (...elements: any[]) => elements;

export const Timestamp = {
    now: () => ({ toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000) })
};
export const initializeFirestore = () => ({ __isLocal: true });
export const getFirestore = () => ({ __isLocal: true });
export const enableIndexedDbPersistence = async () => {};
export const CACHE_SIZE_UNLIMITED = -1;
