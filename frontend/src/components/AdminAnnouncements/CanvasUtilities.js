/**
 * Utilidades para operaciones de canvas y composición de imágenes
 */

/**
 * Convierte un canvas a una cadena base64
 * @param {HTMLCanvasElement} canvas - Canvas a convertir
 * @returns {string} - Data URL en formato base64
 */
export const canvasToBase64 = (canvas) => {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error('Canvas inválido');
    return null;
  }
  try {
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error al convertir canvas a base64:', error);
    return null;
  }
};

/**
 * Carga una imagen de forma asincrónica
 * @param {string} url - URL de la imagen
 * @returns {Promise<HTMLImageElement>} - Imagen cargada
 */
export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('URL de imagen no proporcionada'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Error al cargar imagen: ${url}`));
    img.src = url;
  });
};

/**
 * Combina múltiples elementos en un canvas más grande
 * @param {Object} params - Parámetros de composición
 * @param {HTMLCanvasElement} params.mainCanvas - Canvas principal (anuncio)
 * @param {HTMLCanvasElement} params.logoCanvas - Canvas del logo
 * @param {string} params.logoPosition - Posición del logo (top-left, top-right, etc)
 * @param {number} params.padding - Padding entre elementos
 * @returns {HTMLCanvasElement} - Canvas compuesto
 */
export const composeCanvas = ({
  mainCanvas,
  logoCanvas,
  logoPosition = 'top-right',
  padding = 10,
}) => {
  if (!mainCanvas || !(mainCanvas instanceof HTMLCanvasElement)) {
    console.error('Canvas principal inválido');
    return mainCanvas;
  }

  if (!logoCanvas || !(logoCanvas instanceof HTMLCanvasElement)) {
    console.warn('Canvas del logo inválido, retornando canvas principal');
    return mainCanvas;
  }

  const composedCanvas = document.createElement('canvas');
  composedCanvas.width = mainCanvas.width;
  composedCanvas.height = mainCanvas.height;

  const ctx = composedCanvas.getContext('2d');

  // Dibujar el canvas principal
  ctx.drawImage(mainCanvas, 0, 0);

  // Calcular posición del logo
  let logoX = padding;
  let logoY = padding;

  const logoWidth = logoCanvas.width;
  const logoHeight = logoCanvas.height;

  switch (logoPosition) {
    case 'top-right':
      logoX = mainCanvas.width - logoWidth - padding;
      logoY = padding;
      break;
    case 'bottom-left':
      logoX = padding;
      logoY = mainCanvas.height - logoHeight - padding;
      break;
    case 'bottom-right':
      logoX = mainCanvas.width - logoWidth - padding;
      logoY = mainCanvas.height - logoHeight - padding;
      break;
    case 'center':
      logoX = (mainCanvas.width - logoWidth) / 2;
      logoY = (mainCanvas.height - logoHeight) / 2;
      break;
    case 'top-left':
    default:
      logoX = padding;
      logoY = padding;
  }

  // Dibujar el logo
  ctx.drawImage(logoCanvas, logoX, logoY, logoWidth, logoHeight);

  return composedCanvas;
};

/**
 * Redimensiona un canvas manteniendo proporción
 * @param {HTMLCanvasElement} canvas - Canvas a redimensionar
 * @param {number} maxWidth - Ancho máximo
 * @param {number} maxHeight - Altura máxima
 * @returns {HTMLCanvasElement} - Canvas redimensionado
 */
export const resizeCanvas = (canvas, maxWidth, maxHeight) => {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error('Canvas inválido');
    return canvas;
  }

  let width = canvas.width;
  let height = canvas.height;

  // Calcular nueva dimensión manteniendo proporción
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }

  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = width;
  resizedCanvas.height = height;

  const ctx = resizedCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0, width, height);

  return resizedCanvas;
};

/**
 * Aplica un filtro (blur, grayscale, sepia) a un canvas
 * @param {HTMLCanvasElement} canvas - Canvas a filtrar
 * @param {string} filterType - Tipo de filtro (blur, grayscale, sepia, brightness)
 * @param {number} value - Valor del filtro (0-100)
 * @returns {HTMLCanvasElement} - Canvas con filtro aplicado
 */
export const applyCanvasFilter = (canvas, filterType = 'none', value = 0) => {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error('Canvas inválido');
    return canvas;
  }

  const filteredCanvas = document.createElement('canvas');
  filteredCanvas.width = canvas.width;
  filteredCanvas.height = canvas.height;

  const ctx = filteredCanvas.getContext('2d');

  // Aplicar el filtro correspondiente
  switch (filterType) {
    case 'blur':
      ctx.filter = `blur(${value}px)`;
      break;
    case 'grayscale':
      ctx.filter = `grayscale(${value}%)`;
      break;
    case 'sepia':
      ctx.filter = `sepia(${value}%)`;
      break;
    case 'brightness':
      ctx.filter = `brightness(${value}%)`;
      break;
    case 'contrast':
      ctx.filter = `contrast(${value}%)`;
      break;
    case 'saturate':
      ctx.filter = `saturate(${value}%)`;
      break;
    default:
      ctx.filter = 'none';
  }

  ctx.drawImage(canvas, 0, 0);

  return filteredCanvas;
};

/**
 * Exporta un canvas como imagen
 * @param {HTMLCanvasElement} canvas - Canvas a exportar
 * @param {string} filename - Nombre del archivo
 * @param {string} format - Formato de imagen (png, jpeg)
 */
export const exportCanvasAsImage = (canvas, filename = 'announcement', format = 'png') => {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error('Canvas inválido');
    return;
  }

  try {
    const link = document.createElement('a');
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    link.href = canvas.toDataURL(mimeType, 0.95);
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al exportar canvas:', error);
  }
};

/**
 * Crea un canvas con un gradiente de fondo
 * @param {number} width - Ancho del canvas
 * @param {number} height - Altura del canvas
 * @param {string} gradient - CSS gradient string
 * @returns {HTMLCanvasElement} - Canvas con gradiente
 */
export const createGradientCanvas = (width, height, gradient) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // Parsear el gradiente CSS y aplicarlo
  if (gradient && gradient.includes('linear-gradient')) {
    // Extraer colores del gradiente lineal
    const colorsMatch = gradient.match(/#[A-Fa-f0-9]{6}|rgba?\([^)]+\)/g);
    if (colorsMatch && colorsMatch.length >= 2) {
      const linearGradient = ctx.createLinearGradient(0, 0, width, height);
      linearGradient.addColorStop(0, colorsMatch[0]);
      linearGradient.addColorStop(1, colorsMatch[colorsMatch.length - 1]);
      ctx.fillStyle = linearGradient;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (gradient) {
    // Color sólido
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas;
};

/**
 * Obtiene el ancho y alto óptimos para un canvas
 * @param {number} containerWidth - Ancho del contenedor
 * @param {number} containerHeight - Altura del contenedor
 * @param {number} aspectRatio - Relación de aspecto deseada (ancho/alto)
 * @returns {Object} - Ancho y alto calculados
 */
export const calculateOptimalDimensions = (
  containerWidth,
  containerHeight,
  aspectRatio = 16 / 9
) => {
  let width = containerWidth;
  let height = containerHeight;

  if (width / height > aspectRatio) {
    width = Math.round(height * aspectRatio);
  } else {
    height = Math.round(width / aspectRatio);
  }

  return { width, height };
};

/**
 * Rota un canvas 90 grados
 * @param {HTMLCanvasElement} canvas - Canvas a rotar
 * @param {number} times - Número de rotaciones de 90 grados (1-3)
 * @returns {HTMLCanvasElement} - Canvas rotado
 */
export const rotateCanvas = (canvas, times = 1) => {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error('Canvas inválido');
    return canvas;
  }

  const rotations = Math.max(1, Math.min(3, times));
  let rotatedCanvas = canvas;

  for (let i = 0; i < rotations; i++) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rotatedCanvas.height;
    tempCanvas.height = rotatedCanvas.width;

    const ctx = tempCanvas.getContext('2d');
    ctx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    ctx.rotate((Math.PI / 2) * 1);
    ctx.drawImage(rotatedCanvas, -rotatedCanvas.width / 2, -rotatedCanvas.height / 2);

    rotatedCanvas = tempCanvas;
  }

  return rotatedCanvas;
};

/**
 * Aplica esquinas redondeadas a un canvas
 * @param {HTMLCanvasElement} canvas - Canvas a modificar
 * @param {number} radius - Radio de las esquinas
 * @returns {HTMLCanvasElement} - Canvas con esquinas redondeadas
 */
export const roundCanvasCorners = (canvas, radius = 10) => {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error('Canvas inválido');
    return canvas;
  }

  const roundedCanvas = document.createElement('canvas');
  roundedCanvas.width = canvas.width;
  roundedCanvas.height = canvas.height;

  const ctx = roundedCanvas.getContext('2d');

  // Dibujar rectángulo con esquinas redondeadas
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(canvas.width - radius, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
  ctx.lineTo(canvas.width, canvas.height - radius);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
  ctx.lineTo(radius, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  ctx.fillStyle = 'white';
  ctx.fill();

  // Dibujar la imagen dentro del área redondeada
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(canvas.width - radius, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
  ctx.lineTo(canvas.width, canvas.height - radius);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
  ctx.lineTo(radius, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(canvas, 0, 0);
  ctx.restore();

  return roundedCanvas;
};
