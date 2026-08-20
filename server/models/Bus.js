import mongoose from 'mongoose';

const StopSchema = new mongoose.Schema({
  id: String,
  stop_name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  stop_order: { type: Number, required: true }
}, { _id: false });

const BusSchema = new mongoose.Schema(
  {
    bus_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    college_id: {
      type: String,
      default: 'ADM-101'
    },
    bus_number: {
      type: String,
      required: true
    },
    bus_name: {
      type: String,
      default: 'Campus Shuttle'
    },
    route: {
      type: String,
      required: true
    },
    stops: [StopSchema],
    estimated_journey_time: {
      type: Number,
      default: 60
    },
    is_active: {
      type: Boolean,
      default: false
    },
    current_driver_id: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.models.Bus || mongoose.model('Bus', BusSchema);
