'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import RegistrationForm, { FormData } from '../components/RegistrationForm';
import IdentityVerification from '../components/IdentityVerification';
import NomineeForm, { Nominee } from '../components/NomineeForm';
import WillForm from '../components/WillForm';

// Initialize Firebase with environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const { isConnected, address } = useAccount();
  const searchParams = useSearchParams();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showIdentityVerification, setShowIdentityVerification] = useState(false);
  const [showNomineeForm, setShowNomineeForm] = useState(false);
  const [showWillForm, setShowWillForm] = useState(false);
  const [showClaimMessage, setShowClaimMessage] = useState(false);
  const [userData, setUserData] = useState<FormData | null>(null);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [isNewUser, setIsNewUser] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [willText, setWillText] = useState('');
  const [checkInterval, setCheckInterval] = useState(1);
  const [claimData, setClaimData] = useState<any>(null);

  useEffect(() => {
    const checkUserExists = async () => {
      if (address) {
        const userDoc = await getDoc(doc(db, "users", address));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data as FormData);
          setNominees(data.nominees || []);
          setIsNewUser(false);
          setIsVerified(data.verified || false);
          setWillText(data.willText || '');
          setCheckInterval(data.checkInterval || 1);
          setPaymentComplete(data.paymentComplete || false);

          const claimId = searchParams.get('claim');
          if (claimId && data.verified) {
            const claimDoc = await getDoc(doc(db, "claims", claimId));
            if (claimDoc.exists()) {
              setClaimData(claimDoc.data());
              setShowWillForm(true);
            } else {
              console.error("Claim not found");
            }
          } else if (!data.verified) {
            setShowIdentityVerification(true);
          } else if (!data.nominees || data.nominees.length === 0) {
            setShowNomineeForm(true);
          } else if (!data.willText) {
            setShowWillForm(true);
          } else if (!data.paymentComplete) {
            setShowWillForm(true);
          } else {
            setPaymentComplete(true);
          }
        } else {
          setShowRegistration(true);
        }
      }
    };

    if (isConnected) {
      checkUserExists();
    } else {
      // Reset all states when disconnected
      setShowRegistration(false);
      setShowIdentityVerification(false);
      setShowNomineeForm(false);
      setShowWillForm(false);
      setShowClaimMessage(false);
      setUserData(null);
      setNominees([]);
      setIsNewUser(true);
      setIsVerified(false);
      setPaymentComplete(false);
      setWillText('');
      setCheckInterval(1);
      setClaimData(null);
    }
  }, [isConnected, address, searchParams]);

  const handleRegistrationSubmit = async (formData: FormData) => {
    if (address) {
      await setDoc(doc(db, "users", address), formData);
      setUserData(formData);
      setShowRegistration(false);
      setShowIdentityVerification(true);
    }
  };

  const handleIdentityVerificationComplete = async () => {
    if (address) {
      const claimId = searchParams.get('claim');
      if (claimId) {
        await updateDoc(doc(db, "users", address), {
          verified: true,
          claimId: claimId
        });
        setShowClaimMessage(true);
      } else {
        await updateDoc(doc(db, "users", address), { verified: true });
        setShowNomineeForm(true);
      }
      setIsVerified(true);
      setShowIdentityVerification(false);
    }
  };

  const handleNomineeSubmit = async (updatedNominees: Nominee[]) => {
    if (address) {
      await updateDoc(doc(db, "users", address), { nominees: updatedNominees });
      setNominees(updatedNominees);
      setShowNomineeForm(false);
      setShowWillForm(true);
    }
  };

  const handleNomineeSkip = () => {
    setShowNomineeForm(false);
    setShowWillForm(true);
  };

  const handleWillSubmit = async (willText: string, checkInterval: number) => {
    if (address) {
      await updateDoc(doc(db, "users", address), {
        willText,
        checkInterval,
      });
      setWillText(willText);
      setCheckInterval(checkInterval);
    }
  };

  const handlePaymentComplete = async () => {
    if (address) {
      await updateDoc(doc(db, "users", address), { paymentComplete: true });
      setPaymentComplete(true);
      setShowWillForm(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-indigo-700">Pahal</h1>
            <p className="text-xl text-gray-700 mt-2">Secure your legacy, simplify your wishes</p>
          </div>
          <div className="wallet-container">
            <Wallet>
              <ConnectWallet>
                <ConnectWalletText>
                  Sign up / log in
                </ConnectWalletText>
                <Avatar className="h-6 w-6" />
                <Name className="text-gray-800" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl w-full mx-auto bg-white rounded-lg shadow-lg p-8">
          {!isConnected ? (
            <div className="text-center">
              <div className="w-1/3 mx-auto mb-8">
                <img 
                  src="/star.png" 
                  alt="Pahal Logo" 
                  className="w-full h-auto"
                />
              </div>
              <h2 className="text-4xl font-bold text-indigo-800 mb-4">Welcome to Pahal</h2>
              <p className='text-gray-700 text-lg mb-8'>
                Pahal simplifies the process of creating and managing your last will and testament. 
                Secure your legacy and ensure your wishes are respected.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-blue-100 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-indigo-800 mb-3">How We Determine User Status</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Regular check-ins: Users set a check-in interval (1-10 years)</li>
                    <li>Automated reminders: Email and SMS notifications sent before deadline</li>
                    <li>Grace period: Additional time allowed after missed check-in</li>
                    <li>Nominee verification: Trusted contacts can report user's status</li>
                    <li>Official records: Integration with death registries (where available)</li>
                  </ul>
                </div>
                <div className="bg-green-100 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-indigo-800 mb-3">How We Secure Your Data</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>End-to-end encryption: Your will is encrypted before storage</li>
                    <li>Decentralized storage: Data distributed across secure nodes</li>
                    <li>Multi-factor authentication: Required for accessing sensitive information</li>
                    <li>Regular security audits: Third-party experts review our systems</li>
                    <li>Limited access: Only verified nominees can claim wills</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-gray-700 text-lg mb-4">
                  To get started, please connect your wallet using the button in the top right corner.
                </p>
              </div>
            </div>
          ) : showRegistration ? (
            <RegistrationForm 
              onSubmit={handleRegistrationSubmit} 
              initialData={userData}
              title={isNewUser ? "Continue Your Registration" : "Update Your Information"}
            />
          ) : showIdentityVerification ? (
            <IdentityVerification
              onComplete={handleIdentityVerificationComplete}
              db={db}
              userAddress={address || ''}
            />
          ) : showClaimMessage ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Claim Submitted</h2>
              <p className="text-gray-700">
                Your claim has been submitted. We will contact you once the verification process is complete.
              </p>
            </div>
          ) : showNomineeForm ? (
            <NomineeForm
              onSubmit={handleNomineeSubmit}
              onSkip={handleNomineeSkip}
              initialNominees={nominees}
            />
          ) : showWillForm ? (
            <WillForm
              onSubmit={handleWillSubmit}
              onPaymentComplete={handlePaymentComplete}
              db={db}
              userAddress={address || ''}
              isExistingUser={!isNewUser}
              initialWillText={claimData ? claimData.willText : willText}
              initialCheckInterval={checkInterval}
              claimData={claimData}
            />
          ) : paymentComplete ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-green-600 mb-4">Process Complete!</h2>
              <p className="text-gray-700">
                Thank you for completing the process! You can now disconnect your wallet to log out.
              </p>
            </div>
          ) : (
            <p className="text-red-600 text-center">An error occurred. Please try again or contact support.</p>
          )}
        </div>
      </main>

      <footer className="bg-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-700">
          © 2023 Pahal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
