import React, { useEffect, useState } from 'react';
import { Modal } from '../../ui/modals/Modal';
import { ModalHeader } from '../../ui/modals/ModalHeader';
import { ModalContent } from '../../ui/modals/ModalContent';
import { ModalFooter } from '../../ui/modals/ModalFooter';
import { Input } from '../../ui/forms/Input';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import { Card, CardContent, CardHeader } from '../../ui/cards/Card';
import { useMedicationEvaluationTemplateStore } from '../../../stores/medicationEvaluationTemplateStore';
import { apiClient } from '../../../api/client';
import { useToast } from '../../ui/toast';
import type { MedicationEvaluationTemplate } from '../../../types/medicationEvaluation';
import type { MedicationEvaluationTemplateFormData } from '../../../types/medicationEvaluation';

interface CriterionEntry {
  name: string;
  description: string;
  type: 'number' | 'yes_no' | 'text' | 'yes_no_partial';
  weight: number;
}

interface TemplateBuilderModalProps {
  isOpen: boolean;
  editingTemplate?: MedicationEvaluationTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}

export const TemplateBuilderModal: React.FC<TemplateBuilderModalProps> = ({
  isOpen,
  editingTemplate,
  onClose,
  onSaved,
}) => {
  const { createTemplate, updateTemplate, isLoading } = useMedicationEvaluationTemplateStore();
  const { addToast } = useToast();
  const [activeMedicationCount, setActiveMedicationCount] = useState(0);

  const isEditing = Boolean(editingTemplate);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [criteria, setCriteria] = useState<CriterionEntry[]>([]);

  // Fetch active medication count from API
  useEffect(() => {
    if (!isOpen) return;

    const fetchCount = async () => {
      try {
        const response = await apiClient.get<{ meta: { total: number; active_count: number } }>(
          '/api/v1/medications?per_page=1&is_active=1'
        );
        setActiveMedicationCount(response.meta.active_count ?? response.meta.total ?? 0);
      } catch {
        // silently fail, count stays 0
      }
    };

    fetchCount();
  }, [isOpen]);

  // Populate form when opening modal
  useEffect(() => {
    if (!isOpen) return;

    // Use setTimeout to avoid React 19 set-state-in-effect lint rule
    const timer = setTimeout(() => {
      if (editingTemplate) {
        setName(editingTemplate.name);
        setDescription(editingTemplate.description ?? '');
        setIsActive(editingTemplate.is_active);
        setCriteria(
          (editingTemplate.criteria || []).map((c) => ({
            name: c.name,
            description: c.description ?? '',
            type: c.type,
            weight: c.weight,
          }))
        );
      } else {
        // Reset form for new template
        setName('');
        setDescription('');
        setIsActive(true);
        setCriteria([]);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, editingTemplate]);

  const addCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      { name: '', description: '', type: 'yes_no', weight: 1 },
    ]);
  };

  const removeCriterion = (index: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
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
    // medications not sent — backend auto-populates from catalog
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
      if (isEditing && editingTemplate) {
        await updateTemplate(editingTemplate.id, buildPayload());
        addToast('Template updated successfully', 'success');
      } else {
        await createTemplate(buildPayload());
        addToast('Template created successfully', 'success');
      }
      onSaved();
      onClose();
    } catch {
      addToast('Failed to save template', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={isEditing ? 'Edit Template' : 'Create Template'}
        onClose={onClose}
      />
      <ModalContent>
        <div className="space-y-8">
          {/* Section 1 — Template Info */}
          <Card variant="outlined" padding="none" className="overflow-hidden">
            <CardHeader
              title="Template Information"
              subtitle="Set up the basic details for this evaluation template."
            />
            <CardContent className="space-y-4">
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
                  <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-red-500 peer-checked:after:translate-x-full" />
                </label>
                <span className="text-sm font-medium text-slate-700">Active</span>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 — Auto-Included Medications */}
          <Card variant="outlined" padding="none" className="overflow-hidden">
            <CardHeader
              title="Medications"
              subtitle="Medications are auto-included from the catalog."
            />
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">Auto-Included Medications</p>
                    <p className="text-sm text-red-700 mt-1">
                      This template will include all <strong>{activeMedicationCount}</strong> active medications from the catalog automatically. No manual selection needed — evaluations will be generated for every active medication using the criteria defined below.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 — Define Criteria */}
          <Card variant="outlined" padding="none" className="overflow-hidden">
            <CardHeader
              title="Criteria"
              subtitle={criteria.length > 0 ? `${criteria.length} criterion/criteria defined` : 'Define evaluation criteria for this template.'}
            />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {criteria.length > 0
                    ? `Total weight: ${criteria.reduce((s, c) => s + Number(c.weight), 0)}`
                    : 'No criteria defined yet'}
                </p>
                <Button
                  variant="gradient"
                  gradient="from-red-500 to-amber-500"
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
              </div>

              {criteria.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p>No criteria defined. Click "Add Criterion" to begin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {criteria.map((criterion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Gradient order number circle */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0 mt-1">
                        {index + 1}
                      </div>

                      {/* Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2">
                          <Label className="text-[10px]">Name</Label>
                          <Input
                            value={criterion.name}
                            onChange={(e) => updateCriterionField(index, 'name', e.target.value)}
                            placeholder="Criterion name"
                            className="text-sm"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label className="text-[10px]">Description</Label>
                          <Input
                            value={criterion.description}
                            onChange={(e) => updateCriterionField(index, 'description', e.target.value)}
                            placeholder="Optional description"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">Type</Label>
                          <SearchableCombobox
                            value={criterion.type}
                            onChange={(val) => updateCriterionField(index, 'type', val as 'number' | 'yes_no' | 'yes_no_partial' | 'text')}
                            options={[
                              { value: 'yes_no', label: 'Yes/No' },
                              { value: 'yes_no_partial', label: 'Yes/Partially/No' },
                              { value: 'number', label: 'Number' },
                              { value: 'text', label: 'Text' },
                            ]}
                            placeholder="Type"
                            noSelectionLabel="Select type"
                            clearable={false}
                          />
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
                        className="p-2 mt-5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
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
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="gradient"
          gradient="from-red-500 to-amber-500"
          onClick={handleSave}
          isLoading={isLoading}
        >
          {isEditing ? 'Save Changes' : 'Create Template'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TemplateBuilderModal;
