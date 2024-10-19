import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { useState } from "react";
import { NewComposerEditor } from "../composer/components/NewComposerEditor";

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
                        <AutocompleteItem key={item.value}>
                            {item.label}
                        </AutocompleteItem>
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
                    action={action}
                    presets={[]}
                    onSend={props.onSend}
                />
            </div>
        </form>
    );
};
