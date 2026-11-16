import React, { useState } from 'react';
import { 
  FileText, Plus, DollarSign, CheckCircle2, XCircle, 
  Trash2, Filter, AlertCircle, Eye, Calendar, User, ArrowDownRight, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PosReportView() {
  const { 
    currentUser, 
    isAdmin, 
    posReports, 
    createPosReport, 
    approvePosReport, 
    users 
  } = useApp();

  // Modal Tạo Báo Cáo POS
  const [createModal, setCreateModal] = useState(false);
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [posRevenue, setPosRevenue] = useState(8500000);
  const [bankAmount, setBankAmount] = useState(4000000);
  const [appRevenue, setAppRevenue] = useState(1500000);
  const [reportNotes, setReportNotes] = useState('');

  // Dynamic Expenses list
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Mua đá cây ca chiều', amount: 50000 },
  ]);

  // Modal Chi tiết báo cáo
  const [detailModal, setDetailModal] = useState({ open: false, report: null });

  // Filter Admin
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Tính toán realtime công thức: Tiền mặt nộp = POS - Chuyển khoản - App - Tổng chi
  const totalExpenseCalc = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const calculatedCashSubmitted = Math.max(0, posRevenue - bankAmount - appRevenue - totalExpenseCalc);

  const addExpenseRow = () => {
    setExpenses((prev) => [...prev, { id: Date.now(), name: '', amount: 0 }]);
  };

  const removeExpenseRow = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const updateExpenseRow = (id, field, value) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createPosReport({
      reportDate,
      posMachineRevenue: Number(posRevenue),
      bankTransferAmount: Number(bankAmount),
      appDeliveryRevenue: Number(appRevenue),
      expenses,
      notes: reportNotes.trim(),
    });
    setCreateModal(false);
  };

  const filteredReports = posReports.filter((r) => {
    const matchDate = !filterDate || r.reportDate === filterDate;
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchDate && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Đối Soát Doanh Thu POS Cuối Ngày</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-coffee-950 mt-0.5">
            Báo Cáo Doanh Thu Máy POS & Tiền Mặt Nộp Két
          </h2>
          <p className="text-xs text-coffee-600 mt-0.5">
            Công thức: <strong>Tiền mặt thực tế nộp = POS − Chuyển khoản − Doanh thu ứng dụng − Tổng các khoản chi khác</strong>
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-coffee-800 hover:from-amber-700 hover:to-coffee-900 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Báo Cáo POS Cuối Ngày</span>
        </button>
      </div>

      {/* Filter Bar (Admin) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-4 border border-coffee-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-coffee-500" />
            <span className="font-bold text-coffee-800">Lọc danh sách báo cáo:</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-coffee-300 font-mono text-xs"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-coffee-300 font-bold text-xs"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>
        </div>
      )}

      {/* Reports Table / Grid */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-coffee-950">
          Danh Sách Báo Cáo POS ({filteredReports.length})
        </h3>

        {filteredReports.length === 0 ? (
          <div className="py-8 text-center text-xs text-coffee-500">
            Không có báo cáo nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-coffee-200 text-coffee-600 uppercase font-bold bg-coffee-50/70">
                  <th className="py-3 px-3 rounded-l-xl">Ngày Báo Cáo</th>
                  <th className="py-3 px-3">Người Lập</th>
                  <th className="py-3 px-3">Doanh Thu Máy POS</th>
                  <th className="py-3 px-3">Chuyển Khoản</th>
                  <th className="py-3 px-3">App Giao Hàng</th>
                  <th className="py-3 px-3">Chi Phí Mua Ngoài</th>
                  <th className="py-3 px-3 font-black text-amber-950">Tiền Mặt Nộp Két</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3 rounded-r-xl text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-coffee-50/50 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-coffee-950">{r.reportDate}</td>
                    <td className="py-3.5 px-3 font-bold text-coffee-800">{r.createdByName}</td>
                    <td className="py-3.5 px-3 font-mono font-medium">{formatCurrency(r.posMachineRevenue)}</td>
                    <td className="py-3.5 px-3 font-mono text-blue-800 font-semibold">{formatCurrency(r.bankTransferAmount)}</td>
                    <td className="py-3.5 px-3 font-mono text-emerald-800 font-semibold">{formatCurrency(r.appDeliveryRevenue)}</td>
                    <td className="py-3.5 px-3 font-mono text-rose-700 font-semibold">{formatCurrency(r.totalExpenses)}</td>
                    <td className="py-3.5 px-3">
                      <strong className="text-sm font-black font-mono text-amber-950">
                        {formatCurrency(r.actualCashSubmitted)}
                      </strong>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {r.status === 'APPROVED' ? '✓ ĐÃ DUYỆT' : r.status === 'REJECTED' ? '✕ TỪ CHỐI' : '⏳ CHỜ DUYỆT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setDetailModal({ open: true, report: r })}
                        className="py-1 px-2.5 rounded-lg bg-coffee-100 hover:bg-coffee-200 text-coffee-800 font-bold text-[11px]"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: TẠO BÁO CÁO POS CUỐI NGÀY */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-coffee-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-coffee-100">
              <h3 className="font-black text-coffee-950 text-base">
                Lập Báo Cáo Doanh Thu POS Cuối Ngày
              </h3>
              <button onClick={() => setCreateModal(false)}>
                <X className="w-5 h-5 text-coffee-500" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Ngày Báo Cáo:</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Người Lập Báo Cáo:</label>
                  <input
                    type="text"
                    value={currentUser?.fullName}
                    disabled
                    className="w-full py-2 px-3 rounded-xl border border-coffee-200 bg-coffee-50 font-bold"
                  />
                </div>
              </div>

              {/* Các nguồn tiền */}
              <div className="p-4 rounded-2xl bg-coffee-50 border border-coffee-200 space-y-3">
                <span className="text-[11px] font-black uppercase text-coffee-900 block">
                  1. Doanh thu & Các kênh thanh toán:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-coffee-700 mb-1">Doanh thu POS cả ngày:</label>
                    <input
                      type="number"
                      step="1000"
                      value={posRevenue}
                      onChange={(e) => setPosRevenue(Number(e.target.value))}
                      className="w-full py-2 px-2.5 rounded-xl border border-coffee-300 font-mono font-black text-coffee-950"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-blue-800 mb-1">Tiền Chuyển Khoản:</label>
                    <input
                      type="number"
                      step="1000"
                      value={bankAmount}
                      onChange={(e) => setBankAmount(Number(e.target.value))}
                      className="w-full py-2 px-2.5 rounded-xl border border-blue-300 font-mono font-bold text-blue-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-800 mb-1">App Giao Hàng (Grab...):</label>
                    <input
                      type="number"
                      step="1000"
                      value={appRevenue}
                      onChange={(e) => setAppRevenue(Number(e.target.value))}
                      className="w-full py-2 px-2.5 rounded-xl border border-emerald-300 font-mono font-bold text-emerald-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách động Các khoản chi khác */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-950">
                    2. Các khoản chi khác (Mua ngoài trong ca):
                  </span>
                  <button
                    type="button"
                    onClick={addExpenseRow}
                    className="text-amber-800 font-black hover:underline text-xs flex items-center gap-1"
                  >
                    + Thêm dòng chi
                  </button>
                </div>

                <div className="space-y-2">
                  {expenses.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tên khoản chi (ví dụ: Mua đá bi, mua chanh tươi...)"
                        value={item.name}
                        onChange={(e) => updateExpenseRow(item.id, 'name', e.target.value)}
                        className="flex-1 py-1.5 px-3 rounded-xl border border-coffee-300 bg-white"
                        required
                      />
                      <input
                        type="number"
                        step="1000"
                        placeholder="Số tiền (VNĐ)"
                        value={item.amount}
                        onChange={(e) => updateExpenseRow(item.id, 'amount', Number(e.target.value))}
                        className="w-32 py-1.5 px-2.5 rounded-xl border border-coffee-300 bg-white font-mono font-bold text-rose-700"
                        required
                      />
                      {expenses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseRow(item.id)}
                          className="p-1.5 text-rose-600 font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-right text-[11px] text-amber-900 font-bold">
                  Tổng chi mua ngoài: <span className="font-mono text-sm text-rose-700">{formatCurrency(totalExpenseCalc)}</span>
                </div>
              </div>

              {/* Tự Động Tính Tiền Mặt Thực Tế Nộp */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-coffee-800 text-white space-y-1 shadow-md">
                <span className="text-[10px] text-coffee-200 font-bold uppercase tracking-wider block">
                  Kết quả tính tự động:
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold">TIỀN MẶT THỰC TẾ NỘP KÉT:</span>
                  <span className="text-2xl font-black font-mono">
                    {formatCurrency(calculatedCashSubmitted)}
                  </span>
                </div>
                <p className="text-[10px] text-coffee-200 italic">
                  = {formatCurrency(posRevenue)} (POS) − {formatCurrency(bankAmount)} (CK) − {formatCurrency(appRevenue)} (App) − {formatCurrency(totalExpenseCalc)} (Chi khác)
                </p>
              </div>

              <div>
                <label className="block font-bold text-coffee-700 mb-1">Ghi Chú & Bàn Giao:</label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm về ca làm việc..."
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-coffee-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-coffee-100">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-coffee-300 text-coffee-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-coffee-950 text-white font-black shadow-lg"
                >
                  Xác Nhận Nộp Báo Cáo
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHI TIẾT BÁO CÁO & PHÊ DUYỆT ADMIN */}
      {detailModal.open && detailModal.report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-coffee-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
              <h3 className="font-extrabold text-coffee-950 text-sm">
                Chi Tiết Báo Cáo POS ({detailModal.report.reportDate})
              </h3>
              <button onClick={() => setDetailModal({ open: false, report: null })}>
                <X className="w-5 h-5 text-coffee-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-coffee-600">Người lập:</span>
                <strong>{detailModal.report.createdByName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-600">Doanh thu POS:</span>
                <strong className="font-mono">{formatCurrency(detailModal.report.posMachineRevenue)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-600">Chuyển khoản:</span>
                <strong className="font-mono text-blue-800">{formatCurrency(detailModal.report.bankTransferAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-600">App giao hàng:</span>
                <strong className="font-mono text-emerald-800">{formatCurrency(detailModal.report.appDeliveryRevenue)}</strong>
              </div>

              {/* Chi tiết từng khoản chi */}
              <div className="p-3 bg-coffee-50 rounded-2xl border border-coffee-200 space-y-1.5">
                <span className="font-bold text-coffee-800 block">Các khoản chi khác trong ngày:</span>
                {detailModal.report.expenses?.map((exp, i) => (
                  <div key={i} className="flex justify-between text-coffee-900">
                    <span>• {exp.name}</span>
                    <strong className="font-mono text-rose-700">{formatCurrency(exp.amount)}</strong>
                  </div>
                ))}
                <div className="pt-1 border-t border-coffee-200 flex justify-between font-bold">
                  <span>Tổng chi:</span>
                  <span className="font-mono text-rose-800">{formatCurrency(detailModal.report.totalExpenses)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-100 rounded-2xl border border-amber-300 flex justify-between items-center">
                <span className="font-black text-amber-950">TIỀN MẶT THỰC NỘP KÉT:</span>
                <span className="text-lg font-black font-mono text-amber-950">
                  {formatCurrency(detailModal.report.actualCashSubmitted)}
                </span>
              </div>

              {detailModal.report.notes && (
                <div className="text-coffee-600 italic">
                  Ghi chú: {detailModal.report.notes}
                </div>
              )}
            </div>

            {/* Admin Duyệt / Từ chối nếu PENDING */}
            {isAdmin && detailModal.report.status === 'PENDING' && (
              <div className="flex gap-2 pt-3 border-t border-coffee-100">
                <button
                  onClick={() => {
                    approvePosReport(detailModal.report.id, false);
                    setDetailModal({ open: false, report: null });
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs"
                >
                  Từ Chối
                </button>
                <button
                  onClick={() => {
                    approvePosReport(detailModal.report.id, true);
                    setDetailModal({ open: false, report: null });
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs"
                >
                  Phê Duyệt Báo Cáo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
