import { type OutputOptions, type FitEnum } from "sharp"

export interface fromUriParameter {
    kind: 'fromUri'
    url: string
    percentage?: number
    width?: number
    height?: number
    format?: 'jpeg' | 'png' | 'webp'
    quality?: number
    fit?: keyof FitEnum
    options?: OutputOptions
}

export interface fromPathParameter extends Omit<fromUriParameter, 'url' | 'kind'> {
    kind: 'fromPath'
    path: string
}

export interface fromBase64Parameter extends Omit<fromUriParameter, 'url' | 'kind'> {
    kind: 'fromBase64'
    content: string
}

export type convertParameter =  fromUriParameter | fromPathParameter | fromBase64Parameter