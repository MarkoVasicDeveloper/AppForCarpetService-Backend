/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { JwtData } from "dto/jwt/jwt.dto";

declare module "express" {
    interface Request {
        token: JwtData
    }
}