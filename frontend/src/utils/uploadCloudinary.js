/* eslint-disable */
import axios from 'axios';

const CLOUD_NAME = 'e6l5x5yz';
const UPLOAD_PRESET = 'house_rent';

// 🚀 تصویر کو 1 سیکنڈ میں چھوٹا کرنے والا ٹول (8MB -> 200KB)
const compressImage = (file) => {
  return new Promise((resolve) => {
    // اگر ویڈیو ہو تو اسے کمپریس نہ کرے
    if (!file.type.startsWith('image/')) return resolve(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // ایچ ڈی سائز
        const scaleSize = MAX_WIDTH / img.width;
        const width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        const height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.75 // 75% کوالٹی (دیکھنے میں بالکل اصلی رہے گی)
        );
      };
    };
  });
};

// کلاؤڈ اپلوڈ فنکشن مع لائیو پروگریس
export const uploadToCloudinary = async (file, resourceType = 'auto', onProgress = null) => {
  // پہلے فائل کو چھوٹا اور تیز بنائیں
  const fileToUpload = await compressImage(file);

  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      }
    );
    return res.data.secure_url;
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error('Cloudinary upload error:', errorMsg);
    throw new Error(errorMsg);
  }
};