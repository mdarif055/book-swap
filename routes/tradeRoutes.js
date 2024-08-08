const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradeController');

const {isLoggedIn, isHost} = require('../middlewares/auth');
const{validateId} = require('../middlewares/validator');
const { validateDevice, validateResult} = require('../middlewares/validator');

router.get('/', controller.index);

router.get('/new', isLoggedIn, controller.new);

router.post('/', isLoggedIn, validateDevice, validateResult, controller.create);

router.get('/:id',validateId, controller.show);

router.get('/:id/edit', validateId, isLoggedIn, isHost, controller.edit);

 router.put('/:id', validateId, isLoggedIn, isHost, validateDevice, validateResult, controller.update);

router.delete('/:id',validateId, isLoggedIn, isHost, controller.delete);

router.post('/:id/favourite', validateId, isLoggedIn, controller.favourite);

router.post('/:id/unfavourite', validateId, isLoggedIn, controller.unfavourite);

router.post('/:id/tradeitem', validateId, isLoggedIn, controller.tradeitem);

router.post('/:id/acceptOffer', validateId, isLoggedIn, controller.acceptOffer);

router.post('/:id/rejectOffer', validateId, isLoggedIn, controller.rejectOffer);

router.post('/:id/cancelOffer', validateId, isLoggedIn, controller.cancelOffer);

router.post('/:id/manageOffer', validateId, isLoggedIn, controller.manageOffer);

router.post('/:id/tradeoffered',validateId, isLoggedIn, controller.tradeoffered);
module.exports=router;  