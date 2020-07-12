import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import UploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(UploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactionsWithBalance = {
    transactions: await transactionsRepository.find({
      relations: ['category'],
    }),
    balance: await transactionsRepository.getBalance(),
  };
  return response.json(transactionsWithBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const savedTransaction = await createTransactionService.execute({
    title,
    type,
    value,
    category,
  });
  return response.json(savedTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);
  return response.json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute(
      request.file.filename,
    );
    response.json(transactions);
  },
);

export default transactionsRouter;
