export interface Transaction {
    id: string;
}

export interface TransactionManager {
    asTransaction<T>(callback: (transaction: Transaction) => Promise<T>): Promise<T>;
}
