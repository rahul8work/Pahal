import React, { useState } from 'react';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

interface Props {
  onComplete: () => void;
  db: any;
  userAddress: string;
}

const IdentityVerification: React.FC<Props> = ({ onComplete, db, userAddress }) => {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      side === 'front' ? setFrontImage(file) : setBackImage(file);
    } else {
      alert('Please select an image under 5MB.');
    }
  };

  const uploadImage = async (file: File, side: string) => {
    const storage = getStorage();
    const storageRef = ref(storage, `id_verification/${userAddress}_${side}`);
    await uploadBytes(storageRef, file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!frontImage || !backImage) {
      alert('Please upload both front and back images of your ID.');
      return;
    }

    setIsUploading(true);
    try {
      await uploadImage(frontImage, 'front');
      await uploadImage(backImage, 'back');
      await updateDoc(doc(db, 'users', userAddress), { verified: false });
      alert('ID verification submitted successfully. It will be reviewed manually.');
      onComplete();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Identity Verification</h2>
      <p className="mb-4">Please upload images of your government-issued ID for verification. Note that verification is currently done manually.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Front of ID</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'front')} className="w-full" />
        </div>
        <div>
          <label className="block mb-2">Back of ID</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} className="w-full" />
        </div>
        <button type="submit" disabled={isUploading} className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
          {isUploading ? 'Uploading...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
};

export default IdentityVerification;