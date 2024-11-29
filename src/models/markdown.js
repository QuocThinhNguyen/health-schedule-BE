import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const markdownSchema = new Schema({
    markdownId: {
        type: Number,
        unique: true
    },
    doctorId: {
        type: Number,
        ref: 'Doctor_info',
        required: true
    },
    clinicId: {
        type: Number,
        ref: 'Clinic',
        required: true
    },
    specialtyId: {
        type: Number,
        ref: 'Specialty',
        required: true
    },
    contentHTML: {
        type: String,
        required: true
    },
    contentMarkdown: {
        type: String,
        required: true
    }
});
markdownSchema.plugin(AutoIncrement, { inc_field: 'markdownId', start_seq: 1 });

const Markdown = mongoose.model('Markdown', markdownSchema);

export default Markdown;