import mqtt from "mqtt";

type MqttOptions = {
  host: string;
  port?: number;
  path?: string;
  clientId?: string;
  useSSL?: boolean;
  topics?: string[];
  onMessage?: (topic: string, payload: string) => void;
  onConnect?: () => void;
  onFailure?: (err: any) => void;
};

export function createMqttClient(opts: MqttOptions) {
  const {
    host,
    port = 8884,
    path = "/mqtt",
    clientId = "webclient-" + Math.random().toString(16).substr(2, 8),
    useSSL = true,
    topics = [],
    onMessage,
    onConnect,
    onFailure,
  } = opts;

  // Build proper WebSocket URL with wss:// for secure connections
  const protocol = useSSL ? "wss" : "ws";
  const brokerUrl = `${protocol}://${host}:${port}${path}`;

  const client = mqtt.connect(brokerUrl, {
    clientId,
    reconnectPeriod: 2000,
  });

  let connected = false;

  client.on("connect", () => {
    connected = true;
    console.log("MQTT connected to", brokerUrl);
    if (onConnect) onConnect();
    
    // Subscribe to initial topics
    topics.forEach((topic) => {
      client.subscribe(topic, (err) => {
        if (err) {
          console.warn("Subscribe failed for", topic, err);
        }
      });
    });
  });

  client.on("message", (topic, payload) => {
    try {
      const payloadString = payload.toString();
      if (onMessage) onMessage(topic, payloadString);
    } catch (e) {
      console.error("Error parsing MQTT message", e);
    }
  });

  client.on("error", (err) => {
    connected = false;
    console.warn("MQTT error", err);
    if (onFailure) onFailure(err);
  });

  client.on("close", () => {
    connected = false;
    console.log("MQTT connection closed");
  });

  return {
    isConnected: () => connected,
    subscribe: (topic: string) => {
      client.subscribe(topic, (err) => {
        if (err) {
          console.warn("Subscribe error", err);
        }
      });
    },
    unsubscribe: (topic: string) => {
      client.unsubscribe(topic, (err) => {
        if (err) {
          console.warn("Unsubscribe error", err);
        }
      });
    },
    disconnect: () => {
      client.end();
      connected = false;
    },
    rawClient: client,
  };
}

export default createMqttClient;