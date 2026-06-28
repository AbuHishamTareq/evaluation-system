import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/forms/Input';
import { Textarea } from '../../components/ui/forms/Textarea';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/cards/Card';
import { Label } from '../../components/ui/forms/Label';
import { useMedicationEvaluationTemplateStore } from '../../stores/medicationEvaluationTemplateStore';
import { useMedicationStore } from '../../stores/medicationStore';
import { useToast } from '../../components/ui/toast';
import type { Medication } from '../../types/medication';
import type { MedicationEvaluationTemplateFormData } from '../../types/medicationEvaluation';

interface MedicationEntry {
  medication_id: number;
  medication_name: string;
  medication_strength: string;
  medication_form: string;
  recommended_quantity: number;
  allocation_location: string;
}

interface CriterionEntry {
  name: string;
  description: string;
  type: 'number' | 'yes_no' | 'yes_no_partial' | 'text';
  weight: number;
}

// ─── Dropdown Item ──────────────────────────────────────────────────────────────
interface MedDropdownItemProps {
  medication: Medication;
  isHighlighted: boolean;
  onClick: (medication: Medication) => void;
}

const MedDropdownItem: React.FC<MedDropdownItemProps> = ({
  medication,
  isHighlighted,
  onClick,
}) => {
  return (
    <div
      role="option"
      onClick={() => onClick(medication)}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isHighlighted ? 'bg-emerald-50' : 'hover:bg-emerald-50'}
      `}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
        {medication.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">
            {medication.name}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            medication.is_active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {medication.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {[medication.strength, medication.form, medication.unit].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
    </div>
  );
};

export const TemplateBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentTemplate = useMedicationEvaluationTemplateStore((s) => s.currentTemplate);
  const fetchTemplate = useMedicationEvaluationTemplateStore((s) => s.fetchTemplate);
  const createTemplate = useMedicationEvaluationTemplateStore((s) => s.createTemplate);
  const updateTemplate = useMedicationEvaluationTemplateStore((s) => s.updateTemplate);
  const isLoading = useMedicationEvaluationTemplateStore((s) => s.isLoading);
  const medications = useMedicationStore((s) => s.medications);
  const fetchMedications = useMedicationStore((s) => s.fetchMedications);
  const { addToast } = useToast();

  const isEditing = Boolean(id);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedMedications, setSelectedMedications] = useState<MedicationEntry[]>([]);
  const [criteria, setCriteria] = useState<CriterionEntry[]>([]);

  // Medication picker state
  const [showMedicationPicker, setShowMedicationPicker] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [medDropdownOpen, setMedDropdownOpen] = useState(false);
  const [medHighlightedIndex, setMedHighlightedIndex] = useState(-1);
  const medDropdownRef = useRef<HTMLDivElement>(null);
  const medInputRef = useRef<HTMLInputElement>(null);

  // Load medications catalog
  useEffect(() => {
    fetchMedications({ per_page: 100 });
  }, [fetchMedications]);

  // Load template if editing
  useEffect(() => {
    if (id) {
      fetchTemplate(Number(id));
    }
  }, [id, fetchTemplate]);

  // Close medication dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (medDropdownRef.current && !medDropdownRef.current.contains(e.target as Node)) {
        setMedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Populate form from fetched template
  useEffect(() => {
    if (isEditing && currentTemplate && currentTemplate.id === Number(id)) {
      const timer = setTimeout(() => {
        setName(currentTemplate.name);
        setDescription(currentTemplate.description ?? '');
        setIsActive(currentTemplate.is_active);
        setSelectedMedications(
          (currentTemplate.medications || []).map((m) => ({
            medication_id: m.medication_id,
            medication_name: m.medication?.name || `Medication #${m.medication_id}`,
            medication_strength: m.medication?.strength || '',
            medication_form: m.medication?.form || '',
            recommended_quantity: m.recommended_quantity,
            allocation_location: m.allocation_location ?? '',
          }))
        );
        setCriteria(
          (currentTemplate.criteria || []).map((c) => ({
            name: c.name,
            description: c.description ?? '',
            type: c.type,
            weight: c.weight,
          }))
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing, currentTemplate, id]);

  const filteredMedications = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(medSearch.toLowerCase()) &&
      !selectedMedications.some((sm) => sm.medication_id === m.id)
  );

  const addMedication = (medication: Medication) => {
    setSelectedMedications((prev) => [
      ...prev,
      {
        medication_id: medication.id,
        medication_name: medication.name,
        medication_strength: medication.strength || '',
        medication_form: medication.form || '',
        recommended_quantity: 1,
        allocation_location: '',
      },
    ]);
    setShowMedicationPicker(false);
    setMedSearch('');
  };

  const removeMedication = (index: number) => {
    setSelectedMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const moveMedication = (index: number, direction: 'up' | 'down') => {
    setSelectedMedications((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const updateMedicationField = (index: number, field: keyof MedicationEntry, value: string | number) => {
    setSelectedMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const addCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      { name: '', description: '', type: 'yes_no', weight: 1 },
    ]);
  };

  const removeCriterion = (index: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const moveCriterion = (index: number, direction: 'up' | 'down') => {
    setCriteria((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const updateCriterionField = (index: number, field: keyof CriterionEntry, value: string | number) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      addToast('Template name is required', 'error');
      return false;
    }
    if (selectedMedications.length === 0) {
      addToast('Please select at least one medication', 'error');
      return false;
    }
    if (criteria.length === 0) {
      addToast('Please define at least one criterion', 'error');
      return false;
    }
    return true;
  };

  const buildPayload = (): MedicationEvaluationTemplateFormData => ({
    name: name.trim(),
    description: description.trim(),
    is_active: isActive,
    medications: selectedMedications.map((m, idx) => ({
      medication_id: m.medication_id,
      recommended_quantity: m.recommended_quantity,
      allocation_location: m.allocation_location,
      order: idx,
    })),
    criteria: criteria.map((c, idx) => ({
      name: c.name,
      description: c.description,
      type: c.type,
      weight: c.weight,
      order: idx,
    })),
  });

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (isEditing && id) {
        await updateTemplate(Number(id), buildPayload());
        addToast('Template updated successfully', 'success');
      } else {
        await createTemplate(buildPayload());
        addToast('Template created successfully', 'success');
      }
      navigate('/medication-evaluation-templates');
    } catch {
      addToast('Failed to save template', 'error');
    }
  };

  const handleSaveAndClose = async () => {
    if (!validate()) return;
    try {
      if (isEditing && id) {
        await updateTemplate(Number(id), buildPayload());
      } else {
        await createTemplate(buildPayload());
      }
      addToast('Template saved successfully', 'success');
      navigate('/medication-evaluation-templates');
    } catch {
      addToast('Failed to save template', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {isEditing ? 'Edit Template' : 'Create Template'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditing ? 'Modify the medication evaluation template' : 'Define a new medication evaluation template'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/medication-evaluation-templates')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave}>
            Save
          </Button>
          <Button
            variant="gradient"
            gradient="from-emerald-500 to-teal-500"
            onClick={handleSaveAndClose}
            isLoading={isLoading}
          >
            Save & Close
          </Button>
        </div>
      </div>

      {/* Template Info Section */}
      <Card variant="elevated" padding="lg">
        <CardHeader title="Template Information" />
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label required>Template Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Quarterly Medication Check"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this template..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm font-medium text-slate-700">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications Section */}
      <Card variant="elevated" padding="lg">
        <CardHeader
          title="Medications"
          subtitle={`${selectedMedications.length} medication(s) selected`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMedicationPicker(true)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Add Medication
            </Button>
          }
        />
        <CardContent>
          {selectedMedications.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No medications selected. Click "Add Medication" to begin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedMedications.map((med, index) => (
                <div
                  key={`${med.medication_id}-${index}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveMedication(index, 'up')}
                      disabled={index === 0}
                      className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMedication(index, 'down')}
                      disabled={index === selectedMedications.length - 1}
                      className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Medication info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">{med.medication_name}</p>
                    <p className="text-xs text-slate-500">
                      {[med.medication_strength, med.medication_form].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>

                  {/* Fields */}
                  <div className="flex items-center gap-3">
                    <div className="w-28">
                      <Label className="text-[10px]">Rec. Qty</Label>
                      <Input
                        type="number"
                        min={0}
                        value={med.recommended_quantity}
                        onChange={(e) => updateMedicationField(index, 'recommended_quantity', parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                    <div className="w-36">
                      <Label className="text-[10px]">Location</Label>
                      <Input
                        value={med.allocation_location}
                        onChange={(e) => updateMedicationField(index, 'allocation_location', e.target.value)}
                        placeholder="e.g., Shelf A"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medication Picker Modal */}
      {showMedicationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-800">Select Medication</h3>
                <button
                  type="button"
                  onClick={() => { setShowMedicationPicker(false); setMedSearch(''); setMedDropdownOpen(false); setMedHighlightedIndex(-1); }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div ref={medDropdownRef} className="relative">
                <Input
                  ref={medInputRef}
                  placeholder="Search medications..."
                  value={medSearch}
                  onChange={(e) => {
                    setMedSearch(e.target.value);
                    setMedDropdownOpen(true);
                  }}
                  onFocus={() => { setMedHighlightedIndex(-1); setMedDropdownOpen(true); }}
                  onKeyDown={(e) => {
                    if (!medDropdownOpen) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setMedHighlightedIndex((prev) => Math.min(prev + 1, filteredMedications.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setMedHighlightedIndex((prev) => Math.max(prev - 1, 0));
                    } else if (e.key === 'Enter' && medHighlightedIndex >= 0) {
                      e.preventDefault();
                      const med = filteredMedications[medHighlightedIndex];
                      if (med) {
                        addMedication(med);
                        setMedDropdownOpen(false);
                        setMedHighlightedIndex(-1);
                      }
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setMedDropdownOpen(false);
                    }
                  }}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
                {medDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 max-h-60 overflow-y-auto">
                    {filteredMedications.length === 0 ? (
                      <div className="text-center py-8 px-4">
                        <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          {medSearch ? 'No medications match your search' : 'No medications available'}
                        </p>
                      </div>
                    ) : (
                      <div role="listbox" className="py-1">
                        {filteredMedications.map((med, index) => (
                          <MedDropdownItem
                            key={med.id}
                            medication={med}
                            isHighlighted={index === medHighlightedIndex}
                            onClick={(m) => {
                              addMedication(m);
                              setMedDropdownOpen(false);
                              setMedHighlightedIndex(-1);
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {filteredMedications.length > 0 && (
                      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                        <span>{filteredMedications.length} result{filteredMedications.length !== 1 ? 's' : ''}</span>
                        <span className="flex items-center gap-2">
                          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑↓</kbd>
                          navigate
                          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd>
                          select
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredMedications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {medSearch ? 'No medications match your search' : 'No medications available'}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredMedications.map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => addMedication(med)}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors rounded-lg flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                        {med.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{med.name}</p>
                        <p className="text-xs text-slate-500">
                          {[med.strength, med.form, med.unit].filter(Boolean).join(' · ') || '—'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Criteria Section */}
      <Card variant="elevated" padding="lg">
        <CardHeader
          title="Criteria"
          subtitle={`${criteria.length} criterion/criteria defined`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={addCriterion}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Add Criterion
            </Button>
          }
        />
        <CardContent>
          {criteria.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No criteria defined. Click "Add Criterion" to begin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criteria.map((criterion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  {/* Order */}
                  <div className="flex flex-col gap-0.5 mt-1">
                    <button
                      type="button"
                      onClick={() => moveCriterion(index, 'up')}
                      disabled={index === 0}
                      className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCriterion(index, 'down')}
                      disabled={index === criteria.length - 1}
                      className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <Label className="text-[10px]">Name</Label>
                      <Input
                        value={criterion.name}
                        onChange={(e) => updateCriterionField(index, 'name', e.target.value)}
                        placeholder="Criterion name"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Type</Label>
                      <select
                        value={criterion.type}
                        onChange={(e) => updateCriterionField(index, 'type', e.target.value as 'number' | 'yes_no' | 'text')}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="yes_no">Yes/No</option>
                        <option value="number">Number</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Weight</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={criterion.weight}
                        onChange={(e) => updateCriterionField(index, 'weight', parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeCriterion(index)}
                    className="p-2 mt-5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/medication-evaluation-templates')}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleSave}>
          Save
        </Button>
        <Button
          variant="gradient"
          gradient="from-emerald-500 to-teal-500"
          onClick={handleSaveAndClose}
          isLoading={isLoading}
        >
          Save & Close
        </Button>
      </div>
    </div>
  );
};

export default TemplateBuilderPage;
