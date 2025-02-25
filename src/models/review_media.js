import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const reviewMediaSchema = new Schema({
    mediaId: {
        type: Number,
        unique: true
    },
    feedBackId: {
        type: Number,
        ref: 'FeedBacks',
        required: true
    },
    mediaName: {
        type: String,
        required: true
    }
});

reviewMediaSchema.plugin(AutoIncrement, { inc_field: 'mediaId', start_seq: 1 });
const ReviewMedia = mongoose.model('ReviewMedia', reviewMediaSchema);

export default ReviewMedia;