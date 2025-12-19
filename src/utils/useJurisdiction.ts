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
        setLoading(false);
        return;
      }

      try {
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
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.Status && data.Data && data.Data.length > 0) {
          const profile = data.Data[0];
          setJurisdiction({
            userId: profile.UserId,
            roleId: profile.RoleId,
            roleName: profile.RoleName,
            districtId: profile.DistrictId || null,
            districtName: profile.DistrictName || null,
            blockId: profile.BlockId || null,
            blockName: profile.BlockName || null,
            gramPanchayatId: profile.GramPanchayatId || null,
            gramPanchayatName: profile.GramPanchayatName || null,
            fullName: profile.FullName
          });
        } else {
          throw new Error('No profile data found');
        }
      } catch (err) {
        console.error('Error fetching jurisdiction:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch jurisdiction');
      } finally {
        setLoading(false);
      }
    };

    fetchJurisdiction();
  }, [userId]);

  return { jurisdiction, loading, error };
};