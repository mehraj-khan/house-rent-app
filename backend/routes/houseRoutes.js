import express from 'express';
import { addHouse, getAllHouses, getHouseById, deleteHouse, getMyHouses, updateHouse  } from '../controllers/houseController.js';

const router = express.Router();

router.get('/', getAllHouses);
router.get('/:id', getHouseById);
router.post('/add', addHouse);
router.delete('/:id', deleteHouse); // deleteHouse یہاں امپورٹ ہو کر استعمال ہو رہا ہے
router.get('/owner/:ownerId', getMyHouses); // نیا روٹ شامل کیا
router.put('/:id', updateHouse);


export default router;