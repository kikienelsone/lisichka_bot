import axios, {type AxiosResponse} from "axios";
import FormData from "form-data";
import type {IPropsGenerate, TGenerateResponse, TModelResponse, TPicGenerationResponse} from "./Interfaces.ts";





const HEADERS = {
    'X-Key': `Key ${process.env.KANDINSKY_TOKEN}`,
    'X-Secret': `Secret ${process.env.KANDINSKY_SECRET}`
}
export const  getToken = async () => {
    try {
        const response: AxiosResponse<TModelResponse[]> = await axios
            .get(process.env.KANDINSKY_BASE_URL + 'models', {
                headers: HEADERS
            })
        return response.data[0].id
    } catch (error) {
        console.log(error, 'Error response')
    }
}

export const generate = async ({
                            prompt,
                            modelId,
                            imageCount = 1,
                            width = 1024,
                            height = 1023,
                            style = 'DEFAULT'
                        }: IPropsGenerate) =>  {
    const params = {
        type: 'GENERATE',
        numImages: imageCount,
        width,
        height,
        style: style,
        generateParams: {
            query: prompt
        }
    }

    const formData = new FormData()
    const modelIdData = { value: modelId, options: {contentType: undefined}}
    const paramsData = { value: JSON.stringify(params), options: {contentType: 'application/json'} }
    formData.append('model_id', modelIdData.value, modelIdData.options)
    formData.append('params', paramsData.value, paramsData.options)

    try {
        const response: AxiosResponse<TGenerateResponse> = await axios.post(
            process.env.KANDINSKY_BASE_URL + 'text2image/run',
            formData, {
                headers: {
                    ...formData.getHeaders(),
                    ...HEADERS
                },
                // @ts-ignore
                'Content-Type': 'multipart/form-data'
            })
        const data = response.data
        return data.uuid
    } catch (err) {
        console.log('This Error', err)
    }
}

export const picGeneration = async (
    uuid: string | undefined,
    attempts = 10,
    delay = 15
) => {
    while (attempts > 0) {
        try {
            const response: AxiosResponse<TPicGenerationResponse> = await axios.get(
                process.env.KANDINSKY_BASE_URL + `text2image/status/${uuid}`,
                {
                    headers: HEADERS,
                },
            )

            const data = response.data
            if (data.status === 'DONE') {
                console.log('Картинка готова!')
                return data.images?.[0];
            }
        } catch (error) {
            console.log(error)
        }
        attempts -= 1
        console.log('Еще не готово')
        await new Promise((resolve) => setTimeout(resolve, delay * 1000))
    }
}