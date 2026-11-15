import { Router } from 'express';
import { InMemoryProblemRepository } from '../infrastructure/persistence/InMemoryProblemRepository.ts';
import { InMemoryAttemptRepository } from '../infrastructure/persistence/InMemoryAttemptRepository.ts';

import { GetProblemsUseCase } from '../application/use-cases/GetProblemsUseCase.ts';
import { StartAttemptUseCase } from '../application/use-cases/StartAttemptUseCase.ts';
import { SaveDraftUseCase } from '../application/use-cases/SaveDraftUseCase.ts';
import { SubmitAttemptUseCase } from '../application/use-cases/SubmitAttemptUseCase.ts';
import { GetAttemptHistoryUseCase } from '../application/use-cases/GetAttemptHistoryUseCase.ts';

import { ProblemController } from './controllers/ProblemController.ts';
import { AttemptController } from './controllers/AttemptController.ts';

const problemRepo = new InMemoryProblemRepository();
const attemptRepo = new InMemoryAttemptRepository();

const getProblemsUseCase = new GetProblemsUseCase(problemRepo);
const startAttemptUseCase = new StartAttemptUseCase(attemptRepo, problemRepo);
const saveDraftUseCase = new SaveDraftUseCase(attemptRepo);
const submitAttemptUseCase = new SubmitAttemptUseCase(attemptRepo, problemRepo);
const historyUseCase = new GetAttemptHistoryUseCase(attemptRepo, problemRepo);

const problemController = new ProblemController(getProblemsUseCase);
const attemptController = new AttemptController(
  attemptRepo,
  startAttemptUseCase,
  saveDraftUseCase,
  submitAttemptUseCase,
  historyUseCase
);

export const apiRouter = Router();

// Problem Routes
apiRouter.get('/problems', problemController.getAll);
apiRouter.get('/problems/:id', problemController.getById);

// Attempt & Practice Routes
apiRouter.post('/attempts', attemptController.startAttempt);
apiRouter.get('/attempts/:id', attemptController.getAttempt);
apiRouter.patch('/attempts/:id', attemptController.saveDraft);
apiRouter.post('/attempts/:id/submit', attemptController.submit);
apiRouter.get('/attempts/:id/evaluation', attemptController.getAttempt);
apiRouter.post('/attempts/:id/retry-evaluation', attemptController.retryEvaluation);

// History Routes
apiRouter.get('/history', attemptController.getHistory);
