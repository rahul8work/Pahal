import React, { useState, useEffect } from 'react';

export interface FormData {
  name: string;
  familyName: string;
  birthDate: string;
  mobileCountryCode: string;
  mobileNumber: string;
  email: string;
  country: string;
  zipCode: string;
  address: string;
}

interface Props {
  onSubmit: (formData: FormData) => void;
  initialData?: FormData | null;
  title: string;
}

const RegistrationForm: React.FC<Props> = ({ onSubmit, initialData, title }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    familyName: '',
    birthDate: '',
    mobileCountryCode: '',
    mobileNumber: '',
    email: '',
    country: '',
    zipCode: '',
    address: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      <div>
        <label htmlFor="name" className="block mb-1">Name (Max 50 characters)</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          maxLength={50}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="familyName" className="block mb-1">Family Name (Max 50 characters)</label>
        <input
          type="text"
          id="familyName"
          name="familyName"
          value={formData.familyName}
          onChange={handleChange}
          maxLength={50}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="birthDate" className="block mb-1">Birth Date</label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex space-x-2">
        <div className="w-1/4">
          <label htmlFor="mobileCountryCode" className="block mb-1">Country Code</label>
          <input
            type="text"
            id="mobileCountryCode"
            name="mobileCountryCode"
            value={formData.mobileCountryCode}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="w-3/4">
          <label htmlFor="mobileNumber" className="block mb-1">Mobile Number (10 digits)</label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            pattern="[0-9]{10}"
            required
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block mb-1">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="country" className="block mb-1">Country</label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="zipCode" className="block mb-1">Zip Code</label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="address" className="block mb-1">Address</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
          rows={3}
        ></textarea>
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Submit
      </button>
    </form>
  );
};

export default RegistrationForm;