import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class InvoiceService extends CoreService {
  async find(reference: string) {
    return await this.get(Routes.INVOICE(reference), { auth: false });
  }
  async create(payload: unknown) {
    return await this.send(Routes.INVOICES, payload);
  }
}
export const INVOICE_SERVICE = new InvoiceService();
