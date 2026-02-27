import { Router } from 'express';
import { validate } from '../middleware/validate';
import { searchCitiesSchema } from '../schemas';
import { searchCities } from '../controllers/cityController';

const router = Router();

router.get('/', validate(searchCitiesSchema, 'query'), searchCities);

export default router;
