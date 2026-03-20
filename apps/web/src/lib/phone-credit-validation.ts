export const PHONE_CREDIT_AMOUNTS = [20, 30, 50, 100] as const;

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

type PhoneCreditValidationInput = {
  phone: string;
  amount: number | null | undefined;
  balance: number | null | undefined;
};

export function isValidPhoneNumber(phone: string) {
  return PHONE_REGEX.test(phone.trim());
}

export function getPhoneCreditValidationMessage({
  phone,
  amount,
  balance,
}: PhoneCreditValidationInput): string | null {
  if (!phone.trim()) {
    return null;
  }

  if (!isValidPhoneNumber(phone)) {
    return "Informe um telefone valido no formato internacional.";
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  if (amount > (balance ?? 0)) {
    return "O valor da recarga nao pode ser maior que o saldo disponivel.";
  }

  return null;
}
