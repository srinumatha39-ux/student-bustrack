import mongoose from 'mongoose';

const IssueReportSchema = new mongoose.Schema(
  {
    report_id: {
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
    message: {
      type: String,
      required: true
    },
    issue_type: {
      type: String,
      default: 'MECHANICAL BREAKDOWN'
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    status: {
      type: String,
      default: 'PENDING'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      expires: 86400 // TTL Index: Auto-delete 24 hours after creation
    }
  },
  { timestamps: true }
);

export default mongoose.models.IssueReport || mongoose.model('IssueReport', IssueReportSchema);
