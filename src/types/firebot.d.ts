type Trigger = {
  type: TriggerType;
  metadata: {
    username: string;
    hotkey?: unknown;
    command?: unknown;
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
