import type { CreateRubricDto } from '../dto/create-rubric.dto.js';
import { RubricRepository } from '../repositories/rubric.repository.js';

export class RubricService {
  constructor(private readonly repository: RubricRepository) {}

  create(dto: CreateRubricDto) {
    return this.repository.create(dto);
  }

  list() {
    return this.repository.findAll();
  }
}
