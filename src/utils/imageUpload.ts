/**
 * Image Processing Utility for User Profile Photos
 * Crops and compresses any uploaded image to a crisp 200x200 square WebP/JPEG data URL
 * so it loads instantaneously and syncs cleanly across all players in real time.
 */
export function processProfileImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Faqat rasm faylini tanlang!'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const size = 200;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Center crop to square
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Rasmni o‘qishda xatolik yuz berdi'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Faylni o‘qib bo‘lmadi'));
    reader.readAsDataURL(file);
  });
}
