import { Problem } from '../entities/Problem.ts';

export interface IProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | null>;
  findBySlug(slug: string): Promise<Problem | null>;
}
