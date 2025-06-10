import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const feedBackSchema = new Schema(
  {
    feedBackId: {
      type: Number,
      unique: true,
    },
    patientId: {
      type: Number,
      ref: "PatientRecords",
      required: true,
    },
    doctorId: {
      type: Number,
      ref: "Users",
      required: true,
    },
    rating: {
      type: Number,
      default: 5,
      required: true,
    },
    comment: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    // clinicId:{
    //   type: Number,
    //   ref: "Clinic",
    //   required: true
    // }
  },
  { timestamps: true }
);

feedBackSchema.plugin(AutoIncrement, { inc_field: "feedBackId", start_seq: 1 });
feedBackSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const FeedBacks = mongoose.model("FeedBacks", feedBackSchema);

export default FeedBacks;
