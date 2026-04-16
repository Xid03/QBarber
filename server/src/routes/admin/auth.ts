import { Router } from 'express';

import { loginAdmin } from '../../controllers/admin-auth-controller.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { validateRequest } from '../../middleware/validate.js';
import { adminLoginSchema } from '../../validation/schemas.js';

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', validateRequest({ body: adminLoginSchema }), asyncHandler(loginAdmin));
