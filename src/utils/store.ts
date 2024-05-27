import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";

export default class Store {
  static IntegrationId: string = "oceanity-spotify";
  static SpotifyApplication: SpotifyApplication;
  static SpotifyAuth: SpotifyAuth = {};
  static Modules: ScriptModules;
  static State: string | null = null;
}
