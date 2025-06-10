import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const videoLikeSchema = new Schema({
  likeId: {
    type: Number,
    unique: true,
  },
  userId: {
    type: Number,
    required: true,
    ref: "Users",
  },
  videoId: {
    type: Number,
    required: true,
    ref: "Videos",
  },
  createdAt: {
    type: Date,
    required: true,
  },
  },
  { timestamps: true }
);

// Thêm ràng buộc duy nhất trên cặp userId và videoId
videoLikeSchema.index({ userId: 1, videoId: 1 }, { unique: true });
videoLikeSchema.plugin(AutoIncrement, { inc_field: "likeId", start_seq: 1 });
videoLikeSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const VideoLikes = mongoose.model("VideoLikes", videoLikeSchema);

export default VideoLikes;
