const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;

const promotionSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
        required:true
    },
    label:{
        type:String,
        default:''
    },
    price:{
        type:Currency,
        min:0
    },
    description:{
        type:String,
    },
    featured:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});
const Promotions = mongoose.model('Promotion',promotionSchema);
module.exports = Promotions;
