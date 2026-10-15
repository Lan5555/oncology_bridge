export class Role {
  public id: string = "";
  public name: string = "";
  public description: string = "";
  public created_at: string = "";
  public permissions: Array<string | { key?: string; name?: string }> = [];

  constructor(
    id: string,
    name: string,
    description: string,
    created_at: string,
    permissions: Array<string | { key?: string; name?: string }> = [],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.created_at = created_at;
    this.permissions = permissions;
  }

  static fromJson(json: Record<string, any>) {
    return new Role(
      json["id"] ?? "",
      json["name"] ?? "",
      json["description"] ?? "",
      json["created_at"] ?? "",
      json["permissions"] ?? [],
    );
  }
}
