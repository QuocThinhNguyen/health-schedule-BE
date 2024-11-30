import allCode from "../models/allcodes.js"

const createAllCode = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.keyMap || !data.type || !data.valueEn || !data.valueVi) {
                resolve({
                    status:400,
                    message: "Missing required fields"
                })
            } else {
                await allCode.create({
                    keyMap: data.keyMap,
                    type: data.type,
                    valueEn: data.valueEn,
                    valueVi: data.valueVi
                })
                resolve({
                    status:200,
                    message: "Create allcode successfully"
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createAllCode   
}