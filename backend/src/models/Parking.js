const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema(
  {
    code:            { type: String, required: true, unique: true, uppercase: true, trim: true },
    name:            { type: String, required: true, trim: true },
    totalSpaces:     { type: Number, required: true, min: 1 },
    availableSpaces: { type: Number, required: true, min: 0 },
    location:        { type: String, required: true, trim: true },
    feePerHour:      { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Parking', parkingSchema);
