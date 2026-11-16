import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Edit3, Lock, Unlock, 
  Trash2, Mail, Phone, DollarSign, Briefcase, CheckCircle2, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function EmployeeManagementView() {
  const { users, setUsers, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ open: false, editingUser: null });
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    role: 'EMPLOYEE',
    position: 'Pha chế (Barista)',
    hourlyRate: 25000,
    isActive: true,
    avatar: '☕',
  });

  const filteredUsers = users.filter((u) => {
    return (
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phoneNumber.includes(searchTerm) ||
      u.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const openAdd = () => {
    setModal({ open: true, editingUser: null });
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      role: 'EMPLOYEE',
      position: 'Pha chế (Barista)',
      hourlyRate: 25000,
      isActive: true,
      avatar: '☕',
    });
  };

  const openEdit = (user) => {
    setModal({ open: true, editingUser: user });
    setFormData({ ...user });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modal.editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === modal.editingUser.id ? { ...u, ...formData } : u))
      );
      addToast(`Đã cập nhật hồ sơ nhân viên: ${formData.fullName}`, 'success');
    } else {
      // Check duplicate phone
      if (users.some((u) => u.phoneNumber === formData.phoneNumber.trim())) {
        addToast('Số điện thoại này đã được sử dụng!', 'error');
        return;
      }
      const newUser = {
        id: Date.now(),
        ...formData,
        hourlyRate: formData.role === 'ADMIN' ? 0 : Number(formData.hourlyRate),
      };
      setUsers((prev) => [...prev, newUser]);
      addToast(`Đã thêm nhân viên mới: ${newUser.fullName}`, 'success');
    }
    setModal({ open: false, editingUser: null });
  };

  const toggleStatus = (user) => {
    if (user.role === 'ADMIN') {
      addToast('Không thể khóa tài khoản Admin tối cao!', 'warning');
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
    );
    addToast(user.isActive ? `Đã tạm khóa tài khoản ${user.fullName}` : `Đã mở khóa tài khoản ${user.fullName}`, 'info');
  };

  const deleteUser = (user) => {
    if (user.role === 'ADMIN') {
      addToast('Không thể xóa tài khoản Admin!', 'error');
      return;
    }
    if (!window.confirm(`Xác nhận xóa vĩnh viễn nhân sự ${user.fullName}?`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    addToast(`Đã xóa nhân sự: ${user.fullName}`, 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
            <Users className="w-4 h-4 text-amber-700" />
            <span>Đặc Quyền Quản Trị Viên (Admin)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-coffee-950 mt-0.5">
            Quản Lý Nhân Sự & Mức Lương Theo Giờ
          </h2>
          <p className="text-xs text-coffee-600 mt-0.5">
            Thêm mới, sửa hồ sơ, thiết lập mức lương/giờ và quản lý khóa tài khoản nhân viên
          </p>
        </div>

        <button
          onClick={openAdd}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-coffee-800 hover:from-amber-700 hover:to-coffee-900 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Nhân Viên Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-coffee-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, SĐT, chức vụ..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-coffee-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <span className="text-xs font-bold text-coffee-500">
          Tổng: {filteredUsers.length} nhân sự
        </span>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className={`bg-white rounded-3xl p-5 border shadow-sm transition hover:shadow-md flex flex-col justify-between space-y-4 ${
              u.isActive ? 'border-coffee-200' : 'border-rose-200 bg-rose-50/20 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{u.avatar}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-coffee-950 leading-tight">
                      {u.fullName}
                    </h3>
                    <span className="text-xs text-coffee-600 font-semibold">{u.position}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  u.role === 'ADMIN'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : u.role === 'MANAGER'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {u.role}
                </span>
              </div>

              <div className="space-y-1.5 py-3 mt-2 border-y border-coffee-100 text-xs text-coffee-800">
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-coffee-400" />
                  <span>{u.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-coffee-400" />
                  <span className="truncate">{u.email}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-coffee-600 font-medium">Lương theo giờ:</span>
                  <strong className="text-sm font-black font-mono text-amber-900">
                    {u.role === 'ADMIN' ? '0 ₫ (Không tính lương)' : `${formatCurrency(u.hourlyRate)}/h`}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {u.isActive ? '● Đang làm việc' : '✕ Đã tạm khóa'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(u)}
                  className="p-1.5 rounded-lg text-coffee-700 hover:bg-coffee-100"
                  title="Sửa hồ sơ"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {u.role !== 'ADMIN' && (
                  <>
                    <button
                      onClick={() => toggleStatus(u)}
                      className="p-1.5 rounded-lg text-coffee-700 hover:bg-coffee-100"
                      title={u.isActive ? "Tạm khóa" : "Mở khóa"}
                    >
                      {u.isActive ? <Lock className="w-4 h-4 text-amber-700" /> : <Unlock className="w-4 h-4 text-emerald-700" />}
                    </button>
                    <button
                      onClick={() => deleteUser(u)}
                      className="p-1.5 rounded-lg text-coffee-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Xóa nhân sự"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL: Thêm / Sửa Nhân Sự */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-coffee-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
              <h3 className="font-extrabold text-coffee-950 text-sm">
                {modal.editingUser ? 'Chỉnh Sửa Nhân Sự' : 'Thêm Nhân Viên Mới'}
              </h3>
              <button onClick={() => setModal({ open: false, editingUser: null })}>
                <X className="w-4 h-4 text-coffee-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-coffee-700 mb-1">Họ Và Tên:</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-coffee-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Chức Vụ:</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Nhóm Quyền:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full py-2 px-2.5 rounded-xl border border-coffee-300 font-bold"
                  >
                    <option value="EMPLOYEE">STAFF (Nhân viên)</option>
                    <option value="MANAGER">MANAGEMENT (Quản lý)</option>
                    <option value="ADMIN">ADMIN (Chủ cửa hàng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-coffee-700 mb-1">
                  Mức Lương Tính Giờ (VNĐ/h):
                </label>
                <input
                  type="number"
                  step="1000"
                  disabled={formData.role === 'ADMIN'}
                  value={formData.role === 'ADMIN' ? 0 : formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-mono font-black text-amber-900 disabled:bg-coffee-50"
                  required
                />
                {formData.role === 'ADMIN' && (
                  <span className="text-[10px] text-amber-800 italic mt-0.5 block">
                    * Admin lương = 0 ₫, tự động loại trừ khỏi quyết toán bảng lương.
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-coffee-100">
                <button
                  type="button"
                  onClick={() => setModal({ open: false, editingUser: null })}
                  className="py-2 px-3 rounded-xl border border-coffee-300 font-bold text-coffee-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-coffee-950 text-white font-black"
                >
                  Lưu Nhân Sự
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
