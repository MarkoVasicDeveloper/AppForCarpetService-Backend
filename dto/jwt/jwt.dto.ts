/* eslint-disable prettier/prettier */
export class JwtData {
    Id: number
    identity: string
    userAgent: string
    ipAddress: string
    expire: number
    role: 'administrator' | 'user'

    toPlane() {
        return {
            Id: this.Id,
            identity: this.identity,
            userAgent: this.userAgent,
            ipAddress: this.ipAddress,
            expire: this.expire,
            role: this.role
        }
    }
}