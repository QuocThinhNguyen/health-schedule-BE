import {
  syncDoctorsToElasticsearch,
  syncSetupDoctorsToElasticsearch,
} from "./syncDoctors.js";
import {
  syncServicesToElasticsearch,
  syncSetupServicesToElasticsearch,
} from "./syncServices.js";

export const initializeElasticsearch = async (fullSync = false) => {
  try {
    console.log("Khởi tạo các chỉ mục Elasticsearch...");
    await syncSetupDoctorsToElasticsearch();
    await syncSetupServicesToElasticsearch();
    console.log("Khỏi tạo chỉ mục hoàn tất");

    if (fullSync) {
      await syncDoctorsToElasticsearch();
      await syncServicesToElasticsearch();
      console.log("Đồng bộ toàn bộ dữ liệu vào Elasticsearch hoàn tất!");
    }
    console.log("Khởi tạo Elasticsearch hoàn tất.");
  } catch (error) {
    console.error("Lỗi khi khởi tạo Elasticsearch:", error);
    throw error;
  }
};
