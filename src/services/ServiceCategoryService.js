import serviceCategory from "../models/service_category.js";
import service from "../models/service.js";
import scheduleService from "./ScheduleService.js";

const getDropdownServiceCategory = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await serviceCategory.find();
      return resolve({
        status: 200,
        message: "Get dropdown service category successfully",
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getServiceCategoryBySearch = (keyword, pageNo, pageSize) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!pageNo || pageNo < 1) {
        pageNo = 1;
      }
      if (!pageSize || pageSize < 1) {
        pageSize = 10;
      }

      let search = {};
      if (keyword) {
        console.log("keyword 1", keyword);

        keyword = keyword.trim();
        search = {
          // name: { $regex: new RegExp(keyword, "i") },
          $text: { $search: keyword },
        };
      }

      const data = await serviceCategory
        .find(search)
        .skip((pageNo - 1) * pageSize)
        .limit(pageSize);
      const total = await serviceCategory.countDocuments(search);
      return resolve({
        status: 200,
        message: "Get service category by search successfully",
        currentPage: pageNo,
        totalPages: Math.ceil(total / pageSize),
        totalElement: total,
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDropdownServiceCategoryByClinic = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const clinicId = await scheduleService.getClinicIdByUserId(userId);
      if (!clinicId) {
        return resolve({
          status: 404,
          message: "Clinic not found for this user",
        });
      }
      const data = await serviceCategory.find({
        clinicId: clinicId,
      });

      return resolve({
        status: 200,
        message: "Get dropdown service category by clinic successfully",
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailServiceCategory = (serviceCategoryId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await serviceCategory.findOne({
        serviceCategoryId: serviceCategoryId,
      });

      if (data === null) {
        return resolve({
          status: 404,
          message: "Service category not found",
        });
      }
      return resolve({
        status: 200,

        message: "Get service category by ID successfully",
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const createServiceCategory = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.name) {
        return resolve({
          status: 400,
          message: "Missing required fields",
        });
      }
      const existingCategory = await serviceCategory.findOne({
        name: data.name,
      });
      if (existingCategory !== null) {
        return resolve({
          status: 400,
          message: "Service category already exists",
        });
      }
      const newData = await serviceCategory.create({
        name: data.name,
      });
      return resolve({
        status: 200,
        message: "Create service category successfully",
        data: {
          serviceCategoryId: newData.serviceCategoryId,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateServiceCategory = (serviceCategoryId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingCategory = await serviceCategory.findOne({
        serviceCategoryId,
      });
      if (existingCategory === null) {
        return resolve({
          status: 400,
          message: "Service category not found",
        });
      }
      await serviceCategory.updateOne(
        { serviceCategoryId },
        {
          name: data.name,
        }
      );
      return resolve({
        status: 200,
        message: "Update service category successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteServiceCategory = (serviceCategoryId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingCategory = await serviceCategory.findOne({
        serviceCategoryId,
      });
      if (existingCategory === null) {
        return resolve({
          status: 400,
          message: "Service category not found",
        });
      }
      await serviceCategory.deleteOne({ serviceCategoryId });
      await service.updateMany(
        {
          serviceCategoryId: serviceCategoryId,
        },
        { $set: { serviceCategoryId: null } }
      );
      return resolve({
        status: 200,
        message: "Delete service category successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
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
