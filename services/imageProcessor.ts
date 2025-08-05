import { EditParams, Resolution } from "../types";

const EXPORT_TYPE = 'image/jpeg';
const RESOLUTIONS = {
  standard: { width: 1080, height: 1080, quality: 0.90, label: '1080x1080' },
  high: { width: 3000, height: 3000, quality: 0.95, label: '3000x3000' },
};

type ImageAndParams = {
    img: HTMLImageElement;
    params: EditParams;
} | null;

const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

const getFilename = (originalName: string, resolution: Resolution) => {
    const name = originalName.split('.').slice(0, -1).join('.') || 'image';
    const resLabel = RESOLUTIONS[resolution].label;
    return `facebook_${name}_${resLabel}.jpg`;
};

const applyFiltersToImageData = (imageData: ImageData, params: EditParams) => {
    const data = imageData.data;
    const { brightness, contrast, saturation, highlights, sharpness } = params;
    
    // Convert parameters to usable values
    const brightnessValue = brightness / 100;
    const contrastValue = (contrast + 100) / 100;
    const saturationValue = (saturation + 100) / 100;
    const highlightsValue = highlights / 100;
    const sharpnessValue = sharpness / 100;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Apply brightness
        if (brightness !== 0) {
            r += brightnessValue * 255;
            g += brightnessValue * 255;
            b += brightnessValue * 255;
        }
        
        // Apply contrast
        if (contrast !== 0) {
            r = ((r / 255 - 0.5) * contrastValue + 0.5) * 255;
            g = ((g / 255 - 0.5) * contrastValue + 0.5) * 255;
            b = ((b / 255 - 0.5) * contrastValue + 0.5) * 255;
        }
        
        // Apply saturation
        if (saturation !== 0) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = gray + (r - gray) * saturationValue;
            g = gray + (g - gray) * saturationValue;
            b = gray + (b - gray) * saturationValue;
        }
        
        // Apply highlights (brighten lighter areas more)
        if (highlights !== 0) {
            const luminance = (r + g + b) / 3;
            const factor = (luminance / 255) * highlightsValue;
            r += factor * 255;
            g += factor * 255;
            b += factor * 255;
        }
        
        // Apply sharpness (enhance contrast in mid-tones)
        if (sharpness !== 0) {
            const luminance = (r + g + b) / 3;
            if (luminance > 64 && luminance < 192) {
                const factor = 1 + sharpnessValue;
                r = ((r / 255 - 0.5) * factor + 0.5) * 255;
                g = ((g / 255 - 0.5) * factor + 0.5) * 255;
                b = ((b / 255 - 0.5) * factor + 0.5) * 255;
            }
        }
        
        // Clamp values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }
    
    return imageData;
};


const drawImageToCanvas = (
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement,
    params: EditParams,
    dx: number, dy: number, dWidth: number, dHeight: number
) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dWidth, dHeight);
    ctx.clip();
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = 'white';
    ctx.fillRect(dx, dy, dWidth, dHeight);

    const { zoom, x, y, brightness, contrast, saturation, shadows, sharpness } = params;
    
    // We'll apply filters after drawing the image using ImageData for better compatibility
    
    const hRatio = dWidth / img.width;
    const vRatio = dHeight / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const finalZoom = zoom * ratio;
    
    // The x/y panning values are based on the preview canvas size,
    // so we need to scale them up to match the export resolution.
    // Assuming preview is a fraction of the standard resolution. Let's say ~300px wide.
    // Standard canvas is 1080. A simple ratio should work.
    const exportWidth = dWidth;
    const previewWidth = 300; // An approximation of the on-screen canvas editor width.
    const scaleFactor = exportWidth / previewWidth;


    const centerX = dx + dWidth / 2;
    const centerY = dy + dHeight / 2;
    
    ctx.translate(centerX + x * scaleFactor, centerY + y * scaleFactor);
    ctx.scale(finalZoom, finalZoom);
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    
    ctx.restore();
    
    // Apply filters using ImageData if any filters are active
    const hasFilters = brightness !== 0 || contrast !== 0 || saturation !== 0 || 
                      params.highlights !== 0 || sharpness !== 0;
    
    if (hasFilters) {
        // Create temporary canvas for the image region
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = dWidth;
        tempCanvas.height = dHeight;
        const tempCtx = tempCanvas.getContext('2d')!;
        
        // Draw the image region to temp canvas
        tempCtx.save();
        tempCtx.translate(dWidth / 2, dHeight / 2);
        tempCtx.translate(x * scaleFactor, y * scaleFactor);
        tempCtx.scale(finalZoom, finalZoom);
        tempCtx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
        tempCtx.restore();
        
        // Get image data from temp canvas
        const imageData = tempCtx.getImageData(0, 0, dWidth, dHeight);
        
        // Apply filters to the image data
        const filteredImageData = applyFiltersToImageData(imageData, params);
        
        // Put filtered image data back to temp canvas
        tempCtx.putImageData(filteredImageData, 0, 0);
        
        // Draw the filtered result to main canvas
        ctx.drawImage(tempCanvas, dx, dy);
    }
};

