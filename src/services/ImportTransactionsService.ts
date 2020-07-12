import path from 'path';
import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface TransactionOfFile {
  title: string;
  type: string;
  value: string;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp', filename);
    const input = fs.readFileSync(tmpFolder, 'utf8');
    const records = parse(input, {
      columns: true,
      trim: true,
    });
    const transactionsAjusted = records.map(
      (transaction: TransactionOfFile) => {
        return {
          ...transaction,
          value: parseFloat(transaction.value),
        };
      },
    );
    const createTransactionService = new CreateTransactionService();
    const transactions: Array<Transaction> = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const transaction of transactionsAjusted) {
      // eslint-disable-next-line no-await-in-loop
      transactions.push(await createTransactionService.execute(transaction));
    }
    return transactions;
  }
}

export default ImportTransactionsService;
