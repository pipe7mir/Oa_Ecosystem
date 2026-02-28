/**
 * Cloudinary Direct Upload Service
 * Uploads images directly from browser to Cloudinary, bypassing backend
 * 
 * Configure in Vercel Environment Variables:
 * - VITE_CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - VITE_CLOUDINARY_UPLOAD_PRESET: Unsigned upload preset name
 */

// Your Cloudinary credentials - update these with your actual values
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlls51qjo';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'oasis_unsigned';

/**
 * Upload a base64 image directly to Cloudinary
 * @param {string} base64Image - Base64 encoded image (with or without data URI prefix)
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export async function uploadToCloudinary(base64Image, folder = 'oasis-announcements') {
    try {
        // Validate configuration
        if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'demo') {
            throw new Error('Cloudinary Cloud Name not configured');
        }
        if (!CLOUDINARY_UPLOAD_PRESET) {
            throw new Error('Cloudinary Upload Preset not configured');
        }

        // Cloudinary upload URL - using YOUR cloud name
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        // Prepare form data for upload - ORDER MATTERS for some browsers
        const formData = new FormData();
        formData.append('file', base64Image);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        console.log('☁️ Uploading to Cloudinary...', {
            url: uploadUrl,
            cloud: CLOUDINARY_CLOUD_NAME,
            preset: CLOUDINARY_UPLOAD_PRESET,
            imageSize: (base64Image.length / 1024).toFixed(1) + 'KB'
        });

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Cloudinary upload failed:', data);
            throw new Error(data.error?.message || `Upload failed: ${response.status}`);
        }

        console.log('✅ Cloudinary upload success:', data.secure_url);

        return {
            success: true,
            imageUrl: data.secure_url,
            publicId: data.public_id
        };
    } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message || 'Upload failed'
        };
    }
}

/**
 * Convert a canvas to base64 and upload to Cloudinary
 * Optimized for quality with reasonable file size
 * @param {HTMLCanvasElement} canvas 
 * @param {number} maxWidth - Max width to scale down to (default: 1920 for HD quality)
 * @param {number} maxKB - Max file size in KB (default: 600 for good quality/size balance)
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export async function uploadCanvasToCloudinary(canvas, maxWidth = 1920, maxKB = 600) {
    try {
        // Scale canvas down only if larger than maxWidth
        const scale = Math.min(1, maxWidth / canvas.width);
        const compCanvas = document.createElement('canvas');
        compCanvas.width = Math.round(canvas.width * scale);
        compCanvas.height = Math.round(canvas.height * scale);
        const ctx = compCanvas.getContext('2d');
        
        // High quality image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, compCanvas.width, compCanvas.height);

        // Compress with better quality starting point
        let quality = 0.92;
        let base64 = compCanvas.toDataURL('image/jpeg', quality);
        
        // Gradually reduce quality only if file is too large
        while (base64.length > maxKB * 1024 * 1.37 && quality > 0.5) {
            quality = Math.max(0.5, quality - 0.05);
            base64 = compCanvas.toDataURL('image/jpeg', quality);
        }

        console.log('📸 Compressed image:', {
            width: compCanvas.width,
            height: compCanvas.height,
            quality: quality.toFixed(2),
            size: (base64.length / 1024).toFixed(1) + 'KB'
        });

        return await uploadToCloudinary(base64);
    } catch (error) {
        console.error('❌ Canvas upload error:', error);
        return {
            success: false,
            error: error.message || 'Canvas upload failed'
        };
    }
}

export default { uploadToCloudinary, uploadCanvasToCloudinary };
