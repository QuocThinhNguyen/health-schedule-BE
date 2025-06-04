import mongoose from "mongoose";
import pkg from "mongoose-sequence"; // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const clinicManagerSchema = new Schema(
  {
    clinicManagerId: {
      type: Number,
      unique: true,
    },
    userId: {
      type: Number,
      ref: "Users",
      required: true,
    },
    clinicId: {
      type: Number,
      ref: "Clinic",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

clinicManagerSchema.plugin(AutoIncrement, {
  inc_field: "clinicManagerId",
  start_seq: 1,
});
const ClinicManager = mongoose.model("ClinicManager", clinicManagerSchema);

export default ClinicManager;
