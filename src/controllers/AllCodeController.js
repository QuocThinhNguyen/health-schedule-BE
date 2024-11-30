import allCodeService from "../services/AllCodeService.js";

const createAllCode = async (req,res)=>{
    try{
        const info = await allCodeService.createAllCode(req.body);
        return res.status(info.status).json(info);
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        });
    }
}

const updateAllCode = async (req, res) => {
    try {
        const id = req.params.id;
        const info = await allCodeService.updateAllCode(id, req.body);
        return res.status(200).json(info);
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
    });
}
}

const getAllCode = async (req, res) => {
    try {
        const data = await allCodeService.getAllCode();
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

const deleteAllCode = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await allCodeService.deleteAllCode(id);
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
}

export default {
    createAllCode, 
    updateAllCode,
    getAllCode,
    deleteAllCode
}