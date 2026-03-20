import assert from "node:assert/strict";
import test from "node:test";

import {
  PHONE_CREDIT_AMOUNTS,
  getPhoneCreditValidationMessage,
  isValidPhoneNumber,
} from "./phone-credit-validation.ts";

test("accepts phone numbers in E.164 format", () => {
  assert.equal(isValidPhoneNumber("+5511999999999"), true);
});

test("rejects phone numbers outside E.164 format", () => {
  assert.equal(isValidPhoneNumber("11999999999"), false);
});

test("exposes the fixed phone credit amounts for the UI", () => {
  assert.deepEqual(PHONE_CREDIT_AMOUNTS, [20, 30, 50, 100]);
});

test("returns an error when phone credit amount is greater than available balance", () => {
  assert.equal(
    getPhoneCreditValidationMessage({
      phone: "+5511999999999",
      amount: 50,
      balance: 30,
    }),
    "O valor da recarga nao pode ser maior que o saldo disponivel.",
  );
});

test("returns an error when phone number is invalid", () => {
  assert.equal(
    getPhoneCreditValidationMessage({
      phone: "11999999999",
      amount: 20,
      balance: 100,
    }),
    "Informe um telefone valido no formato internacional.",
  );
});
