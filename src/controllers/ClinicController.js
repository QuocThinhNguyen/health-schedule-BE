import clinicService from "../services/ClinicService.js";

const createClinic = async (req, res) => {
  try {
    const imageArray = Object.values(req.files["image"] || {});
    const image =
      imageArray.length > 0
        ? imageArray[0].path
        : "https://res.cloudinary.com/dv9yzzjgg/image/upload/v1745632787/clinic_default_sbbquh.png";
    const clinicData = {
      ...req.body,
      image,
    };

    const infor = await clinicService.createClinic(clinicData);
    return res.status(200).json(infor);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const updateClinic = async (req, res) => {
  try {
    const id = req.params.id;
    const imageArray = Object.values(req.files["image"] || {});
    const image = imageArray.length > 0 ? imageArray[0].path : null;
    const clinicData = {
      ...req.body,
    };

    if (image) {
      clinicData.image = image;
    }
    const info = await clinicService.updateClinic(id, clinicData);
    return res.status(200).json(info);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getAllClinic = async (req, res) => {
  try {
    const data = await clinicService.getAllClinic();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getDetailClinic = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await clinicService.getDetailClinic(id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const deleteClinic = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await clinicService.deleteClinic(id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const filterClinics = async (req, res) => {
  try {
    const data = await clinicService.filterClinics(req.query);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getDropdownClinics = async (req, res) => {
  try {
    const data = await clinicService.getDropdownClinics();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

export default {
  createClinic,
  updateClinic,
  getAllClinic,
  getDetailClinic,
  deleteClinic,
  filterClinics,
  getDropdownClinics,
};
