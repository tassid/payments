export type Tx = { id?: string; type: string; amount?: number; createdAt?: string };
export type Statement = { accountId: number|string; balance: number; transactions: Tx[] };
