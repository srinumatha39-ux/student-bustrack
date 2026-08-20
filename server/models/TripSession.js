import mongoose from 'mongoose';

const TripSessionSchema = new mongoose.Schema(
  {
    trip_id: {
      type: String,
      required: true,
      unique: true
    },
    bus_id: {
      type: String,
      required: true
    },
    driver_id: {
      type: String,
      required: true
    },
    start_time: {
      type: Date,
      default: Date.now
    },
    end_time: {
      type: Date
    },
    live_location: {
      latitude: { type: Number, default: 17.6896 },
      longitude: { type: Number, default: 83.0024 },
      speed: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export default mongoose.models.TripSession || mongoose.model('TripSession', TripSessionSchema);
