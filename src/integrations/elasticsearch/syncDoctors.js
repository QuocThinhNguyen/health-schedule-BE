import doctorInfo from "../../models/doctor_info.js";
import specialty from "../../models/specialty.js";
import clinic from "../../models/clinic.js";
import user from "../../models/users.js";
import feedBacks from "../../models/feedbacks.js";
import { elasticClient } from "../../configs/connectElastic.js";

async function syncSetupDoctorsToElasticsearch() {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: "doctors",
    });
    if (indexExists.statusCode !== 200) {
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
      console.log("Chỉ mục 'doctors' đã được tạo thành công!");
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ dữ liệu doctors lên Elasticsearch:", error);
    throw error;
  }
}

// async function syncDoctorsToElasticsearch() {
//   const doctors = await doctorInfo.find();

//   for (let doctor of doctors) {
//     const clinicData = await clinic.findOne({
//       clinicId: doctor.clinicId,
//     });
//     const specialtyData = await specialty.findOne({
//       specialtyId: doctor.specialtyId,
//     });
//     const doctorInfoData = await doctorInfo.findOne({
//       doctorId: doctor.doctorId,
//     });

//     const userData = await user.findOne({
//       userId: doctor.doctorId,
//     });

//     const feedbackData = await feedBacks.find({
//       doctorId: doctor.doctorId,
//     });

//     await elasticClient.index({
//       index: "doctors",
//       id: doctor.doctorId,
//       body: {
//         doctorId: doctor.doctorId,
//         fullname: userData ? userData.fullname : null,
//         gender: userData ? userData.gender : null,
//         image: userData ? userData.image : null,
//         position: doctor ? doctor.position : null,
//         clinicId: clinicData ? clinicData.clinicId : null,
//         clinicName: clinicData ? clinicData.name : null,
//         clinicAddress: clinicData ? clinicData.address : null,
//         clinicImage: clinicData ? clinicData.image : null,
//         specialtyId: specialtyData ? specialtyData.specialtyId : null,
//         specialtyName: specialtyData ? specialtyData.name : null,
//         price: doctorInfoData.price,
//         avgRating:
//           feedbackData.length > 0
//             ? Math.round(
//                 (feedbackData.reduce(
//                   (acc, feedback) => acc + feedback.rating,
//                   0
//                 ) /
//                   feedbackData.length) *
//                   10
//               ) / 10
//             : 0.0,
//         countFeedBack: feedbackData.length,
//         comments: feedbackData
//           ? feedbackData.map((feedback) => feedback.comment)
//           : [],
//       },
//     });
//   }
//   console.log("Đồng bộ dữ liệu doctors lên Elasticsearch hoàn tất!");
// }

async function syncDoctorsToElasticsearch() {
  // 1. Lấy danh sách bác sĩ từ MongoDB
  const doctors = await doctorInfo.find();
  const doctorIdsInDB = doctors.map((doc) => doc.doctorId.toString());

  // 2. Lấy danh sách doctorId hiện có trong Elasticsearch
  const existingDocs = await elasticClient.search({
    index: "doctors",
    body: {
      query: { match_all: {} },
      _source: ["doctorId"],
      size: 10000, // đủ lớn để lấy hết
    },
  });

  const doctorIdsInES = existingDocs.body.hits.hits.map((hit) =>
    hit._source.doctorId.toString()
  );

  // 3. Xác định các doctorId cần xóa (không còn trong MongoDB)
  const idsToDelete = doctorIdsInES.filter((id) => !doctorIdsInDB.includes(id));

  // 4. Xoá những doctor thừa khỏi Elasticsearch
  for (const id of idsToDelete) {
    await elasticClient.delete({
      index: "doctors",
      id: id,
    });
    console.log(
      `Đã xoá doctorId ${id} khỏi Elasticsearch vì không còn trong DB`
    );
  }

  // 5. Cập nhật lại danh sách hiện có
  for (let doctor of doctors) {
    const clinicData = await clinic.findOne({ clinicId: doctor.clinicId });
    const specialtyData = await specialty.findOne({
      specialtyId: doctor.specialtyId,
    });
    const doctorInfoData = await doctorInfo.findOne({
      doctorId: doctor.doctorId,
    });
    const userData = await user.findOne({ userId: doctor.doctorId });
    const feedbackData = await feedBacks.find({ doctorId: doctor.doctorId });

    await elasticClient.index({
      index: "doctors",
      id: doctor.doctorId,
      body: {
        doctorId: doctor.doctorId,
        fullname: userData?.fullname || null,
        gender: userData?.gender || null,
        image: userData?.image || null,
        position: doctor?.position || null,
        clinicId: clinicData?.clinicId || null,
        clinicName: clinicData?.name || null,
        clinicAddress: clinicData?.address || null,
        clinicImage: clinicData?.image || null,
        specialtyId: specialtyData?.specialtyId || null,
        specialtyName: specialtyData?.name || null,
        price: doctorInfoData?.price || null,
        avgRating:
          feedbackData.length > 0
            ? Math.round(
                (feedbackData.reduce((acc, fb) => acc + fb.rating, 0) /
                  feedbackData.length) *
                  10
              ) / 10
            : 0.0,
        countFeedBack: feedbackData.length,
        comments: feedbackData.map((fb) => fb.comment),
      },
    });
  }

  console.log("Đồng bộ dữ liệu doctors lên Elasticsearch hoàn tất!");
}

export { syncSetupDoctorsToElasticsearch, syncDoctorsToElasticsearch };
