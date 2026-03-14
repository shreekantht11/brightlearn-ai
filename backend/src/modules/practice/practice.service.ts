import { PracticeRepository } from './practice.repository';

const repository = new PracticeRepository();

export class PracticeService {
  async getTestsForSubject(subjectId: number) {
    return repository.getTestsBySubjectId(subjectId);
  }

  async getTestQuestions(testId: number) {
    return repository.getTestQuestions(testId);
  }

  async submitAttempt(userId: number, testId: number, answers: { questionId: number, selectedOption: string }[]) {
    const questions: any = await repository.getQuestionsByTestIdWithAnswers(testId);
    if (!questions || questions.length === 0) {
      throw new Error('Test not found or has no questions');
    }

    const questionMap = new Map();
    questions.forEach((q: any) => questionMap.set(q.id, q.correct_option));

    let score = 0;
    const evaluatedAnswers = answers.map(ans => {
      const correctOption = questionMap.get(ans.questionId);
      const isCorrect = correctOption === ans.selectedOption;
      if (isCorrect) score++;
      
      return {
        ...ans,
        isCorrect,
        correctOption
      };
    });

    const attemptId = await repository.saveAttempt(userId, testId, score, questions.length);

    for (const ans of evaluatedAnswers) {
      await repository.saveAnswer(attemptId, ans.questionId, ans.selectedOption, ans.isCorrect);
    }

    return {
      attemptId,
      score,
      totalQuestions: questions.length,
      evaluatedAnswers
    };
  }

  async getUserTestResults(userId: number, testId: number) {
    return repository.getUserResults(userId, testId);
  }
}
