import mongoose from "mongoose";
import pkg from "mongoose-sequence"; // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const patientRecordsSchema = new Schema({
  patientRecordId: {
    type: Number,
    unique: true,
  },
  patientId: {
    type: Number,
    ref: "Users",
  },
  fullname: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  birthDate: {
    type: Date,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  CCCD: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  job: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

patientRecordsSchema.plugin(AutoIncrement, {
  inc_field: "patientRecordId",
  start_seq: 1,
});

const PatientRecords = mongoose.model("PatientRecords", patientRecordsSchema);
export default PatientRecords;
