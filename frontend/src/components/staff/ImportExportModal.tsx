import { useState, useRef } from 'react'
import { useAppStore } from '@/stores/appStore'
import { staffApi } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import * as XLSX from 'xlsx'
import {
  Upload, Download, FileSpreadsheet, Check,
  AlertCircle, Loader2, ArrowRight, ArrowLeft, FileText, FileDown
} from 'lucide-react'

export interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  selectedIds?: number[]
  type?: 'staff' | 'department' | 'zone' | 'phc-center' | 'nationality' | 'medicalField' | 'specialty' | 'rank' | 'shcCategory'
  api?: {
    getAll: (params?: any) => Promise<any>
    importFile: (file: File, format?: any) => Promise<any>
    exportFile: (format: any, params?: any) => Promise<any>
    downloadTemplate?: (format?: any) => Promise<any>
  }
}

type FileFormat = 'csv' | 'excel'
type ExportFormat = 'csv' | 'excel' | 'pdf'

export function ImportExportModal({
  isOpen,
  onClose,
  onComplete,
  selectedIds = [],
  type = 'staff',
  api: customApi
}: ImportExportModalProps) {
  const { locale, direction } = useAppStore()
  const isRTL = direction === 'rtl'

  const usedApi = customApi || staffApi

  const getLabels = () => {
    if (type === 'department') {
      return {
        title: locale === 'ar' ? 'استيراد/تصدير الأقسام' : 'Import/Export Departments',
        import: locale === 'ar' ? 'استيراد أقسام' : 'Import Departments',
        export: locale === 'ar' ? 'تصدير أقسام' : 'Export Departments',
        importSuccess: locale === 'ar' ? 'تم استيراد الأقسام بنجاح' : 'Departments imported successfully',
        exportSuccess: locale === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Export completed',
        downloadTemplate: locale === 'ar' ? 'تحميل قالب' : 'Download Template',
      }
    }
    if (type === 'zone') {
      return {
        title: locale === 'ar' ? 'استيراد/تصدير المناطق' : 'Import/Export Zones',
        import: locale === 'ar' ? 'استيراد مناطق' : 'Import Zones',
        export: locale === 'ar' ? 'تصدير مناطق' : 'Export Zones',
        importSuccess: locale === 'ar' ? 'تم استيراد المناطق بنجاح' : 'Zones imported successfully',
        exportSuccess: locale === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Export completed',
        downloadTemplate: locale === 'ar' ? 'تحميل قالب' : 'Download Template',
      }
    }
    if (type === 'phc-center') {
      return {
        title: locale === 'ar' ? 'استيراد/تصدير مراكز الصحة' : 'Import/Export PHC Centers',
        import: locale === 'ar' ? 'استيراد مراكز' : 'Import PHC Centers',
        export: locale === 'ar' ? 'تصدير مراكز' : 'Export PHC Centers',
        importSuccess: locale === 'ar' ? 'تم استيراداكز الصحة بنجاح' : 'PHC Centers imported successfully',
        exportSuccess: locale === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Export completed',
        downloadTemplate: locale === 'ar' ? 'تحميل قالب' : 'Download Template',
      }
    }
    return {
      title: locale === 'ar' ? 'استيراد/تصدير الموظفين' : 'Import/Export Staff',
      import: locale === 'ar' ? 'استيراد موظفين' : 'Import Staff',
      export: locale === 'ar' ? 'تصدير موظفين' : 'Export Staff',
      importSuccess: locale === 'ar' ? 'تم استيراد الموظفين بنجاح' : 'Staff imported successfully',
      exportSuccess: locale === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Export completed',
      downloadTemplate: locale === 'ar' ? 'تحميل قالب' : 'Download Template',
    }
  }

  const labels = getLabels()

  const [mode, setMode] = useState<'menu' | 'import' | 'export'>('menu')
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [importFormat, setImportFormat] = useState<FileFormat>('csv')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isValidFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (importFormat === 'csv') {
      return ext === 'csv'
    }
    return ext === 'xlsx' || ext === 'xls'
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!isValidFile(selected)) {
        setError(locale === 'ar'
          ? `الملف يجب أن يكون ${importFormat === 'csv' ? 'CSV' : 'Excel'}`
          : `File must be ${importFormat === 'csv' ? 'CSV' : 'Excel'}`)
        return
      }
      setFile(selected)
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      await usedApi.importFile(file, importFormat)
      setSuccess(type === 'department'
        ? 'تم استيراد الأقسام بنجاح'
        : 'تم استيراد الموظفين بنجاح')
      onComplete()
      setTimeout(onClose, 2000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Import failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const format = importFormat

      if (type === 'department') {
        const headers = ['Name', 'Name (Arabic)', 'Code', 'PHC Center', 'Status']
        const sampleData = ['Nursing', 'تمريض', 'NUR001', 'Main PHC', 'active']
        createTemplateFile(headers, sampleData, format, 'department_import_template')
        return
      } else if (type === 'nationality') {
        const headers = ['Name', 'Name (Arabic)', 'Code', 'Status']
        const sampleData = ['Saudi Arabian', 'سعودي', 'SA', 'active']
        createTemplateFile(headers, sampleData, format, 'nationality_import_template')
        return
      } else if (type === 'zone') {
        const headers = ['Name', 'Name (Arabic)', 'Code', 'Status']
        const sampleData = ['Riyadh Region', 'منطقة الرياض', 'RIY', 'active']
        createTemplateFile(headers, sampleData, format, 'zone_import_template')
        return
      } else if (type === 'phc-center') {
        const headers = ['Name', 'Name (Arabic)', 'Code', 'Region', 'Address', 'Phone', 'Status']
        const sampleData = ['North Riyadh PHC', 'مركز شمال الرياض الصحي', 'NR-PHC-001', 'Riyadh Region', 'Kingdom Avenue, Riyadh', '+966-11-123-4567', 'active']
        createTemplateFile(headers, sampleData, format, 'phc_center_import_template')
        return
      } else if (type === 'staff') {
        const response = await usedApi.downloadTemplate?.(format)
        if (response) {
          const blob = new Blob([response.data], { type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `staff_import_template.${format === 'excel' ? 'xlsx' : 'csv'}`
          a.click()
          window.URL.revokeObjectURL(url)
          return
        }
        const headers = ['Employee ID', 'First Name', 'Last Name', 'First Name (Arabic)', 'Last Name (Arabic)', 'National ID', 'Nationality', 'Birth Date', 'Gender', 'Phone', 'Email', 'Zone', 'PHC Center', 'Department', 'Medical Field', 'Specialty', 'Rank', 'Status', 'Hire Date', 'License Number', 'License Expiry Date', 'Policy Number', 'Policy Expiry Date']
        const sampleData = ['EMP001', 'John', 'Doe', 'جون', 'ديو', '1234567890', 'Saudi Arabia', '1990-01-01', 'male', '966501234567', 'john@example.com', 'Central', 'Main PHC', 'Nursing', 'Medicine', 'General', 'Specialist', 'active', '2024-01-01', 'SCFHS12345', '2027-01-01', 'POL12345', '2027-01-01']
        createTemplateFile(headers, sampleData, format, 'staff_import_template')
        return
      }

      const response = await usedApi.getAll({ per_page: 1 })
      const responseData = response.data
      const headers = responseData.data.length > 0 ? Object.keys(responseData.data[0]) : []
      const sampleData = headers.length > 0 ? headers.map(() => 'sample') : []

      createTemplateFile(headers, sampleData, format, `${type}_import_template`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to download template')
    }
  }

  const createTemplateFile = (headers: string[], sampleData: string[], format: FileFormat, filename: string) => {
    if (format === 'excel') {
      const ws = XLSX.utils.aoa_to_sheet([headers, sampleData])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Template')
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } else {
      const output = '"' + headers.join('","') + '"\n"' + sampleData.join('","') + '"'
      const blob = new Blob([output], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }
  }

  const handleExport = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const params: Record<string, unknown> = {}
      if (exportScope === 'selected' && selectedIds.length > 0) {
        params.ids = selectedIds.join(',')
      }

      const response = await usedApi.exportFile(exportFormat, params)
      const mimeType = exportFormat === 'csv'
        ? 'text/csv'
        : exportFormat === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf'
      const extension = exportFormat === 'csv' ? 'csv' : exportFormat === 'excel' ? 'xlsx' : 'pdf'
      const blob = new Blob([response.data], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.${extension}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setSuccess(type === 'department'
        ? 'تم تصدير البيانات بنجاح'
        : 'تم تصدير البيانات بنجاح')
      onComplete()
      setTimeout(onClose, 2000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Export failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setMode('menu')
    setFile(null)
    setError(null)
    setSuccess(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={labels.title}
      size="lg"
    >
      {mode === 'menu' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('import')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition flex flex-col items-center gap-3"
            >
              <Upload className="w-10 h-10 text-brand-600" />
              <span className="font-medium">
                {labels.import}
              </span>
              <span className="text-sm text-gray-500">
                {locale === 'ar'
                  ? 'CSV أو Excel'
                  : 'CSV or Excel'}
              </span>
            </button>

            <button
              onClick={() => setMode('export')}
              disabled={isProcessing}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition flex flex-col items-center gap-3"
            >
              {isProcessing ? (
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
              ) : (
                <Download className="w-10 h-10 text-brand-600" />
              )}
              <span className="font-medium">
                {labels.export}
              </span>
              <span className="text-sm text-gray-500">
                {locale === 'ar'
                  ? 'CSV، Excel أو PDF'
                  : 'CSV, Excel or PDF'}
              </span>
            </button>
          </div>
        </div>
      )}

      {mode === 'import' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMode('menu')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {locale === 'ar' ? 'رجوع' : 'Back'}
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setImportFormat('csv'); setFile(null); }}
              className={`px-4 py-2 rounded-lg border-2 ${importFormat === 'csv' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
            >
              <FileText className="w-5 h-5 inline me-2" />
              CSV
            </button>
            <button
              onClick={() => { setImportFormat('excel'); setFile(null); }}
              className={`px-4 py-2 rounded-lg border-2 ${importFormat === 'excel' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
            >
              <FileSpreadsheet className="w-5 h-5 inline me-2" />
              Excel
            </button>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <FileDown className="w-5 h-5 inline me-2" />
              {labels.downloadTemplate}
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={importFormat === 'csv' ? '.csv' : '.xlsx,.xls'}
              onChange={handleFileSelect}
              className="hidden"
            />
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-3">
              {locale === 'ar'
                ? `اختر ملف ${importFormat === 'csv' ? 'CSV' : 'Excel'} للاستيراد`
                : `Select a ${importFormat === 'csv' ? 'CSV' : 'Excel'} file to import`}
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              {locale === 'ar' ? 'اختيار ملف' : 'Choose File'}
            </Button>
          </div>

          {file && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">
              {locale === 'ar' ? 'ملف محدد:' : 'File selected:'} {file.name}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {locale === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 me-2" />
                  {locale === 'ar' ? 'استيراد' : 'Import'}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {mode === 'export' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMode('menu')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {locale === 'ar' ? 'رجوع' : 'Back'}
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setExportScope('all')}
                className={`px-4 py-2 rounded-lg border-2 ${exportScope === 'all' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
              >
                {locale === 'ar' ? 'تصدير الكل' : 'Export All'}
              </button>
              <button
                onClick={() => setExportScope('selected')}
                className={`px-4 py-2 rounded-lg border-2 ${exportScope === 'selected' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
              >
                {locale === 'ar'
                  ? `تصدير المحدد (${selectedIds.length})`
                  : `Export Selected (${selectedIds.length})`}
              </button>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setExportFormat('csv')}
              className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${exportFormat === 'csv' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
            >
              <FileText className="w-5 h-5" />
              CSV
            </button>
            <button
              onClick={() => setExportFormat('excel')}
              className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${exportFormat === 'excel' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Excel
            </button>
            <button
              onClick={() => setExportFormat('pdf')}
              className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${exportFormat === 'pdf' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              PDF
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleExport} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {locale === 'ar' ? 'جاري التصدير...' : 'Exporting...'}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 me-2" />
                  {locale === 'ar' ? 'تصدير' : 'Export'}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}