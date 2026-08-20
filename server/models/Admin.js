import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    college_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password_hash: {
      type: String,
      required: true
    },
    college_name: {
      type: String,
      required: true,
      default: 'College Campus'
    },
    name: {
      type: String,
      default: 'Administrator'
    },
    security_code: {
      type: String,
      default: 'SEC-ADM-101'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
