import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import * as companyController from '../controllers/companyController.js';

const router = express.Router();

router.post('/', authenticate, isAdmin, companyController.createCompany);
router.get('/', authenticate, companyController.getCompanies);
router.put('/:id', authenticate, isAdmin, companyController.updateCompany);
router.delete('/:id', authenticate, isAdmin, companyController.deleteCompany);

export default router;