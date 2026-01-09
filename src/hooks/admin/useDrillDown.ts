import { useState, useEffect } from 'react';

export const useDrillDown = (userRole: string | null) => {
  const [drillDownLevel, setDrillDownLevel] = useState<'district' | 'block' | 'gp' | 'village'>('district');
  const [selectedDrillDistrict, setSelectedDrillDistrict] = useState('');
  const [selectedDrillBlock, setSelectedDrillBlock] = useState('');
  const [selectedDrillGP, setSelectedDrillGP] = useState('');

  useEffect(() => {
    if (userRole === 'Admin' || userRole === 'DPRO') {
      setDrillDownLevel('district');
    } else if (userRole === 'ADO') {
      setDrillDownLevel('block');
    } else if (userRole === 'Sachiv') {
      setDrillDownLevel('gp');
    }
  }, [userRole]);

  const navigateBack = () => {
    if (drillDownLevel === 'village') {
      setDrillDownLevel('gp');
      setSelectedDrillGP('');
    } else if (drillDownLevel === 'gp') {
      setDrillDownLevel('block');
      setSelectedDrillBlock('');
    } else if (drillDownLevel === 'block') {
      setDrillDownLevel('district');
      setSelectedDrillDistrict('');
    }
  };

  const drillToBlock = (district: string) => {
    setSelectedDrillDistrict(district);
    setDrillDownLevel('block');
  };

  const drillToGP = (block: string) => {
    setSelectedDrillBlock(block);
    setDrillDownLevel('gp');
  };

  const drillToVillage = (gp: string) => {
    setSelectedDrillGP(gp);
    setDrillDownLevel('village');
  };

  return {
    drillDownLevel,
    setDrillDownLevel,
    selectedDrillDistrict,
    setSelectedDrillDistrict,
    selectedDrillBlock,
    setSelectedDrillBlock,
    selectedDrillGP,
    setSelectedDrillGP,
    navigateBack,
    drillToBlock,
    drillToGP,
    drillToVillage,
  };
};