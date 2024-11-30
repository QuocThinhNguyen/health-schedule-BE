import allCodeService from "../services/AllCodeService.js";

const createAllCode = async (req,res)=>{
    try{
        const info = await allCodeService.createAllCode(req.body);
        return res.status(info.status).json(info);
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        });
    }
}

export default {
    createAllCode
}