import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { Pay, PayButton, PayStatus } from '@coinbase/onchainkit/pay';

interface Props {
  onSubmit: (willText: string, checkInterval: number) => void;
  onPaymentComplete: () => void;
  db: any;
  userAddress: string;
  isExistingUser: boolean;
  initialWillText?: string;
  initialCheckInterval?: number;
  claimData?: any;
}

const WillForm: React.FC<Props> = ({ 
  onSubmit, 
  onPaymentComplete, 
  db, 
  userAddress, 
  isExistingUser, 
  initialWillText = '', 
  initialCheckInterval = 1,
  claimData
}) => {
  const [willText, setWillText] = useState(initialWillText);
  const [checkInterval, setCheckInterval] = useState(initialCheckInterval);
  const [isUploading, setIsUploading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (claimData) {
      setWillText(claimData.willText || '');
      setCheckInterval(claimData.checkInterval || 1);
    } else {
      setWillText(initialWillText);
      setCheckInterval(initialCheckInterval);
    }
  }, [claimData, initialWillText, initialCheckInterval]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (willText.length > 10000) {
      alert('Will text must be 10000 characters or less.');
      return;
    }
    setIsUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `wills/${userAddress}`);
      await uploadString(storageRef, willText);
      await updateDoc(doc(db, 'users', userAddress), { 
        hasWill: true,
        checkInterval: checkInterval,
        willText: willText
      });
      onSubmit(willText, checkInterval);
      setShowPayment(true);
    } catch (error) {
      console.error('Error uploading will:', error);
      alert('Error uploading will. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentSuccess = () => {
    onPaymentComplete();
  };

  const statusHandler = (status: any) => { 
    const { statusName } = status; 
    if (statusName === 'success') {
      handlePaymentSuccess();
    }
  } 

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Your Will</h2>
      {!showPayment ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-700">Will Text (Max 10000 characters)</label>
            <textarea 
              value={willText}
              onChange={(e) => setWillText(e.target.value)}
              className="w-full h-64 p-2 border border-gray-300 rounded text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              maxLength={10000}
              readOnly={claimData !== null}
            />
            <p className="text-sm text-gray-500 mt-1">{willText.length}/10000 characters</p>
          </div>
          {!claimData && (
            <div>
              <label className="block mb-2 text-gray-700">Check Interval (Years)</label>
              <select 
                value={checkInterval}
                onChange={(e) => setCheckInterval(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                disabled={isExistingUser}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
          {!isExistingUser && !claimData && (
            <button 
              type="submit" 
              disabled={isUploading} 
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 transition duration-300"
            >
              {isUploading ? 'Uploading...' : 'Submit Will'}
            </button>
          )}
        </form>
      ) : (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2 text-indigo-700">Payment Required</h3>
          <p className="mb-4 text-gray-700">Please pay 10 USDC to store your will.</p>
          <Pay 
          productId='8307d7f8-f930-45d2-8990-5a60c6c9bf49' 
          onStatus={statusHandler}> 
            <PayButton coinbaseBranded/> 
            <PayStatus />
          </Pay>
        </div>
      )}
    </div>
  );
};

export default WillForm;
