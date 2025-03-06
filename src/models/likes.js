import mongoose from "mongoose";
import pkg from "mongoose-sequence";

const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const likeSchema = new Schema({
    likeId:{
        type: Number,
        unique: true    
    },
    userId:{
        type: Number,
        required: true,
        ref:'Users'
    },
    targetId:{
        type: Number,
        required: true
    },
    type:{
        type: String,
        required
    },
    createdAt:{
        type: String,
        required: true
    }
})

likeSchema.plugin(AutoIncrement, { inc_field: 'likeId', start_seq: 1 });
const Likes = mongoose.model('Likes', likeSchema);

export default Likes;