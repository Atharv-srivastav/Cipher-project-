import { IAttemptRepository } from '../../domain/repositories/IAttemptRepository.ts';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository.ts';
import { Attempt } from '../../domain/entities/Attempt.ts';

export class StartAttemptUseCase {
  constructor(
    private attemptRepo: IAttemptRepository,
    private problemRepo: IProblemRepository
  ) {}

  public async execute(userId: string, problemId: string): Promise<Attempt> {
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new Error(`Problem with ID ${problemId} not found`);
    }

    const nextAttemptNum = await this.attemptRepo.getNextAttemptNumber(userId, problemId);
    const attempt = new Attempt({
      userId,
      problemId,
      attemptNumber: nextAttemptNum,
      status: 'DRAFT',
    });

    return await this.attemptRepo.save(attempt);
  }
}
