/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Search, X, Plus, Trash2, Users } from 'lucide-react'
import { phcCenterApi, teamBasedCodeApi } from '@/lib/api'
import { useAppStore } from '@/stores/appStore'
import Swal from 'sweetalert2'

interface TeamCode {
  id: number
  code: string
  is_active: boolean
  roles?: { id: number; name: string }[]
}

interface AssignTeamsModalProps {
  isOpen: boolean
  onClose: () => void
  phcId: number
  phcName: string
  phcCode?: string
}

export function AssignTeamsModal({ isOpen, onClose, phcId, phcName, phcCode }: AssignTeamsModalProps) {
  const { locale } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [allTeams, setAllTeams] = useState<TeamCode[]>([])
  const [assignedIds, setAssignedIds] = useState<number[]>([])

  useEffect(() => {
    if (isOpen && phcId) {
      loadTeams()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setAllTeams([])
      setAssignedIds([])
      setSearch('')
    }
  }, [isOpen])

  const loadTeams = async () => {
    setIsLoading(true)
    try {
      const assignedRes = await phcCenterApi.getAssignedTeams(phcId)
      const assigned = Array.isArray(assignedRes.data) ? assignedRes.data : (assignedRes.data?.data || [])
      setAssignedIds(assigned)
      
      const unassignedRes = await teamBasedCodeApi.getUnassigned()
      const unassigned = Array.isArray(unassignedRes.data) ? unassignedRes.data : (unassignedRes.data?.data || [])
      
      const allRes = await teamBasedCodeApi.getAllCodes()
      const allTeamsData = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data || [])
      
      const ownAssignedTeams = allTeamsData.filter((t: TeamCode) => assigned.includes(t.id))
      
      setAllTeams([...ownAssignedTeams, ...unassigned])
    } catch (err) {
      console.error('Load teams error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const removeTeam = (teamId: number) => {
    setAssignedIds(prev => prev.filter(id => id !== teamId))
  }

  const removeAll = () => {
    setAssignedIds([])
  }

  const addTeam = (teamId: number) => {
    if (!assignedIds.includes(teamId)) {
      setAssignedIds(prev => [...prev, teamId])
    }
  }

  const handleSave = async () => {
    try {
      await phcCenterApi.assignTeams(phcId, assignedIds)
      Swal.fire({
        title: locale === 'ar' ? 'تم الحفظ' : 'Saved',
        text: locale === 'ar' ? 'تم تعيين الفرق بنجاح' : 'Teams assigned successfully',
        icon: 'success',
      })
      onClose()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to assign teams',
        icon: 'error',
      })
    }
  }

  const filterAssigned = allTeams.filter(t => assignedIds.includes(t.id))
  const filterAvailable = allTeams.filter(t => !assignedIds.includes(t.id) && (search === '' || (t.code || '').toLowerCase().includes(search.toLowerCase())))

  const title = locale === 'ar'
    ? `تعيين الفرق لمركز ${phcName}`
    : `Assign Teams to ${phcName}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {assignedIds.length} {locale === 'ar' ? 'فريق معين' : 'team(s) assigned'}
          </span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave}>
              {locale === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-4">
        {/* Left Column - PHC Info & Assigned Teams */}
        <div className="space-y-4">
          {/* PHC Card */}
          <div className="rounded-xl p-4 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{phcName}</h3>
                <p className="text-gray-500 text-sm font-mono">{phcCode}</p>
              </div>
            </div>
          </div>

          {/* Assigned Teams Header */}
          <div className="flex items-center justify-between px-2">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {locale === 'ar' ? 'الفرق المعينة' : 'Assigned Teams'}
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {assignedIds.length}
              </span>
            </h4>
            {assignedIds.length > 0 && (
              <button
                onClick={removeAll}
                className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {locale === 'ar' ? 'حذف الكل' : 'Remove All'}
              </button>
            )}
          </div>

          {/* Assigned Teams List */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filterAssigned.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  {locale === 'ar' ? 'لا توجد فرق معينة' : 'No teams assigned'}
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  {locale === 'ar' ? 'أضف فرق من العمود الأيمن' : 'Add teams from the right panel'}
                </p>
              </div>
            ) : (
              filterAssigned.map(team => (
                <div
                  key={team.id}
                  className="group flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-xl hover:from-red-100 hover:to-red-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-900">{team.code}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 font-medium">
                        {team.roles?.[0]?.name || '-'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-200 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Search & Available Teams */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={locale === 'ar' ? 'بحث عن كود الفريق...' : 'Search team code...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-12 pe-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Available Teams Header */}
          <div className="mt-6 flex items-center justify-between px-2">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {locale === 'ar' ? 'الفرق المتاحة' : 'Available Teams'}
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                {filterAvailable.length}
              </span>
            </h4>
          </div>

          {/* Available Teams List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
              </div>
            ) : filterAvailable.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
                <p className="text-gray-400 text-sm">
                  {allTeams.length === 0 
                    ? (locale === 'ar' ? 'لا توجد فرق في النظام' : 'No teams in system')
                    : (locale === 'ar' ? 'لا توجد فرق متاحة' : 'No available teams')}
                </p>
              </div>
            ) : (
              filterAvailable.map(team => (
                <div
                  key={team.id}
                  onClick={() => addTeam(team.id)}
                  className="group cursor-pointer flex items-center gap-3 p-3 bg-white border-2 border-gray-100 rounded-xl hover:border-green-300 hover:bg-green-50/50 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition-all">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-all" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-900">{team.code}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        {team.roles?.[0]?.name || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}