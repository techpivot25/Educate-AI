import React from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation } from 'lucide-react';

interface SchoolLocationMapProps {
  lat: number;
  lng: number;
  schoolName: string;
  address?: string;
  className?: string;
}

export const SchoolLocationMap: React.FC<SchoolLocationMapProps> = ({
  lat,
  lng,
  schoolName,
  address,
  className = '',
}) => {
  const position = { lat: lat || 28.6139, lng: lng || 77.2090 };

  return (
    <div className={`rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-800 ${className}`}>
      <div className="h-44 w-full relative">
        <Map
          defaultCenter={position}
          center={position}
          defaultZoom={15}
          zoom={15}
          mapId="DEMO_MAP_ID"
          gestureHandling="cooperative"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <AdvancedMarker position={position} title={schoolName}>
            <Pin background="#4F46E5" glyphColor="#FFFFFF" borderColor="#312E81" />
          </AdvancedMarker>
        </Map>

        {/* Floating badge */}
        <div className="absolute top-2 left-2 max-w-[85%] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-md flex items-center gap-1.5 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="truncate">
            <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate leading-tight">
              {schoolName}
            </p>
            {address && (
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                {address}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