export const exportStandardImage = async (img: HTMLImageElement, params: EditParams, originalName: string, resolution: Resolution): Promise<void> => {
    const blob = await generateStandardImageBlob(img, params, resolution);
    if(blob) {
        triggerDownload(blob, getFilename(originalName, resolution));
    }
}

export const exportCoverImage = async (
    topImage: ImageAndParams,
    bottomLeftImage: ImageAndParams,
    bottomRightImage: ImageAndParams,
    originalName: string,
    resolution: Resolution
): Promise<void> => {
    const blob = await generateCoverImageBlob(topImage, bottomLeftImage, bottomRightImage, resolution);
    if (blob) {
        triggerDownload(blob, getFilename(originalName, resolution));
    }
};

const generateBlob = (canvas: HTMLCanvasElement, resolution: Resolution): Promise<Blob | null> => {
    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), EXPORT_TYPE, RESOLUTIONS[resolution].quality);
    });
};

export const generateStandardImageBlob = (imgElement: HTMLImageElement, params: EditParams, resolution: Resolution): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const resConfig = RESOLUTIONS[resolution];
    canvas.width = resConfig.width;
    canvas.height = resConfig.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);
    drawImageToCanvas(ctx, imgElement, params, 0, 0, resConfig.width, resConfig.height);
    return generateBlob(canvas, resolution);
}

export const generateCoverImageBlob = (
    topImage: ImageAndParams,
    bottomLeftImage: ImageAndParams,
    bottomRightImage: ImageAndParams,
    resolution: Resolution
): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const resConfig = RESOLUTIONS[resolution];
    canvas.width = resConfig.width;
    canvas.height = resConfig.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const TOP_HEIGHT_RATIO = 696 / 1080;
    const TOTAL_WIDTH = resConfig.width;
    const TOP_HEIGHT = Math.round(resConfig.height * TOP_HEIGHT_RATIO);
    const BOTTOM_HEIGHT = resConfig.height - TOP_HEIGHT;
    const HALF_WIDTH = Math.round(TOTAL_WIDTH / 2);

    if (topImage) {
        drawImageToCanvas(ctx, topImage.img, topImage.params, 0, 0, TOTAL_WIDTH, TOP_HEIGHT);
    }
    if (bottomLeftImage) {
        drawImageToCanvas(ctx, bottomLeftImage.img, bottomLeftImage.params, 0, TOP_HEIGHT, HALF_WIDTH, BOTTOM_HEIGHT);
    }
    if (bottomRightImage) {
        drawImageToCanvas(ctx, bottomRightImage.img, bottomRightImage.params, HALF_WIDTH, TOP_HEIGHT, TOTAL_WIDTH - HALF_WIDTH, BOTTOM_HEIGHT);
    }

    return generateBlob(canvas, resolution);
};