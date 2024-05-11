import {
  RunRequestParameters,
  ScriptModules,
} from "@crowbartools/firebot-custom-scripts-types";

export default class Store {
  static Prefix: string = "oceanitysongrequests";
  static SpotifyToken: string | null = null;
  static Modules: ScriptModules;
  static WebserverPort: number;
  static GetWebserverUrl = () =>
    `http://localhost:${Store.WebserverPort}/integrations/${Store.Prefix}`;
  static Parameters: RunRequestParameters<Params>;
  static State: string | null = null;
}
