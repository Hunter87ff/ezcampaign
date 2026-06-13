import config from "@/config";
import {logger} from "@/utils/logger";
import { Role } from '@/enums';
import {sign, verify} from 'jsonwebtoken';


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