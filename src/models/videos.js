import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    videoId: {
      type: Number,
      unique: true,
    },
    doctorId: {
      type: Number,
      required: true,
      ref: "Users",
    },
    specialtyId: {
      type: Number,
      required: true,
      ref: "Specialty",
    },
    videoName: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    createAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(AutoIncrement, { inc_field: "videoId", start_seq: 1 });
videoSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Videos = mongoose.model("Videos", videoSchema);

export default Videos;
