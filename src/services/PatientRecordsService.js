import patientRecords from "../models/patient_records.js";

const getAllPatientRecords = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allPatientRecords = await patientRecords.find({});
      resolve({
        status: 200,
        message: "SUCCESS",
        data: allPatientRecords,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getPatientRecordsById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await patientRecords.findOne({
        patientRecordId: id,
      });
      if (!data) {
        resolve({
          status: 404,
          message: "Patient Record is not defined",
        });
      }
      resolve({
        status: 200,
        message: "Get patient record successfully",
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const createPatientRecord = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.patientId ||
        !data.fullname ||
        !data.gender ||
        !data.birthDate ||
        !data.phoneNumber ||
        !data.CCCD ||
        !data.email ||
        !data.job ||
        !data.address
      ) {
        resolve({
          status: 400,
          message: "Missing required fields",
        });
      } else {
        await patientRecords.create({
          patientId: data.patientId,
          fullname: data.fullname,
          gender: data.gender,
          birthDate: data.birthDate,
          phoneNumber: data.phoneNumber,
          CCCD: data.CCCD,
          email: data.email,
          job: data.job,
          address: data.address,
        });
        resolve({
          status: 200,
          message: "Tạo hồ sơ thành công",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updatePatientRecord = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkRecord = await patientRecords.findOne({
        patientRecordId: id,
      });

      if (!checkRecord) {
        resolve({
          status: 404,
          message: "Patient Record is not defined",
        });
      }

      await patientRecords.updateOne({ patientRecordId: id }, data, {
        new: true,
      });

      resolve({
        status: 200,
        message: "Update patient records successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deletePatientRecord = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const findRecord = await patientRecords.findOne({
        patientRecordId: id,
      });

      if (!findRecord) {
        resolve({
          status: 404,
          message: "Patient Record is not defined",
        });
      }

      await patientRecords.deleteOne({
        patientRecordId: id,
      });

      resolve({
        status: 200,
        message: "Delete patient record successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getPatientRecordsByPatientId = async (patientId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const patientRecord = await patientRecords.find({ patientId: patientId });
      if (!patientRecord) {
        resolve({
          status: 404,
          message: "Patient record not found",
        });
      } else {
        resolve({
          status: 200,
          data: patientRecord,
        });
      }
    } catch (e) {
      reject({
        status: 500,
        message: "Error from server",
        error: e.message,
      });
    }
  });
};

export default {
  getAllPatientRecords,
  getPatientRecordsById,
  createPatientRecord,
  updatePatientRecord,
  deletePatientRecord,
  getPatientRecordsByPatientId,
};
