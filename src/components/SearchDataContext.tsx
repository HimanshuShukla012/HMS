import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchDataContextType {
  handpumps: any[];
  complaints: any[];
  requisitions: any[];
  estimations: any[];
  setHandpumps: (data: any[]) => void;
  setComplaints: (data: any[]) => void;
  setRequisitions: (data: any[]) => void;
  setEstimations: (data: any[]) => void;
}

const SearchDataContext = createContext<SearchDataContextType | undefined>(undefined);

export const SearchDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [handpumps, setHandpumps] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [estimations, setEstimations] = useState<any[]>([]);

  return (
    <SearchDataContext.Provider 
      value={{ 
        handpumps, 
        complaints, 
        requisitions,
        estimations,
        setHandpumps,
        setComplaints,
        setRequisitions,
        setEstimations
      }}
    >
      {children}
    </SearchDataContext.Provider>
  );
};

export const useSearchData = () => {
  const context = useContext(SearchDataContext);
  if (context === undefined) {
    throw new Error('useSearchData must be used within a SearchDataProvider');
  }
  return context;
};