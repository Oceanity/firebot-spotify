import {
  RunRequestParameters,
  ScriptModules,
} from "@crowbartools/firebot-custom-scripts-types";

export default class Store {
  static Prefix: string = "oceanity/spotify";
  static SpotifyApplication: SpotifyApplication;
  static SpotifyAuth: SpotifyAuth = {};
  static Modules: ScriptModules;
  static WebserverPort: number;
  static CallbackPath: string;
  static RedirectUri: string;
  static State: string | null = null;
}
