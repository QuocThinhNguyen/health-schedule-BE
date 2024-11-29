import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const allCodesSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    keyMap: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    valueEn: {
        type: String,
        required: true
    },
    valueVi: {
        type: String,
        required: true
    }
});

allCodesSchema.plugin(AutoIncrement, { inc_field: 'id', start_seq: 1 });
const AllCodes = mongoose.model('AllCodes', allCodesSchema);

export default AllCodes;