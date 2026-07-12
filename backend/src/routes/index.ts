import { Router } from 'express';
import apiRoutes from './api.routes';

const rootRouter = Router();
rootRouter.use('/api/v1', apiRoutes);

export default rootRouter;