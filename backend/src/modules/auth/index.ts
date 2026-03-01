import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { createAuthController } from './auth.controller.js';

const repository = new AuthRepository();
const service = new AuthService(repository);
export const authRouter = createAuthController(service);
