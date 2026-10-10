// export const ACCESS_TOKEN_STORAGE_KEY = "@app:accessToken";
// export const LEGACY_TOKENS_STORAGE_KEY = "@app:tokens";

// const USER_BROWSER_STORAGE_KEYS = [
//     ACCESS_TOKEN_STORAGE_KEY,
//     LEGACY_TOKENS_STORAGE_KEY,
//     "@app:user",
//     "@app-storage",
//     "@user-storage",
//     "@Route-storage",
//     "@Checkout-storage",
//     "@admin:read-notifications",
//     "mercado-craibas-product-reviews",
// ];

// const removeKeys = (storage: Storage) => {
//     USER_BROWSER_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
// };

// export const getStoredAccessToken = () => {
//     localStorage.removeItem(LEGACY_TOKENS_STORAGE_KEY);
//     return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
// };

// export const setStoredAccessToken = (token: string) => {
//     localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
//     localStorage.removeItem(LEGACY_TOKENS_STORAGE_KEY);
// };

// export const clearStoredTokens = () => {
//     localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
//     localStorage.removeItem(LEGACY_TOKENS_STORAGE_KEY);
// };

// export const clearBrowserUserData = () => {
//     removeKeys(localStorage);
//     removeKeys(sessionStorage);
// };

export const ACCESS_TOKEN_STORAGE_KEY = "@app:accessToken";

export const LEGACY_TOKENS_STORAGE_KEY = "@app:tokens";
const SESSION_EXISTS_KEY = "@app:sessionExists";
/**
 * Access Token fica SOMENTE em memória.
 *
 * Não armazenar no localStorage/sessionStorage.
 */
let accessToken: string | null = null;

const USER_BROWSER_STORAGE_KEYS = [

    "@app:user",

    "@app-storage",

    "@user-storage",

    "@Route-storage",

    "@Checkout-storage",

    "@admin:read-notifications",

    "mercado-craibas-product-reviews",

];

const removeKeys = (storage: Storage) => {

    USER_BROWSER_STORAGE_KEYS.forEach((key) => {
        storage.removeItem(key);
    });

};

/**
 * Retorna o Access Token atual.
 *
 * O token existe somente enquanto
 * a aplicação estiver aberta.
 */
export const getStoredAccessToken = (): string | null => {

    return accessToken;

};

/**
 * Atualiza o Access Token em memória.
 */
export const setStoredAccessToken = (
    token: string | null
) => {

    accessToken = token;

};

/**
 * Remove o Access Token da memória.
 */
export const clearStoredTokens = () => {

    accessToken = null;

};

/**
 * Limpa dados persistidos do navegador.
 *
 * O Access Token não precisa ser removido daqui
 * porque ele já está somente em memória.
 */
export const clearBrowserUserData = () => {

    accessToken = null;
    removeKeys(localStorage);
    removeKeys(sessionStorage);

};
export const hasStoredSession = (): boolean => {
    return localStorage.getItem(SESSION_EXISTS_KEY) === "true";
};

export const setStoredSession = (exists: boolean) => {

    if (exists) {
        localStorage.setItem(
            SESSION_EXISTS_KEY,
            "true"
        );
    } else {
        localStorage.removeItem(
            SESSION_EXISTS_KEY
        );
    }
};