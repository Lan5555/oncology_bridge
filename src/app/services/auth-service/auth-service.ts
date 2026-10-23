import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

class AuthService extends CoreService {
  public async resubmitVerification(payload: {
    email: string;
    password: string;
    registry: "MDCN" | "PCN" | "PCN_PREMISES";
    license_number: string;
  }) {
    return await this.send(Routes.RESUBMIT_VERIFICATION, payload, {
      auth: false,
    });
  }

  public async signIn(payload: Record<string, any>) {
    return await this.send(Routes.SIGN_IN, payload, { auth: false });
  }

  public async signOut(id: string) {
    return await this.get(Routes.SIGN_OUT(id));
  }

  public async pingServer() {
    return await this.get(Routes.PING_SERVER);
  }

  public async forgotPassword(email: string) {
    return await this.send(Routes.FORGOT_PASSWORD, { email }, { auth: false });
  }

  public async resetPassword(payload: { token: string; password: string }) {
    return await this.send(Routes.RESET_PASSWORD, payload, { auth: false });
  }
}
export const AUTH_SERVICE: AuthService = new AuthService();
