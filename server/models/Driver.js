import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema(
  {
    driver_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    college_id: {
      type: String,
      default: 'ADM-101'
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
    },
    assigned_bus_id: {
      type: String,
      default: 'b1'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Driver || mongoose.model('Driver', DriverSchema);
