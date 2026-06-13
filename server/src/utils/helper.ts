
import config from "@/config";
import {hash, compare} from "bcryptjs";
import {sign, verify, decode} from 'jsonwebtoken';


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