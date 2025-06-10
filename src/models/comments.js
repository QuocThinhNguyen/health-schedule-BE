import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const commentSchema = new Schema({
    commentId:{
        type: Number,
        unique: true    
    },
    videoId:{
        type: Number,
        required: true,
        ref:'Videos'
    },
    userId:{
        type: Number,
        required: true,
        ref:'Users'
    },
    comment:{
        type: String,
        required: true
    },
    parentId:{
        type:Number
    },
    createdAt:{
        type: Date,
        required: true
    }
})

commentSchema.plugin(AutoIncrement, { inc_field: 'commentId', start_seq: 1 });
commentSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Comments = mongoose.model('Comments', commentSchema);

export default Comments;