import { Button, Chip, Input } from "@nextui-org/react";
import { useMemo, useRef, useState } from "react";
import { OcppMessageStream } from "./components/OcppMessageStream";
import { Status, useConnection } from "./hooks/useConnection";

import clsx from "clsx";
import { TabView } from "./components/TabView/TabView";
import { useCentralSystem } from "./hooks/useCentralSystem";
import { useColumnResize } from "./hooks/useColumnResize";

function App() {
  const [cpIdentity, setCpIdentity] = useState("");
  const [activeCpIdentity, setActiveCpIdentity] = useState("123");

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
      <form
        className="grid min-w-[300px] grid-cols-1 gap-y-3 mx-auto"
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
