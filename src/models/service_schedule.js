import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const { Schema } = mongoose;

const serviceScheduleSchema = new Schema(
  {
    serviceScheduleId: {
      type: Number,
      unique: true,
    },
    serviceId: {
      type: Number,
      ref: "Service",
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
      default: process.env.MAX_SERVICE_NUMBER || 3,
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
serviceScheduleSchema.plugin(AutoIncrement, {
  inc_field: "serviceScheduleId",
  start_seq: 1,
});

const ServiceSchedule = mongoose.model(
  "ServiceSchedule",
  serviceScheduleSchema
);

export default ServiceSchedule;
