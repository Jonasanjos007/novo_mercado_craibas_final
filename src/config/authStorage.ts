export const ACCESS_TOKEN_STORAGE_KEY = "@app:accessToken";
export const LEGACY_TOKENS_STORAGE_KEY = "@app:tokens";

const USER_BROWSER_STORAGE_KEYS = [
    ACCESS_TOKEN_STORAGE_KEY,
    LEGACY_TOKENS_STORAGE_KEY,
    "@app:user",
    "@app-storage",
    "@user-storage",
    "@Route-storage",
    "@Checkout-storage",
    "@admin:read-notifications",
    "mercado-craibas-product-reviews",
];

const removeKeys = (storage: Storage) => {
    USER_BROWSER_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
};

export const getStoredAccessToken = () => {
    localStorage.removeItem(LEGACY_TOKENS_STORAGE_KEY);
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const setStoredAccessToken = (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    localStorage.removeItem(LEGACY_TOKENS_STORAGE_KEY);
};

export const clearStoredTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKENS_STORAGE_KEY);
};

export const clearBrowserUserData = () => {
    removeKeys(localStorage);
    removeKeys(sessionStorage);
};
