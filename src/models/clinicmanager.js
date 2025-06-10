import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

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
      unique: true,
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

clinicManagerSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});

const ClinicManager = mongoose.model("ClinicManager", clinicManagerSchema);

export default ClinicManager;
