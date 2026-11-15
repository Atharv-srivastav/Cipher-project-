import { IAttemptRepository } from '../../domain/repositories/IAttemptRepository.ts';
import { SubmissionData } from '../../domain/entities/Submission.ts';
import { Attempt } from '../../domain/entities/Attempt.ts';

export class SaveDraftUseCase {
  constructor(private attemptRepo: IAttemptRepository) {}

  public async execute(attemptId: string, submissionData: Omit<SubmissionData, 'attemptId'>): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID ${attemptId} not found`);
    }

    attempt.updateDraft(submissionData);
    return await this.attemptRepo.save(attempt);
  }
}
