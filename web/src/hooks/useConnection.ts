import { useEffect, useRef, useState } from "react";

export type ParsedOcppMessage =
  | ParsedOcppCallMessage
  | ParsedOcppCallResultMessage
  | ParsedOcppCallErrorMessage;
export type ParsedOcppCallMessage = {
  msgType: 2;
  uniqueId: string;
  action: string;
  payload: Record<string, any> | null;
  key: string;
  receivedAt: Date;
  direction: "i" | "o";
  raw: string;
};
export type ParsedOcppCallResultMessage = {
  msgType: 3;
  uniqueId: string;
  payload: Record<string, any> | null;
  key: string;
  receivedAt: Date;
  direction: "i" | "o";
  raw: string;
};
export type ParsedOcppCallErrorMessage = {
  msgType: 4;
  uniqueId: string;
  errorCode: string;
  errorDescription: string;
  errorDetails: Record<string, any>;
  key: string;
  receivedAt: Date;
  direction: "i" | "o";
  raw: string;
};

export const Status = {
  Open: 1,
  Closed: 2,
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export type CpMessageHandler = (ocppMessage: ParsedOcppMessage) => void;

export const useConnection = (opts: {
  cpIdentity: string;
  cpMessageHandler: CpMessageHandler;
}) => {
  const [status, setStatus] = useState<Status>(Status.Closed);
  const [parsedMessages, setParsedMessages] = useState<ParsedOcppMessage[]>([]);

  // connect() is called from a useEffect hook which intentionally specified
  // cpIdentity as the only dependency. In doing so, we initiate a websocket
  // connection per cpIdentity.
  //
  // The consequence is cpCallHandler maybe stale due to the concept of closure.
  // By storing the latest cpCallHandler in React ref, we make sure that the
  // connect() function always access the latest cpCallHandler
  const cpCallHandlerRef = useRef<CpMessageHandler>(opts.cpMessageHandler);
  cpCallHandlerRef.current = opts.cpMessageHandler;

  const websocket = useRef<WebSocket | null>(null);
  const connect = () => {
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_BASE_URL}/${opts.cpIdentity}`
    );
    ws.addEventListener("error", (ev) => {
      console.error(ev);
    });
    ws.addEventListener("open", (ev) => {
      if (ws !== websocket.current) return;

      setStatus(Status.Open);
      console.log(ev);
    });
    ws.addEventListener("close", (ev) => {
      if (ws !== websocket.current) return;

      setStatus(Status.Closed);
      console.log(ev);
    });
    ws.addEventListener("message", (ev) => {
      if (ws !== websocket.current) return;

      const wrapper = ev.data as string;

      // Ping message
      if (wrapper === "p") {
        return;
      }

      setParsedMessages((prevMsgs) => {
        const parsedOcppMessage = parse(prevMsgs.length, wrapper);
        switch (parsedOcppMessage.direction) {
          case "i": {
            break;
          }
          case "o": {
            cpCallHandlerRef.current?.(parsedOcppMessage);
            break;
          }
        }
        return prevMsgs.concat(parsedOcppMessage);
      });
    });

    return ws;
  };

  useEffect(() => {
    const ws = connect();
    websocket.current = ws;

    let closeByEffect = false;
    ws.addEventListener("close", () => {
      if (closeByEffect) return;
      const ws = connect();
      websocket.current = ws;
    });

    return () => {
      closeByEffect = true;
      ws.close();
    };
  }, [opts.cpIdentity]);

  const send = (msg: string) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(msg);
      return;
    }
    alert("Websocket is not open.");
  };

  const close = () => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.close();
      return;
    }
  };

  return { send, close, status, messages: parsedMessages };
};

const parse = (idx: number, rawMessage: string): ParsedOcppMessage => {
  const jsonParsedMsg = JSON.parse(rawMessage.slice(1));
  const [msgType] = jsonParsedMsg;

  switch (msgType) {
    case 2: {
      const [uniqueId, action, payload] = jsonParsedMsg.slice(1);
      return {
        key: String(idx),
        msgType: 2,
        direction: rawMessage[0] as "i" | "o",
        uniqueId,
        action,
        payload,
        receivedAt: new Date(),
        raw: jsonParsedMsg,
      };
    }
    case 3: {
      const [uniqueId, payload] = jsonParsedMsg.slice(1);
      return {
        key: String(idx),
        msgType: 3,
        direction: rawMessage[0] as "i" | "o",
        uniqueId,
        payload,
        receivedAt: new Date(),
        raw: jsonParsedMsg,
      };
    }
    case 4: {
      const [uniqueId, errorCode, errorDescription, errorDetails] =
        jsonParsedMsg.slice(1);
      return {
        key: String(idx),
        msgType,
        direction: rawMessage[0] as "i" | "o",
        uniqueId,
        errorCode,
        errorDescription,
        errorDetails,
        receivedAt: new Date(),
        raw: jsonParsedMsg,
      };
    }
    default: {
      throw Error("Invalid Type");
    }
  }
};
