const vnpayConfig = {
    vnp_TmnCode: 'QZ88PFQM', // Mã website của bạn tại VNPay
    vnp_HashSecret: 'AYNMHJAUVATQYJONQBTILLEUTQNIRSUQ', // Chuỗi bí mật dùng để tạo chữ ký
    vnp_Url: ' https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL thanh toán của VNPay Sandbox
    vnp_ReturnUrl: 'http://localhost:9000/booking/vnpay_return' // URL trả về sau khi thanh toán
};

export default vnpayConfig;