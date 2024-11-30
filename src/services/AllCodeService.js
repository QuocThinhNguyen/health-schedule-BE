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

const updateAllCode = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {

            const checkAllCode = await allCode.findOne({
                id: id
            })

            if (!checkAllCode) {
                resolve({
                    status: 404,
                    message: "Allcode not found"
                });
            }

            await allCode.updateOne(
                { id: id },
                data,
                { new: true }
            )

            resolve({
                status: 200,
                message: "Update allcode successfully"
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllCode = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allcodes = await allCode.find()
            resolve({
                status: 200,
                message: "Get all allcodes successfully",
                data: allcodes
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteAllCode = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const findAllCode = await allCode.findOne({
                id: id
            })

            if (!findAllCode) {
                resolve({
                    status: 404,
                    message: "Allcode not found"
                })
            }

            await allCode.deleteOne({
                id: id
            })

            resolve({
                status: 200,
                message: "Delete allcode successfully"
            })
        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createAllCode,
    updateAllCode,
    getAllCode,
    deleteAllCode
}