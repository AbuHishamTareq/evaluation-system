import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '../../components/ui/buttons/Button';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { Table } from '../../components/ui/tables/Table';
import { TableHeader } from '../../components/ui/tables/TableHeader';
import { TableBody } from '../../components/ui/tables/TableBody';
import { TableRow } from '../../components/ui/tables/TableRow';
import { TableCell } from '../../components/ui/tables/TableCell';
import { usePhcMedicationStore } from '../../stores/phcMedicationStore';
import { useMedicationStore } from '../../stores/medicationStore';
import { useCenterStore } from '../../stores/centerStore';
import { useToast } from '../../components/ui/toast';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Input } from '../../components/ui/forms/Input';
import { Label } from '../../components/ui/forms/Label';
import type { PhcMedication, PhcMedicationCreateInput } from '../../types/medication';
import type { Center } from '../../types/center';

export const PhcMedicationsPage: React.FC = () => {
  const { items, isLoading, fetchByCenter, create, update, remove } = usePhcMedicationStore();
  const { medications, fetchMedications } = useMedicationStore();
  const { centers, fetchCenters } = useCenterStore();
  const { addToast } = useToast();

  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PhcMedication | null>(null);
  const [formData, setFormData] = useState<PhcMedicationCreateInput>({
    phc_center_id: 0,
    medication_id: 0,
    recommended_quantity: 0,
    current_stock: null,
    allocation_location: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PhcMedicationCreateInput, string>>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchMedications({ per_page: 100 });
    fetchCenters({ per_page: 100 });
  }, []);

  // ── Derived Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalLinked = items.length;
    const totalRecommendedQty = items.reduce((sum, i) => sum + i.recommended_quantity, 0);
    const stockBelowRecommended = items.filter(
      (i) => i.current_stock !== null && i.current_stock < i.recommended_quantity
    ).length;
    const uniqueLocations = new Set(
      items.map((i) => i.allocation_location).filter((loc): loc is string => !!loc)
    ).size;
    return { totalLinked, totalRecommendedQty, stockBelowRecommended, uniqueLocations };
  }, [items]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCenterChange = (center: Center | null) => {
    setSelectedCenter(center);
    if (center) {
      fetchByCenter(center.id);
    }
  };

  const openAddModal = () => {
    if (!selectedCenter) {
      addToast('Please select a PHC first', 'warning');
      return;
    }
    setEditingItem(null);
    setFormData({
      phc_center_id: selectedCenter.id,
      medication_id: 0,
      recommended_quantity: 0,
      current_stock: null,
      allocation_location: '',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: PhcMedication) => {
    setEditingItem(item);
    setFormData({
      phc_center_id: item.phc_center_id,
      medication_id: item.medication_id,
      recommended_quantity: item.recommended_quantity,
      current_stock: item.current_stock,
      allocation_location: item.allocation_location || '',
      notes: item.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof PhcMedicationCreateInput, string>> = {};
    if (!formData.medication_id) errors.medication_id = 'Medication is required';
    if (!formData.recommended_quantity || formData.recommended_quantity <= 0) {
      errors.recommended_quantity = 'Quantity must be greater than 0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingItem) {
        await update(editingItem.id, formData);
        addToast('PHC medication updated successfully', 'success');
      } else {
        await create(formData);
        addToast('Medication linked successfully', 'success');
      }
      setIsModalOpen(false);
      if (selectedCenter) fetchByCenter(selectedCenter.id);
    } catch {
      addToast('Operation failed', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remove(id);
      addToast('Medication unlinked successfully', 'success');
      setDeleteConfirm(null);
      if (selectedCenter) fetchByCenter(selectedCenter.id);
    } catch {
      addToast('Failed to unlink medication', 'error');
    }
  };

  const usedMedicationIds = items.map((i) => i.medication_id);
  const availableMedications = medications.filter(
    (m) => !usedMedicationIds.includes(m.id)
  );

  const LOCATION_OPTIONS = [
    { value: 'Crash Cart', label: 'Crash Cart' },
    { value: 'Emergency Bag', label: 'Emergency Bag' },
    { value: 'Medication Room', label: 'Medication Room' },
    { value: 'Refrigerator', label: 'Refrigerator' },
    { value: 'Controlled Substance Cabinet', label: 'Controlled Substance Cabinet' },
    { value: 'Anesthesia Tray', label: 'Anesthesia Tray' },
    { value: 'ICU Cart', label: 'ICU Cart' },
    { value: 'Ward Stock', label: 'Ward Stock' },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
            PHC Medications
          </h1>
          <p className="text-slate-500 mt-1">Manage medication allocations across primary health centers</p>
        </div>
        <Button
          variant="gradient"
          gradient="from-rose-500 to-red-500"
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
          onClick={openAddModal}
        >
          Link Medication
        </Button>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Linked Medications */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">Linked Medications</p>
              <p className="text-4xl font-bold mt-2">{stats.totalLinked}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-rose-100">
            <span>Allocated to this PHC</span>
          </div>
        </div>

        {/* Total Recommended Quantity */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Recommended Qty</p>
              <p className="text-4xl font-bold mt-2">{stats.totalRecommendedQty}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-pink-100">
            <span>Total supply needed</span>
          </div>
        </div>

        {/* Stock Below Recommended */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">Low Stock Items</p>
              <p className="text-4xl font-bold mt-2">{stats.stockBelowRecommended}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-rose-100">
            <span>Below recommended levels</span>
          </div>
        </div>

        {/* Allocation Locations */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Locations</p>
              <p className="text-4xl font-bold mt-2">{stats.uniqueLocations}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-100">
            <span>Allocation destinations</span>
          </div>
        </div>
      </div>

      {/* ── Content Glass Card ─────────────────────────────────────────────── */}
      <div className="glass rounded-3xl p-8 border border-white/30">
        {/* PHC Center Selector */}
        <div className="max-w-md mb-6">
          <Label required>Select PHC Center</Label>
          <SearchableCombobox
            value={selectedCenter?.id || null}
            onChange={(val) => {
              const center = centers.find((c) => c.id === val) || null;
              handleCenterChange(center);
            }}
            options={centers.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.code})`,
            }))}
            placeholder="Search PHC centers..."
            noSelectionLabel="Select a center"
          />
        </div>

        {!selectedCenter ? (
          /* ── Empty State: No PHC Selected ──────────────────────────── */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-4 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Select a PHC Center</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Choose a primary health center from the dropdown above to view and manage its linked medications.
            </p>
          </div>
        ) : items.length === 0 && !isLoading ? (
          /* ── Empty State: No Linked Medications ────────────────────── */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Medications Linked</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              This PHC center doesn't have any medications linked yet. Start by linking a medication to this center.
            </p>
            <Button
              variant="gradient"
              gradient="from-rose-500 to-red-500"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={openAddModal}
            >
              Link Your First Medication
            </Button>
          </div>
        ) : (
          /* ── Table Area ───────────────────────────────────────────── */
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell as="th">Medication</TableCell>
                  <TableCell as="th">Strength</TableCell>
                  <TableCell as="th">Recommended Qty</TableCell>
                  <TableCell as="th">Current Stock</TableCell>
                  <TableCell as="th">Allocation Location</TableCell>
                  <TableCell as="th">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-rose-50/40 transition-colors duration-150"
                  >
                    <TableCell className="font-medium text-slate-800">
                      {item.medication?.name || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item.medication?.strength || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">{item.recommended_quantity}</TableCell>
                    <TableCell className="text-slate-600">
                      {item.current_stock !== null ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium ${
                            item.current_stock < item.recommended_quantity
                              ? 'bg-red-100 text-red-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.current_stock < item.recommended_quantity
                                ? 'bg-red-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {item.current_stock}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.allocation_location ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs rounded-full font-medium bg-cyan-100 text-cyan-700">
                          {item.allocation_location}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteConfirm(item.id)}
                        >
                          Unlink
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {isLoading && (
                  <TableRow>
                    <td colSpan={6} className="text-center text-slate-400 py-10">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin text-rose-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading medications...</span>
                      </div>
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader
          title={editingItem ? 'Edit PHC Medication' : 'Link Medication'}
          onClose={() => setIsModalOpen(false)}
        />
        <ModalContent>
          <div className="space-y-4">
            <div>
              <Label required>Medication</Label>
              {editingItem ? (
                <p className="text-sm font-medium text-slate-700 py-2">
                  {items.find((i) => i.id === editingItem.id)?.medication?.name || '-'}
                </p>
              ) : (
                <SearchableCombobox
                  value={formData.medication_id || null}
                  onChange={(val) => setFormData({ ...formData, medication_id: (val as number) || 0 })}
                  options={availableMedications.map((m) => ({
                    value: m.id,
                    label: `${m.name}${m.strength ? ` ${m.strength}` : ''}${m.form ? ` - ${m.form}` : ''}`,
                  }))}
                  placeholder="Search medications..."
                  error={formErrors.medication_id}
                  noSelectionLabel="Select medication"
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label required>Recommended Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.recommended_quantity || ''}
                  onChange={(e) => setFormData({ ...formData, recommended_quantity: parseFloat(e.target.value) || 0 })}
                  error={formErrors.recommended_quantity}
                />
              </div>
              <div>
                <Label>Current Stock</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_stock ?? ''}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label>Allocation Location</Label>
              <SearchableCombobox
                value={formData.allocation_location || ''}
                onChange={(val) => setFormData({ ...formData, allocation_location: (val as string) || '' })}
                options={LOCATION_OPTIONS}
                placeholder="Select location..."
                noSelectionLabel="No location"
                clearable
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient="from-rose-500 to-red-500"
            onClick={handleSubmit}
          >
            {editingItem ? 'Save Changes' : 'Link Medication'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal isOpen={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} size="sm">
        <ModalHeader title="Unlink Medication" onClose={() => setDeleteConfirm(null)} />
        <ModalContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-800 font-medium">Are you sure?</p>
              <p className="text-slate-500 text-sm mt-1">
                This will unlink the medication from this PHC center. The medication will remain in the catalog.
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Unlink Medication
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PhcMedicationsPage;
