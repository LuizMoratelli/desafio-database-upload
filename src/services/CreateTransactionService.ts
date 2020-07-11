import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
  importMode?: boolean;
}

class CreateTransactionService {
  public async execute(request: Request): Promise<Transaction> {
    const {
      title,
      value,
      type,
      category: category_title,
      importMode = false,
    } = request;

    const transactionsRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value && !importMode) {
      throw new AppError('Invalid balance to create an outcome transaction');
    }

    const createCategory = new CreateCategoryService();

    const category = await createCategory.execute({
      title: category_title,
    });

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
