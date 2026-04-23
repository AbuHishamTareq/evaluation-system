/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useAppStore } from '@/stores/appStore'
import { getTranslation } from '@/i18n'
import { Layout } from '@/components/Layout'
import { staffApi } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useStaffFilters } from '@/stores/filtersStore'
import {
  Search, Plus, ChevronLeft, ChevronRight,
  Edit2, Trash2, Eye, UserCheck, UserX, Filter, FileSpreadsheet
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StaffFilters } from '@/components/staff/StaffFilters'
import { ImportExportModal } from '@/components/staff/ImportExportModal'

interface StaffMember {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  first_name_ar: string
  last_name_ar: string
  phone: string
  email?: string
  gender?: string
  employment_status: string
  department_id?: number
  department?: { id: number; name: string; name_ar: string }
  user?: { id: number; email: string; roles: { id: number; name: string }[] }
}

const columnHelper = createColumnHelper<StaffMember>()

export function StaffListPage() {
  const { locale, direction } = useAppStore()
  const fontClass = locale === 'ar' ? 'font-ar' : 'font-en'

  const [data, setData] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 })
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [departments] = useState<{ id: number; name: string }[]>([])
  const [showImportExport, setShowImportExport] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const { status, department_id, license_expiry } = useStaffFilters()
  const debouncedSearch = useDebounce(search, 500)

  const fetchStaff = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, unknown> = {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      }
      if (debouncedSearch) params.search = debouncedSearch
      if (status) params.status = status
      if (department_id) params.department_id = department_id
      
      const res = await staffApi.getAll(params)
      const items = (res.data.data || []).filter((s: { id?: number }) => s.id)
      setData(items)
      setTotalCount(res.data.meta?.total || res.data.total || 0)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to load staff')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, pagination.pageIndex, pagination.pageSize, status, department_id, license_expiry])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const toggleSelect = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rid => rid !== id) 
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedRows(prev => 
      prev.length === data.length 
        ? [] 
        : data.map(s => s.id)
    )
  }

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await staffApi.toggleStatus(id)
      fetchStaff()
      Swal.fire({
        title: currentStatus === 'active' ? 'Terminated' : 'Activated',
        text: currentStatus === 'active'
          ? (locale === 'ar' ? 'تم إنهاء خدمة الموظف' : 'Staff has been terminated')
          : (locale === 'ar' ? 'تم تفعيل الموظف بنجاح' : 'Staff has been activated'),
        icon: 'success',
      })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } } }
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to update status'
      const isAdminError = errorMsg.toLowerCase().includes('admin') || errorMsg.toLowerCase().includes('cannot change')
      Swal.fire({
        title: isAdminError ? (locale === 'ar' ? 'لا يمكن' : 'Cannot') : 'Error',
        text: isAdminError
          ? (locale === 'ar' ? 'لا يمكن إنهاء خدمة المدير' : 'Admin cannot be terminated')
          : errorMsg,
        icon: 'error',
      })
    }
  }

  const handleDelete = async (id: number) => {
    const staffMember = data.find(s => s.id === id)
    const name = locale === 'ar' 
      ? `${staffMember?.first_name_ar} ${staffMember?.last_name_ar}`
      : `${staffMember?.first_name} ${staffMember?.last_name}`
    
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
      await staffApi.delete(id)
      fetchStaff()
      Swal.fire(
        locale === 'ar' ? 'تم الحذف' : 'Deleted',
        locale === 'ar' ? 'تم حذف الموظف بنجاح' : 'Staff member has been deleted',
        'success'
      )
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to delete staff')
      Swal.fire(
        locale === 'ar' ? 'خطأ' : 'Error',
        error.response?.data?.message || 'Failed to delete staff',
        'error'
      )
    }
  }

  const columns = [
    {
      id: 'select',
      header: () => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedRows.length === data.length && data.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }: { row: { original?: StaffMember } }) => {
        if (!row.original?.id) return null
        return (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={selectedRows.includes(row.original!.id)}
              onChange={() => toggleSelect(row.original!.id)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>
        )
      },
    },
    columnHelper.accessor(
      (row) => ({
        en: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        ar: `${row.first_name_ar || ''} ${row.last_name_ar || ''}`.trim(),
      }),
      {
        id: 'name',
        header: locale === 'ar' ? 'الاسم' : 'Name',
        cell: ({ getValue }) => {
          const name = getValue() || { en: '-', ar: '-' }
          return (
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{locale === 'ar' ? name.ar : name.en}</span>
              {locale === 'ar' ? (
                <span className="text-xs text-gray-500">{name.en}</span>
              ) : (
                <span className="text-xs text-gray-500">{name.ar}</span>
              )}
            </div>
          )
        },
      }
    ),
    columnHelper.accessor('employee_id', {
      header: locale === 'ar' ? 'رقم الموظف' : 'Employee ID',
      cell: ({ getValue }) => <span className="font-mono text-sm">{getValue() || '-'}</span>,
    }),
    columnHelper.accessor(
      (row) => row.email || row.user?.email || '-',
      {
        id: 'email',
        header: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
        cell: ({ getValue }) => <span className="text-sm">{getValue() || '-'}</span>,
      }
    ),
    columnHelper.accessor('phone', {
      header: locale === 'ar' ? 'الهاتف' : 'Phone',
      cell: ({ getValue }) => <span className="text-sm">{getValue() || '-'}</span>,
    }),
    columnHelper.accessor(
      (row) => row.department?.name || '-',
      {
        id: 'department',
        header: locale === 'ar' ? 'القسم' : 'Department',
        cell: ({ getValue }) => <span className="text-sm">{getValue() || '-'}</span>,
      }
    ),
    columnHelper.accessor('employment_status', {
      header: locale === 'ar' ? 'الحالة' : 'Status',
      cell: ({ row }) => {
        if (!row.original?.id) return null
        const empStatus = row.original!.employment_status
        const isActive = empStatus === 'active'
        return (
          <button
            onClick={() => handleToggleStatus(row.original!.id, empStatus)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
              isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            {isActive ? (
              <UserCheck className="w-3 h-3" />
            ) : (
              <UserX className="w-3 h-3" />
            )}
            {locale === 'ar' ? (isActive ? 'نشط' : 'منتهي') : (isActive ? 'Active' : 'Terminated')}
          </button>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: locale === 'ar' ? 'الإجراءات' : 'Actions',
      cell: ({ row }) => {
        if (!row.original?.id) return null
        return (
          <div className="flex items-center gap-2">
            <Link
              to={`/staff/${row.original!.id}`}
              className="p-2 text-amber-600 hover:bg-amber-50 rounded"
              title={locale === 'ar' ? 'عرض' : 'View'}
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/staff/${row.original!.id}/edit`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title={locale === 'ar' ? 'تعديل' : 'Edit'}
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title={locale === 'ar' ? 'حذف' : 'Delete'}
              onClick={() => handleDelete(row.original!.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
  })

  const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1

  return (
    <Layout>
      <div className={`space-y-4 ${fontClass}`} dir={direction}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getTranslation(locale, 'staff.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalCount} {locale === 'ar' ? 'موظف' : 'staff members'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImportExport(true)}>
              <FileSpreadsheet className="w-4 h-4 me-2" />
              {locale === 'ar' ? 'استيراد / تصدير' : 'Import / Export'}
            </Button>
            <Link to="/staff/new">
              <Button size="sm">
                <Plus className="w-4 h-4 me-2" />
                {locale === 'ar' ? 'إضافة موظف' : 'Add Staff'}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={locale === 'ar' ? 'بحث...' : 'Search staff...'}
                      className="w-full ps-10 pe-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
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
                  <StaffFilters 
                    departments={departments} 
                    onClose={() => setShowFilters(false)} 
                  />
                </div>
              )}

              {error && (
                <div className="p-4 text-red-600 bg-red-50">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  {getTranslation(locale, 'common.loading')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                      {table.getRowModel().rows.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                            {locale === 'ar' ? 'لا توجد بيانات' : 'No data available'}
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

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
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
                      }
                      disabled={pagination.pageIndex >= totalPages - 1}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>

        <ImportExportModal
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
          onComplete={fetchStaff}
          selectedIds={selectedRows}
        />
      </div>
    </Layout>
  )
}