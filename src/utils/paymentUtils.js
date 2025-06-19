export const getPaymentStatusText = (status) => {
  switch (status) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'UNPAID':
      return 'Chưa thanh toán';
    case 'FAIL':
      return 'Thanh toán thất bại';
    case 'EXPIRED':
      return 'Hết hạn thanh toán';
    default:
      return 'Không xác định';
  }
};

export const getPaymentStatusHtml = (status) => {
  let backgroundColor, textColor;
  
  switch (status) {
    case 'PAID':
      backgroundColor = '#d4edda';
      textColor = '#155724';
      break;
    case 'UNPAID':
      backgroundColor = '#fff3cd';
      textColor = '#856404';
      break;
    case 'FAIL':
      backgroundColor = '#f8d7da';
      textColor = '#721c24';
      break;
    case 'EXPIRED':
      backgroundColor = '#e2e3e5';
      textColor = '#383d41';
      break;
    default:
      backgroundColor = '#e2e3e5';
      textColor = '#383d41';
  }
  
  return `<span style="padding: 5px 10px; border-radius: 4px; font-weight: 500; background-color: ${backgroundColor}; color: ${textColor};">${getPaymentStatusText(status)}</span>`;
};

