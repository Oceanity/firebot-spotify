type Trigger = {
  type: TriggerType;
  metadata: {
    username: string;
    hotkey?: unknown;
    command?: {
      active: boolean;
      simple: boolean;
      sendCooldownMessage: boolean;
      cooldownMessage: string;
      cooldown: {
        [x: string]: unknown;
      };
      effects: {
        id: string;
        list: {
          id: string;
          type: string;
          active: boolean;
          chatter: string;
          message: string;
        }[];
      };
      restrictionData: {
        restrictions: unknown[];
        mode: string;
        sendFailMessage: boolean;
        failMessage: string;
      };
      aliases: unknown[];
      sortTags: unknown[];
      treatQuotedTextAsSingleArg: boolean;
      trigger: string;
      id: string;
      createdBy: string;
      createdAt: string;
      count: number;
      type: string;
      lastEditBy: string;
      lastEditAt: string;
    };
    userCommand?: { trigger: string; args: string[] };
    chatMessage?: FirebotChatMessage;
    event?: { id: string; name: string };
    eventSource?: { id: string; name: string };
    eventData?: {
      chatMessage?: FirebotChatMessage;
      [x: string]: unknown;
    };
    counter?: {
      id: string;
      name: string;
      previousValue: number;
      value: number;
      minimum?: number;
      maximum?: number;
    };
    [x: string]: unknown;
  };
};

type TriggerType =
  | "command"
  | "custom_script"
  | "startup_script"
  | "api"
  | "event"
  | "hotkey"
  | "timer"
  | "counter"
  | "preset"
  | "quick_action"
  | "manual";

type EffectScope<EffectParams> = {
  effect: EffectParams;
  [x: string]: any;
};
