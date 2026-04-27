import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { rankApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { ImportExportModal } from '@/components/staff/ImportExportModal'
import { Search, Plus, Edit2, Trash2, MapPin, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Award, FileSpreadsheet } from 'lucide-react'

interface Rank {
  id: number
  name: string
  name_ar: string
  code: string
  medical_field_id: number | null
  specialty_id: number | null
  medical_field?: { id: number; name: string } | null
  specialty?: { id: number; name: string } | null
  is_active: boolean
}

const columnHelper = createColumnHelper<Rank>()

export function RankListPage() {
  const { locale } = useAppStore()
  const navigate = useNavigate()
  const { hasPermission, refreshPermissions } = useAuthStore()

  useEffect(() => {
    refreshPermissions()
  }, [])

  const canCreate = hasPermission('ranks.create')
  const canEdit = hasPermission('ranks.edit')
  const canDelete = hasPermission('ranks.delete')
  const canToggle = hasPermission('ranks.toggle')
  const canImportExport = hasPermission('ranks.import_export')
  const [data, setData] = useState<Rank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showImportExport, setShowImportExport] = useState(false)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 })
  const [totalCount, setTotalCount] = useState(0)
  const [gotoPage, setGotoPage] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      }
      if (search) params.search = search

      const res = await rankApi.getAll(params)
      setData(res.data.data || [])
      setTotalCount(res.data.meta?.total || res.data.total || 0)
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } }
      if (error.response?.status === 403) {
        navigate('/forbidden')
        return
      }
      console.error('Failed to load ranks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search, pagination.pageIndex, pagination.pageSize])

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
    const rank = data.find(n => n.id === id)
    const name = locale === 'ar' ? rank?.name_ar || rank?.name : rank?.name

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
      await rankApi.delete(id)
      fetchData()
      Swal.fire({
        title: 'Deleted',
        text: locale === 'ar' ? 'تم حذف الرتبة بنجاح' : 'Rank has been deleted',
        icon: 'success',
      })
    } catch {
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete',
        icon: 'error',
      })
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await rankApi.toggleStatus(id)
      fetchData()
      Swal.fire({
        title: currentStatus ? 'Deactivated' : 'Activated',
        text: currentStatus
          ? (locale === 'ar' ? 'تم إلغاء تفعيل الرتبة' : 'Rank has been deactivated')
          : (locale === 'ar' ? 'تم تفعيل الرتبة بنجاح' : 'Rank has been activated'),
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
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),
    columnHelper.accessor('name_ar', {
      header: locale === 'ar' ? 'الاسم بالعربي' : 'Arabic Name',
    }),
    columnHelper.accessor('code', {
      header: locale === 'ar' ? 'الرمز' : 'Code',
    }),
    columnHelper.accessor('medical_field.name', {
      header: locale === 'ar' ? 'الحقل الطبي' : 'Medical Field',
      cell: ({ row }) => row.original.medical_field?.name || '-',
    }),
    columnHelper.accessor('specialty.name', {
      header: locale === 'ar' ? 'التخصص' : 'Specialty',
      cell: ({ row }) => row.original.specialty?.name || '-',
    }),
    columnHelper.accessor('is_active', {
      header: locale === 'ar' ? 'الحالة' : 'Status',
      cell: ({ row }) => {
        const isActive = row.original.is_active
        if (!canToggle) {
          return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isActive
                ? locale === 'ar' ? 'نشط' : 'Active'
                : locale === 'ar' ? 'غير نشط' : 'Inactive'}
            </span>
          )
        }
        return (
          <button
            onClick={() => handleToggleStatus(row.original.id, row.original.is_active)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
              isActive
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            <Award className="w-3 h-3" />
            {isActive
              ? locale === 'ar' ? 'نشط' : 'Active'
              : locale === 'ar' ? 'غير نشط' : 'Inactive'}
          </button>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: locale === 'ar' ? 'الإجراءات' : 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <button
              onClick={() => navigate(`/ranks/${row.original.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title={locale === 'ar' ? 'تعديل' : 'Edit'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.original.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title={locale === 'ar' ? 'حذف' : 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
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

  const handleGotoPage = () => {
    const page = Number(gotoPage)
    if (page >= 1 && page <= totalPages) {
      setPagination(p => ({ ...p, pageIndex: page - 1 }))
      setGotoPage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGotoPage()
    }
  }

  return (
    <Layout>
      <div className={`space-y-4 ${locale === 'ar' ? 'font-ar' : 'font-en'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {locale === 'ar' ? 'إدارة الرتب' : 'Rank Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalCount} {locale === 'ar' ? 'رتبة' : 'ranks'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canImportExport && (
              <Button variant="outline" size="sm" onClick={() => setShowImportExport(true)}>
                <FileSpreadsheet className="w-4 h-4 me-2" />
                {locale === 'ar' ? 'استيراد / تصدير' : 'Import / Export'}
              </Button>
            )}
            {canCreate && (
            <Link to="/ranks/new">
              <Button size="sm">
                <Plus className="w-4 h-4 me-2" />
                {locale === 'ar' ? 'إضافة رتبة' : 'Add Rank'}
              </Button>
            </Link>
          )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="p-4 border-b border-gray-200">
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
          </div>

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
                      <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">
                        {locale === 'ar' ? 'لا توجد رتب' : 'No ranks found'}
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
                  onClick={() => setPagination(p => ({ ...p, pageIndex: 0 }))}
                  disabled={pagination.pageIndex === 0}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronFirst className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                  disabled={pagination.pageIndex === 0}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                  disabled={pagination.pageIndex >= totalPages - 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, pageIndex: totalPages - 1 }))}
                  disabled={pagination.pageIndex >= totalPages - 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronLast className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 ms-2 border-s border-gray-300 ps-2">
                  <input
                    type="number"
                    value={gotoPage}
                    onChange={(e) => setGotoPage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="#"
                    min={1}
                    max={totalPages}
                    className="w-12 px-2 py-1 text-sm border border-gray-200 rounded text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                  <button
                    onClick={handleGotoPage}
                    disabled={!gotoPage || Number(gotoPage) < 1 || Number(gotoPage) > totalPages}
                    className="px-2 py-1 text-sm bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Go
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
          onComplete={fetchData}
          selectedIds={selectedRows}
          type="rank"
          api={rankApi}
        />
      </Layout>
    )
}