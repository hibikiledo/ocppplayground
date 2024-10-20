import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { useState } from "react";
import { NewComposerEditor } from "../composer/components/NewComposerEditor";

const defaultBuilderByAction: Record<string, string> = {
  ClearCache: "{}",
  GetLocalListVersion: "{}",
};

const presetsByAction: Record<string, { label: string; content: string }[]> = {
  TriggerMessage: [
    {
      label: "BootNotification",
      content: `{
  triggerMessage: "BootNotification"
}`,
    },
    {
      label: "DiagnosticsStatusNotification",
      content: `{
  triggerMessage: "DiagnosticsStatusNotification"
}`,
    },
    {
      label: "FirmwareStatusNotification",
      content: `{
  triggerMessage: "FirmwareStatusNotification"
}`,
    },
    {
      label: "Heartbeat",
      content: `{
  triggerMessage: "Heartbeat"
}`,
    },
    {
      label: "MeterValues",
      content: `{
  triggerMessage: "MeterValues"
}`,
    },
    {
      label: "StatusNotification",
      content: `{
  triggerMessage: "StatusNotification"
}`,
    },
  ],
  ChangeAvailability: [
    {
      label: "Inoperative",
      content: `{
  type: "Inoperative",
  connectorId: 0,
}`,
    },
    {
      label: "Operative",
      content: `{
  type: "Operative",
  connectorId: 0,
}`,
    },
  ],
};

export const CsToCpView = (props: { onSend: (rawMessage: string) => void }) => {
  const csCallActions = [
    "CancelReservation",
    "ChangeAvailability",
    "ChangeConfiguration",
    "ClearCache",
    "ClearChargingProfile",
    "DataTransfer",
    "GetCompositeSchedule",
    "GetConfiguration",
    "GetDiagnostics",
    "GetLocalListVersion",
    "RemoteStartTransaction",
    "RemoteStopTransaction",
    "ReserveNow",
    "Reset",
    "SendLocalList",
    "SetChargingProfile",
    "TriggerMessage",
    "UnlockConnector",
    "UpdateFirmware",
    "Custom",
  ].map((action) => ({ label: action, value: action }));

  const [action, setAction] = useState("");
  const [customAction, setCustomAction] = useState("");

  return (
    <form>
      <div className="flex flex-col gap-4">
        <Autocomplete
          label="Action"
          defaultItems={csCallActions}
          selectedKey={action}
          onSelectionChange={(key) => {
            if (key) {
              setAction(key.toString());
            } else {
              setAction("");
            }
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
        {action === "Custom" && (
          <Input
            label="Custom Action"
            value={customAction}
            onChange={(e) => {
              setCustomAction(e.target.value);
            }}
          />
        )}
        <NewComposerEditor
          key={action}
          initialValue={defaultBuilderByAction[action]}
          action={action}
          presets={presetsByAction[action] ?? []}
          onSend={props.onSend}
        />
      </div>
    </form>
  );
};
