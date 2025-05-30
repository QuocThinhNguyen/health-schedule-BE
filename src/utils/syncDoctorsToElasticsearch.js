import doctorInfo from "../models/doctor_info.js";
import specialty from "../models/specialty.js";
import clinic from "../models/clinic.js";
import user from "../models/users.js";
import feedBacks from "../models/feedbacks.js";
import { elasticClient } from "../configs/connectElastic.js";

async function syncSetupDoctorsToElasticsearch() {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: "doctors",
    });
    if (indexExists) {
      await elasticClient.indices.delete({ index: "doctors" });
    }
    await elasticClient.indices.create({
      index: "doctors",
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
            fullname: {
              type: "text",
              analyzer: "custom_vietnamese",
              search_analyzer: "search_vietnamese",
            },
            clinicId: { type: "keyword" },
            specialtyId: { type: "keyword" },
            gender: { type: "keyword" },
            price: { type: "float" },
            avgRating: { type: "float" },
            comments: {
              type: "text",
              search_analyzer: "search_vietnamese",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi đồng bộ dữ liệu lên Elasticsearch:", error);
    throw error;
  }
}

async function syncDoctorsToElasticsearch() {
  const doctors = await doctorInfo.find();

  for (let doctor of doctors) {
    const clinicData = await clinic.findOne({
      clinicId: doctor.clinicId,
    });
    const specialtyData = await specialty.findOne({
      specialtyId: doctor.specialtyId,
    });
    const doctorInfoData = await doctorInfo.findOne({
      doctorId: doctor.doctorId,
    });

    const userData = await user.findOne({
      userId: doctor.doctorId,
    });

    const feedbackData = await feedBacks.find({
      doctorId: doctor.doctorId,
    });

    await elasticClient.index({
      index: "doctors",
      id: doctor.doctorId,
      body: {
        doctorId: doctor.doctorId,
        fullname: userData ? userData.fullname : null,
        gender: userData ? userData.gender : null,
        image: userData ? userData.image : null,
        position: doctor ? doctor.position : null,
        clinicId: clinicData ? clinicData.clinicId : null,
        clinicName: clinicData ? clinicData.name : null,
        clinicAddress: clinicData ? clinicData.address : null,
        clinicImage: clinicData ? clinicData.image : null,
        specialtyId: specialtyData ? specialtyData.specialtyId : null,
        specialtyName: specialtyData ? specialtyData.name : null,
        price: doctorInfoData.price,
        avgRating:
          feedbackData.length > 0
            ? Math.round(
                (feedbackData.reduce(
                  (acc, feedback) => acc + feedback.rating,
                  0
                ) /
                  feedbackData.length) *
                  10
              ) / 10
            : 0.0,
        countFeedBack: feedbackData.length,
        comments: feedbackData
          ? feedbackData.map((feedback) => feedback.comment)
          : [],
      },
    });
  }
  console.log("Đồng bộ dữ liệu lên Elasticsearch hoàn tất!");
}

export { syncSetupDoctorsToElasticsearch, syncDoctorsToElasticsearch };
