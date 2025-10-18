import React, { useState, useEffect } from 'react';
import { ContentItem } from '../types';
import { api } from '../api';
import { CloseIcon } from './Icons';

// FIX: Add TypeScript definitions for the <model-viewer> custom element.
// This resolves the error "Property 'model-viewer' does not exist on type 'JSX.IntrinsicElements'"
// by augmenting the global JSX namespace to include the custom element and its properties.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        // FIX: Use camelCase for properties with hyphens when using custom elements in React.
        arModes?: string;
        cameraControls?: boolean;
        autoRotate?: boolean;
        iosSrc?: string;
      }, HTMLElement>;
    }
  }
}

interface ARViewerProps {
  itemId: string;
}

const ARViewer: React.FC<ARViewerProps> = ({ itemId }) => {
  const [item, setItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedItem = await api.getContentItem(itemId);
        if (fetchedItem) {
          setItem(fetchedItem);
        } else {
          setError('ไม่พบเนื้อหาสำหรับ QR code นี้');
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        console.error(err);
      }
    };
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const onClose = () => {
    window.location.hash = '#/';
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button onClick={onClose} className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200">
                <CloseIcon />
                <span className="ml-2">กลับไปที่สแกนเนอร์</span>
            </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
            <div className="text-white text-lg">กำลังโหลดโมเดล...</div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
      <div className="relative w-full h-full max-w-3xl max-h-[80vh] bg-gray-800 rounded-xl shadow-2xl border border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white text-center truncate">{item.name}</h2>
        </div>
        <div className="flex-grow w-full h-full min-h-0">
          {/* FIX: Use camelCase for properties with hyphens when using custom elements in React. */}
          <model-viewer
            src={item.modelDataUrl}
            iosSrc=""
            ar
            arModes="webxr scene-viewer quick-look"
            cameraControls
            autoRotate
            alt={`3D model of ${item.name}`}
          ></model-viewer>
        </div>
        <audio src={item.audioDataUrl} autoPlay loop controls className="w-full p-2 bg-gray-700/50"></audio>
      </div>
      <button
        onClick={onClose}
        className="mt-6 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200"
      >
        <CloseIcon />
        <span className="ml-2">กลับไปที่สแกนเนอร์</span>
      </button>
    </div>
  );
};

export default ARViewer;