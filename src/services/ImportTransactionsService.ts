import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Line {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const csvPath = path.join(uploadConfig.dir, filename);

    const readStream = fs.createReadStream(csvPath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readStream.pipe(parseStream);

    const lines: Line[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      lines.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransaction = new CreateTransactionService();

    const transactions = Promise.all(
      lines.map(async line => {
        const transaction = await createTransaction.execute({
          title: line.title,
          type: line.type,
          value: line.value,
          category: line.category,
          importMode: true,
        });

        return transaction;
      }),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
