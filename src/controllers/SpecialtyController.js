import specialtyService from "../services/SpecialtyService.js";

const createSpecialty = async (req, res) => {
    try {
        const image = req.file ? `${req.file.filename}` : null;
        const specialtyData = {
            ...req.body,
            image
        }
        const infor = await specialtyService.createSpecialty(specialtyData);
        return res.status(200).json(infor);
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

const updateSpecialty = async (req, res) => {
    try {
        const id = req.params.id;
        const image = req.file ? `${req.file.filename}` : null;
        const specialtyData = {
            ...req.body,
        }

        if (image) {
            specialtyData.image = image;
        }
        const info = await specialtyService.updateSpecialty(id, specialtyData);
        return res.status(200).json(info);
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

const getAllSpecialty = async (req, res) => {
    try {
        const data = await specialtyService.getAllSpecialty(req.query);
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

const getDetailSpecialty = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await specialtyService.getDetailSpecialty(id);
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

const deleteSpecialty = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await specialtyService.deleteSpecialty(id);
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

const filterSpecialty = async (req, res) => {
    try {
        const data = await specialtyService.filterSpecialty(req.body);
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

const getDropdownSpecialty = async (req, res) => {
    try {
        const data = await specialtyService.getDropdownSpecialty();
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

const getSpecialtyByClinicId = async (req, res) => {
    try {
        const clinicId = req.params.clinicId;
        const data = await specialtyService.getSpecialtyByClinicId(clinicId);
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

export default {
    createSpecialty,
    updateSpecialty,
    getAllSpecialty,
    getDetailSpecialty,
    deleteSpecialty,
    filterSpecialty,
    getDropdownSpecialty,
    getSpecialtyByClinicId
}