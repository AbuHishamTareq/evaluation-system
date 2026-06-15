import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { Zone, ZoneLevel } from '../../../types/zone';
import { ZONE_LEVEL_COLORS } from '../../../types/zone';

interface ZoneCardProps {
  zone: Zone;
  onClick?: () => void;
  onEdit?: (zone: Zone) => void;
  onDelete?: (zone: Zone) => void;
  showChildren?: boolean;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  onClick,
  onEdit,
  onDelete,
  showChildren = false,
}) => {
  const levelColor = ZONE_LEVEL_COLORS[zone.level as ZoneLevel] || 'bg-gray-100 text-gray-800';
  
  const levelLabels = {
    region: 'Region',
    district: 'District',
    sub_district: 'Sub-District',
  };

  return (
    <Card
      variant="outlined"
      padding="md"
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-lg ${
            zone.level === 'region' ? 'bg-purple-100 text-purple-600' :
            zone.level === 'district' ? 'bg-blue-100 text-blue-600' :
            'bg-green-100 text-green-600'
          }`}>
            {zone.code.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">{zone.name}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor}`}>
                {levelLabels[zone.level as ZoneLevel] || zone.level}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Code: {zone.code}</p>
            {zone.description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{zone.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              {zone.centers_count !== undefined && (
                <span>{zone.centers_count} center{zone.centers_count !== 1 ? 's' : ''}</span>
              )}
              {zone.children && zone.children.length > 0 && (
                <span>{zone.children.length} sub-zone{zone.children.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
        
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(zone);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit zone"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(zone);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete zone"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {showChildren && zone.children && zone.children.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Sub-zones:</p>
          <div className="flex flex-wrap gap-2">
            {zone.children.map((child) => (
              <span
                key={child.id}
                className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs"
              >
                {child.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};