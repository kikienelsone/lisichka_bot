export type TModelResponse = {
    id: number;
    name: string;
    version: number;
    type: string;
}


export type TGenerateResponse = {
    status: string;
    uuid: string;
}

export type TPicGenerationResponse = {
    uuid: string;
    status?: 'INITIAL' | 'PROCESSING' | 'DONE' | 'FAIL';
    images?: [string];
    errorDescription?: string;
    censored?: boolean;
}

export type IPropsGenerate = {
    prompt: string;
    modelId?: number;
    imageCount?: number;
    width?: number;
    height?: number;
    style?: string;
    controller?: AbortController;
}
