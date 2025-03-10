import doctorInforService from "../services/DoctorService.js";

const getDoctorInfor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const info = await doctorInforService.getDoctorInfor(doctorId);
    return res.status(200).json(info);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getPriceRange = async (req, res) => {
  try {
    const data = await doctorInforService.getPriceRange(req.query);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getAllDoctor = async (req, res) => {
  try {
    const data = await doctorInforService.getAllDoctor(req.query);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      status: 500,

      message: `Error from server, ${e.message}`,
    });
  }
};

const updateDoctorInfor = async (req, res) => {
  try {
    const id = req.params.id;
    const image = req.file ? `${req.file.filename}` : null;
    const doctorData = {
      ...req.body,
    };

    if (image) {
      doctorData.image = image;
    }
    const data = await doctorInforService.updateDoctorInfor(id, doctorData);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const searchDoctor = async (req, res) => {
  try {
    const keyword = req.query.keyword.replace(/\s+/g, " ").trim();
    const result = await doctorInforService.searchDoctor(keyword);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getDropdownDoctors = async (req, res) => {
  try {
    const data = await doctorInforService.getDropdownDoctors();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getAcademicRanksAndDegrees = async (req, res) => {
  try {
    const data = await doctorInforService.getAcademicRanksAndDegrees();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const searchDoctorByElasticeSearch = async (req, res) => {
  try {
    const { keyword, clinicId, specialtyId,gender, minPrice, maxPrice, sort, page, limit } =
      req.query;
    console.log("query", req.query);

    const filters = {
      clinicId,
      specialtyId,
      gender,
      minPrice,
      maxPrice,
    };

    const sortOption = sort;

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    };
    const result = await doctorInforService.searchDoctorByElasticeSearch(
      keyword,
      filters,
      sortOption,
      pagination
    );
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

export default {
  getDoctorInfor,
  updateDoctorInfor,
  searchDoctor,
  getPriceRange,
  getAllDoctor,
  getDropdownDoctors,
  getAcademicRanksAndDegrees,
  searchDoctorByElasticeSearch,
};
