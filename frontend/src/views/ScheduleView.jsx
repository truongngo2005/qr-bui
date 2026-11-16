import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, Plus, Trash2, 
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, User, X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ScheduleView() {
  const { isManager } = useAuth();
  
  const [scheduleData, setScheduleData] = useState(null);
  const [currentMonday, setCurrentMonday] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Thứ Hai
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal phân ca mới
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchSchedule = async (startDate) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getWeeklySchedule(startDate);
      if (res.success) {
        setScheduleData(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(currentMonday);
  }, [currentMonday]);

  useEffect(() => {
    if (isManager) {
      api.getUsers().then(res => {
        if (res.success) setAllUsers(res.data.filter(u => u.isActive));
      }).catch(console.error);
    }
  }, [isManager]);

  // Điều hướng tuần
  const changeWeek = (offsetDays) => {
    const current = new Date(currentMonday);
    current.setDate(current.getDate() + offsetDays);
    setCurrentMonday(current.toISOString().split('T')[0]);
  };

  // Mở modal gán ca
  const openAssignModal = (dateStr, templateId) => {
    setSelectedDate(dateStr || currentMonday);
    setSelectedTemplate(templateId || (scheduleData?.templates?.[0]?.id || ''));
    setSelectedUser(allUsers[0]?.id || '');
    setAssignNotes('');
    setError('');
    setSuccess('');
    setShowAssignModal(true);
  };

  // Gửi phân ca mới với kiểm tra trùng giờ
  const handleAssignShift = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedTemplate || !selectedDate) {
      setError('Vui lòng chọn đầy đủ Nhân viên, Ca làm và Ngày làm!');
      return;
    }

    setAssignLoading(true);
    setError('');
    try {
      const res = await api.assignShift({
        userId: Number(selectedUser),
        shiftTemplateId: Number(selectedTemplate),
        workDate: selectedDate,
        notes: assignNotes.trim(),
      });
      if (res.success) {
        setSuccess('Đã xếp ca thành công cho nhân viên!');
        setShowAssignModal(false);
        fetchSchedule(currentMonday);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  // Hủy ca làm
  const handleDeleteAssignment = async (id, userName) => {
    if (!window.confirm(`Bạn có chắc muốn hủy ca của nhân viên ${userName}?`)) return;
    try {
      const res = await api.deleteAssignment(id);
      if (res.success) {
        fetchSchedule(currentMonday);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Controls: Week Navigator & Actions */}
      <div className="bg-white rounded-3xl p-5 border border-coffee-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <CalendarIcon className="w-4 h-4 text-amber-600" />
            <span>Bảng Lịch Phân Ca Tuần</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-coffee-950 mt-0.5">
            {scheduleData ? (
              <>Tuần {new Date(scheduleData.startDate).toLocaleDateString('vi-VN')} - {new Date(scheduleData.endDate).toLocaleDateString('vi-VN')}</>
            ) : 'Đang tải lịch...'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Week switcher */}
          <div className="flex items-center bg-coffee-50 p-1 rounded-2xl border border-coffee-200">
            <button
              onClick={() => changeWeek(-7)}
              className="p-2 rounded-xl text-coffee-700 hover:bg-white hover:shadow-sm transition"
              title="Tuần trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const d = new Date();
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                setCurrentMonday(new Date(d.setDate(diff)).toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-xs font-bold text-coffee-800 hover:text-amber-800"
            >
              Tuần hiện tại
            </button>
            <button
              onClick={() => changeWeek(7)}
              className="p-2 rounded-xl text-coffee-700 hover:bg-white hover:shadow-sm transition"
              title="Tuần sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Add Shift button */}
          {isManager && (
            <button
              onClick={() => openAssignModal(currentMonday, scheduleData?.templates?.[0]?.id)}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-coffee-800 text-white font-bold text-xs sm:text-sm shadow-md hover:from-amber-700 hover:to-coffee-900 flex items-center gap-2 active:scale-98 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Phân Ca Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Shift Templates Legend */}
      <div className="bg-amber-50/70 rounded-3xl p-4 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-amber-950 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-700" />
          Mẫu ca chuẩn của quán:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {scheduleData?.templates?.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-coffee-900 shadow-sm">
              <span className="font-bold text-amber-800">{t.name}:</span>
              <span className="font-mono text-coffee-700">{t.startTime.slice(0, 5)} - {t.endTime.slice(0, 5)}</span>
              <span className="text-[10px] text-coffee-500 bg-coffee-100 px-1.5 py-0.2 rounded-full">
                Tối thiểu: {t.minEmployees} người
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Weekly Board */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {scheduleData?.days?.map((day) => {
          const isToday = day.date === new Date().toISOString().split('T')[0];
          return (
            <div
              key={day.date}
              className={`rounded-3xl border flex flex-col transition shadow-sm ${
                isToday 
                  ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/30' 
                  : 'bg-white border-coffee-200'
              }`}
            >
              {/* Day Header */}
              <div className={`p-3.5 border-b text-center rounded-t-3xl ${
                isToday ? 'bg-amber-200/60 border-amber-300' : 'bg-coffee-50 border-coffee-100'
              }`}>
                <div className="text-xs font-bold text-coffee-700 uppercase tracking-wide">
                  {day.dayOfWeek}
                </div>
                <div className={`text-base font-extrabold font-mono mt-0.5 ${isToday ? 'text-amber-950 font-black' : 'text-coffee-900'}`}>
                  {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                </div>
                {isToday && (
                  <span className="inline-block text-[10px] font-black uppercase text-amber-900 bg-amber-300 px-2 py-0.2 rounded-full mt-1">
                    Hôm nay
                  </span>
                )}
              </div>

              {/* Shift Slots */}
              <div className="p-2 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  {day.slots?.map((slot) => {
                    return (
                      <div
                        key={slot.template.id}
                        className={`p-2.5 rounded-2xl border text-xs transition ${
                          slot.isUnderstaffed
                            ? 'bg-orange-50/80 border-orange-300 text-orange-950'
                            : 'bg-coffee-50/50 border-coffee-200 text-coffee-950'
                        }`}
                      >
                        {/* Slot Header */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[11px] truncate" title={slot.template.name}>
                            {slot.template.name.split(' ')[0]} {slot.template.name.split(' ')[1]}
                          </span>
                          
                          {/* Staffing Status Pill */}
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            slot.isUnderstaffed 
                              ? 'bg-orange-200 text-orange-900 flex items-center gap-0.5' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {slot.isUnderstaffed && <AlertTriangle className="w-2.5 h-2.5" />}
                            {slot.currentCount}/{slot.minEmployees}
                          </span>
                        </div>

                        {/* Assigned Employees */}
                        <div className="space-y-1 mt-1">
                          {slot.assignments?.length === 0 ? (
                            <div className="text-[10px] text-coffee-400 italic py-1 text-center">
                              Trống ca
                            </div>
                          ) : (
                            slot.assignments.map((ass) => (
                              <div
                                key={ass.id}
                                className="group flex items-center justify-between p-1 rounded-lg bg-white border border-coffee-200/80 text-[11px]"
                              >
                                <span className="font-medium text-coffee-900 truncate max-w-[90px]" title={ass.user?.fullName}>
                                  {ass.user?.fullName}
                                </span>

                                {isManager && (
                                  <button
                                    onClick={() => handleDeleteAssignment(ass.id, ass.user?.fullName)}
                                    title="Hủy xếp ca"
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-coffee-400 hover:text-red-600 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Fast Add Button per slot */}
                        {isManager && (
                          <button
                            onClick={() => openAssignModal(day.date, slot.template.id)}
                            className="w-full mt-2 py-1 text-[10px] font-bold text-coffee-600 hover:text-amber-800 hover:bg-amber-100/50 rounded-lg border border-dashed border-coffee-300 transition flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Xếp người
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Phân ca mới với kiểm tra xung đột */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-coffee-200 animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-coffee-100">
              <h3 className="text-lg font-bold text-coffee-950 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-600" />
                Phân Công Ca Làm Việc
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-xl text-coffee-500 hover:bg-coffee-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAssignShift} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-coffee-700 uppercase mb-1">
                  Chọn Nhân Viên
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 bg-coffee-50/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.position}) - {u.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-coffee-700 uppercase mb-1">
                    Ngày Làm Việc
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 bg-coffee-50/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coffee-700 uppercase mb-1">
                    Mẫu Ca Làm
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 bg-coffee-50/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {scheduleData?.templates?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.startTime.slice(0, 5)} - {t.endTime.slice(0, 5)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-coffee-700 uppercase mb-1">
                  Ghi Chú Nhiệm Vụ (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Ví dụ: Pha chế chính, mở két thu ngân, trông xe..."
                  className="w-full py-2 px-3 rounded-xl border border-coffee-300 bg-coffee-50/50 text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                ⚡ <strong>Kiểm tra xung đột tự động:</strong> Hệ thống sẽ tự động ngăn chặn nếu nhân viên đã bị xếp ca khác trùng giờ trong cùng ngày.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-coffee-300 font-semibold text-xs text-coffee-700 hover:bg-coffee-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-coffee-800 text-white font-bold text-xs shadow-md hover:from-amber-700 hover:to-coffee-900 flex items-center gap-1.5"
                >
                  {assignLoading ? 'Đang kiểm tra & lưu...' : 'Xác Nhận Phân Ca'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
