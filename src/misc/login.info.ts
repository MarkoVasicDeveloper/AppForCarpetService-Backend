/* eslint-disable prettier/prettier */
export class LoginInfo {
    Id: number
    identity: string
    token: string
    refreshToken: string
    tokenExpire: string

    constructor(Id: number, identity: string, token: string, refreshToken: string, tokenExpire: string) {
        this.Id = Id
        this.identity = identity
        this.token = token
        this.refreshToken = refreshToken
        this.tokenExpire = tokenExpire
    }
}