export const GoogleAuthProvider = class {
    static credentialFromResult() { return {}; }
    addScope() {}
};
export const GithubAuthProvider = class {
    static credentialFromResult() { return {}; }
    addScope() {}
};
export const signInWithPopup = async () => ({ user: {} });
export const linkWithPopup = async () => ({ user: {} });
export const signOut = async () => {};
export const getAuth = () => ({});
export const onAuthStateChanged = (auth: any, cb: any) => { cb(null); return () => {}; };
export const setPersistence = async () => {};
export const browserLocalPersistence = {};
