import serviceCategoryService from "../services/ServiceCategoryService.js";

const getDropdownServiceCategory = async (req, res) => {
  try {
    const result = await serviceCategoryService.getDropdownServiceCategory();
    return res.status(200).json(result);
  } catch (e) {
    console.log(
      "Error from getDropdownServiceCategory controller: ",
      e.message
    );
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getServiceCategoryBySearch = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const pageNo = parseInt(req.query.pageNo);
    const pageSize = parseInt(req.query.pageSize);
    const result = await serviceCategoryService.getServiceCategoryBySearch(
      keyword,
      pageNo,
      pageSize
    );
    return res.status(200).json(result);
  } catch (e) {
    console.log(
      "Error from getServiceCategoryBySearch controller: ",
      e.message
    );
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getDropdownServiceCategoryByClinic = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const result =
      await serviceCategoryService.getDropdownServiceCategoryByClinic(
        userId
      );
    return res.status(200).json(result);
  } catch (e) {
    console.log(
      "Error from getDropdownServiceCategoryByClinic controller: ",
      e.message
    );
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
}

const getDetailServiceCategory = async (req, res) => {
  try {
    const serviceCategoryId = req.params.id;
    const result = await serviceCategoryService.getDetailServiceCategory(
      serviceCategoryId
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from getDetailServiceCategory controller: ", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const createServiceCategory = async (req, res) => {
  try {
    const serviceCategoryData = req.body;
    const result = await serviceCategoryService.createServiceCategory(
      serviceCategoryData
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from createServiceCategory controller: ", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const updateServiceCategory = async (req, res) => {
  try {
    const serviceCategoryId = req.params.id;
    const serviceCategoryData = req.body;
    const result = await serviceCategoryService.updateServiceCategory(
      serviceCategoryId,
      serviceCategoryData
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from updateServiceCategory controller: ", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const deleteServiceCategory = async (req, res) => {
  try {
    const serviceCategoryId = req.params.id;
    const result = await serviceCategoryService.deleteServiceCategory(
      serviceCategoryId
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error from deleteServiceCategory controller: ", err.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

export default {
  getDropdownServiceCategory,
  getServiceCategoryBySearch,
  getDropdownServiceCategoryByClinic,
  getDetailServiceCategory,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
};
