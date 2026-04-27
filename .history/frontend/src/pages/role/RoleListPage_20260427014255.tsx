/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useAppStore } from "@/stores/appStore";
import { getTranslation } from "@/i18n";
import { roleApi } from "@/lib/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
} from "lucide-react";

interface Role {
  id: number;
  name: string;
  name_ar?: string;
  description?: string;
  permissions: { id: number; name: string }[];
  guard_name: string;
  created_at: string;
}

const columnHelper = createColumnHelper<Role>();

export function RoleListPage() {
  const { locale, direction } = useAppStore();
  const fontClass = locale === "ar" ? "font-ar" : "font-en";

  const [data, setData] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [totalCount, setTotalCount] = useState(0);
  const [gotoPage, setGotoPage] = useState("");

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

      const res = await roleApi.getAll(params);
      setData(res.data.data || []);
      setTotalCount(res.data.meta?.total || res.data.total || 0);
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    const role = data.find((r) => r.id === id);
    if (!role) return;

    if (role.name === "Main Office") {
      Swal.fire({
        icon: "error",
        title: locale === "ar" ? "خطأ" : "Error",
        text: locale === "ar" ? "لا يمكن حذف الدور الرئيسي" : "Cannot delete Main Office role",
      });
      return;
    }

    const result = await Swal.fire({
      title: locale === "ar" ? "حذف الدور" : "Delete Role",
      text: locale === "ar" ? `هل أنت متأكد من حذف ${role.name}?` : `Are you sure you want to delete ${role.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: locale === "ar" ? "حذف" : "Delete",
      cancelButtonText: locale === "ar" ? "إلغاء" : "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (result.isConfirmed) {
      try {
        await roleApi.delete(id);
        Swal.fire({
          icon: "success",
          title: locale === "ar" ? "تم" : "Done",
          text: locale === "ar" ? "تم حذف الدور بنجاح" : "Role deleted successfully",
        });
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: locale === "ar" ? "خطأ" : "Error",
          text: locale === "ar" ? "فشل حذف الدور" : "Failed to delete role",
        });
      }
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      header: locale === "ar" ? "الاسم" : "Name",
      cell: (info) => (
        <div>
          <p className="font-medium">{info.getValue()}</p>
          {info.row.original.name_ar && (
            <p className="text-sm text-gray-500">{info.row.original.name_ar}</p>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("description", {
      header: locale === "ar" ? "الوصف" : "Description",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("permissions", {
      header: locale === "ar" ? "الصلاحيات" : "Permissions",
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue()?.slice(0, 3).map((p) => (
            <span key={p.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {p.name}
            </span>
          ))}
          {(info.getValue()?.length || 0) > 3 && (
            <span className="text-xs text-gray-500">+{(info.getValue()?.length || 0) - 3}</span>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: locale === "ar" ? "الإجراءات" : "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/roles/${row.original.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title={locale === "ar" ? "تعديل" : "Edit"}
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title={locale === "ar" ? "حذف" : "Delete"}
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
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
              {getTranslation(locale, "nav.roles")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalCount} {locale === "ar" ? "دور" : "roles"}
            </p>
          </div>
          <Link to="/roles/new">
            <Button size="sm">
              <Plus className="w-4 h-4 me-2" />
              {locale === "ar" ? "إضافة دور" : "Add Role"}
            </Button>
          </Link>
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
                  placeholder={locale === "ar" ? "بحث..." : "Search roles..."}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      {locale === "ar" ? "جاري التحميل..." : "Loading..."}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      {locale === "ar" ? "لا توجد أدوار" : "No roles found"}
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
                onChange={(e) =>
                  setPagination((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))
                }
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
      </div>
    </Layout>
  );
}