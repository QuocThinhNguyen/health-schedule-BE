import service from "../../models/service.js";
import serviceCategory from "../../models/service_category.js";
import clinic from "../../models/clinic.js";
import { elasticClient } from "../../configs/connectElastic.js";

async function syncSetupServicesToElasticsearch() {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: "services",
    });
    if (indexExists.statusCode !== 200) {
      await elasticClient.indices.create({
        index: "services",
        body: {
          settings: {
            analysis: {
              filter: {
                edge_ngram_filter: {
                  type: "edge_ngram",
                  min_gram: 3,
                  max_gram: 5,
                  preserve_original: true,
                },
              },
              analyzer: {
                custom_vietnamese: {
                  tokenizer: "standard",
                  filter: [
                    "lowercase",
                    "icu_normalizer",
                    "icu_folding",
                    "edge_ngram_filter",
                  ],
                },
                search_vietnamese: {
                  tokenizer: "standard",
                  filter: ["lowercase", "icu_normalizer", "icu_folding"],
                },
              },
            },
          },
          mappings: {
            properties: {
              name: {
                type: "text",
                analyzer: "custom_vietnamese",
                search_analyzer: "search_vietnamese",
              },
              price: { type: "float" },
              clinicId: { type: "keyword" },
              serviceCategoryId: { type: "keyword" },
            },
          },
        },
      });
      console.log("Chỉ mục 'services' đã được tạo thành công!");
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ dữ liệu services lên Elasticsearch:", error);
    throw error;
  }
}

async function syncServicesToElasticsearch() {
  const services = await service.find();

  for (let service of services) {
    const clinicData = await clinic.findOne({
      clinicId: service.clinicId,
    });
    const serviceCategoryData = await serviceCategory.findOne({
      serviceCategoryId: service.serviceCategoryId,
    });

    await elasticClient.index({
      index: "services",
      id: service.serviceId,
      body: {
        serviceId: service.serviceId,
        name: service.name,
        image: service.image,
        price: service.price,
        clinicId: clinicData ? clinicData.clinicId : null,
        clinicName: clinicData ? clinicData.name : null,
        clinicAddress: clinicData ? clinicData.address : null,
        clinicImage: clinicData ? clinicData.image : null,
        serviceCategoryId: serviceCategoryData
          ? serviceCategoryData.serviceCategoryId
          : null,
        serviceCategoryName: serviceCategoryData
          ? serviceCategoryData.name
          : null,
      },
    });
  }
  console.log("Đồng bộ dữ liệu services lên Elasticsearch hoàn tất!");
}

export { syncSetupServicesToElasticsearch, syncServicesToElasticsearch };
