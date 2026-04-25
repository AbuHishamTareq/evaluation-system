import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useAppStore } from '@/stores/appStore'
import { phcCenterApi, zoneApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { ImportExportModal } from '@/components/staff/ImportExportModal'
import { Search, Trash2, Filter, ChevronLeft, ChevronRight, FileSpreadsheet, Building2, UserPlus, X, Plus as PlusIcon } from 'lucide-react'

interface PhcCenter {
  id: number
  name: string
  name_ar: string
  code: string
  address: string
  phone: string
  is_active: boolean
  region_id: number
  region?: { id: number; name: string }
}

interface TeamBasedCode {
  id: number
  code: string
  role: string
  is_active: boolean
}

const columnHelper = createColumnHelper<PhcCenter>()

function AssignCodesModal({
  isOpen,
  onClose,
  phcCenterId,
}: {
  isOpen: boolean
  onClose: () => void
  phcCenterId: number
}) {
  const { locale } = useAppStore()
  const [phcCenter, setPhcCenter] = useState<PhcCenter | null>(null)
  const [assignedCodes, setAssignedCodes] = useState<TeamBasedCode[]>([])
  const [availableCodes, setAvailableCodes] = useState<TeamBasedCode[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedForRemoval, setSelectedForRemoval] = useState<number[]>([])

  useEffect(() => {
    if (isOpen && phcCenterId) {
      loadData()
    }
  }, [isOpen, phcCenterId, search])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const centerRes = await phcCenterApi.getById(phcCenterId)
      setPhcCenter(centerRes.data.data)

      const assignedRes = await phcCenterApi.getAssignedTeamBasedCodes(phcCenterId)
      setAssignedCodes(assignedRes.data.data || [])

      const availableRes = await phcCenterApi.getAvailableTeamBasedCodes(phcCenterId, { search })
      setAvailableCodes(availableRes.data.data || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignCode = async (codeId: number) => {
    const codeToMove = availableCodes.find(c => c.id === codeId)
    if (!codeToMove) return

    setAvailableCodes(prev => prev.filter(c => c.id !== codeId))
    setAssignedCodes(prev => [...prev, codeToMove])

    try {
      await phcCenterApi.assignTeamBasedCode(phcCenterId, codeId)
    } catch (err) {
      setAssignedCodes(prev => prev.filter(c => c.id !== codeId))
      setAvailableCodes(prev => [...prev, codeToMove])
      console.error('Failed to assign code:', err)
      Swal.fire({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        text: locale === 'ar' ? 'فشل تعيين الرمز' : 'Failed to assign code',
        icon: 'error',
      })
    }
  }

  const handleRemoveCode = async (codeId: number) => {
    const codeToMove = assignedCodes.find(c => c.id === codeId)
    if (!codeToMove) return

    setAssignedCodes(prev => prev.filter(c => c.id !== codeId))
    setAvailableCodes(prev => [...prev, codeToMove])
    setSelectedForRemoval(prev => prev.filter(id => id !== codeId))

    try {
      await phcCenterApi.removeTeamBasedCode(phcCenterId, codeId)
    } catch (err) {
      setAvailableCodes(prev => prev.filter(c => c.id !== codeId))
      setAssignedCodes(prev => [...prev, codeToMove])
      console.error('Failed to remove code:', err)
      Swal.fire({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        text: locale === 'ar' ? 'فشل إزالة الرمز' : 'Failed to remove code',
        icon: 'error',
      })
    }
  }

  const handleRemoveAll = async () => {
    if (assignedCodes.length === 0) return

    const codesToMove = [...assignedCodes]
    setAssignedCodes([])
    setAvailableCodes(prev => [...prev, ...codesToMove])
    setSelectedForRemoval([])

    try {
      const ids = codesToMove.map(c => c.id)
      await phcCenterApi.removeTeamBasedCodes(phcCenterId, ids)
    } catch (err) {
      setAssignedCodes(prev => [...prev, ...codesToMove])
      setAvailableCodes(prev => prev.filter(c => !codesToMove.some(m => m.id === c.id)))
      console.error('Failed to remove codes:', err)
      Swal.fire({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        text: locale === 'ar' ? 'فشل إزالة الرموز' : 'Failed to remove codes',
        icon: 'error',
      })
    }
  }

  const handleRemoveSelected = async () => {
    if (selectedForRemoval.length === 0) return

    const codesToMove = assignedCodes.filter(c => selectedForRemoval.includes(c.id))
    setAssignedCodes(prev => prev.filter(c => !selectedForRemoval.includes(c.id)))
    setAvailableCodes(prev => [...prev, ...codesToMove])
    setSelectedForRemoval([])

    try {
      await phcCenterApi.removeTeamBasedCodes(phcCenterId, selectedForRemoval)
    } catch (err) {
      setAvailableCodes(prev => prev.filter(c => !codesToMove.some(m => m.id === c.id)))
      setAssignedCodes(prev => [...prev, ...codesToMove])
      console.error('Failed to remove codes:', err)
      Swal.fire({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        text: locale === 'ar' ? 'فشل إزالة الرموز المحددة' : 'Failed to remove selected codes',
        icon: 'error',
      })
    }
  }

  const handleToggleSelection = (codeId: number) => {
    setSelectedForRemoval(prev =>
      prev.includes(codeId)
        ? prev.filter(id => id !== codeId)
        : [...prev, codeId]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {locale === 'ar' ? 'تعيين الرموز' : 'Assign Team Based Codes'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Column - PHC Center Info & Assigned Codes */}
            <div className="space-y-4">
              {/* PHC Center Card */}
              {phcCenter && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{phcCenter.name}</h3>
                      <p className="text-sm text-gray-600">
                        {locale === 'ar' ? 'الرمز' : 'Code'}: {phcCenter.code}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Codes */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {locale === 'ar' ? 'الرموز الم.assigned Codes' : 'Assigned'}
                  </h3>
                  {selectedForRemoval.length > 0 ? (
                    <button
                      onClick={handleRemoveSelected}
                      className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded"
                    >
                      {locale === 'ar'
                        ? `إزالة (${selectedForRemoval.length})`
                        : `Remove (${selectedForRemoval.length})`}
                    </button>
                  ) : (
                    <button
                      onClick={handleRemoveAll}
                      disabled={assignedCodes.length === 0}
                      className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded disabled:opacity-50"
                    >
                      {locale === 'ar' ? 'إزالة الكل' : 'Remove All'}
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </p>
                  </div>
                ) : assignedCodes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {locale === 'ar' ? 'لا توجد رموز مخصصة' : 'No codes assigned'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignedCodes.map((code) => (
                      <div
                        key={code.id}
                        onClick={() => handleRemoveCode(code.id)}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer hover:bg-red-50 ${
                          selectedForRemoval.includes(code.id)
                            ? 'bg-red-50 border-red-300'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedForRemoval.includes(code.id)}
                            onChange={() => handleToggleSelection(code.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <div>
                            <p className="font-medium">{code.code}</p>
                            <p className="text-sm text-gray-500">{code.role}</p>
                          </div>
                        </div>
                        <div className="p-2 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Second Column - Search & Available Codes */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {locale === 'ar' ? 'الرموز المتاحة' : 'Available Codes'}
                </h3>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </p>
                  </div>
                ) : availableCodes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {locale === 'ar' ? 'لا توجد رموز متاحة' : 'No available codes'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableCodes.map((code) => (
                      <button
                        key={code.id}
                        onClick={() => handleAssignCode(code.id)}
                        className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 transition-colors group text-start"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded group-hover:bg-green-100">
                            <UserPlus className="w-4 h-4 text-blue-600 group-hover:text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{code.code}</p>
                            <p className="text-sm text-gray-500">{code.role}</p>
                          </div>
                        </div>
                        <div className="p-2 text-green-600 group-hover:text-green-700">
                          <PlusIcon className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {locale === 'ar' ? 'حفظ' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PhcCenterListPage() {
  const { locale } = useAppStore()
  const [data, setData] = useState<PhcCenter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [zoneFilter, setZoneFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showImportExport, setShowImportExport] = useState(false)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 })
  const [totalCount, setTotalCount] = useState(0)
  const [zones, setZones] = useState<{ id: number; name: string }[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignPhcCenterId, setAssignPhcCenterId] = useState<number | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      }
      if (search) params.search = search
      if (zoneFilter) params.region_id = zoneFilter

      const res = await phcCenterApi.getAll(params)
      setData(res.data.data || [])
      setTotalCount(res.data.meta?.total || res.data.total || 0)
    } catch (err) {
      console.error('Failed to load PHC centers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchZones = async () => {
    try {
      const res = await zoneApi.getAll()
      setZones(res.data.data || [])
    } catch (err) {
      console.error('Failed to load zones:', err)
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  useEffect(() => {
    fetchData()
  }, [search, zoneFilter, pagination.pageIndex, pagination.pageSize])

  const toggleSelect = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rid => rid !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(data.map(s => s.id))
    }
  }

  const handleDelete = async (id: number) => {
    const phc = data.find(p => p.id === id)
    const name = locale === 'ar' ? phc?.name_ar || phc?.name : phc?.name

    const result = await Swal.fire({
      title: locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      text: locale === 'ar'
        ? `هل أنت متأكد من حذف ${name}؟`
        : `Are you sure you want to delete ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: locale === 'ar' ? 'حذف' : 'Delete',
      cancelButtonText: locale === 'ar' ? 'إلغاء' : 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      await phcCenterApi.delete(id)
      fetchData()
      Swal.fire({
        title: 'Deleted',
        text: locale === 'ar' ? 'تم حذف المركز بنجاح' : 'PHC Center has been deleted',
        icon: 'success',
      })
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete',
        icon: 'error',
      })
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await phcCenterApi.toggleStatus(id)
      fetchData()
      Swal.fire({
        title: currentStatus ? 'Deactivated' : 'Activated',
        text: currentStatus
          ? (locale === 'ar' ? 'تم إلغاء تفعيل المركز' : 'PHC Center has been deactivated')
          : (locale === 'ar' ? 'تم تفعيل المركز بنجاح' : 'PHC Center has been activated'),
        icon: 'success',
      })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update status',
        icon: 'error',
      })
    }
  }

  const openAssignModal = (id: number) => {
    setAssignPhcCenterId(id)
    setShowAssignModal(true)
  }

  const columns = [
    columnHelper.display({
      id: 'select',
      header: () => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedRows.length === data.length && data.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-300"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedRows.includes(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
            className="w-4 h-4 rounded border-gray-300"
          />
        </div>
      ),
    }),
    columnHelper.accessor('name', {
      header: locale === 'ar' ? 'الاسم' : 'Name',
    }),
    columnHelper.accessor('name_ar', {
      header: locale === 'ar' ? 'الاسم بالعربي' : 'Arabic Name',
    }),
    columnHelper.accessor('code', {
      header: locale === 'ar' ? 'الرمز' : 'Code',
    }),
    columnHelper.accessor(
      (row) => row.region?.name || '-',
      {
        id: 'region',
        header: locale === 'ar' ? 'المنطقة' : 'Zone',
      }
    ),
    columnHelper.accessor('is_active', {
      header: locale === 'ar' ? 'الحالة' : 'Status',
      cell: ({ row }) => (
        <button
          onClick={() => handleToggleStatus(row.original.id, row.original.is_active)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
            row.original.is_active
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          <Building2 className="w-3 h-3" />
          {row.original.is_active
            ? locale === 'ar' ? 'نشط' : 'Active'
            : locale === 'ar' ? 'غير نشط' : 'Inactive'}
        </button>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: locale === 'ar' ? 'الإجراءات' : 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openAssignModal(row.original.id)}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
            title={locale === 'ar' ? 'تعيين الرموز' : 'Assign Codes'}
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title={locale === 'ar' ? 'حذف' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
  })

  const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1

  return (
    <Layout>
      <div className={`space-y-4 ${locale === 'ar' ? 'font-ar' : 'font-en'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {locale === 'ar' ? 'إدارة مراكز الصحة' : 'PHC Center Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalCount} {locale === 'ar' ? 'مركز' : 'PHC centers'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImportExport(true)}>
              <FileSpreadsheet className="w-4 h-4 me-2" />
              {locale === 'ar' ? 'استيراد / تصدير' : 'Import / Export'}
            </Button>
            <Link to="/phc-centers/new">
              <Button size="sm">
                <PlusIcon className="w-4 h-4 me-2" />
                {locale === 'ar' ? 'إضافة مركز' : 'Add PHC Center'}
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 me-2" />
                {locale === 'ar' ? 'تصفية' : 'Filter'}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'المنطقة' : 'Zone'}
                  </label>
                  <select
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  >
                    <option value="">{locale === 'ar' ? 'الكل' : 'All'}</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="text-start px-4 py-3 text-sm font-medium text-gray-500"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center">
                      <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">
                        {locale === 'ar' ? 'لا توجد مراكز' : 'No PHC centers found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <select
                value={pagination.pageSize}
                  onChange={(e) =>
                    setPagination((p) => ({
                      ...p,
                      pageSize: Number(e.target.value),
                      pageIndex: 0,
                    }))
                  }
                  className="border border-gray-200 rounded px-2 py-1 text-sm"
                >
                  {[15, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              <span className="text-sm text-gray-500">per page</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Page {pagination.pageIndex + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
                  }
                  disabled={pagination.pageIndex === 0}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                  }
                  disabled={pagination.pageIndex >= totalPages - 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <ImportExportModal
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
          onComplete={fetchData}
          selectedIds={selectedRows}
          type="phc-center"
          api={phcCenterApi}
        />

        <AssignCodesModal
          isOpen={showAssignModal}
          onClose={() => {
            fetchData()
            setShowAssignModal(false)
            setAssignPhcCenterId(null)
          }}
          phcCenterId={assignPhcCenterId || 0}
        />
      </div>
    </Layout>
  )
}