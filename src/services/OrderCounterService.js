// services/orderCounterService.js
import orderCounter from '../models/order_counter.js';

/**
 * Tạo số thứ tự cho booking
 * @param {string} entityId - ID của service hoặc doctor
 * @param {string} appointmentDate - Ngày hẹn (YYYY-MM-DD hoặc Date object)
 * @param {string} bookingType - Loại booking (SERVICE hoặc DOCTOR)
 * @returns {Promise<number>} - Số thứ tự mới
 */
const generateOrderNumber = async (entityId, appointmentDate, bookingType) => {
  try {
    // Chuyển đổi appointmentDate thành chuỗi YYYY-MM-DD
    // const date = new Date(appointmentDate);
    // const dateString = date.toISOString().split('T')[0];
    
    // Tìm và cập nhật (hoặc tạo mới nếu chưa có) bản ghi counter
    const result = await orderCounter.findOneAndUpdate(
      {
        appointmentDate: appointmentDate,
        bookingType: bookingType,
        entityId: entityId
      },
      { $inc: { sequence: 1 } }, // Tăng sequence lên 1
      { 
        upsert: true, // Tạo mới nếu chưa có
        new: true,    // Trả về document sau khi cập nhật
        runValidators: true // Chạy validation
      }
    );
    
    return result.sequence;
  } catch (error) {
    console.error('Lỗi khi tạo số thứ tự:', error);
    throw error;
  }
};

export default {
  generateOrderNumber
};