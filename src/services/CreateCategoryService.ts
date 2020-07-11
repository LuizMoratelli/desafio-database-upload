import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute(request: Request): Promise<Category> {
    const { title } = request;

    const categoriesRepository = getRepository(Category);

    const categoryAlreadyExists = await categoriesRepository.findOne({
      where: {
        title,
      },
    });

    if (categoryAlreadyExists) {
      return categoryAlreadyExists;
    }

    const category = categoriesRepository.create({
      title,
    });

    await categoriesRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
