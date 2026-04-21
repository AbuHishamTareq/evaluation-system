/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useAppStore } from '@/stores/appStore'
import { userApi, roleApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Search, ChevronLeft, ChevronRight, User, Shield } from 'lucide-react'

interface UserData {
  id: number
  name: string
  email: string
  is_active: boolean
  roles: { id: number; name: string }[]
  created_at: string
}

interface Role {
  id: number
  name: string
}

const columnHelper = createColumnHelper<UserData>()

export function UserListPage() {
  const { locale, direction } = useAppStore()
  const fontClass = locale === 'ar' ? 'font-ar' : 'font-en'

  const [data, setData] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [totalPages, setTotalPages] = useState(0)

  const [showRolesModal, setShowRolesModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [savingRoles, setSavingRoles] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = {
        page: pageIndex + 1,
        per_page: pageSize,
      }
      if (search) params.search = search

      const res = await userApi.getAll(params)
      setData(res.data.data || [])
      setTotalPages(res.data.meta?.last_page || 1)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search, pageIndex, pageSize])

  const openRolesModal = async (user: UserData) => {
    setSelectedUser(user)
    setSelectedRoles(user.roles?.map(r => r.id) || [])
    setShowRolesModal(true)

    try {
      const res = await roleApi.getAll({ per_page: 100 })
      setAvailableRoles(res.data.data || [])
    } catch (err) {
      console.error('Failed to load roles:', err)
    }
  }

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const saveRoles = async () => {
    if (!selectedUser) return

    setSavingRoles(true)
    try {
      await userApi.syncRoles(selectedUser.id, selectedRoles)
      setShowRolesModal(false)
      fetchData()
      Swal.fire({
        icon: 'success',
        title: locale === 'ar' ? 'تم' : 'Done',
        text: locale === 'ar' ? 'تم تحديث الأدوار' : 'Roles updated successfully',
      })
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: locale === 'ar' ? 'خطأ' : 'Error',
        text: locale === 'ar' ? 'فشل تحديث الأدوار' : 'Failed to update roles',
      })
    } finally {
      setSavingRoles(false)
    }
  }

  const columns = [
    columnHelper.accessor('name', {
      header: locale === 'ar' ? 'الاسم' : 'Name',
      cell: info => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="font-medium">{info.getValue()}</p>
            <p className="text-sm text-gray-500">{info.row.original.email}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('roles', {
      header: locale === 'ar' ? 'الأدوار' : 'Roles',
      cell: info => (
        <div className="flex flex-wrap gap-1">
          {info.getValue()?.slice(0, 2).map(role => (
            <span
              key={role.id}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
            >
              {role.name}
            </span>
          ))}
          {(info.getValue()?.length || 0) > 2 && (
            <span className="text-xs text-gray-500">
              +{(info.getValue()?.length || 0) - 2}
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: locale === 'ar' ? 'تخصيص الأدوار' : 'Assign Roles',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => openRolesModal(row.original)}>
          <Shield className="w-4 h-4 me-2" />
          {locale === 'ar' ? 'تخصيص' : 'Assign'}
        </Button>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <Layout>
      <div className={`space-y-4 ${fontClass}`} dir={direction}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {locale === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500"
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
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    {locale === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}
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

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {locale === 'ar' ? 'إظهار' : 'Show'} {pageSize} {locale === 'ar' ? 'سجل' : 'records'}
              </span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                  setPageIndex(0)
                }}
                className="border border-gray-200 rounded px-2 py-1 text-sm"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {locale === 'ar' ? 'صفحة' : 'Page'} {pageIndex + 1} {locale === 'ar' ? 'من' : 'of'} {totalPages}
              </span>
              <button
                onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
                disabled={pageIndex === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={pageIndex >= totalPages - 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showRolesModal}
          onClose={() => setShowRolesModal(false)}
          title={locale === 'ar' ? 'تخصيص الأدوار للمستخدم' : 'Assign Roles to User'}
          size="lg"
        >
          <div className="p-6">
            <div className="text-sm text-gray-500 mb-4">
              {selectedUser?.name} ({selectedUser?.email})
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableRoles.map(role => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleToggleRole(role.id)}
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                  />
                  <span className="font-medium">{role.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowRolesModal(false)}>
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={saveRoles} disabled={savingRoles}>
                {savingRoles
                  ? locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                  : locale === 'ar'
                  ? 'حفظ'
                  : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}