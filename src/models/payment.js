import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const payemntSchema = new Schema(
  {
    paymentId: {
      type: Number,
      unique: true,
    },
    bookingId: {
      type: Number,
      ref: "Booking",
      required: true,
    },
    status: {
      type: String,
      enum: ["UNPAID", "PAID", "FAILED", "EXPIRED"],
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "MOMO", "VNPAY", "COD", "BANK_TRANSFER"],
    },
    paymentUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

payemntSchema.plugin(AutoIncrement, { inc_field: "paymentId", start_seq: 1 });
payemntSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Payment = mongoose.model("Payment", payemntSchema);

export default Payment;
