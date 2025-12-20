import { useState, useEffect } from 'react';

interface JurisdictionData {
  userId: number;
  roleId: number;
  roleName: string;
  districtId: number | null;
  districtName: string | null;
  blockId: number | null;
  blockName: string | null;
  gramPanchayatId: number | null;
  gramPanchayatName: string | null;
  fullName: string;
}

// Cache jurisdiction data to avoid repeated fetches
const jurisdictionCache: Map<number, JurisdictionData> = new Map();

export const useJurisdiction = (userId: number | null) => {
  const [jurisdiction, setJurisdiction] = useState<JurisdictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJurisdiction = async () => {
      if (!userId) {
        console.log('useJurisdiction: No userId provided');
        setLoading(false);
        return;
      }

      // Check cache first
      if (jurisdictionCache.has(userId)) {
        console.log('Using cached jurisdiction data');
        setJurisdiction(jurisdictionCache.get(userId)!);
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        setLoading(true);
        setError(null);

        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(
          `https://hmsapi.kdsgroup.co.in/api/Signup/GetUserProfileById?UserId=${userId}`,
          {
            method: 'GET',
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        let jurisdictionData: JurisdictionData;

        // Check if API call was successful
        if (!data.Status) {
          console.warn('API returned Status: false', data.Message);
          jurisdictionData = {
            userId: userId,
            roleId: 0,
            roleName: 'Unknown',
            districtId: null,
            districtName: null,
            blockId: null,
            blockName: null,
            gramPanchayatId: null,
            gramPanchayatName: null,
            fullName: 'User'
          };
        } else {
          // Handle different response structures
          let profile = null;

          if (data.Data && Array.isArray(data.Data) && data.Data.length > 0) {
            profile = data.Data[0];
          } else if (data.Data && typeof data.Data === 'object' && !Array.isArray(data.Data)) {
            profile = data.Data;
          }

          if (profile) {
            jurisdictionData = {
              userId: profile.UserId || userId,
              roleId: profile.RoleId || 0,
              roleName: profile.RoleName || 'Unknown',
              districtId: profile.DistrictId || null,
              districtName: profile.DistrictName || null,
              blockId: profile.BlockId || null,
              blockName: profile.BlockName || null,
              gramPanchayatId: profile.GramPanchayatId || null,
              gramPanchayatName: profile.GramPanchayatName || null,
              fullName: profile.FullName || profile.Name || 'User'
            };
          } else {
            jurisdictionData = {
              userId: userId,
              roleId: 0,
              roleName: 'Unknown',
              districtId: null,
              districtName: null,
              blockId: null,
              blockName: null,
              gramPanchayatId: null,
              gramPanchayatName: null,
              fullName: 'User'
            };
          }
        }

        // Cache the result
        jurisdictionCache.set(userId, jurisdictionData);
        setJurisdiction(jurisdictionData);

      } catch (err) {
        if (err.name === 'AbortError') {
          console.error('Jurisdiction fetch timeout');
          setError('Request timeout');
        } else {
          console.error('Error fetching jurisdiction:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch jurisdiction');
        }
        
        // Set default jurisdiction to allow app to continue
        const defaultJurisdiction: JurisdictionData = {
          userId: userId!,
          roleId: 0,
          roleName: 'Unknown',
          districtId: null,
          districtName: null,
          blockId: null,
          blockName: null,
          gramPanchayatId: null,
          gramPanchayatName: null,
          fullName: 'User'
        };
        
        jurisdictionCache.set(userId, defaultJurisdiction);
        setJurisdiction(defaultJurisdiction);
      } finally {
        setLoading(false);
      }
    };

    fetchJurisdiction();
  }, [userId]);

  return { jurisdiction, loading, error };
};

// Export function to clear cache (useful on logout)
export const clearJurisdictionCache = () => {
  jurisdictionCache.clear();
};