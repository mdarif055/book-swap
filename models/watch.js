const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchSchema= new Schema({
    username:{type: Schema.Types.ObjectId, ref: 'User'},
    tradelist:[{type: Schema.Types.ObjectId, ref: 'Item'}],
    }
);

module.exports = mongoose.model('Watch', watchSchema);