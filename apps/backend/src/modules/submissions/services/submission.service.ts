import type { CreateSubmissionDto } from '../dto/create-submission.dto.js';
import { SubmissionRepository } from '../repositories/submission.repository.js';

export class SubmissionService {
  constructor(private readonly repository: SubmissionRepository) {}

  create(dto: CreateSubmissionDto) {
    return this.repository.create(dto);
  }

  list() {
    return this.repository.findAll();
  }
}
