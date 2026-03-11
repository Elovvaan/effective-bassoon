import type { CreateClassroomDto } from '../dto/create-classroom.dto.js';
import { ClassroomRepository } from '../repositories/classroom.repository.js';

export class ClassroomService {
  constructor(private readonly repository: ClassroomRepository) {}

  create(dto: CreateClassroomDto) {
    return this.repository.create(dto);
  }

  list() {
    return this.repository.findAll();
  }
}
