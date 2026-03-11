import type { CreateSchoolDto } from '../dto/create-school.dto.js';
import { SchoolRepository } from '../repositories/school.repository.js';

export class SchoolService {
  constructor(private readonly repository: SchoolRepository) {}

  create(dto: CreateSchoolDto) {
    return this.repository.create(dto);
  }

  list() {
    return this.repository.findAll();
  }
}
