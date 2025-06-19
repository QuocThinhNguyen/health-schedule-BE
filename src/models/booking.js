import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    bookingId: {
      type: Number,
      unique: true,
    },
    bookingType: {
      type: String,
      enum: ["DOCTOR", "SERVICE"],
      required: true,
    },
    doctorId: {
      type: Number,
      ref: "Users",
    },
    serviceId: {
      type: Number,
      ref: "Users",
    },
    orderNumber: {
      type: Number,
      default: "",
    },
    patientRecordId: {
      type: Number,
      ref: "PatientRecords",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeType: {
      type: String,
      ref: "AllCodes",
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      ref: "AllCodes",
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "MOMO", "VNPAY", "COD", "BANK_TRANSFER"],
    },
    paymentStatus: {
      type: String,
      enum: [, "UNPAID", "PAID", "FAILED", "EXPIRED"],
    },
    paymentUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

bookingSchema.plugin(AutoIncrement, { inc_field: "bookingId", start_seq: 1 });
bookingSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
