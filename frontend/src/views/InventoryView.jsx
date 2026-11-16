import React, { useState } from 'react';
import { 
  Package, Plus, AlertTriangle, Search, FileText, 
  Trash2, Edit3, ArrowUpRight, CheckCircle2, History, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function InventoryView() {
  const { 
    inventoryItems, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem, 
    stockIssues, 
    createStockIssue 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal Thêm / Sửa mặt hàng
  const [itemModal, setItemModal] = useState({ open: false, editingItem: null });
  const [itemForm, setItemForm] = useState({
    code: '',
    name: '',
    category: 'Cà phê hạt',
    unit: 'kg',
    currentStock: 10,
    safeStockThreshold: 5,
    unitPrice: 150000,
  });

  // Modal Lập Phiếu Xuất Kho
  const [issueModal, setIssueModal] = useState(false);
  const [issueShift, setIssueShift] = useState('Ca Sáng (S1)');
  const [issueNotes, setIssueNotes] = useState('');
  const [issueItemsList, setIssueItemsList] = useState([
    { itemId: inventoryItems[0]?.id || 1, quantity: 1 },
  ]);

  // Modal Xem Lịch Sử Xuất Kho
  const [historyModal, setHistoryModal] = useState(false);

  const categories = ['ALL', 'Cà phê hạt', 'Sữa & Kem', 'Syrup & Sốt', 'Trà & Bột', 'Bao bì & Ly'];

  const filteredItems = inventoryItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const openAddItemModal = () => {
    setItemModal({ open: true, editingItem: null });
    setItemForm({
      code: `SP-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Cà phê hạt',
      unit: 'kg',
      currentStock: 10,
      safeStockThreshold: 5,
      unitPrice: 100000,
    });
  };

  const openEditItemModal = (item) => {
    setItemModal({ open: true, editingItem: item });
    setItemForm({ ...item });
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (itemModal.editingItem) {
      updateInventoryItem(itemModal.editingItem.id, itemForm);
    } else {
      addInventoryItem(itemForm);
    }
    setItemModal({ open: false, editingItem: null });
  };

  // Thao tác lập phiếu xuất kho
  const addIssueLine = () => {
    setIssueItemsList((prev) => [...prev, { itemId: inventoryItems[0]?.id || 1, quantity: 1 }]);
  };

  const removeIssueLine = (index) => {
    setIssueItemsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateIssueLine = (index, field, value) => {
    setIssueItemsList((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, [field]: value } : line))
    );
  };

  const handleSaveStockIssue = (e) => {
    e.preventDefault();
    const formattedItems = issueItemsList.map((line) => {
      const inv = inventoryItems.find((i) => i.id === Number(line.itemId));
      return {
        itemId: Number(line.itemId),
        itemName: inv?.name || 'Mặt hàng',
        quantity: Number(line.quantity) || 1,
        unit: inv?.unit || 'đv',
      };
    });

    createStockIssue({
      shiftName: issueShift,
      notes: issueNotes.trim() || 'Xuất kho cho ca làm',
      items: formattedItems,
    });

    setIssueModal(false);
    setIssueNotes('');
    setIssueItemsList([{ itemId: inventoryItems[0]?.id || 1, quantity: 1 }]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Action Buttons */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
            <Package className="w-4 h-4 text-amber-700" />
            <span>Đặc Quyền Quản Trị Viên (Admin)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-coffee-950 mt-0.5">
            Quản Lý Kho Hàng & Xuất Kho
          </h2>
          <p className="text-xs text-coffee-600 mt-0.5">
            Theo dõi tồn kho nguyên vật liệu, cảnh báo sắp hết hàng và lập phiếu xuất kho theo ca
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setHistoryModal(true)}
            className="py-2.5 px-4 rounded-xl border border-coffee-300 hover:bg-coffee-50 text-coffee-800 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <History className="w-4 h-4 text-coffee-600" />
            <span>Lịch Sử Xuất Kho ({stockIssues.length})</span>
          </button>

          <button
            onClick={() => setIssueModal(true)}
            className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Lập Phiếu Xuất Kho</span>
          </button>

          <button
            onClick={openAddItemModal}
            className="py-2.5 px-4 rounded-xl bg-coffee-900 hover:bg-black text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mặt Hàng</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-coffee-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc mã hàng..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-coffee-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-coffee-900 text-white'
                  : 'bg-coffee-50 hover:bg-coffee-100 text-coffee-700'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isLowStock = item.currentStock <= item.safeStockThreshold;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 border shadow-sm transition hover:shadow-md space-y-3 ${
                isLowStock ? 'border-rose-300 bg-rose-50/20' : 'border-coffee-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-coffee-400 font-bold block">{item.code}</span>
                  <h3 className="font-extrabold text-sm text-coffee-950 leading-tight mt-0.5">
                    {item.name}
                  </h3>
                  <span className="text-[11px] text-coffee-500 font-semibold">{item.category}</span>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  isLowStock ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isLowStock ? '⚠ SẮP HẾT' : '✓ AN TOÀN'}
                </span>
              </div>

              {/* Stock Numbers */}
              <div className="p-3 bg-coffee-50/60 rounded-2xl border border-coffee-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-coffee-500 block text-[10px] uppercase font-bold">Hiện còn tồn:</span>
                  <span className={`text-xl font-black font-mono ${isLowStock ? 'text-rose-700' : 'text-coffee-950'}`}>
                    {item.currentStock} {item.unit}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-coffee-500 block text-[10px] uppercase font-bold">Ngưỡng an toàn:</span>
                  <span className="font-mono font-bold text-coffee-800">
                    {item.safeStockThreshold} {item.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-coffee-600 font-medium">Đơn giá nhập:</span>
                <strong className="font-mono text-amber-900 font-black">{formatCurrency(item.unitPrice)}</strong>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-coffee-100">
                <button
                  onClick={() => openEditItemModal(item)}
                  className="p-1.5 rounded-lg text-coffee-700 hover:bg-coffee-100"
                  title="Sửa mặt hàng"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteInventoryItem(item.id)}
                  className="p-1.5 rounded-lg text-coffee-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Xóa mặt hàng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL 1: Thêm / Chỉnh sửa mặt hàng */}
      {itemModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-coffee-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
              <h3 className="font-extrabold text-coffee-950 text-sm">
                {itemModal.editingItem ? 'Sửa Mặt Hàng Kho' : 'Thêm Mặt Hàng Kho Mới'}
              </h3>
              <button onClick={() => setItemModal({ open: false, editingItem: null })}>
                <X className="w-4 h-4 text-coffee-500" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-coffee-700 mb-1">Mã Hàng:</label>
                <input
                  type="text"
                  value={itemForm.code}
                  onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-coffee-700 mb-1">Tên Mặt Hàng:</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Phân Loại:</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full py-2 px-2.5 rounded-xl border border-coffee-300 font-semibold"
                  >
                    <option value="Cà phê hạt">Cà phê hạt</option>
                    <option value="Sữa & Kem">Sữa & Kem</option>
                    <option value="Syrup & Sốt">Syrup & Sốt</option>
                    <option value="Trà & Bột">Trà & Bột</option>
                    <option value="Bao bì & Ly">Bao bì & Ly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Đơn Vị Tính:</label>
                  <input
                    type="text"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Số Lượng Tồn Ban Đầu:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={itemForm.currentStock}
                    onChange={(e) => setItemForm({ ...itemForm, currentStock: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Ngưỡng An Toàn:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={itemForm.safeStockThreshold}
                    onChange={(e) => setItemForm({ ...itemForm, safeStockThreshold: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-coffee-700 mb-1">Đơn Giá Nhập (VNĐ):</label>
                <input
                  type="number"
                  step="1000"
                  value={itemForm.unitPrice}
                  onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                  className="w-full py-2 px-3 rounded-xl border border-coffee-300 font-mono font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setItemModal({ open: false, editingItem: null })}
                  className="py-2 px-3 rounded-xl border border-coffee-300 font-bold text-coffee-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-coffee-900 text-white font-black"
                >
                  Lưu Mặt Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Lập Phiếu Xuất Kho Cho Ca Làm */}
      {issueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-coffee-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
              <h3 className="font-extrabold text-coffee-950 text-sm">
                Lập Phiếu Xuất Kho (Trừ Tồn Tự Động)
              </h3>
              <button onClick={() => setIssueModal(false)}>
                <X className="w-4 h-4 text-coffee-500" />
              </button>
            </div>

            <form onSubmit={handleSaveStockIssue} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Xuất Cho Ca Làm:</label>
                  <select
                    value={issueShift}
                    onChange={(e) => setIssueShift(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl border border-coffee-300 font-bold"
                  >
                    <option value="Ca Sáng (S1)">Ca Sáng (S1)</option>
                    <option value="Ca Chiều (C1)">Ca Chiều (C1)</option>
                    <option value="Ca Tối (T1)">Ca Tối (T1)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-coffee-700 mb-1">Ghi Chú Ca:</label>
                  <input
                    type="text"
                    placeholder="Nguyên liệu đầu ca..."
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-coffee-300"
                  />
                </div>
              </div>

              {/* Danh sách mặt hàng xuất */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-black text-coffee-950 uppercase text-[10px]">
                    Danh sách nguyên vật liệu xuất kho:
                  </label>
                  <button
                    type="button"
                    onClick={addIssueLine}
                    className="text-amber-800 font-black hover:underline text-[11px]"
                  >
                    + Thêm dòng
                  </button>
                </div>

                {issueItemsList.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-coffee-50 p-2 rounded-xl border border-coffee-200">
                    <select
                      value={line.itemId}
                      onChange={(e) => updateIssueLine(idx, 'itemId', e.target.value)}
                      className="flex-1 py-1.5 px-2 rounded-lg border border-coffee-300 font-bold text-xs"
                    >
                      {inventoryItems.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} (Tồn: {inv.currentStock} {inv.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={line.quantity}
                      onChange={(e) => updateIssueLine(idx, 'quantity', e.target.value)}
                      className="w-20 py-1.5 px-2 rounded-lg border border-coffee-300 font-mono font-bold text-xs"
                    />

                    {issueItemsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIssueLine(idx)}
                        className="text-rose-600 font-bold p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-coffee-100">
                <button
                  type="button"
                  onClick={() => setIssueModal(false)}
                  className="py-2 px-3 rounded-xl border border-coffee-300 font-bold text-coffee-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black"
                >
                  Xác Nhận Xuất Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Xem Lịch Sử Xuất Kho */}
      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-coffee-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
              <h3 className="font-extrabold text-coffee-950 text-sm">
                Lịch Sử Các Phiếu Xuất Kho Đã Lập
              </h3>
              <button onClick={() => setHistoryModal(false)}>
                <X className="w-4 h-4 text-coffee-500" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {stockIssues.map((iss) => (
                <div key={iss.id} className="p-3.5 rounded-2xl bg-coffee-50 border border-coffee-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="font-mono text-amber-900">{iss.issueCode}</span>
                    <span className="text-coffee-600">{iss.issueDate} • {iss.shiftName}</span>
                  </div>

                  <div className="text-coffee-700">
                    Người lập: <strong>{iss.createdByName}</strong>
                  </div>

                  <div className="space-y-1 bg-white p-2 rounded-xl border border-coffee-100">
                    {iss.items?.map((it, i) => (
                      <div key={i} className="flex justify-between text-coffee-900">
                        <span>• {it.itemName}</span>
                        <strong className="font-mono">{it.quantity} {it.unit}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right pt-2 border-t border-coffee-100">
              <button
                onClick={() => setHistoryModal(false)}
                className="py-2 px-4 rounded-xl bg-coffee-900 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
