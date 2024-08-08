const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeItemSchema = new Schema({
    traderid:{type: Schema.Types.ObjectId, ref: 'User'},
    tradeid:{type: Schema.Types.ObjectId, ref: 'Item'},
    offerid:{type: Schema.Types.ObjectId, ref: 'Item'}
}
);

module.exports = mongoose.model('TradeItem', tradeItemSchema);