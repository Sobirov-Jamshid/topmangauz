"use client";

import React, { useState, Suspense } from 'react';
import { SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  name: string;
  paramName: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface MangaFilterBarProps {
  sortOptions?: FilterOption[];
  filterGroups?: FilterGroup[];
}

function MangaFilterBarContent({ 
  sortOptions = defaultSortOptions, 
  filterGroups = defaultFilterGroups 
}: MangaFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort') || 'popularity';
  
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const handleSortChange = (sort: string) => {
    router.push(`${pathname}?${createQueryString('sort', sort)}`);
  };
  
  const handleFilterChange = (paramName: string, value: string, multiSelect = false) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (multiSelect) {
      const currentValues = params.getAll(paramName);
      if (currentValues.includes(value)) {
        const newValues = currentValues.filter(v => v !== value);
        params.delete(paramName);
        newValues.forEach(v => params.append(paramName, v));
      } else {
        params.append(paramName, value);
      }
    } else {
      const current = params.get(paramName);
      if (current === value) {
        params.delete(paramName);
      } else {
        params.set(paramName, value);
      }
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set('sort', currentSort);
    router.push(`${pathname}?${params.toString()}`);
  };

  let activeFilterCount = 0;
  filterGroups.forEach(group => {
    if (group.multiSelect) {
      activeFilterCount += searchParams.getAll(group.paramName).length;
    } else if (searchParams.get(group.paramName)) {
      activeFilterCount += 1;
    }
  });

  return (
    <div className="bg-[#121212] border border-[#1a1a1a] rounded-md mb-6">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center text-sm font-medium text-white"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtrlar
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-[#ff9900]/20 text-[#ff9900] text-xs py-0.5 px-1.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown 
              className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>
        
        <div className="flex items-center">
          {activeFilterCount > 0 && (
            <button 
              onClick={clearFilters}
              className="text-xs text-[#a0a0a0] hover:text-white flex items-center mr-4"
            >
              <X className="w-3 h-3 mr-1" />
              Tozalash
            </button>
          )}
          
          <div className="relative group">
            <button className="flex items-center text-sm text-white">
              Saralash:
              <span className="ml-1 font-medium text-[#ff9900]">
                {sortOptions.find(option => option.value === currentSort)?.label || 'Mashhur'}
              </span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            
            <div className="absolute right-0 top-full mt-1 bg-[#121212] border border-[#1a1a1a] rounded-md shadow-lg z-20 w-48 py-1 hidden group-hover:block">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-[#1a1a1a] transition-colors ${
                    currentSort === option.value ? 'text-[#ff9900]' : 'text-white'
                  }`}
                  onClick={() => handleSortChange(option.value)}
                >
                  {option.label}
                  {currentSort === option.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filterGroups.map(group => (
              <div key={group.paramName}>
                <h3 className="font-medium text-sm mb-2 text-white">{group.name}</h3>
                <div className="space-y-1">
                  {group.options.map(option => {
                    let isSelected = false;
                    if (group.multiSelect) {
                      isSelected = searchParams.getAll(group.paramName).includes(option.value);
                    } else {
                      isSelected = searchParams.get(group.paramName) === option.value;
                    }
                    
                    return (
                      <button
                        key={option.value}
                        className={`flex items-center text-sm py-1 px-2 rounded hover:bg-[#1a1a1a] w-full text-left transition-colors ${
                          isSelected ? 'text-[#ff9900] bg-[#ff9900]/10' : 'text-[#a0a0a0]'
                        }`}
                        onClick={() => handleFilterChange(group.paramName, option.value, group.multiSelect)}
                      >
                        <span className={`w-4 h-4 rounded border ${
                          isSelected ? 'border-[#ff9900] bg-[#ff9900]/20' : 'border-[#333333]'
                        } mr-2 flex items-center justify-center`}>
                          {isSelected && <Check className="w-3 h-3 text-[#ff9900]" />}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MangaFilterBar = (props: MangaFilterBarProps) => {
  return (
    <Suspense fallback={
      <div className="bg-[#121212] border border-[#1a1a1a] rounded-md mb-6 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-[#1a1a1a] rounded w-24 mb-2"></div>
          <div className="h-3 bg-[#1a1a1a] rounded w-32"></div>
        </div>
      </div>
    }>
      <MangaFilterBarContent {...props} />
    </Suspense>
  );
};

const defaultSortOptions: FilterOption[] = [
  { label: 'Mashhur', value: 'popularity' },
  { label: 'Yangi', value: 'new' },
  { label: 'Alifbo bo\'yicha', value: 'alphabet' },
  { label: 'Reyting bo\'yicha', value: 'rating' }
];

const defaultFilterGroups: FilterGroup[] = [
  {
    name: 'Turi',
    paramName: 'type',
    options: [
      { label: 'Manga', value: 'manga' },
      { label: 'Manhva', value: 'manhwa' },
      { label: 'Manhua', value: 'manhua' }
    ]
  },
  {
    name: 'Janrlar',
    paramName: 'genre',
    options: [
      { label: 'Shonen', value: 'shounen' },
      { label: 'Ekshen', value: 'action' },
      { label: 'Fantaziya', value: 'fantasy' },
      { label: 'Sarguzasht', value: 'adventure' },
      { label: 'Romantika', value: 'romance' },
      { label: 'Isekai', value: 'isekai' }
    ],
    multiSelect: true
  },
  {
    name: 'Holati',
    paramName: 'status',
    options: [
      { label: 'Jarayonda', value: 'ongoing' },
      { label: 'Yakunlangan', value: 'completed' },
      { label: 'To\'xtatilgan', value: 'dropped' }
    ]
  }
];

export default MangaFilterBar; 