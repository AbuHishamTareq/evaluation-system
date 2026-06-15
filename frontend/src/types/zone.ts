// Zone types for hierarchical region management

export interface Zone {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  parent?: { id: number; name: string; code?: string };
  children_count?: number;
  level: ZoneLevel;
  description?: string;
  children?: Zone[];
  centers_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type ZoneLevel = 'region' | 'district' | 'sub_district';

export interface ZoneCreateInput {
  name: string;
  code: string;
  parent_id?: number | null;
  level: ZoneLevel;
  description?: string;
}

export interface ZoneUpdateInput extends Partial<ZoneCreateInput> {}

export interface ZoneFilters {
  search?: string;
  level?: ZoneLevel;
  parent_id?: number | null;
  is_active?: boolean;
}

export interface ZoneTree {
  regions: Zone[];
}

export const ZONE_LEVEL_OPTIONS: { value: ZoneLevel; label: string }[] = [
  { value: 'region', label: 'Region' },
  { value: 'district', label: 'District' },
  { value: 'sub_district', label: 'Sub-District' },
];

export const ZONE_LEVEL_COLORS: Record<ZoneLevel, string> = {
  region: 'bg-purple-100 text-purple-800',
  district: 'bg-blue-100 text-blue-800',
  sub_district: 'bg-green-100 text-green-800',
};