export const ALLOWED_PHONE_CREDIT_AMOUNTS = [20, 30, 50, 100] as const;

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export function isValidPhoneNumber(phone: string) {
  return PHONE_REGEX.test(phone);
}

export function isAllowedPhoneCreditAmount(amount: number) {
  return ALLOWED_PHONE_CREDIT_AMOUNTS.includes(
    amount as (typeof ALLOWED_PHONE_CREDIT_AMOUNTS)[number],
  );
}
