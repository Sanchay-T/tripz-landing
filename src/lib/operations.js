import { z } from "zod";

export const expenseCategories = [
  "Marketing",
  "Operations",
  "Salary",
  "Travel",
  "Vendor",
  "Utilities",
  "Other"
];
export const leadStatuses = ["new", "contacted", "qualified", "converted", "lost"];
export const financeAccountTypes = ["bank", "cash"];
export const financeTransactionTypes = ["cash_in", "cash_out"];

const nullableText = z
  .string()
  .nullable()
  .optional()
  .transform((value) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed || null;
  });

const dateText = z.string().date("Use a valid date in YYYY-MM-DD format");
const id = z.string().uuid("A valid record ID is required");

export const idSchema = z.object({ id });

export const expenseSchema = z.object({
  category: z.string().trim().min(1).max(80),
  nameOrVendor: z.string().trim().min(1).max(200),
  amount: z.coerce.number().positive().max(999999999999),
  expenseDate: dateText,
  paymentStatus: z.enum(["pending", "paid"]),
  notes: nullableText
});

export const financeAccountSchema = z.object({
  name: z.string().trim().min(1).max(120),
  accountType: z.enum(financeAccountTypes),
  openingBalance: z.coerce.number().min(-999999999999).max(999999999999),
  isActive: z.boolean().default(true)
});

export const financeTransactionSchema = z.object({
  accountId: id,
  transactionType: z.enum(financeTransactionTypes),
  amount: z.coerce.number().positive().max(999999999999),
  transactionDate: dateText,
  description: z.string().trim().min(1).max(300),
  reference: nullableText
});

export const reconciliationSchema = z.object({
  accountId: id,
  actualBalance: z.coerce.number().min(-999999999999).max(999999999999),
  transactionDate: dateText,
  description: z.string().trim().min(1).max(300).default("Balance reconciliation")
});

export const financeTransactionsQuerySchema = z.object({
  accountId: z.union([id, z.literal("")]).default("")
});

export const leadsQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  status: z.union([z.enum(leadStatuses), z.literal("")]).default(""),
  campaign: z.string().trim().max(160).default(""),
  location: z.string().trim().max(160).default(""),
  followUp: z.union([z.enum(["overdue", "today", "upcoming", "none"]), z.literal("")]).default(""),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(160),
  company: nullableText,
  location: nullableText,
  mobileNumber: nullableText,
  email: z.union([z.string().trim().email(), z.literal("")]).nullable().optional().transform((v) => v || null),
  designation: nullableText,
  campaignName: nullableText,
  remarks: nullableText,
  followUpDate: z.union([dateText, z.literal("")]).nullable().optional().transform((v) => v || null),
  status: z.enum(leadStatuses)
});

export const operationalAccountSchema = z
  .object({
    serviceName: z.string().trim().min(1).max(160),
    loginId: z.string().trim().min(1).max(240),
    ownerName: nullableText,
    loginUrl: z.union([z.string().trim().url(), z.literal("")]).nullable().optional().transform((v) => v || null),
    passwordManagerReference: nullableText,
    notes: nullableText
  })
  .strict();

export function transactionDelta(transaction) {
  const amount = Number(transaction.amount ?? 0);
  return ["cash_out", "reconciliation_debit"].includes(transaction.transaction_type) ? -amount : amount;
}

export function accountBalance(account, transactions = []) {
  return transactions
    .filter((row) => row.account_id === account.id)
    .reduce((total, row) => total + transactionDelta(row), Number(account.opening_balance ?? 0));
}

export function reconciliationEntry(currentBalance, actualBalance) {
  const delta = Number((Number(actualBalance) - Number(currentBalance)).toFixed(2));
  if (delta === 0) return null;
  return {
    transactionType: delta > 0 ? "reconciliation_credit" : "reconciliation_debit",
    amount: Math.abs(delta)
  };
}

export function followUpBucket(date, today) {
  if (!date) return "none";
  if (date < today) return "overdue";
  if (date === today) return "today";
  return "upcoming";
}

export function validationMessage(error) {
  return error?.issues?.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") || "Request is not valid.";
}
