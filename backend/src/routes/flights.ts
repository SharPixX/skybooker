import { Router } from 'express';
import { validate } from '../middleware/validate';
import { searchFlightsSchema, flightIdParamSchema } from '../schemas';
import { searchFlights, getFlightById } from '../controllers/flightController';

const router = Router();

router.get('/', validate(searchFlightsSchema, 'query'), searchFlights);
router.get('/:id', validate(flightIdParamSchema, 'params'), getFlightById);

export default router;
