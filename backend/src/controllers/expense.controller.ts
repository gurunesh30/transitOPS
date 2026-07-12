import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export class ExpenseController {
  public static async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await prisma.expense.create({ data: req.body });
      res.status(201).json(expense);
    } catch (err) { next(err); }
  }

  public static async getExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.query;
      const where = vehicleId ? { vehicle_id: String(vehicleId) } : {};
      const expenses = await prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' }
      });
      res.status(200).json(expenses);
    } catch (err) { next(err); }
  }

  public static async getExpenseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const expense = await prisma.expense.findUnique({ where: { id } });
      if (!expense) return res.status(404).json({ error: 'Expense not found' });
      res.status(200).json(expense);
    } catch (err) { next(err); }
  }

  public static async updateExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const expense = await prisma.expense.update({
        where: { id },
        data: req.body
      });
      res.status(200).json(expense);
    } catch (err) { next(err); }
  }

  public static async deleteExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.expense.delete({ where: { id } });
      res.status(204).send();
    } catch (err) { next(err); }
  }
}