export interface Net {
  success: boolean;
  message: string;
  data: any;
  status?: number;
  code?: string;
}

export class NetResponse {
  constructor(private readonly response: Net) {}

  get success() {
    return this.response.success;
  }

  get message() {
    return this.response.message;
  }
  get data() {
    return this.response.data;
  }

  get status() {
    return this.response.status;
  }

  get code() {
    return this.response.code;
  }
}
