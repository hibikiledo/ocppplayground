import { Button, Chip, Code, Input } from "@nextui-org/react";
import { useMemo, useRef, useState } from "react";
import { OcppMessageStream } from "./components/OcppMessageStream";
import { Status, useConnection } from "./hooks/useConnection";

import clsx from "clsx";
import { TabView } from "./components/TabView/TabView";
import { useCentralSystem } from "./hooks/useCentralSystem";
import { useColumnResize } from "./hooks/useColumnResize";

function App() {
  const [cpIdentity, setCpIdentity] = useState("");
  const [activeCpIdentity, setActiveCpIdentity] = useState("");

  if (activeCpIdentity) {
    return (
      <AppActive
        cpIdentity={activeCpIdentity}
        onDisconnect={() => {
          setCpIdentity("");
          setActiveCpIdentity("");
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 grid items-center justfy-center">
      <main className="flex flex-col items-center gap-4">
        <form
          className="grid w-[300px] grid-cols-1 gap-y-3 mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            setActiveCpIdentity(cpIdentity);
          }}
        >
          <Input
            type="text"
            label="Charge Point Identity"
            value={cpIdentity}
            onChange={(e) => setCpIdentity(e.currentTarget.value)}
          />
          <Button color="primary" variant="shadow" type="submit">
            Start
          </Button>
        </form>
        <div className="w-[300px] flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Supported Protocols</h2>
          <p className="text-sm text-foreground-500">OCPPJ 1.6</p>
        </div>
        <div className="w-[300px] flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Central System URL</h2>
          <p className="text-sm text-foreground-500">
            The demo server provides two central system URLs as some charge
            point models do not support WSS.
          </p>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold">WS (Plain Websocket)</div>
            <Code>ws://ocppws.evtoolbox.app/ocppj</Code>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold">
              WSS (Websocket over TLS)
            </div>
            <Code>wss://ocpp.evtoolbox.app/ocppj</Code>
          </div>
        </div>
      </main>
      <footer></footer>
    </div>
  );
}

const AppActive = (props: { cpIdentity: string; onDisconnect: () => void }) => {
  const centralSystem = useCentralSystem();
  const connection = useConnection({
    cpIdentity: props.cpIdentity,
    cpMessageHandler: (message) => {
      if (message.msgType === 2) {
        connection.send(centralSystem.process(message));
      }
    },
  });

  const statusNameByStatus = useMemo(() => {
    return {
      [Status.Open]: "Open",
      [Status.Closed]: "Closed",
    } satisfies Record<Status, string>;
  }, []);

  const targetRef = useRef<HTMLDivElement>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const draggerRef = useRef<HTMLDivElement>(null);
  useColumnResize({
    initialWidth: 700,
    targetRef,
    dragContainerRef,
    draggerRef,
  });

  return (
    <div
      className="fixed inset-0 grid grid-cols-[1fr_auto_auto]"
      ref={dragContainerRef}
    >
      <div className="min-h-0 p-2 overflow-auto">
        <OcppMessageStream messages={connection.messages} />
      </div>
      <div
        ref={draggerRef}
        className={clsx(
          "border-l-[2px] border-r-[2px] bg-foreground-200 border-transparent z-20 overflow-hidden",
          "transition-all duration-150",
          "hover:border-primary-300 hover:cursor-col-resize"
        )}
      ></div>
      <div className="overflow-auto" ref={targetRef}>
        <div className="h-[48px] sticky top-0 p-2 bg-white z-20 border-b-1">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center justify-between gap-3">
              <div>{props.cpIdentity}</div>
              <div>
                <Chip
                  variant="dot"
                  size="sm"
                  color={
                    connection.status === Status.Open ? "success" : "default"
                  }
                >
                  {statusNameByStatus[connection.status]}
                </Chip>
              </div>
            </div>
            {connection.status === Status.Open && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                onClick={() => {
                  connection.close();
                  props.onDisconnect();
                }}
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>

        <TabView
          centralSystem={centralSystem}
          onSend={(rawMessage) => {
            connection.send(rawMessage);
          }}
        />
      </div>
    </div>
  );
};

export default App;
