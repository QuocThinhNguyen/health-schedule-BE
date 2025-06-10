import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const postSchema = new Schema({
  postId: {
    type: Number,
    unique: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.plugin(AutoIncrement, { inc_field: "postId", start_seq: 1 });
postSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Post = mongoose.model("Post", postSchema);

export default Post;
