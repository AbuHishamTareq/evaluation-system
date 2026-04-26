/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useAppStore } from "@/stores/appStore";
import { getTranslation } from "@/i18n";
import { userApi, roleApi } from "@/lib/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Search, Plus, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, User, Shield, Trash2 } from "lucide-react";

interface UserData {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: { id: number; name: string }[];
  created_at: string;
}

interface Role {
  id: number;
  name: string;
}

const columnHelper = createColumnHelper<UserData>();

export function UserListPage() {
  const { locale, direction } = useAppStore();
  const fontClass = locale === "ar" ? "font-ar" : "font-en";

  const [data, setData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [totalCount, setTotalCount] = useState(0);
  const [gotoPage, setGotoPage] = useState("");

  const [showRolesModal, setShowRolesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role_id: null as number | null });
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search, pagination.pageIndex, pagination.pageSize]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      };
      if (search) params.search = search;

      const res = await userApi.getAll(params);
      setData(res.data.data || []);
      setTotalCount(res.data.meta?.total || res.data.total || 0);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Swal.fire({
        icon: "error",
        title: locale === "ar" ? "خطأ" : "Error",
        text: locale === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields",
      });
      return;
    }
    setSavingUser(true);
    try {
      const payload = { name: newUser.name, email: newUser.email, password: newUser.password, ...(newUser.role_id && { role_id: newUser.role_id }) };
      await userApi.create(payload);
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role_id: null });
      fetchData();
      Swal.fire({
        icon: "success",
        title: locale === "ar" ? "تم" : "Done",
        text: locale === "ar" ? "تم إضافة ال��ستخدم بنجاح" : "User added successfully",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: locale === "ar" ? "خطأ" : "Error",
        text: locale === "ar" ? "فشل إضافة المستخدم" : "Failed to add user",
      });
    } finally {
      setSavingUser(false);
    }
  };

  const openRolesModal = async (user: UserData) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles?.map((r) => r.id) || []);
    setShowRolesModal(true);

    try {
      const res = await roleApi.getAll({ per_page: 100 });
      setAvailableRoles(res.data.data || []);
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const saveRoles = async () => {
    if (!selectedUser) return;
    setSavingRoles(true);
    try {
      await userApi.syncRoles(selectedUser.id, selectedRoles);
      setShowRolesModal(false);
      fetchData();
      Swal.fire({
        icon: "success",
        title: locale === "ar" ? "تم" : "Done",
        text: locale === "ar" ? "تم تحديث الأدوار" : "Roles updated successfully",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: locale === "ar" ? "خطأ" : "Error",
        text: locale === "ar" ? "فشل تحديث الأدوار" : "Failed to update roles",
      });
    } finally {
      setSavingRoles(false);
    }
  };

  const handleDelete = async (id: number) => {
    const user = data.find((u) => u.id === id);
    if (!user) return;

    const result = await Swal.fire({
      title: locale === "ar" ? "حذف المستخدم" : "Delete User",
      text: locale === "ar" ? `هل أنت متأكد من حذف ${user.name}?` : `Are you sure you want to delete ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: locale === "ar" ? "حذف" : "Delete",
      cancelButtonText: locale === "ar" ? "إلغاء" : "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await userApi.destroy(id);
      fetchData();
      Swal.fire({
        icon: "success",
        title: locale === "ar" ? "تم" : "Done",
        text: locale === "ar" ? "تم حذف المستخدم" : "User deleted successfully",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: locale === "ar" ? "خطأ" : "Error",
        text: locale === "ar" ? "فشل حذف المستخدم" : "Failed to delete user",
      });
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      header: locale === "ar" ? "الاسم" : "Name",
      cell: (info) => (
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
    columnHelper.accessor("roles", {
      header: locale === "ar" ? "الأدوار" : "Roles",
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue()?.slice(0, 2).map((role) => (
            <span key={role.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {role.name}
            </span>
          ))}
          {(info.getValue()?.length || 0) > 2 && (
            <span className="text-xs text-gray-500">+{(info.getValue()?.length || 0) - 2}</span>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: locale === "ar" ? "الإجراءات" : "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openRolesModal(row.original)} title={locale === "ar" ? "تخصيص الأدوار" : "Assign Roles"}>
            <Shield className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)} title={locale === "ar" ? "حذف" : "Delete"} className="text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize) || 1,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1;

  const handleGotoPage = () => {
    const page = Number(gotoPage);
    if (page >= 1 && page <= totalPages) {
      setPagination((p) => ({ ...p, pageIndex: page - 1 }));
      setGotoPage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGotoPage();
    }
  };

  return (
    <Layout>
      <div className={`space-y-4 ${fontClass}`} dir={direction}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getTranslation(locale, "nav.users")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalCount} {locale === "ar" ? "مستخدم" : "users"}
            </p>
          </div>
          <Button onClick={() => {
            if (availableRoles.length === 0) {
              roleApi.getAll({ per_page: 100 }).then((res) => setAvailableRoles(res.data.data || []));
            }
            setShowAddModal(true);
          }} size="sm">
            <Plus className="w-4 h-4 me-2" />
            {locale === "ar" ? "إضافة مستخدم" : "Add User"}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={locale === "ar" ? "بحث..." : "Search users..."}
                  className="w-full ps-10 pe-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      {locale === "ar" ? "جاري التحميل..." : "Loading..."}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      {locale === "ar" ? "لا يوجد مستخدمين" : "No users found"}
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

          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => setPagination((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))}
                className="border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-500">per page</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Page {pagination.pageIndex + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
                  disabled={pagination.pageIndex === 0}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.min(totalPages - 1, p.pageIndex + 1) }))}
                  disabled={pagination.pageIndex >= totalPages - 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <Modal isOpen={showRolesModal} onClose={() => setShowRolesModal(false)} title={locale === "ar" ? "تخصيص الأدوار للمستخدم" : "Assign Roles to User"} size="lg">
          <div className="p-6">
            <div className="text-sm text-gray-500 mb-4">
              {locale === "ar" ? "تخصيص أدوار لـ:" : "Assign roles to:"} <span className="font-medium text-gray-900">{selectedUser?.name}</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableRoles.map((role) => (
                <label key={role.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleToggleRole(role.id)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium">{role.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRolesModal(false)}>
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={saveRoles} isLoading={savingRoles}>
                {locale === "ar" ? "حفظ" : "Save"}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={locale === "ar" ? "إضافة مستخدم" : "Add User"} size="lg">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === "ar" ? "الاسم" : "Name"} *
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === "ar" ? "البريد الإلكتروني" : "Email"} *
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === "ar" ? "كلمة المرور" : "Password"} *
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === "ar" ? "الدور" : "Role"}
              </label>
              <select
                value={newUser.role_id || ""}
                onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="">{locale === "ar" ? "اختر دور" : "Select role"}</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleAddUser} isLoading={savingUser}>
                {locale === "ar" ? "إضافة" : "Add"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}