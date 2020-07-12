import { getRepository, getCustomRepository } from 'typeorm';
import TransactionRepostitory from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  type: string;
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    if (!(type === 'income' || type === 'outcome')) {
      throw new AppError('Invalid Type');
    }
    const transactionsRepository = getCustomRepository(TransactionRepostitory);
    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('insufficient funds');
    }
    const categoryRepository = getRepository(Category);
    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!categoryExists) {
      const newCategory = await categoryRepository.create({
        title: category,
      });
      const savedCategory = await categoryRepository.save(newCategory);
      const newTransaction = await transactionsRepository.create({
        title,
        type,
        value,
        category: savedCategory,
      });
      await transactionsRepository.save(newTransaction);
      return newTransaction;
    }
    const newTransaction = await transactionsRepository.create({
      title,
      type,
      value,
      category: categoryExists,
    });
    await transactionsRepository.save(newTransaction);
    return newTransaction;
  }
}

export default CreateTransactionService;
