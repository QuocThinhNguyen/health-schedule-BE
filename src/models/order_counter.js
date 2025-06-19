import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const orderCounterSchema = new Schema(
  {
    orderCounterId: {
      type: Number,
      unique: true,
    },
    appointmentDate: {
      type: String,
      required: true,
    }, // Format: YYYY-MM-DD
    bookingType: {
      type: String,
      required: true,
      enum: ["SERVICE", "DOCTOR"],
      default: "DOCTOR",
    },
    entityId: {
      type: Number,
      required: true,
    }, // serviceId hoặc doctorId
    sequence: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

orderCounterSchema.plugin(AutoIncrement, { inc_field: "orderCounterId", start_seq: 1 });
orderCounterSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
orderCounterSchema.index(
  { appointmentDate: 1, bookingType: 1, entityId: 1 },
  { unique: true }
);

const OrderCounter = mongoose.model("OrderCounter", orderCounterSchema);

export default OrderCounter;
