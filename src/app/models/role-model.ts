export class Role {
    public id: string = '';
    public name: string = '';
    public description: string = '';
    public created_at: string = ''

    constructor(id: string, name: string, description: string, created_at: string){
        this.id = id;
        this.name = name;
        this.description = description;
        this.created_at = created_at
    }

    static fromJson(json: Record<string, any>){
        return new Role(
            json['id'] ?? '',
            json['name'] ?? '',
            json['description'] ?? '',
            json['created_at'] ?? ''
        )
    }
}