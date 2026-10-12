import React, { useState, useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { DBSchool } from '../../types';
import { useApp } from '../../context/AppContext';
import { School, MapPin, Plus, Check, Loader2, Search, Building2, Globe } from 'lucide-react';

interface SchoolAutocompleteProps {
  selectedSchoolName?: string;
  selectedSchoolAddress?: string;
  onSelectSchool: (school: {
    id?: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const SchoolAutocomplete: React.FC<SchoolAutocompleteProps> = ({
  selectedSchoolName = '',
  selectedSchoolAddress = '',
  onSelectSchool,
  placeholder = 'Search school name or location (e.g. D.A.V. Public School, Chandigarh)...',
  required = false,
  className = '',
}) => {
  const { schools, fetchSchools, registerSchool } = useApp();
  const placesLib = useMapsLibrary('places');

  const [inputVal, setInputVal] = useState(selectedSchoolName);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleSuggestions, setGoogleSuggestions] = useState<any[]>([]);
  const [dbMatches, setDbMatches] = useState<DBSchool[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<{
    name: string;
    address: string;
    lat?: number;
    lng?: number;
  } | null>(
    selectedSchoolName
      ? { name: selectedSchoolName, address: selectedSchoolAddress }
      : null
  );

  const sessionTokenRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync initial input
  useEffect(() => {
    if (selectedSchoolName && selectedSchoolName !== inputVal) {
      setInputVal(selectedSchoolName);
      setSelectedDetails({
        name: selectedSchoolName,
        address: selectedSchoolAddress || '',
      });
    }
  }, [selectedSchoolName, selectedSchoolAddress]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Query DB schools and Google Places API New suggestions
  useEffect(() => {
    if (!inputVal.trim() || inputVal.trim().length < 2) {
      setGoogleSuggestions([]);
      setDbMatches([]);
      return;
    }

    const query = inputVal.trim().toLowerCase();

    // 1. Filter local / server institutional DB
    const matchedInDB = schools.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query)
    );
    setDbMatches(matchedInDB);

    // 2. Fetch Google Places Autocomplete Suggestions if places library is available
    if (!placesLib) return;

    let isMounted = true;
    setIsLoading(true);

    try {
      const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: inputVal,
        sessionToken: sessionTokenRef.current,
      })
        .then((res: any) => {
          if (!isMounted) return;
          const suggestions = res?.suggestions || [];
          setGoogleSuggestions(suggestions.slice(0, 5));
          setIsLoading(false);
        })
        .catch((err: any) => {
          if (!isMounted) return;
          console.warn('Google Places suggestion fetch notice:', err);
          setIsLoading(false);
        });
    } catch (err) {
      console.warn('Places autocomplete setup note:', err);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [inputVal, placesLib, schools]);

  const handleSelectDbSchool = (school: DBSchool) => {
    setInputVal(school.name);
    setSelectedDetails({
      name: school.name,
      address: school.address,
      lat: school.lat,
      lng: school.lng,
    });
    setIsOpen(false);
    sessionTokenRef.current = null;
    onSelectSchool({
      id: school.id,
      name: school.name,
      address: school.address,
      lat: school.lat,
      lng: school.lng,
    });
  };

  const handleSelectGoogleSuggestion = async (suggestion: any) => {
    setIsLoading(true);
    try {
      const place = suggestion.placePrediction?.toPlace();
      if (place) {
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });

        const name = place.displayName || suggestion.placePrediction?.text?.toString() || inputVal;
        const address = place.formattedAddress || 'India';
        const lat = place.location?.lat ? place.location.lat() : 28.6139;
        const lng = place.location?.lng ? place.location.lng() : 77.2090;

        // Auto-register into database
        const savedSchool = await registerSchool({ name, address, lat, lng });

        setInputVal(savedSchool.name);
        setSelectedDetails({
          name: savedSchool.name,
          address: savedSchool.address,
          lat: savedSchool.lat,
          lng: savedSchool.lng,
        });
        setIsOpen(false);
        sessionTokenRef.current = null;

        onSelectSchool({
          id: savedSchool.id,
          name: savedSchool.name,
          address: savedSchool.address,
          lat: savedSchool.lat,
          lng: savedSchool.lng,
        });
      }
    } catch (err) {
      console.error('Error fetching place details:', err);
      // Fallback: register using text prediction
      const fallbackName = suggestion.placePrediction?.text?.toString() || inputVal;
      const fallbackAddress = `${fallbackName}, India`;
      const savedSchool = await registerSchool({
        name: fallbackName,
        address: fallbackAddress,
        lat: 28.6139,
        lng: 77.2090,
      });
      setInputVal(savedSchool.name);
      setSelectedDetails(savedSchool);
      setIsOpen(false);
      onSelectSchool(savedSchool);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewManualSchool = async () => {
    if (!inputVal.trim()) return;
    setIsLoading(true);
    try {
      const savedSchool = await registerSchool({
        name: inputVal.trim(),
        address: `${inputVal.trim()}, India`,
        lat: 28.6139,
        lng: 77.2090,
      });
      setInputVal(savedSchool.name);
      setSelectedDetails(savedSchool);
      setIsOpen(false);
      sessionTokenRef.current = null;
      onSelectSchool(savedSchool);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <School className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (schools.length === 0) {
              fetchSchools();
            }
          }}
          required={required}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Selected Confirmation Pill */}
      {selectedDetails && (
        <div className="mt-1.5 flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
          <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1 truncate">
            <span className="font-semibold">{selectedDetails.name}</span>
            {selectedDetails.address && (
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] ml-1 opacity-90 truncate block">
                {selectedDetails.address}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 backdrop-blur-md">
          {/* Section 1: Institutional Network DB Matches */}
          {dbMatches.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>Existing Platform Schools ({dbMatches.length})</span>
              </div>
              {dbMatches.map((school) => (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => handleSelectDbSchool(school)}
                  className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-start gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <School className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {school.name}
                      </p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium ml-1">
                        In Network
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {school.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section 2: Google Maps Places Suggestions */}
          {googleSuggestions.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-500" />
                <span>Google Maps Live Suggestions</span>
              </div>
              {googleSuggestions.map((sug, idx) => {
                const mainText =
                  sug.placePrediction?.structuredFormat?.mainText?.toString() ||
                  sug.placePrediction?.text?.toString() ||
                  'School';
                const secondaryText =
                  sug.placePrediction?.structuredFormat?.secondaryText?.toString() ||
                  '';

                return (
                  <button
                    key={sug.placePrediction?.placeId || idx}
                    type="button"
                    onClick={() => handleSelectGoogleSuggestion(sug)}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {mainText}
                      </p>
                      {secondaryText && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {secondaryText}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Section 3: Add Custom School Entry */}
          {inputVal.trim().length >= 2 && (
            <div className="p-2 bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={handleAddNewManualSchool}
                className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold">Register as new school: </span>
                  <span className="italic">"{inputVal.trim()}"</span>
                </div>
              </button>
            </div>
          )}

          {/* Empty state */}
          {dbMatches.length === 0 && googleSuggestions.length === 0 && inputVal.trim().length < 2 && (
            <div className="p-4 text-center text-xs text-slate-400">
              Type at least 2 characters to search Indian institutional schools or Google Places...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
