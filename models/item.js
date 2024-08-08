const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {type: String, required: [true, 'Title is required']},
    topic: {type: String, required: [true, 'Topic is required']},
    details: {type: String, required: [true, 'Detail is required'], 
              minLength: [10, 'The detail should have at least 10 characters']},
    host: {type: Schema.Types.ObjectId, ref: 'User'},
    year: {type: String, required: [true, 'Year is required']},
    miles: {type: String, required: [true, 'Miles is required']},
    price: {type: String, required: [true, 'Price is required']},
    condition: {type: String, required: [true, 'Condition is required']},
    image: {type: String, required: [true, 'Image is required']},
    status: {type: String}
},
{timestamps: true}
);

module.exports = mongoose.model('Item', itemSchema);