import service from "../models/service.js";
import clinic from "../models/clinic.js";
import serviceCategory from "../models/service_category.js";
import uploadFile from "../utils/uploadFile.js";
import cloudinary from "../configs/cloudinaryConfig.js";
import scheduleService from "./ScheduleService.js";
import { elasticClient } from "../configs/connectElastic.js";
import { syncServicesToElasticsearch } from "../integrations/elasticsearch/syncServices.js";
const getServiceBySearchAndFilter = (
  keyword,
  serviceCategoryId,
  clinicId,
  minPrice,
  maxPrice,
  sort,
  pageNo,
  pageSize
) => {
  return new Promise(async (resolve, reject) => {
    try {
      //elastice search
      // const query = {};
      // if (keyword) {
      //   query.name = { $regex: keyword, $options: "i" };
      // }
      // if (filter.serviceCategoryId) {
      //   query.serviceCategoryId = filter.serviceCategoryId;
      // }
      // if (filter.clinicId) {
      //   query.clinicId = filter.clinicId;
      // }
      // if (filter.minPrice && filter.maxPrice) {
      //   query.price = {
      //     $gte: parseFloat(filter.minPrice),
      //     $lte: parseFloat(filter.maxPrice),
      //   };
      // }

      // const services = await service
      //   .find(query)
      //   .populate({
      //     path: "clinicId",
      //     model: "Clinic",
      //     localField: "clinicId",
      //     foreignField: "clinicId",
      //     select: "name address ",
      //   })
      //   .populate({
      //     path: "serviceCategoryId",
      //     model: "ServiceCategory",
      //     localField: "serviceCategoryId",
      //     foreignField: "serviceCategoryId",
      //     select: "name ",
      //   })

      //   .skip((pageNo - 1) * pageSize)
      //   .limit(pageSize)
      //   .sort({ createdAt: -1 });
      // const totalServices = await service.countDocuments(query);

      let keywordQueries = [];
      let filterQueries = [];
      let sortQueries = [];

      if (keyword) {
        const words = keyword.toLowerCase().split(" ");
        const nameQueries = words.map((word) => ({
          match_phrase: {
            name: word,
          },
        }));
        keywordQueries.push({
          bool: {
            should: [...nameQueries],
            minimum_should_match: 1,
          },
        });
      }

      if (clinicId) {
        filterQueries.push({
          term: { clinicId: clinicId },
        });
      }
      if (serviceCategoryId) {
        filterQueries.push({
          term: { serviceCategoryId: serviceCategoryId },
        });
      }

      if (minPrice || maxPrice) {
        let priceRange = {};
        if (minPrice) {
          priceRange.gte = minPrice;
        }
        if (maxPrice) {
          priceRange.lte = maxPrice;
        }
        filterQueries.push({
          range: { price: priceRange },
        });
      }

      if (sort) {
        switch (sort) {
          case "gia-cao-den-thap":
            sortQueries.push({ price: "desc" });
            break;
          case "gia-thap-den-cao":
            sortQueries.push({ price: "asc" });
            break;
        }
      }

      console.log("keywordQueries", keywordQueries);
      console.log("filterQueries", filterQueries);
      console.log("sortQueries",sortQueries);
      
      const results = await elasticClient.search({
        index: "services",
        body: {
          query: {
            bool: {
              must:
                keywordQueries.length > 0
                  ? [...keywordQueries]
                  : { match_all: {} },
              filter: filterQueries,
            },
          },
          sort: sortQueries,
          from: (pageNo - 1) * pageSize,
          size: pageSize,
          track_total_hits: true,
          highlight: {
            fields: {
              name: {},
            },
          },
        },
      });

      const totalServices = results.body?.hits?.total.value;
      const totalPages = Math.ceil(totalServices / pageSize);

      return resolve({
        status: 200,
        message: "Get service by search successfully",
        currentPage: pageNo,
        totalPage: totalPages,
        totalElement: totalServices,
        data: results.body?.hits?.hits.map((hit) => ({
          ...hit._source,
          highlight: hit.highlight || {},
        })),
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getServiceByClinic = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const clinicId = await scheduleService.getClinicIdByUserId(userId);

      const services = await service
        .find({ clinicId: clinicId })
        .populate({
          path: "clinicId",
          model: "Clinic",
          localField: "clinicId",
          foreignField: "clinicId",
          select: "name address ",
        })
        .populate({
          path: "serviceCategoryId",
          model: "ServiceCategory",
          localField: "serviceCategoryId",
          foreignField: "serviceCategoryId",
          select: "name",
        });
      return resolve({
        status: 200,
        message: "Get services by clinic successfully",
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
      syncServicesToElasticsearch();
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
      syncServicesToElasticsearch();
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
      syncServicesToElasticsearch();
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
  getServiceByClinic,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
