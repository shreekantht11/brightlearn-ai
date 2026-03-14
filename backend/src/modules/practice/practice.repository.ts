import pool from '../../config/database';

export class PracticeRepository {
  async getTestsBySubjectId(subjectId: number) {
    const [rows]: any = await pool.query('SELECT * FROM practice_tests WHERE subject_id = ? ORDER BY created_at ASC', [subjectId]);
    return rows;
  }

  async getTestQuestions(testId: number) {
    const [rows]: any = await pool.query('SELECT id, test_id, question_text, option_a, option_b, option_c, option_d FROM practice_questions WHERE test_id = ? ORDER BY id ASC', [testId]);
    return rows;
  }

  async getQuestionsByTestIdWithAnswers(testId: number) {
    const [rows]: any = await pool.query('SELECT id, correct_option FROM practice_questions WHERE test_id = ?', [testId]);
    return rows;
  }

  async saveAttempt(userId: number, testId: number, score: number, totalQuestions: number): Promise<number> {
    const [result]: any = await pool.query(
      'INSERT INTO practice_attempts (user_id, test_id, score, total_questions) VALUES (?, ?, ?, ?)',
      [userId, testId, score, totalQuestions]
    );
    return result.insertId;
  }

  async saveAnswer(attemptId: number, questionId: number, selectedOption: string, isCorrect: boolean) {
    await pool.query(
      'INSERT INTO practice_answers (attempt_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?)',
      [attemptId, questionId, selectedOption, isCorrect]
    );
  }

  async getUserResults(userId: number, testId: number) {
    const [rows]: any = await pool.query(
      'SELECT id, score, total_questions, completed_at FROM practice_attempts WHERE user_id = ? AND test_id = ? ORDER BY completed_at DESC',
      [userId, testId]
    );
    return rows;
  }
}
