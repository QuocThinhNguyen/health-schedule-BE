import mongoose from "mongoose";
import pkg from "mongoose-sequence"; // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const feedBackSchema = new Schema({
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
});

feedBackSchema.plugin(AutoIncrement, { inc_field: "feedBackId", start_seq: 1 });
const FeedBacks = mongoose.model("FeedBacks", feedBackSchema);

export default FeedBacks;
