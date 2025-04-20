import feedBackService from "../services/FeedBackService.js";
import ReviewMedia from "../models/review_media.js";
const createFeedBack = async (req, res) => {
  try {
    console.log("CHECK:", req.body);
    const files = req.files || [];
    console.log("FILES:", files);
    const info = await feedBackService.createFeedBack(req.body);
    console.log("INFO:", info);

    if (info.status === 200) {
      for (const file of files) {
        await ReviewMedia.create({
          feedBackId: info.data.feedBackId,
          mediaName: file.filename,
        });
      }
      return res.status(200).json(info);
    }
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const updateFeedBack = async (req, res) => {
  try {
    const id = req.params.id;
    const info = await feedBackService.updateFeedBack(id, req.body);
    return res.status(200).json(info);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getAllFeedBack = async (req, res) => {
  try {
    const data = await feedBackService.getAllFeedBack();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

const deleteFeedBack = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await feedBackService.deleteFeedBack(id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

// const getFeedBackByDoctorId = async (req, res) => {
//     try {
//         const doctorId = req.params.doctorId;
//         const data = await feedBackService.getFeedBackByDoctorId(doctorId);
//         return res.status(200).json(data)
//     } catch (err) {
//         return res.status(500).json({
//             status: 500,
//             message: "Error from server"
//         })
//     }
// }

const getFeedBackByDoctorId = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const query = {
      doctorId: doctorId,
      page: req.query.page,
      limit: req.query.limit,
    };
    const data = await feedBackService.getFeedBackByDoctorId(query);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

const checkFeedBacked = async (req, res) => {
  try {
    const { patientId, doctorId, date } = req.body;
    // console.log(req.body)
    const data = await feedBackService.checkFeedBacked(
      patientId,
      doctorId,
      date
    );
    return res.status(200).json({
      status: 200,
      message: "Commented",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getAllFeedBackByFilter = async (req, res) => {
  try {
    // Gọi service và truyền query từ request
    const data = await feedBackService.getAllFeedBackByFilter(req.query);
    // console.log('Query received:', req.query);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getFeedBackByClinicId = async (req, res) => {
  try {
    const clinicId = req.params.clinicId;
    const query = {
      clinicId: clinicId,
      page: req.query.page,
      limit: req.query.limit,
    };
    console.log("TEST ", query);
    const data = await feedBackService.getFeedBackByClinicId(query);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

export default {
  createFeedBack,
  updateFeedBack,
  getAllFeedBack,
  deleteFeedBack,
  getFeedBackByDoctorId,
  checkFeedBacked,
  getAllFeedBackByFilter,
  getFeedBackByClinicId,
};
