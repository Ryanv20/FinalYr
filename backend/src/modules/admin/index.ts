import { AdminRepository } from './admin.repository.js';
import { AdminService } from './admin.service.js';
import { createAdminController } from './admin.controller.js';

const repository = new AdminRepository();
const service = new AdminService(repository);
export const adminRouter = createAdminController(service);
