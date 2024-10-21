import React from 'react';

interface Props {
  onSelect: (purpose: 'create' | 'claim') => void;
}

const PurposeSelection: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="flex h-full">
      <div 
        className="w-1/2 p-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 transition-colors cursor-pointer"
        onClick={() => onSelect('create')}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Create Your Will</h2>
          <p>Start planning your legacy and secure your wishes for the future.</p>
        </div>
      </div>
      <div 
        className="w-1/2 p-8 flex items-center justify-center bg-green-100 hover:bg-green-200 transition-colors cursor-pointer"
        onClick={() => onSelect('claim')}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Claim a Will</h2>
          <p>Access and manage a will that has been left to you.</p>
        </div>
      </div>
    </div>
  );
};

export default PurposeSelection;