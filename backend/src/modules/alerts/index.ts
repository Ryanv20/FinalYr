import { AlertsRepository } from './alerts.repository.js';
import { AlertsService } from './alerts.service.js';
import { createAlertsController } from './alerts.controller.js';

const repository = new AlertsRepository();
const service = new AlertsService(repository);
export const alertsRouter = createAlertsController(service);
