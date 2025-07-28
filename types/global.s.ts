// types/global.d.ts
declare global {
    interface Window {
        handleSignInWithGoogle?: (response: any) => Promise<void>;
    }
}

export {};