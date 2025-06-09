import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete"; // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const clinicSchema = new Schema(
  {
    clinicId: {
      type: Number,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    provinceCode: {
      type: String,
      required: true,
    },
    provinceName: {
      type: String,
      required: true,
    },
    districtCode: {
      type: String,
      required: true,
    },
    districtName: {
      type: String,
      required: true,
    },
    wardCode: {
      type: String,
      required: true,
    },
    wardName: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    mapUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

clinicSchema.plugin(AutoIncrement, { inc_field: "clinicId", start_seq: 1 });

clinicSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});

const Clinic = mongoose.model("Clinic", clinicSchema);

export default Clinic;
