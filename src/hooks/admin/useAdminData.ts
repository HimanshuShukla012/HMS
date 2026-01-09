import { useState, useEffect } from 'react';

const API_BASE = 'https://hmsapi.kdsgroup.co.in/api';

export interface Handpump {
  H_id: number;
  HandpumpId: string;
  DistrictName: string;
  BlockName: string;
  GrampanchayatName: string;
  VillegeName: string;
  HandpumpStatus: string;
  WaterQuality?: string;
  SoakpitConnected?: number;
  DrainageConnected?: number;
  PlateformBuild?: number;
  NearByPersonName?: string;
  NearByPersonNo?: string;
  CreateddateStr?: string;
  CreatedDate?: string;
}

export interface Requisition {
  RequisitionId: number;
  HPId: number;
  HandpumpId: string;
  VillageName: string;
  GrampanchayatName: string;
  BlockName: string;
  DistrictName: string;
  RequisitionType: string;
  RequisitionTypeId: number;
  RequisitionDate: string;
  RequisitionStatus: number;
  SanctionAmount?: string;
  CompletionDateStr?: string;
}

interface AdminData {
  handpumps: Handpump[];
  requisitions: Requisition[];
  userId: number | null;
  userRole: string | null;
}

export const useAdminData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminData>({
    handpumps: [],
    requisitions: [],
    userId: null,
    userRole: null,
  });

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const getUserId = () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.UserID || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const getUserRole = () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.Role || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const authToken = getAuthToken();
        const extractedUserId = getUserId();

        if (!authToken) {
          throw new Error('Authentication token not found. Please login again.');
        }

        if (!extractedUserId) {
          throw new Error('User ID not found. Please login again.');
        }

        const extractedUserRole = getUserRole();

        const [handpumpsResponse, requisitionsResponse] = await Promise.all([
          fetch(`${API_BASE}/HandpumpRegistration/GetHandpumpListByUserId?UserId=${extractedUserId}`, {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${authToken}`,
            },
          }).catch((err) => {
            console.warn('Handpumps fetch failed:', err);
            return null;
          }),
          fetch(`${API_BASE}/HandpumpRequisition/GetRequisitionListByUserId?UserId=${extractedUserId}`, {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${authToken}`,
            },
          }).catch((err) => {
            console.warn('Requisitions fetch failed:', err);
            return null;
          }),
        ]);

        const [handpumpsData, requisitionsData] = await Promise.all([
          handpumpsResponse?.ok ? handpumpsResponse.json().catch(() => ({ Data: [] })) : Promise.resolve({ Data: [] }),
          requisitionsResponse?.ok ? requisitionsResponse.json().catch(() => ({ Data: [] })) : Promise.resolve({ Data: [] }),
        ]);

        setData({
          handpumps: handpumpsData?.Data && Array.isArray(handpumpsData.Data) ? handpumpsData.Data : [],
          requisitions: requisitionsData?.Data && Array.isArray(requisitionsData.Data) ? requisitionsData.Data : [],
          userId: extractedUserId,
          userRole: extractedUserRole,
        });
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setData({
          handpumps: [],
          requisitions: [],
          userId: null,
          userRole: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ...data, loading, error };
};