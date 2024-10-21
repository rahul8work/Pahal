import React, { useState, useEffect } from 'react';

export interface Nominee {
  id: string;
  type: 'Person' | 'Organization';
  name: string;
  mobileCountryCode: string;
  mobileNumber: string;
  email: string;
  country: string;
  zipCode: string;
  address: string;
  relationship?: string;
}

interface Props {
  onSubmit: (nominees: Nominee[]) => void;
  onSkip: () => void;
  initialNominees?: Nominee[];
}

const NomineeForm: React.FC<Props> = ({ onSubmit, onSkip, initialNominees = [] }) => {
  const [nominees, setNominees] = useState<Nominee[]>(initialNominees);

  const addNominee = () => {
    setNominees([...nominees, {
      id: Date.now().toString(),
      type: 'Person',
      name: '',
      mobileCountryCode: '',
      mobileNumber: '',
      email: '',
      country: '',
      zipCode: '',
      address: '',
    }]);
  };

  const removeNominee = (id: string) => {
    setNominees(nominees.filter(nominee => nominee.id !== id));
  };

  const updateNominee = (id: string, field: keyof Nominee, value: string) => {
    setNominees(nominees.map(nominee => 
      nominee.id === id ? { ...nominee, [field]: value } : nominee
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(nominees);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Add Nominees</h2>
      {nominees.map((nominee, index) => (
        <div key={nominee.id} className="border p-4 rounded">
          <h3 className="text-xl font-semibold mb-2">Nominee {index + 1}</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Type</label>
              <div>
                <label className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    value="Person"
                    checked={nominee.type === 'Person'}
                    onChange={() => updateNominee(nominee.id, 'type', 'Person')}
                    className="mr-2"
                  />
                  Person
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="Organization"
                    checked={nominee.type === 'Organization'}
                    onChange={() => updateNominee(nominee.id, 'type', 'Organization')}
                    className="mr-2"
                  />
                  Organization
                </label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Name"
              value={nominee.name}
              onChange={(e) => updateNominee(nominee.id, 'name', e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Country Code"
                value={nominee.mobileCountryCode}
                onChange={(e) => updateNominee(nominee.id, 'mobileCountryCode', e.target.value)}
                className="w-1/4 p-2 border rounded"
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={nominee.mobileNumber}
                onChange={(e) => updateNominee(nominee.id, 'mobileNumber', e.target.value)}
                className="w-3/4 p-2 border rounded"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={nominee.email}
              onChange={(e) => updateNominee(nominee.id, 'email', e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Country"
              value={nominee.country}
              onChange={(e) => updateNominee(nominee.id, 'country', e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={nominee.zipCode}
              onChange={(e) => updateNominee(nominee.id, 'zipCode', e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Address"
              value={nominee.address}
              onChange={(e) => updateNominee(nominee.id, 'address', e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
            {nominee.type === 'Person' && (
              <input
                type="text"
                placeholder="Relationship"
                value={nominee.relationship || ''}
                onChange={(e) => updateNominee(nominee.id, 'relationship', e.target.value)}
                className="w-full p-2 border rounded"
              />
            )}
            <button
              type="button"
              onClick={() => removeNominee(nominee.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Remove Nominee
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addNominee}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Nominee
      </button>
      <div className="flex justify-between">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default NomineeForm;