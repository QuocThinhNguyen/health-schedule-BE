import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const doctorInfoSchema = new Schema(
  {
    doctorInforId: {
      type: Number,
      unique: true,
    },
    doctorId: {
      type: Number,
      ref: "Users",
      required: true,
    },
    specialtyId: {
      type: Number,
      ref: "Specialty",
    },
    clinicId: {
      type: Number,
      ref: "Clinic",
    },
    price: {
      type: String,
    },
    note: {
      type: String,
    },
    position: {
      type: String,
      ref: "Allcodes",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

doctorInfoSchema.plugin(AutoIncrement, {
  inc_field: "doctorInforId",
  start_seq: 1,
});
doctorInfoSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const DoctorInfo = mongoose.model("DoctorInfo", doctorInfoSchema);

export default DoctorInfo;
