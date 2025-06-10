import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const reviewMediaSchema = new Schema({
  mediaId: {
    type: Number,
    unique: true,
  },
  feedBackId: {
    type: Number,
    ref: "FeedBacks",
    required: true,
  },
  mediaName: {
    type: String,
    required: true,
  },
  },
  { timestamps: true }
);

reviewMediaSchema.plugin(AutoIncrement, { inc_field: "mediaId", start_seq: 1 });
reviewMediaSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const ReviewMedia = mongoose.model("ReviewMedia", reviewMediaSchema);

export default ReviewMedia;
