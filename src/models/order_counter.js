import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

// const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const orderCounterSchema = new Schema(
  {
    appointmentDate: {
      type: Date,
      required: true,
    },
    bookingType: {
      type: String,
      required: true,
      enum: ["SERVICE", "DOCTOR"],
      default: "DOCTOR",
    },
    entityId: {
      type: Number,
      required: true,
      ref: function () {
        return this.bookingType === "SERVICE" ? "Service" : "Doctor";
      },
    }, // serviceId hoặc doctorId
    sequence: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

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
