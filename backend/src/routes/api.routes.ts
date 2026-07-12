import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { FleetController } from '../controllers/fleet.controller';
import { TripController } from '../controllers/trip.controller';
import { ReportController } from '../controllers/report.controller';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { FuelLogController } from '../controllers/fuelLog.controller';
import { ExpenseController } from '../controllers/expense.controller';
import { getVehicles } from '../controllers/vehicleController';
import { authorizeUser } from '../middleware/auth';
import { checkPermissions } from '../middleware/rbac';

const router = Router();

// Open Auth Context
router.post('/auth/login', AuthController.login);

// Fleet Registry Bounds
router.post('/vehicles', authorizeUser, checkPermissions(['Fleet_Manager']), FleetController.registerVehicle);
router.get('/vehicles', authorizeUser, getVehicles);
router.post('/drivers', authorizeUser, checkPermissions(['Fleet_Manager', 'Safety_Officer']), FleetController.registerDriver);

// Trip Workflows
router.post('/trips', authorizeUser, checkPermissions(['Fleet_Manager', 'Driver']), TripController.dispatch);
router.post('/trips/:id/complete', authorizeUser, checkPermissions(['Fleet_Manager', 'Driver']), TripController.complete);

// Dashboard Intelligence & Exports
router.get('/analytics/dashboard', authorizeUser, ReportController.getDashboardMetrics);
router.get('/analytics/export', authorizeUser, checkPermissions(['Financial_Analyst', 'Fleet_Manager']), ReportController.exportCSV);

// Maintenance Logs
router.post('/maintenance', authorizeUser, checkPermissions(['Fleet_Manager', 'Safety_Officer']), MaintenanceController.createLog);
router.get('/maintenance', authorizeUser, MaintenanceController.getLogs);
router.get('/maintenance/:id', authorizeUser, MaintenanceController.getLogById);
router.patch('/maintenance/:id', authorizeUser, checkPermissions(['Fleet_Manager', 'Safety_Officer']), MaintenanceController.updateLog);
router.patch('/maintenance/:id/close', authorizeUser, checkPermissions(['Fleet_Manager', 'Safety_Officer']), MaintenanceController.closeLog);
router.delete('/maintenance/:id', authorizeUser, checkPermissions(['Fleet_Manager']), MaintenanceController.deleteLog);

// Fuel Logs
router.post('/fuel', authorizeUser, checkPermissions(['Fleet_Manager', 'Driver']), FuelLogController.createLog);
router.get('/fuel', authorizeUser, FuelLogController.getLogs);
router.get('/fuel/:id', authorizeUser, FuelLogController.getLogById);
router.patch('/fuel/:id', authorizeUser, checkPermissions(['Fleet_Manager', 'Driver']), FuelLogController.updateLog);
router.delete('/fuel/:id', authorizeUser, checkPermissions(['Fleet_Manager']), FuelLogController.deleteLog);

// Expenses
router.post('/expenses', authorizeUser, checkPermissions(['Fleet_Manager', 'Financial_Analyst']), ExpenseController.createExpense);
router.get('/expenses', authorizeUser, ExpenseController.getExpenses);
router.get('/expenses/:id', authorizeUser, ExpenseController.getExpenseById);
router.patch('/expenses/:id', authorizeUser, checkPermissions(['Fleet_Manager', 'Financial_Analyst']), ExpenseController.updateExpense);
router.delete('/expenses/:id', authorizeUser, checkPermissions(['Fleet_Manager', 'Financial_Analyst']), ExpenseController.deleteExpense);

export default router;