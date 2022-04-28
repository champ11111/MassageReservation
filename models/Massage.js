const mongoose = require("mongoose");

const MassageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postal code"],
      maxlength: [5, "Postal code can not be more than 5 characters"],
    },
    tel: {
      type: String,
    },
    region: {
      type: String,
      required: [true, "Please add a region"],
    },
    opentime: {
      type: Date,
      require: [true, "Please add a open time"],
    },
    closetime: {
      type: Date,
      require: [true, "Please add a close time"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Cascade delete appointments when a massage is deleted
MassageSchema.pre("remove", async function (next) {
  console.log(`Appointments being removed from ${this._id}`);
  await this.model("Appointment").deleteMany({ massage: this._id });
  next();
});

//Reverses populate with virtuals
MassageSchema.virtual("appointments", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "massage",
  justOne: false,
});

module.exports = mongoose.model("massage", MassageSchema);
