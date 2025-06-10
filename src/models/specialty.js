import mongoose from 'mongoose';
import pkg from 'mongoose-sequence'; 
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const specialtySchema = new Schema({
    specialtyId: {
        type: Number,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
  },
  { timestamps: true }
);

specialtySchema.plugin(AutoIncrement, { inc_field: 'specialtyId', start_seq: 1 });
specialtySchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Specialty = mongoose.model('Specialty', specialtySchema);

export default Specialty;