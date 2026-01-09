import { useState, useMemo } from 'react';

interface Handpump {
  DistrictName: string;
  BlockName: string;
  GrampanchayatName: string;
  VillegeName: string;
  CreateddateStr: string;
  HandpumpStatus: string;
  WaterQuality?: string;
  SoakpitConnected?: number;
  DrainageConnected?: number;
}

interface Filters {
  district: string;
  block: string;
  gramPanchayat: string;
  village: string;
  financialYear: string;
  month: string;
}

export const useFilters = (handpumps: Handpump[]) => {
  const [filters, setFilters] = useState<Filters>({
    district: '',
    block: '',
    gramPanchayat: '',
    village: '',
    financialYear: '2025-26',
    month: 'June',
  });

  // Generate filter options with cascading logic
  const filterOptions = useMemo(() => {
    return {
      districts: ['All Districts', ...new Set(handpumps.map((hp) => hp.DistrictName).filter(Boolean))],
      blocks: [
        'All Blocks',
        ...new Set(
          handpumps
            .filter((hp) => !filters.district || hp.DistrictName === filters.district)
            .map((hp) => hp.BlockName)
            .filter(Boolean)
        ),
      ],
      gramPanchayats: [
        'All Gram Panchayats',
        ...new Set(
          handpumps
            .filter((hp) => {
              const districtMatch = !filters.district || hp.DistrictName === filters.district;
              const blockMatch = !filters.block || hp.BlockName === filters.block;
              return districtMatch && blockMatch;
            })
            .map((hp) => hp.GrampanchayatName)
            .filter(Boolean)
        ),
      ],
      villages: [
        'All Villages',
        ...new Set(
          handpumps
            .filter((hp) => {
              const districtMatch = !filters.district || hp.DistrictName === filters.district;
              const blockMatch = !filters.block || hp.BlockName === filters.block;
              const gpMatch = !filters.gramPanchayat || hp.GrampanchayatName === filters.gramPanchayat;
              return districtMatch && blockMatch && gpMatch;
            })
            .map((hp) => hp.VillegeName)
            .filter(Boolean)
        ),
      ],
      financialYears: ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    };
  }, [handpumps, filters.district, filters.block, filters.gramPanchayat]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterName]: value };

      // Reset dependent filters when parent filter changes
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
      financialYear: '2025-26',
      month: 'June',
    });
  };

  // Filter handpumps based on current filters
  const getFilteredHandpumps = (allHandpumps: Handpump[]) => {
    return allHandpumps.filter((hp) => {
      const districtMatch = !filters.district || hp.DistrictName === filters.district;
      const blockMatch = !filters.block || hp.BlockName === filters.block;
      const gpMatch = !filters.gramPanchayat || hp.GrampanchayatName === filters.gramPanchayat;
      const villageMatch = !filters.village || hp.VillegeName === filters.village;

      // Financial Year filtering
      let yearMatch = true;
      if (hp.CreateddateStr) {
        try {
          const [day, month, year] = hp.CreateddateStr.split('-').map(Number);
          const hpDate = new Date(year, month - 1, day);
          const hpYear = hpDate.getFullYear();
          const hpMonth = hpDate.getMonth() + 1;

          const [startYear, endYear] = filters.financialYear.split('-').map((y) => parseInt('20' + y));

          if (hpMonth >= 4) {
            yearMatch = hpYear === startYear;
          } else {
            yearMatch = hpYear === endYear;
          }
        } catch (error) {
          console.error('Error parsing date:', hp.CreateddateStr, error);
          yearMatch = true;
        }
      }

      return districtMatch && blockMatch && gpMatch && villageMatch && yearMatch;
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