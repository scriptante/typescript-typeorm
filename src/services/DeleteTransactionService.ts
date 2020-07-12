import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transaction = await transactionRepository.findOne(id);
    if (!transaction) {
      throw new AppError('transaction not found');
    }
    const balance = await transactionRepository.getBalance();
    if (
      transaction.type === 'income' &&
      balance.total - transaction.value < 0
    ) {
      throw new AppError('Remove this transaction will overcome balance');
    }
    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
