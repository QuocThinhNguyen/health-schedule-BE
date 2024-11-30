import adminService from "../services/AdminService.js";

const adminHomePage = async (req, res) => {
  try {
    const response = await adminService.adminHomePage();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

export default { adminHomePage };
