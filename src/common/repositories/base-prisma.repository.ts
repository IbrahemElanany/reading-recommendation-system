import { PrismaClient, Prisma } from '@prisma/client';

export class BasePrismaRepository<T> {
  constructor(
    protected readonly prismaModel: any, // e.g., prisma.user
  ) {}

  async findAll(): Promise<T[]> {
    return this.prismaModel.findMany();
  }

  async findById(id: number): Promise<T | null> {
    return this.prismaModel.findUnique({ where: { id } });
  }

  async create(data: Partial<T>): Promise<T> {
    return this.prismaModel.create({ data });
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    return this.prismaModel.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prismaModel.delete({ where: { id } });
  }
}