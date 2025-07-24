declare module 'google-one-tap' {
    export interface CredentialResponse {
        credential: string;
        select_by: string;
    }

    export interface accounts {
        id: {
            initialize: (config: {
                client_id: string;
                callback: (response: CredentialResponse) => void;
                nonce?: string;
                use_fedcm_for_prompt?: boolean;
            }) => void;
            prompt: () => void;
        };
    }
}