import type { CreateUserDto } from '../dto/create-user.dto.js';
import { UserRepository } from '../repositories/user.repository.js';

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  create(dto: CreateUserDto) {
    return this.repository.create(dto);
  }

  list() {
    return this.repository.findAll();
  }
}
