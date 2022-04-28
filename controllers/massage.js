const Massage = require("../models/Massage");
// const vacCenter = require("../models/VacCenter");

// //@ desc    Get all vaccine centers
// //@ route   GET /api/v1/massages/vaccine-centers/
// //@ access  Public
// exports.getMassageCenters = async (req, res, next) => {
//   vacCenter.getAll((err, data) => {
//     if (err) {
//       res.status(500).send({
//         message:
//           err.message ||
//           "Some error occurred while retrieving vaccine centers.",
//       });
//     } else res.send(data);
//   });
// };

//@ desc    Get all massages
//@ route   GET /api/v1/massages
//@ access  Public
exports.getMassages = async (req, res, next) => {
  try {
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };

    //Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //Find massages
    query = Massage.find(JSON.parse(queryStr)).populate("appointments");

    //Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    //sort by
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Massage.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Execute query
    const massages = await query;

    //Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: massages.length,
      pagination,
      data: massages,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

//@ desc     Get single massage
//@ route   GET /api/v1/massages/:id
//@ access  Public
exports.getMassage = async (req, res, next) => {
  try {
    const massage = await Massage.findById(req.params.id);
    if (!massage) {
      return res
        .status(404)
        .json({ success: false, error: "Massage not found" });
    }
    res.status(200).json({ success: true, data: massage });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

//@ desc     Create a massages
//@ route   Post /api/v1/massages
//@ access  Private
exports.createMassage = async (req, res, next) => {
  const massage = await Massage.create(req.body);
  res.status(201).json({ success: true, data: massage });
};

//@ desc    Update single massage
//@ route   Put /api/v1/massages/:id
//@ access  Private
exports.updateMassage = async (req, res, next) => {
  try {
    const massage = await Massage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!massage) {
      return res
        .status(404)
        .json({ success: false, error: "Massage not found" });
    }
    return res.status(200).json({ success: true, data: massage });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

//@ desc   Delete single massage
//@ route   Delete /api/v1/massages/:id
//@ access  Private
exports.deleteMassage = async (req, res, next) => {
  try {
    const massage = await Massage.findById(req.params.id);
    if (!massage) {
      return res
        .status(404)
        .json({ success: false, error: "Massage not found" });
    }

    massage.remove();

    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
