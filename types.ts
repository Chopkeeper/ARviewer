export interface ContentItem {
  id: string;
  name: string;
  // URL ที่ชี้ไปยังไฟล์โมเดลที่อยู่บน Server
  modelDataUrl: string; 
  // URL ที่ชี้ไปยังไฟล์เสียงที่อยู่บน Server
  audioDataUrl: string; 
  // URL ของรูปภาพ QR Code ที่ถูกสร้างและเก็บไว้
  qrCodeUrl: string;    
}
