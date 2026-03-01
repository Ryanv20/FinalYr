import { ReportsRepository } from './reports.repository.js';
import { ReportsService } from './reports.service.js';
import { createReportsController } from './reports.controller.js';

const repository = new ReportsRepository();
const service = new ReportsService(repository);
export const reportsRouter = createReportsController(service);
