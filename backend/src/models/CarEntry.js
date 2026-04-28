const mongoose = require('mongoose');

const carEntrySchema = new mongoose.Schema(
  {
    plateNumber:   { type: String, required: true, uppercase: true, trim: true },
    parkingCode:   { type: String, required: true, uppercase: true, trim: true },
    parking:       { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
    driverEmail:   { type: String, trim: true, lowercase: true, default: null },
    entryDateTime: { type: Date, default: Date.now },
    exitDateTime:  { type: Date, default: null },
    chargedAmount: { type: Number, default: 0 },
    status:        { type: String, enum: ['parked', 'exited'], default: 'parked' },
    attendant:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CarEntry', carEntrySchema);
