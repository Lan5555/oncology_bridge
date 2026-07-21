import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

class AuthService extends CoreService {
    public async signIn(payload: Record<string, any>) {
        return await this.send(Routes.SIGN_IN, payload);
    }

    public async signOut(id: string) {
        return await this.get(`${Routes.SIGN_OUT}/${id}`);
    }

}
export const AUTH_SERVICE: AuthService = new AuthService();