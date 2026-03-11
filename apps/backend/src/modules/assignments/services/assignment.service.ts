import type { CreateAssignmentDto } from '../dto/create-assignment.dto.js';
import { AssignmentRepository } from '../repositories/assignment.repository.js';

export class AssignmentService {
  constructor(private readonly repository: AssignmentRepository) {}

  create(dto: CreateAssignmentDto) {
    return this.repository.create(dto);
  }

  list() {
    return this.repository.findAll();
  }
}
