
import config from "@/config";
import {logger} from "./logger";
import { Role } from '@/enums';
import {hash, compare} from "bcryptjs";
import {sign, verify, decode} from 'jsonwebtoken';

export class UserToken{
    id : string;
    name : string;
    role : {
        admin : boolean;
        manager : boolean;
    };
    token : string;
    private __role : Role;

    constructor({id, name, role} : {id : string, name : string, role : Role}){
        this.id = id;
        this.name = name;
        this.__role = role;
        this.role = {
            admin : role === Role.ADMIN,
            manager : role === Role.MANAGER
        };
        this.token = this.getToken();
    }

    toJson(){
        return {
            id : this.id,
            name : this.name,
            role : this.__role
        }
    }

    getToken(){
        if (this.token){
            return this.token;
        }
        const token = sign(this.toJson(), config.jwt_secret, {expiresIn : config.jwt_expires});
        this.token = token;
        return token;
    }

    static async fromToken(token : string){
        try{
            const payload = verify(token, config.jwt_secret);
            if(!payload) {return null;}
            const {id, name, role} = payload as any;
            if(!id || !name || !role) {return null;}
            const userToken = new UserToken({id, name, role});
            userToken.token = token;
            return userToken;
        }catch(err){
            logger.error(err);
            return null;
        }
    }

}


export default class Helper {

    static async hashPassword(password : string){
        const _hash = await hash(password, config.bcrypt_salt_rounds);
        return _hash;
    }

    static async comparePassword(password : string, hash : string){
        const isMatch = await compare(password, hash);
        return isMatch;
    }

    static async generateToken(payload : Object){
        const token  = sign(payload, config.jwt_secret, {expiresIn : config.jwt_expires});
        return token;
    }

    static async verifyToken(token : string){
        const decoded = verify(token, config.jwt_secret);
        return decoded;
    }

    static async decodeToken(token : string){
        const decoded = decode(token);
        return decoded;
    }

    static async generateOTP(){
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp;
    }

    static async sendSMS(phone : string, message : string){
        // TODO: Implement SMS sending
        return true;
    }

    static async sendEmail(email : string, subject : string, body : string){
        // TODO: Implement email sending
        return true;
    }


}