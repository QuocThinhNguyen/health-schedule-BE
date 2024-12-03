import feedBack from "../models/feedbacks.js"

const createFeedBack = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.patientId || !data.doctorId || !data.rating || !data.comment || !data.date) {
                resolve({
                    status:400,
                    message: "Missing required fields"
                })
            } else {
                await feedBack.create({
                    patientId: data.patientId,
                    doctorId: data.doctorId,
                    rating: data.rating,
                    comment: data.comment,
                    date: data.date
                })
                resolve({
                    status:200,
                    message: "Create feedback successfully"
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const updateFeedBack = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {

            const checkFeedBack = await feedBack.findOne({
                feedBackId: id
            })

            if (!checkFeedBack) {
                resolve({
                    status: 404,
                    message: "Feedback not found"
                });
            }

            await feedBack.updateOne(
                { feedBackId: id },
                data,
                { new: true }
            )

            resolve({
                status: 200,
                message: "Update feedback successfully"
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllFeedBack = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const feedBacks = await feedBack.find()
            resolve({
                status: 200,
                message: "Get all feedbacks successfully",
                data: feedBacks
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteFeedBack = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const findFeedBack = await feedBack.findOne({
                feedBackId: id
            })

            if (!findFeedBack) {
                resolve({
                    status: 404,
                    message: "Feedback not found"
                })
            }

            await feedBack.deleteOne({
                feedBackId: id
            })

            resolve({
                status: 200,
                message: "Delete feedback successfully"
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getFeedBackByDoctorId = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const feedBacks = await feedBack.find({
                doctorId: doctorId
            })
            .populate({
                path: 'patientId',
                model:"PatientRecords",
                localField: 'patientId',
                foreignField: 'patientRecordId',
                select: "fullname"

            })
            resolve({
                status: 200,
                message: "Get all feedbacks successfully",
                data: feedBacks
            })

        } catch (e) {
            reject(e)
        }
    })
}

const checkFeedBacked = (patientId, doctorId,date) => {
    return new Promise(async (resolve, reject) => {
        try {
            const feedBacks = await feedBack.find({
                patientId: patientId,
                doctorId: doctorId,
                date: date
            })
            if(feedBacks.length > 0){
                resolve({
                    status: 200,
                    message: "Checked",
                    data: true
                })
            }
            resolve({
                status: 200,
                message: "Checked",
                data: false
            })
        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createFeedBack,
    updateFeedBack,
    getAllFeedBack,
    deleteFeedBack,
    getFeedBackByDoctorId,
    checkFeedBacked
}