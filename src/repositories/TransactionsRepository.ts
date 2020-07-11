import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const [income, outcome] = transactions.reduce(
      ([inTotal, outTotal], current) => {
        if (current.type === 'income')
          return [inTotal + Number(current.value), outTotal];
        return [inTotal, outTotal + Number(current.value)];
      },
      [0, 0],
    );

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
