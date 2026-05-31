'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client'; // استخدام ملف الكلاينت الخاص بك

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void; // دالة لترسل الروابط للفورم الرئيسي
  existingImages?: string[];
}

export default function ImageUpload({ onImagesUploaded, existingImages = [] }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const files = Array.from(event.target.files);
      const uploadedUrls: string[] = [...images];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        // اسم فريد يعتمد على الوقت العشوائي
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // 1. الرفع إلى سوبابيز ستورج مباشرة من المتصفح
        const { error: uploadError } = await supabase.storage
          .from('Mahally Images') // تأكد من مطابقة الاسم تماماً
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. جلب الرابط العام للملف المرفوع
        const { data } = supabase.storage
          .from('Mahally Images')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      setImages(uploadedUrls);
      onImagesUploaded(uploadedUrls); // نرسل الروابط للفورم الأب (Parent Form)

    } catch (error: any) {
      alert('خطأ أثناء رفع الصور: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  return (
    <div className="space-y-4 w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        صور المنتج
      </label>
      
      {/* شبكة لعرض الصور المرفوعة مسبقاً ومعاينتها مع زر حذف */}
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square border rounded-lg overflow-hidden bg-gray-50">
            <img src={url} alt="Product" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}

        {/* خانة الرفع (تظهر دائماً لإضافة المزيد) */}
        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
          <span className="text-2xl text-gray-400">{uploading ? '⏳' : '+'}</span>
          <span className="text-xs text-gray-500 mt-1">{uploading ? 'جاري الرفع...' : 'أضف صورة'}</span>
          <input
            type="file"
            accept="image/*"
            multiple // السماح برفع أكثر من صورة معاً
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}