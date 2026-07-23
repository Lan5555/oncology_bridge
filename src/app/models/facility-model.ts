import { User } from "./user-model";


export class Facility {
    public id?: string;
    public name: string = '';
    public facility_type: string = '';
    public hospital_code: string = '';
    public address: string = '';
    public city: string = '';
    public state: string = '';
    public latitude: number | null = null;
    public longitude: number | null = null;
    public phone: string = '';
    public email: string = '';
    public status: string = '';
    public users: User[] = [];
    public inventory: any;
    public created_at: Date | null = null;
    public updated_at: Date | null = null;

    constructor(init?: Partial<Facility>) {
        if (init) {
            Object.assign(this, init);
            if (init.created_at) this.created_at = new Date(init.created_at);
            if (init.updated_at) this.updated_at = new Date(init.updated_at);
            if (init.users) {
                this.users = init.users.map(u => u instanceof User ? u : new User(u));
            }
        }
    }

    /**
     * Creates a Facility instance from a JSON object or string.
     */
    public static fromJson(json: string | Record<string, any>): Facility {
        const data = typeof json === 'string' ? JSON.parse(json) : json;

        return new Facility({
            id: data.id,
            name: data.name ?? '',
            facility_type: data.facility_type ?? '',
            hospital_code: data.hospital_code ?? '',
            address: data.address ?? '',
            city: data.city ?? '',
            state: data.state ?? '',
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            phone: data.phone ?? '',
            email: data.email ?? '',
            status: data.status ?? '',
            users: Array.isArray(data.users) ? data.users.map(User.fromJson) : [],
            created_at: data.created_at ? new Date(data.created_at) : null,
            updated_at: data.updated_at ? new Date(data.updated_at) : null,
        });
    }
}


export class FacilityResponse {
    public facility?: Facility;
    public admin?: User;

    constructor(init?: Partial<FacilityResponse>) {
        if (init) {
            Object.assign(this, init);
            if (init.facility) {
                this.facility = init.facility instanceof Facility ? init.facility : new Facility(init.facility);
            }
            if (init.admin) {
                this.admin = init.admin instanceof User ? init.admin : new User(init.admin);
            }
        }
    }

    /**
     * Creates a FacilityResponse instance from a JSON object or string.
     */
    public static fromJson(json: string | Record<string, any>): FacilityResponse {
        const data = typeof json === 'string' ? JSON.parse(json) : json;

        return new FacilityResponse({
            facility: data.facility ? Facility.fromJson(data.facility) : undefined,
            admin: data.admin ? User.fromJson(data.admin) : undefined,
        });
    }
}