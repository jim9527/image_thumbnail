import fs from 'node:fs'
import imageSize from "image-size";
import sharp, { FitEnum, OutputOptions } from 'sharp'
import { type fromUriParameter, type fromPathParameter, type fromBase64Parameter, type convertParameter } from "./types";
const DEFAULT_PERCENTAGE = 10;

const getDimensions = (imageBuffer: Buffer, percentageOfImage: number, dimensions: {
    width?: number,
    height?: number
}): { width: number, height: number } | null => {
    if (typeof dimensions.width === 'number' && typeof dimensions.height === 'number') {
        return {
            width: dimensions.width,
            height: dimensions.height
        }
    }

    const originalDimensions = imageSize(imageBuffer);

    if (originalDimensions?.width && originalDimensions?.height) {
        const width = parseInt((originalDimensions?.width * (percentageOfImage / 100)).toFixed(0));
        const height = parseInt((originalDimensions?.height * (percentageOfImage / 100)).toFixed(0));
        console.log(width, 'x',height)
        return { width, height };
    }

    return null
}

const sharpResize = (imageBuffer: Buffer, dimensions: { width: number, height: number }, format: 'png' | 'webp' | 'jpeg' = 'jpeg', quality?: number, fit?: keyof FitEnum, options: OutputOptions = {}): sharp.Sharp => {
    let sharpObject = sharp(imageBuffer)
        .resize({
            ...dimensions,
            withoutEnlargement: true,
            fit: fit ? fit : 'contain',
        }).withMetadata()
    switch (format) {
        case 'png':
            sharpObject = sharpObject.png({ ...options, quality })
            break
        case 'jpeg':
            sharpObject = sharpObject.jpeg({ ...options, quality })
            break
        case 'webp':
            sharpObject = sharpObject.webp({ ...options, quality })
            break
    }

    return sharpObject
};

const fromUri = async ({
    url,
    percentage = DEFAULT_PERCENTAGE,
    width,
    height,
    format,
    quality,
    fit,
    options
}: fromUriParameter): Promise<sharp.Sharp | undefined> => {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)
    const dimensions = getDimensions(imageBuffer, percentage, { width, height });

    if(!dimensions) {
       throw new Error('cant fetch image size')
       return
    } else {
       return sharpResize(imageBuffer, dimensions, format, quality, fit, options)
    }   
}

const fromPath = async ({
    path,
    percentage = DEFAULT_PERCENTAGE,
    width,
    height,
    format,
    quality,
    fit,
    options
}: fromPathParameter) => {
    const imageBuffer = fs.readFileSync(path)
    const dimensions = getDimensions(imageBuffer, percentage, { width, height });

    if(!dimensions) {
        throw new Error('cant fetch image size')
        return
     } else {
        return sharpResize(imageBuffer, dimensions, format, quality, fit, options)
     }   
}

const fromBase64 = async ({
    content,
    percentage = DEFAULT_PERCENTAGE,
    width,
    height,
    format,
    quality,
    fit,
    options
}: fromBase64Parameter) => {
    const imageBuffer = Buffer.from(content, 'base64');
    const dimensions = getDimensions(imageBuffer, percentage, { width, height });

    if(!dimensions) {
        throw new Error('cant fetch image size')
        return
     } else {
        return sharpResize(imageBuffer, dimensions, format, quality, fit, options)
     }
}

export const fromBuffer = async ( buffer: Buffer, percentage = DEFAULT_PERCENTAGE, size= {}, quality=90, format: 'png'|'jpeg'|'webp' = 'png') => {
    const dimensions = getDimensions(buffer, percentage, size);

    if(!dimensions) {
        throw new Error('cant fetch image size')
        return 
     } else {
        console.log(quality, "qua")
        const {data, info} = await sharpResize(buffer, dimensions, format, quality).toBuffer({ resolveWithObject: true})
        return {data, info}
     }
}


const convertImage = async (params: convertParameter, output = 'buffer') => {
    let convertPromise
    switch (params.kind) {
        case 'fromUri':
            convertPromise = fromUri(params)
            break
        case 'fromPath':
            convertPromise = fromPath(params)
            break
        case 'fromBase64':
            convertPromise = fromBase64(params)
    }

    const sharpObject = await convertPromise
    const { data, info} = (await sharpObject?.toBuffer({ resolveWithObject: true})) || {}

    console.log(info)
    return data
}

export default convertImage