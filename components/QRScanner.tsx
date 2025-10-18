import React, { useEffect, useRef, useState } from 'react';
import { PlusIcon } from './Icons';

// Declare Html5Qrcode for TypeScript since it's loaded from a CDN
declare var Html5Qrcode: any;

type PermissionState = 'idle' | 'pending' | 'granted' | 'denied';

const QRScanner: React.FC = () => {
  const scannerRef = useRef<any>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const [permission, setPermission] = useState<PermissionState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This single effect handles the entire scanner lifecycle:
    // permission request, initialization, and cleanup.
    if (!readerRef.current) {
        return;
    }

    // Ensure this runs only once.
    if (scannerRef.current) {
        return;
    }

    setPermission('pending');

    const html5QrCode = new Html5Qrcode(readerRef.current.id, /* verbose= */ false);
    scannerRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText: string) => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
      try {
        const url = new URL(decodedText);
        if (url.hash.startsWith('#/view/')) {
          window.location.hash = url.hash;
          return;
        }
      } catch (e) {
        if (decodedText.startsWith('ar-item-')) {
          window.location.hash = `#/view/${decodedText}`;
          return;
        }
      }
      // This alert is a fallback for invalid QR codes.
      // Consider a more integrated UI element if this happens often.
      alert('QR Code ไม่ถูกต้อง');
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    // The start method will internally ask for camera permissions.
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      undefined // Optional error callback, we use .catch() instead
    ).then(() => {
        setPermission('granted');
    }).catch((err: any) => {
        console.error("Could not start scanner.", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError("คุณต้องอนุญาตให้เข้าถึงกล้องเพื่อสแกน QR Code");
        } else if (err.message && err.message.toLowerCase().includes('could not start video source')) {
            setError("ไม่สามารถเริ่มการทำงานของกล้องได้ โปรดตรวจสอบว่าไม่มีแอปอื่นใช้งานอยู่แล้วลองอีกครั้ง");
        }
        else {
            setError("เกิดข้อผิดพลาดในการเข้าถึงกล้อง");
        }
        setPermission('denied');
    });

    return () => {
      // Cleanup function to stop the scanner when the component unmounts.
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch((err: any) => {
          console.error("Failed to stop QR scanner on cleanup.", err);
        });
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount.


  const onGoToManage = () => {
    window.location.hash = '#/admin';
  };

  const renderScannerContent = () => {
    switch (permission) {
      case 'granted':
        return (
          <div className="relative w-full h-full bg-black">
            <div id="qr-reader" ref={readerRef} className="w-full h-full"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[250px] h-[250px] border-4 border-cyan-400/50 rounded-lg shadow-lg animate-pulse"></div>
            </div>
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-gray-900/80 to-transparent">
              <p className="text-center text-lg font-semibold text-white pt-12 sm:pt-4">เล็งกล้องไปที่ QR Code</p>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-lg">กำลังขออนุญาตใช้กล้อง...</p>
            <p className="text-sm text-gray-400 mt-2">โปรดอนุญาตในหน้าต่างที่ปรากฏขึ้น</p>
          </div>
        );
      case 'denied':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <p className="text-lg text-red-400 font-semibold">ไม่สามารถเข้าถึงกล้องได้</p>
            {error && <p className="text-gray-300 mt-2">{error}</p>}
            <p className="text-sm text-gray-500 mt-4">คุณอาจต้องไปที่การตั้งค่าเบราว์เซอร์เพื่อเปิดใช้งานการอนุญาตสำหรับเว็บไซต์นี้</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            >
                ลองอีกครั้ง
            </button>
          </div>
        );
      default:
        // 'idle' state, can show a brief loading or just be blank before 'pending'
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-30 flex flex-col items-center justify-center">
      <button
        onClick={onGoToManage}
        className="absolute top-4 left-4 z-50 p-3 bg-gray-800/60 backdrop-blur-sm text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200"
        aria-label="Admin Dashboard"
      >
        <PlusIcon />
      </button>
      {renderScannerContent()}
    </div>
  );
};

export default QRScanner;
