import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
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
});

specialtySchema.plugin(AutoIncrement, { inc_field: 'specialtyId', start_seq: 1 });

const Specialty = mongoose.model('Specialty', specialtySchema);

export default Specialty;