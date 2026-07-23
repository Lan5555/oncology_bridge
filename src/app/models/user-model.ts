import { Hospital } from "lucide-react";
import { Facility } from "./facility-model";
import { Role } from "./role-model";

export class User {
    public id?: string;
    public role?: Role;
    public hospital?: Facility;
    public first_name: string = '';
    public last_name: string = '';
    public email: string = '';
    public phone: string = '';
    public device_id: string = '';
    public allowed_ip: string = '';
    public active: boolean = false;
    public last_login: Date | null = null;
    public created_at: Date | null = null;
    public updated_at: Date | null = null;

    constructor(init?: Partial<User>) {
        if (init) {
            Object.assign(this, init);
            if (init.last_login) this.last_login = new Date(init.last_login);
            if (init.created_at) this.created_at = new Date(init.created_at);
            if (init.updated_at) this.updated_at = new Date(init.updated_at);
            if(init.hospital) this.hospital = Facility.fromJson(init.hospital);
            if(init.role) this.role = Role.fromJson(init.role);
        }
    }

    /**
     * Creates a User instance from a JSON object or string.
     */
    public static fromJson(json: string | Record<string, any>): User {
        const data = typeof json === 'string' ? JSON.parse(json) : json;

        return new User({
            id: data.id,
            role: data.role,
            hospital: data.hospital,
            first_name: data.first_name ?? '',
            last_name: data.last_name ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            device_id: data.device_id ?? '',
            allowed_ip: data.allowed_ip ?? '',
            active: Boolean(data.active),
            last_login: data.last_login ? new Date(data.last_login) : null,
            created_at: data.created_at ? new Date(data.created_at) : null,
            updated_at: data.updated_at ? new Date(data.updated_at) : null,
        });
    }
}

export class UserResponse {
   public user?: User;
   public token?: string;

   constructor(user: User, token: string){
    this.user = user;
    this.token = token;
   }

   public static fromJson(json: Record<string, any>): UserResponse {
    return new UserResponse(
        User.fromJson(json.user ?? {}),
        json.token ?? ''
    );
}
}