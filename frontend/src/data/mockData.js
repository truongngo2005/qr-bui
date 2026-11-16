// Dữ liệu mẫu khởi tạo ban đầu cho hệ thống "Coffee Lab - HR & POS v2"

export const INITIAL_USERS = [
  {
    id: 1,
    fullName: 'Trần Minh Đức',
    phoneNumber: '0901234567',
    email: 'admin@coffeelab.vn',
    role: 'ADMIN', // Chủ cửa hàng
    position: 'Chủ cửa hàng / Admin',
    hourlyRate: 0, // Admin lương = 0đ, không đưa vào danh sách bảng lương
    isActive: true,
    avatar: '👨‍💼',
  },
  {
    id: 2,
    fullName: 'Hoàng Thùy Linh',
    phoneNumber: '0909876543',
    email: 'manager@coffeelab.vn',
    role: 'MANAGER', // Quản lý
    position: 'Cửa hàng trưởng (Management)',
    hourlyRate: 35000, // Quản lý nhận lương theo giờ như Staff
    isActive: true,
    avatar: '👩‍💼',
  },
  {
    id: 3,
    fullName: 'Nguyễn Văn An',
    phoneNumber: '0912345678',
    email: 'an.nguyen@coffeelab.vn',
    role: 'EMPLOYEE', // Staff
    position: 'Pha chế chính (Barista)',
    hourlyRate: 30000,
    isActive: true,
    avatar: '☕',
  },
  {
    id: 4,
    fullName: 'Trần Thái Bình',
    phoneNumber: '0912345679',
    email: 'binh.tran@coffeelab.vn',
    role: 'EMPLOYEE',
    position: 'Thu ngân (Cashier)',
    hourlyRate: 27000,
    isActive: true,
    avatar: '💵',
  },
  {
    id: 5,
    fullName: 'Lê Thị Mỹ Cúc',
    phoneNumber: '0912345680',
    email: 'cuc.le@coffeelab.vn',
    role: 'EMPLOYEE',
    position: 'Phục vụ bàn (Waitress)',
    hourlyRate: 25000,
    isActive: true,
    avatar: '🍰',
  },
  {
    id: 6,
    fullName: 'Phạm Quốc Dũng',
    phoneNumber: '0912345681',
    email: 'dung.pham@coffeelab.vn',
    role: 'EMPLOYEE',
    position: 'Bảo vệ & Hướng dẫn xe',
    hourlyRate: 26000,
    isActive: true,
    avatar: '🛵',
  },
];

// 3 Ca chuẩn mỗi ngày
export const INITIAL_SHIFT_TEMPLATES = [
  {
    id: 1,
    code: 'S1',
    name: 'Ca Sáng (S1)',
    startTime: '07:00',
    endTime: '12:00',
    minEmployees: 1, // Định mức: 1 người
    salaryMultiplier: 1.0,
    color: 'amber',
  },
  {
    id: 2,
    code: 'C1',
    name: 'Ca Chiều (C1)',
    startTime: '12:00',
    endTime: '18:00',
    minEmployees: 1, // Định mức: 1 người
    salaryMultiplier: 1.0,
    color: 'orange',
  },
  {
    id: 3,
    code: 'T1',
    name: 'Ca Tối (T1)',
    startTime: '18:00',
    endTime: '22:30',
    minEmployees: 2, // Định mức: 2 người
    salaryMultiplier: 1.1,
    color: 'indigo',
  },
];

// Mặt hàng kho
export const INITIAL_INVENTORY_ITEMS = [
  {
    id: 1,
    code: 'CF-ROB',
    name: 'Cà phê Robusta Đắk Lắk (Rang mộc)',
    category: 'Cà phê hạt',
    unit: 'kg',
    currentStock: 18.5,
    safeStockThreshold: 10.0,
    unitPrice: 185000,
  },
  {
    id: 2,
    code: 'CF-ARA',
    name: 'Cà phê Arabica Cầu Đất (Specialty)',
    category: 'Cà phê hạt',
    unit: 'kg',
    currentStock: 9.0,
    safeStockThreshold: 8.0,
    unitPrice: 260000,
  },
  {
    id: 3,
    code: 'MILK-DALAT',
    name: 'Sữa tươi thanh trùng Dalat Milk 1L',
    category: 'Sữa & Kem',
    unit: 'Hộp 1L',
    currentStock: 5.0, // Thấp hơn an toàn -> cảnh báo
    safeStockThreshold: 15.0,
    unitPrice: 36000,
  },
  {
    id: 4,
    code: 'MILK-COND',
    name: 'Sữa đặc Ngôi Sao Phương Nam',
    category: 'Sữa & Kem',
    unit: 'Lon 380g',
    currentStock: 28.0,
    safeStockThreshold: 12.0,
    unitPrice: 24000,
  },
  {
    id: 5,
    code: 'SYRUP-VAN',
    name: 'Syrup Monin Vanilla 700ml',
    category: 'Syrup & Sốt',
    unit: 'Chai',
    currentStock: 2.0, // Cảnh báo tồn kho thấp
    safeStockThreshold: 4.0,
    unitPrice: 220000,
  },
  {
    id: 6,
    code: 'SYRUP-CARA',
    name: 'Syrup Monin Caramel 700ml',
    category: 'Syrup & Sốt',
    unit: 'Chai',
    currentStock: 6.0,
    safeStockThreshold: 4.0,
    unitPrice: 220000,
  },
  {
    id: 7,
    code: 'MATCHA-UJI',
    name: 'Bột trà xanh Matcha Uji Nhật Bản',
    category: 'Trà & Bột',
    unit: 'Gói 500g',
    currentStock: 3.5,
    safeStockThreshold: 2.0,
    unitPrice: 450000,
  },
  {
    id: 8,
    code: 'CUP-HOT',
    name: 'Ly giấy nóng 8oz có nắp',
    category: 'Bao bì & Ly',
    unit: 'Cây (50 cái)',
    currentStock: 16.0,
    safeStockThreshold: 10.0,
    unitPrice: 48000,
  },
  {
    id: 9,
    code: 'CUP-COLD',
    name: 'Ly nhựa take-away 12oz',
    category: 'Bao bì & Ly',
    unit: 'Cây (50 cái)',
    currentStock: 24.0,
    safeStockThreshold: 12.0,
    unitPrice: 52000,
  },
];

