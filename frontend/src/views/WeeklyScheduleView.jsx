import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, Plus, Minus, RotateCcw, 
  CheckCircle2, AlertTriangle, ArrowLeftRight, UserCheck, ShieldCheck, Check, Trash2, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WeeklyScheduleView({ mode = 'staff', setActiveTab }) {
  // mode: 'admin' (giám sát + chỉnh định mức), 'manager' (xếp lịch + chốt lịch), 'staff' (xem + đăng ký ca rảnh)
  const { 
    currentUser, 
    users, 
    isAdmin, 
    isManager, 
    shiftTemplates, 
    updateShiftQuota, 
    resetShiftQuotas, 
    schedule, 
    assignStaffToShift, 
    unassignStaff, 
    batchRegisterShifts, 
    finalizeSchedule,
    addToast 
  } = useApp();

  // Chế độ đăng ký ca rảnh (cho Staff/Management)
  const [registerMode, setRegisterMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]); // array of { shiftTemplateId, workDate }

  // Modal phân ca (cho Quản lý)
  const [assignModal, setAssignModal] = useState({ open: false, shiftTemplateId: null, workDate: null });
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  const toggleSlotSelection = (shiftTemplateId, workDate) => {
    const exists = selectedSlots.some(
      (s) => s.shiftTemplateId === shiftTemplateId && s.workDate === workDate
    );
    if (exists) {
      setSelectedSlots((prev) =>
        prev.filter((s) => !(s.shiftTemplateId === shiftTemplateId && s.workDate === workDate))
      );
    } else {
      setSelectedSlots((prev) => [...prev, { shiftTemplateId, workDate }]);
    }
  };

  const selectFullDay = (workDate) => {
    const daySlots = shiftTemplates.map((t) => ({ shiftTemplateId: t.id, workDate }));
    // If all are already selected, deselect
    const allSelected = daySlots.every((ds) =>
      selectedSlots.some((s) => s.shiftTemplateId === ds.shiftTemplateId && s.workDate === ds.workDate)
    );
    if (allSelected) {
      setSelectedSlots((prev) => prev.filter((s) => s.workDate !== workDate));
    } else {
      setSelectedSlots((prev) => {
        const other = prev.filter((s) => s.workDate !== workDate);
        return [...other, ...daySlots];
      });
    }
  };

  const handleBatchSubmit = () => {
    batchRegisterShifts(selectedSlots);
    setSelectedSlots([]);
    setRegisterMode(false);
  };

  const openAssignDrawer = (shiftTemplateId, workDate) => {
    setAssignModal({ open: true, shiftTemplateId, workDate });
    setSelectedAssignee(users.filter(u => u.role !== 'ADMIN')[0]?.id || '');
  };

  const handleAssignConfirm = () => {
    if (!selectedAssignee) return;
    assignStaffToShift(assignModal.shiftTemplateId, assignModal.workDate, Number(selectedAssignee));
    setAssignModal({ open: false, shiftTemplateId: null, workDate: null });
  };

  const handleSelfAssign = (shiftTemplateId, workDate) => {
    assignStaffToShift(shiftTemplateId, workDate, currentUser.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Role Specific Controls */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
            <CalendarIcon className="w-4 h-4 text-amber-600" />
            <span>
              {mode === 'admin' ? 'Quản Trị Định Mức Ca & Lịch Tuần'
                : mode === 'manager' ? 'Bảng Xếp Lịch Cửa Hàng (Quản Lý)'
                : 'Lịch Làm Việc & Đăng Ký Ca Tuần'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-coffee-950 mt-0.5">
            Lịch Hoạt Động Tuần (Thứ 2 → Chủ Nhật)
          </h2>
          <p className="text-xs text-coffee-600 mt-0.5">
            3 ca chuẩn: S1 (07:00-12:00), C1 (12:00-18:00), T1 (18:00-22:30).
          </p>
        </div>

        {/* Action Buttons depending on Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Admin Reset Quotas */}
          {mode === 'admin' && (
            <button
              onClick={resetShiftQuotas}
              className="py-2.5 px-3.5 rounded-xl border border-coffee-300 hover:bg-coffee-50 text-coffee-800 font-bold text-xs flex items-center gap-1.5 transition"
              title="Đặt lại S1: 1 người, C1: 1 người, T1: 2 người"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Đặt lại định mức chuẩn</span>
            </button>
          )}

          {/* Management Finalize / Chốt Lịch */}
          {mode === 'manager' && (
            <button
              onClick={finalizeSchedule}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-coffee-800 hover:from-emerald-700 hover:to-coffee-900 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu / Chốt Lịch Cửa Hàng</span>
            </button>
          )}

          {/* Staff & Management: Đăng ký ca rảnh & Đổi ca */}
          {mode !== 'admin' && (
            <>
              <button
                onClick={() => setRegisterMode(!registerMode)}
                className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  registerMode
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{registerMode ? 'Hủy chọn đăng ký' : 'Đăng Ký Ca Rảnh'}</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule-staff')}
                className="py-2.5 px-3.5 rounded-xl bg-coffee-800 hover:bg-coffee-900 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <ArrowLeftRight className="w-4 h-4 text-amber-300" />
                <span>Đổi Ca Cho Nhau</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Admin Shift Template Quotas Setting Strip */}
      {mode === 'admin' && (
        <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Cài Đặt Định Mức Số Người Cho Từng Ca Làm (Chỉ Dành Cho Admin):
            </span>
            <span className="text-[11px] text-amber-800">
              * Quản lý không có quyền đổi định mức này.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {shiftTemplates.map((t) => (
              <div key={t.id} className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-coffee-950">{t.name}</div>
                  <div className="text-xs text-coffee-600 font-mono">{t.startTime} - {t.endTime}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateShiftQuota(t.id, -1)}
                    className="w-7 h-7 rounded-lg bg-coffee-100 hover:bg-coffee-200 text-coffee-800 flex items-center justify-center font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-black font-mono text-sm px-2 text-amber-950">
                    {t.minEmployees} người
                  </span>
                  <button
                    onClick={() => updateShiftQuota(t.id, 1)}
                    className="w-7 h-7 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 flex items-center justify-center font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch Registration Notice Bar when active */}
      {registerMode && (
        <div className="p-4 rounded-3xl bg-amber-100/90 border-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fade-in">
          <div>
            <span className="text-xs font-black uppercase text-amber-950 block">
              Chế độ đăng ký ca rảnh hàng loạt đang bật
            </span>
            <span className="text-xs text-amber-900">
              Nhấn trực tiếp vào các ô ca trong tuần bên dưới để chọn (Đã chọn: <strong>{selectedSlots.length} ca</strong>).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSlots([])}
              className="py-1.5 px-3 rounded-xl border border-coffee-300 text-xs font-bold bg-white text-coffee-700"
            >
              Xóa chọn
            </button>
            <button
              onClick={handleBatchSubmit}
              disabled={selectedSlots.length === 0}
              className="py-2 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
            >
              Gửi Đăng Ký ({selectedSlots.length})
            </button>
          </div>
        </div>
      )}

      {/* 7-Day Weekly Board */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {schedule.days.map((dateStr, idx) => {
          const dayName = daysOfWeek[idx];
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={dateStr}
              className={`rounded-3xl border flex flex-col justify-between overflow-hidden shadow-sm transition ${
                isToday ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20' : 'border-coffee-200 bg-white'
              }`}
            >
              {/* Day Header */}
              <div className={`p-3 text-center border-b ${isToday ? 'bg-amber-200/60 border-amber-300' : 'bg-coffee-50 border-coffee-100'}`}>
                <div className="text-[11px] font-black uppercase text-coffee-700">{dayName}</div>
                <div className="text-sm font-black font-mono text-coffee-950 mt-0.5">{dateStr.slice(5)}</div>
                
                {registerMode && (
                  <button
                    onClick={() => selectFullDay(dateStr)}
                    className="mt-1 text-[10px] font-bold text-amber-900 hover:underline bg-white/70 px-2 py-0.5 rounded-full"
                  >
                    Chọn cả ngày
                  </button>
                )}
              </div>

              {/* Shift Slots for this day */}
              <div className="p-2 space-y-2.5 flex-1">
                {shiftTemplates.map((tpl) => {
                  const assignedList = schedule.assignments.filter(
                    (a) => a.workDate === dateStr && a.shiftTemplateId === tpl.id
                  );
                  const isUnderstaffed = assignedList.length < tpl.minEmployees;
                  const isSelectedForBatch = selectedSlots.some(
                    (s) => s.shiftTemplateId === tpl.id && s.workDate === dateStr
                  );

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => registerMode && toggleSlotSelection(tpl.id, dateStr)}
                      className={`p-2.5 rounded-2xl border text-xs transition relative ${
                        isSelectedForBatch
                          ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-500 shadow-sm'
                          : isUnderstaffed
                          ? 'border-orange-200 bg-orange-50/70'
                          : 'border-coffee-100 bg-coffee-50/40'
                      } ${registerMode ? 'cursor-pointer hover:bg-amber-100/60' : ''}`}
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-[11px] text-coffee-950">{tpl.code}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                          isUnderstaffed ? 'bg-orange-200 text-orange-950' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {assignedList.length}/{tpl.minEmployees}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-coffee-500 mb-1.5">
                        {tpl.startTime}-{tpl.endTime}
                      </div>

                      {/* Assigned Employees Chips */}
                      <div className="space-y-1">
                        {assignedList.length === 0 ? (
                          <div className="text-[10px] text-coffee-400 italic py-0.5">Trống ca</div>
                        ) : (
                          assignedList.map((ass) => {
                            const u = users.find((x) => x.id === ass.userId);
                            return (
                              <div
                                key={ass.id}
                                className="flex items-center justify-between bg-white px-1.5 py-1 rounded-lg border border-coffee-200/80 text-[10px]"
                              >
                                <span className="font-bold text-coffee-900 truncate max-w-[80px]" title={u?.fullName}>
                                  {u?.fullName || 'Nhân viên'}
                                </span>
                                {mode === 'manager' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      unassignStaff(ass.id);
                                    }}
                                    className="p-0.5 text-coffee-400 hover:text-rose-600"
                                    title="Xóa khỏi ca"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Management Quick Actions on slot */}
                      {mode === 'manager' && !registerMode && (
                        <div className="flex items-center gap-1 mt-2 pt-1 border-t border-coffee-200/60">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAssignDrawer(tpl.id, dateStr);
                            }}
                            className="flex-1 py-1 rounded-md bg-coffee-200 hover:bg-coffee-300 text-[10px] font-black text-coffee-900 text-center"
                          >
                            + Xếp
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelfAssign(tpl.id, dateStr);
                            }}
                            className="py-1 px-1.5 rounded-md bg-amber-200 hover:bg-amber-300 text-[9px] font-black text-amber-950"
                            title="Tự nhận ca nhanh cho bản thân"
                          >
                            Tôi nhận
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Xếp Nhân Sự (Quản Lý) */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-coffee-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
              <h3 className="font-extrabold text-coffee-950 text-sm">
                Xếp Nhân Sự Vào Ca
              </h3>
              <button onClick={() => setAssignModal({ open: false, shiftTemplateId: null, workDate: null })}>
                <X className="w-4 h-4 text-coffee-500" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-coffee-700 uppercase mb-1">
                Chọn nhân viên:
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 text-xs font-bold"
              >
                {users.filter(u => u.role !== 'ADMIN').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.position})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModal({ open: false, shiftTemplateId: null, workDate: null })}
                className="py-2 px-3 rounded-xl border border-coffee-300 text-xs font-bold text-coffee-700"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignConfirm}
                className="py-2 px-4 rounded-xl bg-coffee-900 text-white text-xs font-black shadow-md"
              >
                Xác Nhận Xếp
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
