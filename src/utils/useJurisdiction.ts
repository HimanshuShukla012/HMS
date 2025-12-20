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

      try {
        setLoading(true);
        setError(null);

        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('Authentication token not found');
        }

        console.log('Fetching jurisdiction for userId:', userId);

        const response = await fetch(
          `https://hmsapi.kdsgroup.co.in/api/Signup/GetUserProfileById?UserId=${userId}`,
          {
            method: 'GET',
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('GetUserProfileById API Response:', data);

        // Check if API call was successful
        if (!data.Status) {
          console.warn('API returned Status: false', data.Message);
          // For users without specific jurisdiction (e.g., Admin), set minimal data
          setJurisdiction({
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
          });
          setLoading(false);
          return;
        }

        // Handle different response structures
        let profile = null;

        // Case 1: data.Data is an array with elements
        if (data.Data && Array.isArray(data.Data) && data.Data.length > 0) {
          profile = data.Data[0];
          console.log('Profile from array:', profile);
        } 
        // Case 2: data.Data is a direct object (not an array)
        else if (data.Data && typeof data.Data === 'object' && !Array.isArray(data.Data)) {
          profile = data.Data;
          console.log('Profile from object:', profile);
        }
        // Case 3: No data available
        else {
          console.warn('No profile data in response');
          // Set basic jurisdiction for users without profile
          setJurisdiction({
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
          });
          setLoading(false);
          return;
        }

        // Set jurisdiction from profile data
        if (profile) {
          setJurisdiction({
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
          });
          console.log('Jurisdiction set successfully:', {
            districtId: profile.DistrictId,
            blockId: profile.BlockId,
            gramPanchayatId: profile.GramPanchayatId
          });
        }

      } catch (err) {
        console.error('Error fetching jurisdiction:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jurisdiction';
        setError(errorMessage);
        
        // Even on error, set a minimal jurisdiction so the app can continue
        // This allows admins or users without profiles to still use the system
        setJurisdiction({
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJurisdiction();
  }, [userId]);

  return { jurisdiction, loading, error };
};