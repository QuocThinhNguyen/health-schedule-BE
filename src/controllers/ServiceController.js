import serviceService from "../services/ServiceService.js";

const getServiceBySearchAndFilter = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const serviceCategoryId = parseInt(req.query.serviceCategoryId);
    const clinicId = parseInt(req.query.clinicId);
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    const sort = req.query.sort;
    const pageNo = parseInt(req.query.pageNo) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    console.log(
      "getServiceBySearchAndFilter controller called with params:",
      req.query
    );

    const result = await serviceService.getServiceBySearchAndFilter(
      keyword,
      serviceCategoryId,
      clinicId,
      minPrice,
      maxPrice,
      sort,
      pageNo,
      pageSize
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from getServiceBySearch controller:", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getServiceByClinic = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const result = await serviceService.getServiceByClinic(userId);
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from getDropdownServices controller:", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await serviceService.getServiceById(id);
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from getServiceById controller:", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const createService = async (req, res) => {
  try {
    const image = req.file ? `${req.file.path}` : null;
    const serviceData = {
      ...req.body,
      image,
    };
    const result = await serviceService.createService(serviceData);
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from createService controller:", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const updateService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const image = req.file ? `${req.file.path}` : null;
    const serviceData = {
      ...req.body,
      image,
    };
    const result = await serviceService.updateService(id, serviceData);
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from updateService controller:", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await serviceService.deleteService(id);
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from deleteService controller:", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

export default {
  getServiceBySearchAndFilter,
  getServiceByClinic,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
