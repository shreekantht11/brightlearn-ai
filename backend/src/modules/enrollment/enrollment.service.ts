import { EnrollmentRepository } from './enrollment.repository';

const repository = new EnrollmentRepository();

export class EnrollmentService {
  async enroll(userId: number, subjectId: number) {
    const isEnrolled = await repository.checkEnrollment(userId, subjectId);
    if (!isEnrolled) {
      await repository.enrollUser(userId, subjectId);
      return { success: true, message: "Successfully enrolled in the course." };
    }
    return { success: false, message: "Already enrolled in this course." };
  }

  async getMyCourses(userId: number) {
    return await repository.getMyCourses(userId);
  }

  async checkStatus(userId: number, subjectId: number) {
    const enrolled = await repository.checkEnrollment(userId, subjectId);
    return { enrolled };
  }
}
