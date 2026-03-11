import type { LoginDto } from '../dto/login.dto.js';
import { BadRequestError } from '../../../common/errors/app-error.js';
import { AuthRepository } from '../repositories/auth.repository.js';

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  login(dto: LoginDto) {
    const isValid = this.repository.validateCredentials(dto.email, dto.password);

    if (!isValid) {
      throw new BadRequestError('Invalid credentials');
    }

    return {
      accessToken: crypto.randomUUID(),
      tokenType: 'Bearer',
    };
  }
}
