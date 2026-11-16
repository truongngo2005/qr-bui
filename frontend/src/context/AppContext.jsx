import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_USERS, 
  INITIAL_SHIFT_TEMPLATES, 
  INITIAL_INVENTORY_ITEMS, 
  INITIAL_STOCK_ISSUES, 
  INITIAL_POS_REPORTS,
  generateInitialSchedule 
} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Toast Notification System
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // 2. Users & Current Auth
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('coffeelab_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem('coffeelab_current_user_id');
    return saved ? Number(saved) : 3; // Mặc định: Nhân viên Nguyễn Văn An (id: 3)
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[2];
  const role = currentUser?.role || 'EMPLOYEE';
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isStaff = role === 'EMPLOYEE';

  useEffect(() => {
    localStorage.setItem('coffeelab_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('coffeelab_current_user_id', String(currentUserId));
  }, [currentUserId]);

  const switchUser = (userId) => {
    const found = users.find((u) => u.id === Number(userId));
    if (found) {
      setCurrentUserId(found.id);
      addToast(`Đã chuyển sang tài khoản: ${found.fullName} (${found.position})`, 'info');
    }
  };

  const loginByPhone = (phone) => {
    const found = users.find((u) => u.phoneNumber === phone.trim());
    if (!found) {
      addToast('Không tìm thấy nhân viên với số điện thoại này!', 'error');
      return false;
    }
    if (!found.isActive) {
      addToast('Tài khoản này đã bị khóa!', 'error');
      return false;
    }
    setCurrentUserId(found.id);
    addToast(`Chào mừng ${found.fullName} đã đăng nhập!`, 'success');
    return true;
  };

  const logout = () => {
    // Chuyển về màn hình đăng nhập (set null hoặc id = 0)
    setCurrentUserId(0);
    addToast('Đã đăng xuất khỏi phiên làm việc', 'info');
  };

  // 3. Shift Templates
  const [shiftTemplates, setShiftTemplates] = useState(() => {
    const saved = localStorage.getItem('coffeelab_shift_templates');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem('coffeelab_shift_templates', JSON.stringify(shiftTemplates));
  }, [shiftTemplates]);

  // Admin điều chỉnh định mức số người (+ / -)
  const updateShiftQuota = (templateId, delta) => {
    setShiftTemplates((prev) =>
      prev.map((t) => {
        if (t.id === templateId) {
          const newQuota = Math.max(1, t.minEmployees + delta);
          return { ...t, minEmployees: newQuota };
        }
        return t;
      })
    );
    addToast('Đã cập nhật định mức ca làm việc!', 'success');
  };

  // Đặt lại định mức chuẩn: Ca Sáng 1, Ca Chiều 1, Ca Tối 2
  const resetShiftQuotas = () => {
    setShiftTemplates(INITIAL_SHIFT_TEMPLATES);
    addToast('Đã đặt lại định mức chuẩn: Sáng (1) - Chiều (1) - Tối (2)!', 'info');
  };

  // 4. Weekly Schedule
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('coffeelab_schedule');
    return saved ? JSON.parse(saved) : generateInitialSchedule();
  });

  useEffect(() => {
    localStorage.setItem('coffeelab_schedule', JSON.stringify(schedule));
  }, [schedule]);

  const assignStaffToShift = (shiftTemplateId, workDate, userId) => {
    // Kiểm tra xung đột: nhân viên đã có ca trùng trong ngày chưa
    const existing = schedule.assignments.find(
      (a) => a.userId === userId && a.workDate === workDate && a.shiftTemplateId === shiftTemplateId
    );
    if (existing) {
      addToast('Nhân viên này đã được phân công vào ca này!', 'warning');
      return false;
    }

    const newAssignment = {
      id: Date.now(),
      userId,
      shiftTemplateId,
      workDate,
      status: 'ASSIGNED',
    };

    setSchedule((prev) => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment],
    }));
    addToast('Đã xếp nhân sự vào ca thành công!', 'success');
    return true;
  };

  const unassignStaff = (assignmentId) => {
    setSchedule((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== assignmentId),
    }));
    addToast('Đã hủy phân công ca làm', 'info');
  };

  // Đăng ký ca rảnh hàng loạt
  const [shiftRegistrations, setShiftRegistrations] = useState(() => {
    const saved = localStorage.getItem('coffeelab_shift_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  const batchRegisterShifts = (selectedSlots) => {
    if (!selectedSlots || selectedSlots.length === 0) {
      addToast('Vui lòng chọn ít nhất 1 ca để đăng ký!', 'warning');
      return;
    }

    const newRegs = selectedSlots.map((slot) => ({
      id: Date.now() + Math.random(),
      userId: currentUser.id,
      shiftTemplateId: slot.shiftTemplateId,
      workDate: slot.workDate,
      createdAt: new Date().toISOString(),
    }));

    setShiftRegistrations((prev) => [...prev, ...newRegs]);
    addToast(`Đã gửi đăng ký hàng loạt ${selectedSlots.length} ca rảnh trong tuần!`, 'success');
  };

  // Quản lý bấm "Lưu / Chốt lịch cửa hàng"
  const finalizeSchedule = () => {
    addToast('Lịch làm việc của cửa hàng đã được chốt và công bố!', 'success');
  };

  // 5. Cơ chế Đổi ca song phương trực tiếp (Tự động hoán đổi - KHÔNG cần Quản lý duyệt)
  const [exchangeRequests, setExchangeRequests] = useState(() => {
    const saved = localStorage.getItem('coffeelab_exchange_requests');
    if (saved) return JSON.parse(saved);

    // Mẫu 1 lời mời đổi ca mẫu gửi đến Nhân viên An (id: 3) từ Bình (id: 4)
    return [
      {
        id: 101,
        senderId: 4, // Trần Thái Bình
        senderName: 'Trần Thái Bình',
        receiverId: 3, // Nguyễn Văn An
        receiverName: 'Nguyễn Văn An',
        senderShiftId: 1, // Ca S1
        senderShiftName: 'Ca Sáng (S1): 07:00 - 12:00',
        senderShiftDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        receiverShiftId: 2, // Ca C1
        receiverShiftName: 'Ca Chiều (C1): 12:00 - 18:00',
        receiverShiftDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: 'Mai mình bận việc cá nhân ca sáng, muốn đổi lấy ca chiều của bạn nhé!',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('coffeelab_exchange_requests', JSON.stringify(exchangeRequests));
  }, [exchangeRequests]);

  // Tạo lời mời đổi ca song phương
  const createDirectSwap = ({ senderAssignment, receiverUser, receiverAssignment, reason }) => {
    const senderTpl = shiftTemplates.find((t) => t.id === senderAssignment.shiftTemplateId);
    const receiverTpl = shiftTemplates.find((t) => t.id === receiverAssignment.shiftTemplateId);

    const newReq = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId: receiverUser.id,
      receiverName: receiverUser.fullName,
      senderAssignmentId: senderAssignment.id,
      receiverAssignmentId: receiverAssignment.id,
      senderShiftName: `${senderTpl?.name}: ${senderTpl?.startTime} - ${senderTpl?.endTime}`,
      senderShiftDate: senderAssignment.workDate,
      receiverShiftName: `${receiverTpl?.name}: ${receiverTpl?.startTime} - ${receiverTpl?.endTime}`,
      receiverShiftDate: receiverAssignment.workDate,
      reason: reason || 'Đổi ca theo thỏa thuận song phương',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setExchangeRequests((prev) => [newReq, ...prev]);
    addToast(`Đã gửi lời mời đổi ca cho ${receiverUser.fullName}!`, 'success');
  };

  // Người B phản hồi Đồng ý / Từ chối
  const respondDirectSwap = (requestId, action) => {
    const req = exchangeRequests.find((r) => r.id === requestId);
    if (!req) return;

    if (action === 'ACCEPT') {
      // TỰ ĐỘNG HOÁN ĐỔI 2 CA TRÊN LỊCH CHÍNH THỨC NGAY LẬP TỨC!
      setSchedule((prev) => {
        const updated = prev.assignments.map((ass) => {
          // Nếu là ca của sender -> chuyển cho receiver
          if (ass.userId === req.senderId && ass.workDate === req.senderShiftDate) {
            return { ...ass, userId: req.receiverId };
          }
          // Nếu là ca của receiver -> chuyển cho sender
          if (ass.userId === req.receiverId && ass.workDate === req.receiverShiftDate) {
            return { ...ass, userId: req.senderId };
          }
          return ass;
        });
        return { ...prev, assignments: updated };
      });

      setExchangeRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'ACCEPTED' } : r))
      );

      addToast('🎉 Đã đồng ý đổi ca! Hai ca làm việc đã được tự động hoán đổi trên lịch cửa hàng!', 'success');
    } else {
      setExchangeRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
      );
      addToast('Bạn đã từ chối lời mời đổi ca này.', 'info');
    }
  };

  // Người A hủy lời mời khi Người B chưa phản hồi
  const cancelDirectSwap = (requestId) => {
    setExchangeRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'CANCELLED' } : r))
    );
    addToast('Đã hủy lời mời đổi ca.', 'info');
  };

  // Số lượng lời mời đổi ca đang chờ người dùng hiện tại phản hồi
  const pendingSwapCount = exchangeRequests.filter(
    (r) => r.receiverId === currentUser?.id && r.status === 'PENDING'
  ).length;

  // 6. Chấm công QR & Giờ làm
  const [attendances, setAttendances] = useState(() => {
    const saved = localStorage.getItem('coffeelab_attendances');
    if (saved) return JSON.parse(saved);

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    return [
      {
        id: 1,
        userId: 3,
        workDate: yesterdayStr,
        shiftName: 'Ca Sáng (S1)',
        checkInTime: `${yesterdayStr} 06:58:12`,
        checkOutTime: `${yesterdayStr} 12:02:45`,
        totalMinutes: 304,
        workHours: 5.07,
        status: 'ON_TIME',
        hourlyRate: 30000,
        shiftPay: 152100, // 5.07 * 30000
      },
      {
        id: 2,
        userId: 4,
        workDate: yesterdayStr,
        shiftName: 'Ca Chiều (C1)',
        checkInTime: `${yesterdayStr} 12:08:10`,
        checkOutTime: `${yesterdayStr} 18:00:20`,
        totalMinutes: 352,
        workHours: 5.87,
        status: 'ON_TIME',
        hourlyRate: 27000,
        shiftPay: 158490,
      },
      {
        id: 3,
        userId: 5,
        workDate: yesterdayStr,
        shiftName: 'Ca Tối (T1)',
        checkInTime: `${yesterdayStr} 18:22:15`,
        checkOutTime: `${yesterdayStr} 22:30:10`,
        totalMinutes: 248,
        workHours: 4.13,
        status: 'LATE',
        hourlyRate: 25000,
        shiftPay: 103250,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('coffeelab_attendances', JSON.stringify(attendances));
  }, [attendances]);

  // Kiểm tra ca làm hiện tại của currentUser đang check-in
  const activeCheckIn = attendances.find((a) => a.userId === currentUser?.id && !a.checkOutTime);
  const isInShift = Boolean(activeCheckIn);

  const performCheckIn = (targetUserId = currentUser?.id) => {
    const u = users.find((x) => x.id === targetUserId) || currentUser;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('vi-VN');

    // Tìm ca phù hợp
    const curHour = now.getHours();
    let shiftName = 'Ca Sáng (S1)';
    if (curHour >= 12 && curHour < 18) shiftName = 'Ca Chiều (C1)';
    else if (curHour >= 18) shiftName = 'Ca Tối (T1)';

    const newAtt = {
      id: Date.now(),
      userId: u.id,
      workDate: todayStr,
      shiftName,
      checkInTime: `${todayStr} ${timeStr}`,
      checkOutTime: null,
      totalMinutes: 0,
      workHours: 0,
      status: 'ON_TIME',
      hourlyRate: u.hourlyRate,
      shiftPay: 0,
    };

    setAttendances((prev) => [newAtt, ...prev]);
    addToast(`[CHECK-IN] ${u.fullName} đã vào ${shiftName} lúc ${timeStr}!`, 'success');
  };

  const performCheckOut = (targetUserId = currentUser?.id) => {
    const u = users.find((x) => x.id === targetUserId) || currentUser;
    const active = attendances.find((a) => a.userId === u.id && !a.checkOutTime);
    if (!active) {
      addToast('Nhân viên này chưa có lượt Check-in nào đang mở!', 'warning');
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('vi-VN');

    // Tính số phút và giờ làm
    const checkInDate = new Date(active.checkInTime.replace(' ', 'T'));
    const diffMs = Math.max(1000 * 60, now - checkInDate); // Tối thiểu 1 phút
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Number((minutes / 60).toFixed(2));
    const shiftPay = Math.round(hours * u.hourlyRate);

    setAttendances((prev) =>
      prev.map((a) => {
        if (a.id === active.id) {
          return {
            ...a,
            checkOutTime: `${todayStr} ${timeStr}`,
            totalMinutes: minutes,
            workHours: hours,
            shiftPay,
          };
        }
        return a;
      })
    );

    addToast(`[CHECK-OUT] ${u.fullName} đã ra ca lúc ${timeStr}. Giờ công: ${hours}h (${shiftPay.toLocaleString('vi-VN')} ₫)`, 'success');
  };

  // 7. Quản lý Kho hàng (Inventory)
  const [inventoryItems, setInventoryItems] = useState(() => {
    const saved = localStorage.getItem('coffeelab_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_ITEMS;
  });

  const [stockIssues, setStockIssues] = useState(() => {
    const saved = localStorage.getItem('coffeelab_stock_issues');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ISSUES;
  });

  useEffect(() => {
    localStorage.setItem('coffeelab_inventory', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem('coffeelab_stock_issues', JSON.stringify(stockIssues));
  }, [stockIssues]);

  const addInventoryItem = (item) => {
    const newItem = {
      id: Date.now(),
      code: item.code.toUpperCase(),
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: Number(item.currentStock) || 0,
      safeStockThreshold: Number(item.safeStockThreshold) || 10,
      unitPrice: Number(item.unitPrice) || 0,
    };
    setInventoryItems((prev) => [...prev, newItem]);
    addToast(`Đã thêm mặt hàng "${newItem.name}" vào kho!`, 'success');
  };

  const updateInventoryItem = (id, data) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Đã cập nhật thông tin mặt hàng kho!', 'success');
  };

  const deleteInventoryItem = (id) => {
    setInventoryItems((prev) => prev.filter((i) => i.id !== id));
    addToast('Đã xóa mặt hàng khỏi kho', 'info');
  };

  // Lập phiếu xuất kho -> Trừ trực tiếp số lượng tồn kho
  const createStockIssue = ({ shiftName, notes, items }) => {
    const issueCode = `XK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;
    
    // Cập nhật tồn kho
    setInventoryItems((prev) =>
      prev.map((inv) => {
        const found = items.find((x) => x.itemId === inv.id);
        if (found) {
          const newQty = Math.max(0, inv.currentStock - Number(found.quantity));
          return { ...inv, currentStock: Number(newQty.toFixed(2)) };
        }
        return inv;
      })
    );

    const newIssue = {
      id: Date.now(),
      issueCode,
      issueDate: new Date().toISOString().split('T')[0],
      createdByUserId: currentUser.id,
      createdByName: currentUser.fullName,
      shiftName,
      notes,
      items,
    };

    setStockIssues((prev) => [newIssue, ...prev]);
    addToast(`Đã lập phiếu xuất kho ${issueCode} và trừ tồn kho tự động!`, 'success');
  };

  // Số lượng mặt hàng dưới ngưỡng an toàn
  const lowStockCount = inventoryItems.filter(
    (item) => item.currentStock <= item.safeStockThreshold
  ).length;

  // 8. Báo cáo Doanh thu POS cuối ngày
  const [posReports, setPosReports] = useState(() => {
    const saved = localStorage.getItem('coffeelab_pos_reports');
    return saved ? JSON.parse(saved) : INITIAL_POS_REPORTS;
  });

  useEffect(() => {
    localStorage.setItem('coffeelab_pos_reports', JSON.stringify(posReports));
  }, [posReports]);

  // Tạo báo cáo POS cuối ngày
  const createPosReport = (reportData) => {
    const totalExpenses = (reportData.expenses || []).reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    // Công thức tính: Tiền mặt thực tế nộp = POS - Chuyển khoản - App - Chi khác
    const pos = Number(reportData.posMachineRevenue) || 0;
    const bank = Number(reportData.bankTransferAmount) || 0;
    const app = Number(reportData.appDeliveryRevenue) || 0;
    const actualCashSubmitted = Math.max(0, pos - bank - app - totalExpenses);

    const newReport = {
      id: Date.now(),
      reportDate: reportData.reportDate,
      createdByUserId: currentUser.id,
      createdByName: currentUser.fullName,
      posMachineRevenue: pos,
      bankTransferAmount: bank,
      appDeliveryRevenue: app,
      expenses: reportData.expenses || [],
      totalExpenses,
      actualCashSubmitted,
      status: 'PENDING', // Chờ Admin duyệt
      notes: reportData.notes || '',
      createdAt: new Date().toISOString(),
    };

    setPosReports((prev) => [newReport, ...prev]);
    addToast('Đã gửi báo cáo doanh thu POS cuối ngày thành công! Đang chờ Admin duyệt.', 'success');
  };

  // Admin duyệt / từ chối báo cáo
  const approvePosReport = (reportId, approved = true) => {
    setPosReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: approved ? 'APPROVED' : 'REJECTED',
              approvedByUserId: currentUser.id,
            }
          : r
      )
    );
    addToast(approved ? 'Đã phê duyệt báo cáo POS cuối ngày!' : 'Đã từ chối báo cáo POS.', approved ? 'success' : 'info');
  };

  // 9. Quản lý Kiosk QR Modal
  const [qrKioskOpen, setQrKioskOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        // Toast
        toasts,
        addToast,
        removeToast,

        // Auth & Roles
        users,
        setUsers,
        currentUser,
        currentUserId,
        role,
        isAdmin,
        isManager,
        isStaff,
        switchUser,
        loginByPhone,
        logout,

        // Shift Templates
        shiftTemplates,
        updateShiftQuota,
        resetShiftQuotas,

        // Schedule & Registrations
        schedule,
        assignStaffToShift,
        unassignStaff,
        shiftRegistrations,
        batchRegisterShifts,
        finalizeSchedule,

        // Direct Shift Swap
        exchangeRequests,
        createDirectSwap,
        respondDirectSwap,
        cancelDirectSwap,
        pendingSwapCount,

        // Attendance & QR
        attendances,
        activeCheckIn,
        isInShift,
        performCheckIn,
        performCheckOut,

        // Inventory
        inventoryItems,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        stockIssues,
        createStockIssue,
        lowStockCount,

        // POS Reports
        posReports,
        createPosReport,
        approvePosReport,

        // Kiosk Modal
        qrKioskOpen,
        setQrKioskOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
