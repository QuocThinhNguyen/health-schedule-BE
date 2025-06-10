import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = AutoIncrementFactory(mongoose);
const { Schema } = mongoose;

const scheduleSchema = new Schema({
  scheduleId: {
    type: Number,
    unique: true,
  },
  doctorId: {
    type: Number,
    ref: "Users",
    required: true,
  },
  currentNumber: {
    type: Number,
    required: true,
    default: 0,
  },
  maxNumber: {
    type: Number,
    required: true,
    default: process.env.MAX_NUMBER || 2,
  },
  scheduleDate: {
    type: Date,
    required: true,
  },
  timeType: {
    type: String,
    required: true,
  },
  },
  { timestamps: true }
);

// Thêm plugin AutoIncrement cho trường scheduleId
scheduleSchema.plugin(AutoIncrement, { inc_field: "scheduleId", start_seq: 1 });
scheduleSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
