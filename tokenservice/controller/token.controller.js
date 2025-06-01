import TokenRepository from "../repository/token.repository.js";

export default class TokenController {
    constructor(){
        this.tokenRepository = new TokenRepository();
    }
}