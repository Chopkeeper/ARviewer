import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ContentItem } from '../types';
import { api } from '../api';
import { PlusIcon, TrashIcon, File3DIcon, MusicIcon, LogoIcon, LogoutIcon, HomeIcon } from './Icons';

declare var QRCode: any;

// Helper นี้ไม่จำเป็นแล้วถ้าไฟล์ถูกจัดการโดย API แต่เก็บไว้สำหรับการแสดงผลชื่อไฟล์
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const modelInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const fetchedItems = await api.getContentItems();
    setItems(fetchedItems);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddClick = async () => {
    if (!modelFile || !audioFile) {
      setError('กรุณาเลือกทั้งไฟล์โมเดล 3D และไฟล์เสียง');
      return;
    }
    setError('');
    setIsUploading(true);

    // หมายเหตุ: ในสถาปัตยกรรมที่สมบูรณ์, ID และ QR Code ควรถูกสร้างโดย Backend
    // แต่เพื่อความเรียบง่าย เรายังคงสร้างที่ Frontend ก่อนส่งไป
    const id = `ar-item-${Date.now()}`;
    const urlToEncode = `${window.location.origin}${window.location.pathname}#/view/${id}`;

    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, urlToEncode, { width: 256, margin: 1 }, async (err: any) => {
      if (err) {
        console.error(err);
        setError('เกิดข้อผิดพลาดในการสร้าง QR Code');
        setIsUploading(false);
        return;
      }
      
      const qrCodeUrl = canvas.toDataURL();
      const itemName = modelFile.name.replace(/\.[^/.]+$/, '');

      // ตอนนี้เรียกใช้ api.addContentItem เวอร์ชันใหม่
      const newItem = await api.addContentItem(itemName, modelFile, audioFile, qrCodeUrl);

      setIsUploading(false);
      if (newItem) {
        // เมื่อสำเร็จ, ดึงข้อมูลทั้งหมดมาใหม่เพื่อความแน่นอน
        fetchItems(); 

        // เคลียร์ฟอร์ม
        setModelFile(null);
        setAudioFile(null);
        if (modelInputRef.current) modelInputRef.current.value = '';
        if (audioInputRef.current) audioInputRef.current.value = '';
      } else {
        setError('เกิดข้อผิดพลาดในการอัปโหลดไฟล์ไปยังเซิร์ฟเวอร์');
      }
    });
  };

  const handleDeleteContent = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      await api.deleteContentItem(id);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    }
  };

  const FileInput = useCallback(({ label, icon, accept, file, onChange, inputRef }: { label: string, icon: React.ReactNode, accept: string, file: File | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, inputRef: React.RefObject<HTMLInputElement> }) => (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="file" accept={accept} onChange={onChange} ref={inputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className="flex items-center justify-center p-3 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800 hover:border-indigo-500 hover:bg-gray-700 transition-colors">
          {icon}
          <span className={`ml-2 truncate ${file ? 'text-cyan-400' : 'text-gray-500'}`}>{file ? file.name : 'เลือกไฟล์...'}</span>
        </div>
      </div>
    </div>
  ), []);

  return (
    <div className="fixed inset-0 bg-gray-900 z-40 overflow-y-auto">
      <header className="sticky top-0 bg-gray-900/80 backdrop-blur-md z-10 w-full flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center">
          <LogoIcon />
          <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 ml-3">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
            <a href="#/" className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors" aria-label="Go to Scanner">
                <HomeIcon />
            </a>
            <button onClick={onLogout} className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors" aria-label="Logout">
                <LogoutIcon />
            </button>
        </div>
      </header>
      <div className="w-full max-w-5xl p-4 mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">เพิ่มเนื้อหา AR ใหม่</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <FileInput label="ไฟล์โมเดล 3D (.glb)" icon={<File3DIcon />} accept=".glb" file={modelFile} onChange={(e) => setModelFile(e.target.files ? e.target.files[0] : null)} inputRef={modelInputRef} />
            <FileInput label="ไฟล์เสียง (.mp3)" icon={<MusicIcon />} accept=".mp3" file={audioFile} onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)} inputRef={audioInputRef} />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={handleAddClick} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={!modelFile || !audioFile || isUploading}>
            {isUploading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังอัปโหลด...</span>
                </>
            ) : (
                <>
                    <PlusIcon />
                    <span className="ml-2">เพิ่มเนื้อหา</span>
                </>
            )}
          </button>
        </div>
        <h2 className="text-xl font-semibold text-white mb-4">คอลเลกชันของคุณ</h2>
        {isLoading ? (
            <div className="text-center py-10"><p className="text-gray-500">กำลังโหลดข้อมูล...</p></div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-500">ยังไม่มีเนื้อหา AR</p>
            <p className="text-gray-600 text-sm">เพิ่มไฟล์โมเดลและไฟล์เสียงด้านบนเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700 flex flex-col items-center group relative overflow-hidden">
                <img src={item.qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-md bg-white p-2" />
                <div className="text-center mt-3">
                  <p className="font-bold text-lg text-white truncate w-full" title={item.name}>{item.name}</p>
                </div>
                <button onClick={() => handleDeleteContent(item.id)} className="absolute top-2 right-2 p-2 bg-red-600/50 text-white rounded-full opacity-0 group-hover:opacity-100 translate-x-12 group-hover:translate-x-0 transition-all duration-300 hover:bg-red-600" aria-label="Delete item">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
