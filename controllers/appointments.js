const Appointment = require("../models/Appointment");
const Massage = require("../models/Massage");

// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Public
exports.getAppointments = async (req, res, next) => {
  let query;

  //General users can only see their own appointments!
  if (req.user.role !== "admin") {
    query = Appointment.find({ user: req.user.id }).populate({
      path: "massage",
      select: "name province tel",
    });
  } else {
    query = Appointment.find().populate({
      path: "massage",
      select: "name province tel",
    });
  }
  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot find Appointment",
    });
  }
};

//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access   Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "massage",
      select: "name province tel",
    });

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: `Appointment with the id of ${req.params.id} `,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

//@desc     Create a appointment
//@route    POST /api/v1/appointments/:massageId/appointments
//@access   Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.massage = req.params.massageId;

    const massage = await Massage.findById(req.params.massageId);

    if (!massage) {
      return res.status(404).json({
        success: false,
        message: `No massage found with the id of ${req.params.massageId}`,
      });
    }

    const openTime = massage.opentime.split(":");
    const openHour = openTime[0];
    const openMinute = openTime[1];
    const openTimeInSecond = openHour * 3600 + openMinute * 60;

    const closeTime = massage.closetime.split(":");
    const closeHour = closeTime[0];
    const closeMinute = closeTime[1];
    const closeTimeInSecond = closeHour * 3600 + closeMinute * 60;

    let apptTime = new Date(req.body.apptDate);
    let apptHour = apptTime.getHours();
    let apptMinute = apptTime.getMinutes();
    const apptTimeInSecond = apptHour * 3600 + apptMinute * 60;

    if (
      apptTimeInSecond < openTimeInSecond ||
      apptTimeInSecond > closeTimeInSecond
    ) {
      return res.status(404).json({
        success: false,
        message: `Your reservation is not within the massage's business hours`,
      });
    }

    //add user Id to req.body
    req.body.user = req.user.id;

    //Check for existing appointment
    const existedAppointments = await Appointment.find({ user: req.user.id });
    console.log(req.user.id);
    console.log(existedAppointments);

    //If the user is not an admin, they can only have 3 appointment.
    if (existedAppointments.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with the id of ${req.user.id} has already 3 appointments`,
      });
    }

    const appointment = await Appointment.create(req.body);
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Appointment" });
  }
};

//@desc     Update a appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment with the id of ${req.params.id} not found`,
      });
    }
    //Make sure the user is the one who created the appointment
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to update this appointment",
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Appointment" });
  }
};

//@desc     Delete a appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment with the id of ${req.params.id} not found`,
      });
    }
    //Make sure the user is the one who created the appointment
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this bootcamp",
      });
    }

    await appointment.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Appointment" });
  }
};
