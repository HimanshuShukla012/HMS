import { useState, useEffect, useMemo } from 'react';

interface Handpump {
  H_id?: number;
  HandpumpId?: string;
  DistrictName: string;
  BlockName: string;
  GrampanchayatName: string;
  VillegeName?: string;
  HandpumpStatus?: string;
  CreateddateStr?: string;
  CreatedDate?: string;
}

// Helper function to get current financial year
const getCurrentFinancialYear = (): string => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();
  
  // Financial year starts in April
  if (currentMonth >= 4) {
    // April to December: FY is current year to next year
    const startYear = currentYear.toString().slice(-2);
    const endYear = (currentYear + 1).toString().slice(-2);
    return `${startYear}-${endYear}`;
  } else {
    // January to March: FY is previous year to current year
    const startYear = (currentYear - 1).toString().slice(-2);
    const endYear = currentYear.toString().slice(-2);
    return `${startYear}-${endYear}`;
  }
};

export const useFilters = (handpumps: Handpump[]) => {
  const [filters, setFilters] = useState({
    district: '',
    block: '',
    gramPanchayat: '',
    village: '',
    financialYear: getCurrentFinancialYear(),
    month: 'All',
  });

  // Generate financial years (last 10 years)
  const financialYears = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      const startYear = (currentYear - i).toString().slice(-2);
      const endYear = (currentYear - i + 1).toString().slice(-2);
      years.push(`${startYear}-${endYear}`);
    }
    return years;
  }, []);

  const months = [
    'All',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Get unique filter options with cascading logic
  const filterOptions = useMemo(() => {
    const districts = ['All', ...new Set(handpumps.map((hp) => hp.DistrictName).filter(Boolean))];
    
    const filteredByDistrict = filters.district
      ? handpumps.filter((hp) => hp.DistrictName === filters.district)
      : handpumps;
    const blocks = ['All', ...new Set(filteredByDistrict.map((hp) => hp.BlockName).filter(Boolean))];
    
    const filteredByBlock = filters.block
      ? filteredByDistrict.filter((hp) => hp.BlockName === filters.block)
      : filteredByDistrict;
    const gramPanchayats = ['All', ...new Set(filteredByBlock.map((hp) => hp.GrampanchayatName).filter(Boolean))];
    
    const filteredByGP = filters.gramPanchayat
      ? filteredByBlock.filter((hp) => hp.GrampanchayatName === filters.gramPanchayat)
      : filteredByBlock;
    const villages = ['All', ...new Set(filteredByGP.map((hp) => hp.VillegeName).filter(Boolean))];

    return {
      districts,
      blocks,
      gramPanchayats,
      villages,
      financialYears,
      months,
    };
  }, [handpumps, filters.district, filters.block, filters.gramPanchayat, financialYears]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterName]: value };
      
      // Reset dependent filters when parent changes
      if (filterName === 'district') {
        newFilters.block = '';
        newFilters.gramPanchayat = '';
        newFilters.village = '';
      } else if (filterName === 'block') {
        newFilters.gramPanchayat = '';
        newFilters.village = '';
      } else if (filterName === 'gramPanchayat') {
        newFilters.village = '';
      }
      
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFilters({
      district: '',
      block: '',
      gramPanchayat: '',
      village: '',
      financialYear: getCurrentFinancialYear(),
      month: 'All',
    });
  };

  const getFilteredHandpumps = (allHandpumps: Handpump[]) => {
    return allHandpumps.filter((hp) => {
      const districtMatch = !filters.district || hp.DistrictName === filters.district;
      const blockMatch = !filters.block || hp.BlockName === filters.block;
      const gpMatch = !filters.gramPanchayat || hp.GrampanchayatName === filters.gramPanchayat;
      const villageMatch = !filters.village || hp.VillegeName === filters.village;

      // Financial year filter based on handpump geotag date (CreatedDate)
let yearMatch = true;
const createdDate = hp.CreateddateStr || hp.CreatedDate;
if (createdDate) {
  const geotagDate = new Date(createdDate);
  const geotagYear = geotagDate.getFullYear();
  const geotagMonth = geotagDate.getMonth() + 1; // 1-12

  const [startYear, endYear] = filters.financialYear
    .split('-')
    .map((y) => parseInt('20' + y));

  // Financial year: April (startYear) to March (endYear)
  if (geotagMonth >= 4) {
    yearMatch = geotagYear === startYear;
  } else {
    yearMatch = geotagYear === endYear;
  }
}

// Month filter based on geotag date
let monthMatch = true;
if (filters.month !== 'All' && createdDate) {
  const geotagDate = new Date(createdDate);
  const geotagMonthName = geotagDate.toLocaleString('en-US', { month: 'long' });
  monthMatch = geotagMonthName === filters.month;
}

      return districtMatch && blockMatch && gpMatch && villageMatch && yearMatch && monthMatch;
    });
  };

  return {
    filters,
    filterOptions,
    handleFilterChange,
    resetFilters,
    getFilteredHandpumps,
  };
};