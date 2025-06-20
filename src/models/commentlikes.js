import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const commentLikeSchema = new Schema({
    commentLikeId:{
        type: Number,
        unique: true    
    },
    userId:{
        type: Number,
        required: true,
        ref:'Users'
    },
    commentId:{
        type: Number,
        required: true,
        ref:'Comments'
    },
    createdAt:{
        type: Date,
        required: true
    }
})

commentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });
commentLikeSchema.plugin(AutoIncrement, { inc_field: 'commentLikeId', start_seq: 1 });
commentLikeSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const CommentLikes = mongoose.model('CommentLikes', commentLikeSchema);

export default CommentLikes;