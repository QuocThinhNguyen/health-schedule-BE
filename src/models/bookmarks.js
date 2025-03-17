import mongoose from "mongoose";
import pkg from "mongoose-sequence";

const AutoIncrement = pkg(mongoose);

const {Schema} = mongoose;

const bookmarkSchema = new Schema({
    bookmarkId:{
        type: Number,
        unique: true
    },
    userId:{
        type: Number,
        required: true,
        ref:'Users'
    },
    videoId:{
        type: Number,
        required: true,
        ref:'Videos'
    },
    createdAt:{
        type: Date,
        required: true
    }
})

bookmarkSchema.plugin(AutoIncrement, {inc_field: 'bookmarkId', start_seq: 1});
const Bookmarks = mongoose.model('Bookmarks', bookmarkSchema);

export default Bookmarks;