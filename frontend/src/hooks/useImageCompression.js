import imageCompression from 'browser-image-compression';

/**
 * Hook para comprimir imágenes en el navegador antes de enviarlas
 * Útil para resolver Error 413 (Request Entity Too Large) sin sobrecargar servidor
 * 
 * Estrategia:
 * 1. Detecta tamaño original
 * 2. Comprime agresivamente si > 500KB
 * 3. Redimensiona a máximo 1280x720 (suficiente para Hero carousel)
 * 4. Convierte a Base64 optimizado
 * 5. Retorna objeto con metadatos para debugging
 */
export const useImageCompression = () => {
  const compressImage = async (file, options = {}) => {
    const {
      maxSizeMB = 0.9,           // Máximo 900KB después de compresión
      maxWidthOrHeight = 1280,   // Dimensión máxima
      initialQuality = 0.8,      // Calidad JPEG inicial
      useWebWorker = true,       // Usar Web Worker para no bloquear UI
    } = options;

    try {
      const originalSize = file.size;
      console.log(`📸 Imagen original: ${(originalSize / 1024).toFixed(1)}KB`);

      // Comprimir usando librería
      const compressedFile = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker,
        initialQuality,
        alwaysKeepResolution: false,
        fileType: 'image/jpeg',
      });

      const compressedSize = compressedFile.size;
      console.log(`🗜️ Imagen comprimida: ${(compressedSize / 1024).toFixed(1)}KB (reducción: ${(100 - (compressedSize / originalSize * 100)).toFixed(0)}%)`);

      // Convertir a Base64
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result;
          resolve({
            success: true,
            base64,
            originalSizeKB: (originalSize / 1024).toFixed(1),
            compressedSizeKB: (compressedSize / 1024).toFixed(1),
            reductionPercent: (100 - (compressedSize / originalSize * 100)).toFixed(0),
            mimeType: compressedFile.type,
          });
        };

        reader.onerror = () => {
          reject(new Error('Error al leer archivo comprimido'));
        };

        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error('❌ Error comprimiendo imagen:', error);
      throw error;
    }
  };

  /**
   * Valida que la imagen pueda ser enviada sin problemas
   */
  const validateCompressedImage = (base64String) => {
    const sizeInKB = base64String.length / 1024;
    const maxAllowedKB = 950; // 1MB menos buffer

    if (sizeInKB > maxAllowedKB) {
      console.warn(`⚠️ Imagen aún muy grande: ${sizeInKB.toFixed(1)}KB (máximo recomendado: ${maxAllowedKB}KB)`);
      return {
        valid: false,
        reason: `Imagen aún es muy grande (${sizeInKB.toFixed(1)}KB > ${maxAllowedKB}KB)`,
        sizeKB: sizeInKB,
      };
    }

    return {
      valid: true,
      sizeKB: sizeInKB,
    };
  };

  return {
    compressImage,
    validateCompressedImage,
  };
};

export default useImageCompression;
