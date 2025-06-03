const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
    powerOutput: {
      type: Number,
      required: [true, 'Power output is required'],
      min: [0, 'Power output cannot be negative'],
    },
    connectorType: {
      type: String,
      required: [true, 'Connector type is required'],
      enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
stationSchema.index({ location: '2dsphere' });
const Station = mongoose.model('Station', stationSchema);
module.exports = Station; 