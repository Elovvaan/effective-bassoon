export class AuthRepository {
  validateCredentials(email: string, password: string): boolean {
    return email.length > 0 && password.length > 0;
  }
}
