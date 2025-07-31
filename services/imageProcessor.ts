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
    
    // Apply CSS filters to the canvas context
    const filters = [
        `brightness(${100 + brightness}%)`,
        `contrast(${100 + contrast}%)`,
        `saturate(${100 + saturation}%)`,
        `drop-shadow(0 0 ${Math.abs(shadows)}px rgba(0,0,0,${shadows < 0 ? 0.5 : 0}))`,
        sharpness !== 0 ? `contrast(${100 + sharpness * 0.5}%)` : ''
    ].filter(Boolean).join(' ');
    
    ctx.filter = filters;
    
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