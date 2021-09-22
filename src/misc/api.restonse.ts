/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
export class ApiResponse {
    text: string
    statusCode: number
    message: string | null

    constructor(text: string, statusCode: number, message: string | null = null) {
        this.text = text,
        this.statusCode = statusCode,
        this.message = message
    }
}