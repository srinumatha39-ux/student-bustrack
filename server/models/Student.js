import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    roll_no: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    college_id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    password_hash: {
      type: String,
      required: true
    },
    secret_key: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
