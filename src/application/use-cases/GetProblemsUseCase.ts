import { IProblemRepository } from '../../domain/repositories/IProblemRepository.ts';
import { Problem } from '../../domain/entities/Problem.ts';

export class GetProblemsUseCase {
  constructor(private problemRepo: IProblemRepository) {}

  public async execute(): Promise<Problem[]> {
    return await this.problemRepo.findAll();
  }

  public async getById(idOrSlug: string): Promise<Problem | null> {
    const byId = await this.problemRepo.findById(idOrSlug);
    if (byId) return byId;
    return await this.problemRepo.findBySlug(idOrSlug);
  }
}
