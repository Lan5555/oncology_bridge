const route = (module: string, endpoint: string) =>
  `/${module}/api/${endpoint}`;

export class Routes {
  static SIGN_IN = route("auth", "login");
  static SIGN_OUT = route("auth", "log-out");

  static REGISTER_FACILITY = route("hospital", "register-facility");
  static FIND_ALL_FACILITIES = route("hospital", "find-all-facilities");
  static FIND_ONE_FACILITY = route("hospital", "find-one-facility");
  static UPDATE_ONE_FACILITY = route("hospital", "update-one-facility");
  static DELETE_ONE_FACILITY = route("hospital", "delete-one-facility");
}