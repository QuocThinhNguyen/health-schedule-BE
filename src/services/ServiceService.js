import service from "../models/service.js";
import clinic from "../models/clinic.js";
import serviceCategory from "../models/service_category.js";
import uploadFile from "../utils/uploadFile.js";
import cloudinary from "../configs/cloudinaryConfig.js";

const getServiceBySearchAndFilter = (keyword, filter, pageNo, pageSize) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {};
      if (keyword) {
        query.name = { $regex: keyword, $options: "i" };
      }
      if (filter.serviceCategoryId) {
        query.serviceCategoryId = filter.serviceCategoryId;
      }
      if (filter.clinicId) {
        query.clinicId = filter.clinicId;
      }
      if (filter.minPrice && filter.maxPrice) {
        query.price = {
          $gte: parseFloat(filter.minPrice),
          $lte: parseFloat(filter.maxPrice),
        };
      }

      const services = await service
        .find(query)
        .populate({
          path: "clinicId",
          model: "Clinic",
          localField: "clinicId",
          foreignField: "clinicId",
          select: "name address ",
        })
        .skip((pageNo - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });
      const totalServices = await service.countDocuments(query);

      return resolve({
        status: 200,
        message: "Get service by search successfully",
        currentPage: pageNo,
        totalPage: Math.ceil(totalServices / pageSize),
        totalElement: totalServices,
        data: services,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getServiceById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingService = await service
        .findOne({ serviceId: id })
        .populate({
          path: "clinicId",
          model: "Clinic",
          localField: "clinicId",
          foreignField: "clinicId",
          select: "name image address",
        })
        .populate({
          path: "serviceCategoryId",
          model: "ServiceCategory",
          localField: "serviceCategoryId",
          foreignField: "serviceCategoryId",
          select: "name",
        });

      if (!existingService) {
        return resolve({
          status: 400,
          message: "Service not found",
        });
      }
      return resolve({
        status: 200,
        message: "Get service by id successfully",
        data: existingService,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const createService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("data", data);
      console.log("1");

      if (
        !data ||
        !data.name ||
        !data.price ||
        !data.clinicId ||
        !data.serviceCategoryId ||
        !data.image
      ) {
        return resolve({
          status: 400,
          message: "Missing required fields",
        });
      }
      console.log("!data", !data);

      const existingClinic = await clinic.findOne({ clinicId: data.clinicId });
      if (!existingClinic) {
        return resolve({
          status: 400,
          message: "Clinic not found",
        });
      }
      const existingServiceCategory = await serviceCategory.findOne({
        serviceCategoryId: data.serviceCategoryId,
      });
      if (!existingServiceCategory) {
        return resolve({
          status: 400,
          message: "Service category not found",
        });
      }

      const existingService = await service.findOne({
        clinicId: data.clinicId,
        name: data.name,
      });
      if (existingService) {
        return resolve({
          status: 400,
          message: "Service with the same name already exists in this clinic",
        });
      }

      const imageUrl = await uploadFile(data.image);

      const newService = await service.create({
        name: data.name,
        image: imageUrl,
        price: data.price,
        description: data.description,
        preparationProcess: data.preparationProcess,
        serviceDetail: data.serviceDetail,
        clinicId: data.clinicId,
        serviceCategoryId: data.serviceCategoryId,
      });
      console.log("2");
      return resolve({
        status: 200,
        message: "Create service successfully",
        data: {
          serviceCategoryId: newService.serviceId,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateService = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("data:", data);

      if (
        !data ||
        !data.name ||
        !data.price ||
        !data.clinicId ||
        !data.serviceCategoryId
      ) {
        return resolve({
          status: 400,
          message: "Missing required fields",
        });
      }

      const existingService = await service.findOne({ serviceId: id });
      if (!existingService) {
        return resolve({
          status: 400,
          message: "Service not found",
        });
      }

      const existingClinic = await clinic.findOne({ clinicId: data.clinicId });
      if (!existingClinic) {
        return resolve({
          status: 400,
          message: "Clinic not found",
        });
      }
      const existingServiceCategory = await serviceCategory.findOne({
        serviceCategoryId: data.serviceCategoryId,
      });
      if (!existingServiceCategory) {
        return resolve({
          status: 400,
          message: "Service category not found",
        });
      }

      const existingServiceName = await service.findOne({
        clinicId: data.clinicId,
        name: data.name,
      });

      if (existingServiceName && existingServiceName.serviceId !== id) {
        return resolve({
          status: 400,
          message: "Service with the same name already exists in this clinic",
        });
      }

      const serviceData = {
        name: data.name,
        price: data.price,
        description: data.description,
        preparationProcess: data.preparationProcess,
        serviceDetail: data.serviceDetail,
        clinicId: data.clinicId,
        serviceCategoryId: data.serviceCategoryId,
      };

      if (data.image) {
        const imageUrl = await uploadFile(data.image);
        if (existingService.image) {
          const publicId = existingService.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`clinic_management/${publicId}`);
        }
        serviceData.image = imageUrl;
      }

      await service.updateOne({ serviceId: id }, serviceData);
      return resolve({
        status: 200,
        message: "Update service successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingService = await service.findOne({ serviceId: id });
      if (!existingService) {
        return resolve({
          status: 400,
          message: "Service not found",
        });
      }
      await service.delete({ serviceId: id });
      return resolve({
        status: 200,
        message: "Delete service successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getServiceBySearchAndFilter,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
