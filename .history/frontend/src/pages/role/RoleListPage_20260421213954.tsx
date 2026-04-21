import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useAppStore } from "@/stores/appStore";
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
  const navigate = useNavigate();

  const [data, setData] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pageIndex + 1,
        per_page: pageSize,
      };
      if (search) params.search = search;

      const res = await roleApi.getAll(params);
      setData(res.data.data || []);
      setTotalPages(res.data.meta?.last_page || 1);
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, pageIndex, pageSize]);

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
          {info
            .getValue()
            ?.slice(0, 3)
            .map((p) => (
              <span
                key={p.id}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {p.name}
              </span>
            ))}
          {(info.getValue()?.length || 0) > 3 && (
            <span className="text-xs text-gray-500">
              +{(info.getValue()?.length || 0) - 3}
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: locale === "ar" ? "الإجراءات" : "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/roles/${row.original.id}`)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
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
    pageCount: totalPages,
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDelete = async (id: number) => {
    const role = data.find((r) => r.id === id);
    if (!role) return;

    if (role.name === "Main Office") {
      Swal.fire({
        icon: "error",
        title: locale === "ar" ? "خطأ" : "Error",
        text:
          locale === "ar"
            ? "لا يمكن حذف الدور الرئيسي"
            : "Cannot delete Main Office role",
      });
      return;
    }

    const result = await Swal.fire({
      title: locale === "ar" ? "حذف الدور" : "Delete Role",
      text:
        locale === "ar"
          ? `هل أنت متأكد من حذف ${role.name}?`
          : `Are you sure you want to delete ${role.name}?`,
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
          text:
            locale === "ar"
              ? "تم حذف الدور بنجاح"
              : "Role deleted successfully",
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

  return (
    <Layout>
      <div className={`space-y-4 ${fontClass}`} dir={direction}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {locale === "ar" ? "الأدوار" : "Roles"}
            </h1>
          </div>
          <Link to="/roles/new">
            <Button>
              <Plus className="w-4 h-4 me-2" />
              {locale === "ar" ? "إضافة دور" : "Add Role"}
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={locale === "ar" ? "بحث..." : "Search..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {locale === "ar" ? "جاري التحميل..." : "Loading..."}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {locale === "ar" ? "لا توجد أدوار" : "No roles found"}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
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
                {locale === "ar" ? "إظهار" : "Show"}{" "}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageIndex(0);
                  }}
                  className="border border-gray-200 rounded px-2 py-1 text-sm"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>{" "}
                {locale === "ar" ? "سجل" : "records"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={pageIndex === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm text-gray-500">
                  {locale === "ar" ? "صفحة" : "Page"} {pageIndex + 1}{" "}
                  {locale === "ar" ? "من" : "of"} {totalPages}
                </span>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={pageIndex >= totalPages - 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
