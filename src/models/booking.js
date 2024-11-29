import mongoose from "mongoose";
import pkg from "mongoose-sequence"; // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const bookingSchema = new Schema({
  bookingId: {
    type: Number,
    unique: true,
  },
  doctorId: {
    type: Number,
    ref: "Users",
    required: true,
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
    default:''
  },
  status: {
    type: String,
    ref: "AllCodes",
    default:''
  },
});

bookingSchema.plugin(AutoIncrement, { inc_field: "bookingId", start_seq: 1 });
const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
