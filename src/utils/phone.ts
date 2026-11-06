/** Twilio necesita formato internacional: el backend guarda +51 + 9 dígitos. */
export const PE_PREFIX = '+51';

export const toE164 = (localPhone: string) => (localPhone ? `${PE_PREFIX}${localPhone}` : undefined);

export const toLocalPhone = (stored: string | null | undefined) => (stored ?? '').replace(/^\+51/, '');

export const PHONE_REGEX = /^9\d{8}$/;
