/**
 * Regra única de senha (igual ao servidor: PasswordPolicy.cs).
 * Usada no cadastro, na troca de senha e na criação de usuários pelo admin.
 */

export const PASSWORD_MIN_LENGTH = 8;

const WEAK_PASSWORDS = [
    '12345678', '123456789', '1234567890', 'password', 'password123', 'qwerty123',
    'senha123', 'senha1234', 'admin123', 'senha@123', 'admin@123', 'mudar@123',
];

export const passwordChecks = (password: string) => ({
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
});

export const passwordCheckLabels: { key: keyof ReturnType<typeof passwordChecks>; label: string }[] = [
    { key: 'minLength', label: `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres` },
    { key: 'uppercase', label: 'Uma letra maiúscula' },
    { key: 'lowercase', label: 'Uma letra minúscula' },
    { key: 'number', label: 'Um número' },
    { key: 'special', label: 'Um caractere especial (!@#$...)' },
];

/** Retorna a mensagem de erro ou null se a senha for válida. */
export const validatePasswordPolicy = (password: string): string | null => {
    const checks = passwordChecks(password);

    if (!checks.minLength) return `A senha deve possuir pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    if (WEAK_PASSWORDS.includes(password.toLowerCase())) return 'Essa senha é muito fácil de descobrir. Escolha uma senha mais forte.';
    if (!checks.uppercase) return 'A senha deve possuir pelo menos uma letra maiúscula.';
    if (!checks.lowercase) return 'A senha deve possuir pelo menos uma letra minúscula.';
    if (!checks.number) return 'A senha deve possuir pelo menos um número.';
    if (!checks.special) return 'A senha deve possuir pelo menos um caractere especial.';

    return null;
};
