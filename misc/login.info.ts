/* eslint-disable prettier/prettier */
export class LoginInfo {
    Id: number
    identity: string
    token: string

    constructor(Id: number, identity: string, token: string) {
        this.Id = Id
        this.identity = identity
        this.token = token
    }
}