// Lịch sử xuất kho
export const INITIAL_STOCK_ISSUES = [
  {
    id: 1,
    issueCode: 'XK-20261116-01',
    issueDate: new Date().toISOString().split('T')[0],
    createdByUserId: 2,
    createdByName: 'Hoàng Thùy Linh',
    shiftName: 'Ca Sáng (S1)',
    notes: 'Xuất nguyên liệu đầu ca sáng cho quầy Barista',
    items: [
      { itemId: 1, itemName: 'Cà phê Robusta Đắk Lắk', quantity: 2, unit: 'kg' },
      { itemId: 3, itemName: 'Sữa tươi Dalat Milk 1L', quantity: 6, unit: 'Hộp 1L' },
      { itemId: 4, itemName: 'Sữa đặc Phương Nam', quantity: 4, unit: 'Lon 380g' },
    ],
  },
];

// Báo cáo doanh thu POS cuối ngày
export const INITIAL_POS_REPORTS = [
  {
    id: 1,
    reportDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Hôm qua
    createdByUserId: 2,
    createdByName: 'Hoàng Thùy Linh',
    posMachineRevenue: 8650000,
    bankTransferAmount: 4300000,
    appDeliveryRevenue: 1850000,
    expenses: [
      { id: 1, name: 'Mua 3 bao đá viên ca chiều', amount: 60000 },
      { id: 2, name: 'Mua chanh, cam & sả tươi', amount: 85000 },
      { id: 3, name: 'Sửa vòi nước quầy bồn rửa', amount: 150000 },
    ],
    totalExpenses: 295000,
    actualCashSubmitted: 2205000, // 8650000 - 4300000 - 1850000 - 295000 = 2205000
    status: 'APPROVED',
    approvedByUserId: 1,
    notes: 'Tiền mặt đã niêm phong và gửi két sắt quản lý.',
  },
  {
    id: 2,
    reportDate: new Date(Date.now() - 172800000).toISOString().split('T')[0], // Hôm kia
    createdByUserId: 4,
    createdByName: 'Trần Thái Bình',
    posMachineRevenue: 7920000,
    bankTransferAmount: 3800000,
    appDeliveryRevenue: 1650000,
    expenses: [
      { id: 1, name: 'Mua đá bi phục vụ khách', amount: 40000 },
      { id: 2, name: 'Mua giấy in nhiệt bill POS', amount: 120000 },
    ],
    totalExpenses: 160000,
    actualCashSubmitted: 2310000, // 7920000 - 3800000 - 1650000 - 160000 = 2310000
    status: 'APPROVED',
    approvedByUserId: 1,
    notes: 'Thu ngân đối soát chuẩn xác.',
  },
];

// Hàm tạo lịch tuần mẫu động xoay quanh Thứ 2 tuần này
export function generateInitialSchedule() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2
  const monday = new Date(d.setDate(diff));

  const days = [];
  const assignments = [];

  const staffIds = [2, 3, 4, 5, 6]; // Không phân Admin (1) vào ca

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const dateStr = cur.toISOString().split('T')[0];
    days.push(dateStr);

    // Ca Sáng S1 (định mức 1)
    assignments.push({
      id: assignments.length + 1,
      userId: staffIds[i % staffIds.length],
      shiftTemplateId: 1,
      workDate: dateStr,
      status: 'ASSIGNED',
    });

    // Ca Chiều C1 (định mức 1)
    assignments.push({
      id: assignments.length + 1,
      userId: staffIds[(i + 1) % staffIds.length],
      shiftTemplateId: 2,
      workDate: dateStr,
      status: 'ASSIGNED',
    });

    // Ca Tối T1 (định mức 2)
    assignments.push({
      id: assignments.length + 1,
      userId: staffIds[(i + 2) % staffIds.length],
      shiftTemplateId: 3,
      workDate: dateStr,
      status: 'ASSIGNED',
    });
    assignments.push({
      id: assignments.length + 1,
      userId: staffIds[(i + 3) % staffIds.length],
      shiftTemplateId: 3,
      workDate: dateStr,
      status: 'ASSIGNED',
    });
  }

  return { days, assignments };
}
