import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Radio,
    RadioGroup,
    Textarea,
} from "@nextui-org/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { errorCodeOptions } from "./errorCodeOptions";
import { ParsedOcppMessage } from "../../../hooks/useConnection";

export const DefaultComposerCard = (props: {
    message: ParsedOcppMessage;
    onSend: (rawMessage: string) => void;
}) => {
    invariant(props.message.msgType === 2);

    const [msgType, setMsgType] = useState<"3" | "4">("3");
    const [payload, setPayload] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [errorDescription, setErrorDescription] = useState("");
    const [errorDetails, setErrorDetails] = useState("");

    const handleSend = () => {
        if (msgType === "3") {
            props.onSend(`[3,"${props.message.uniqueId}",${payload || "{}"}]`);
        }
        if (msgType === "4") {
            props.onSend(
                `[4,"${props.message.uniqueId}","${errorCode}","${errorDescription}",${
                    errorDescription || "{}"
                }]`,
            );
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="text-sm font-semibold">
                    {props.message.action}.conf
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <div className="flex flex-col gap-2">
                    <RadioGroup
                        size="sm"
                        value={msgType}
                        onChange={(e) =>
                            setMsgType(e.target.value as "3" | "4")
                        }
                    >
                        <div className="flex gap-5">
                            <Radio value="3">CallResult</Radio>
                            <Radio value="4">CallError</Radio>
                        </div>
                    </RadioGroup>
                    <div className="flex flex-col gap-3">
                        {msgType === "3" && (
                            <Textarea
                                fullWidth
                                label="Payload"
                                placeholder="JSON object"
                                value={payload}
                                onChange={(e) =>
                                    setPayload(e.currentTarget.value)
                                }
                                classNames={{
                                    input: "whitespace-pre font-mono",
                                }}
                            />
                        )}
                        {msgType === "4" && (
                            <div className="flex flex-col gap-2">
                                <Autocomplete
                                    isRequired
                                    label="Error Code"
                                    defaultItems={errorCodeOptions}
                                    placeholder="Search error code"
                                    selectedKey={errorCode}
                                    onSelectionChange={(key) =>
                                        key && setErrorCode(key.toString())
                                    }
                                >
                                    {(item) => (
                                        <AutocompleteItem key={item.value}>
                                            {item.label}
                                        </AutocompleteItem>
                                    )}
                                </Autocomplete>
                                <Input
                                    label="Error Description"
                                    placeholder="Plain text"
                                    value={errorDescription}
                                    onChange={(e) =>
                                        setErrorDescription(e.target.value)
                                    }
                                />
                                <Textarea
                                    label="Error Details"
                                    placeholder="JSON object"
                                    value={errorDetails}
                                    onChange={(e) =>
                                        setErrorDetails(e.target.value)
                                    }
                                    classNames={{
                                        input: "whitespace-pre font-mono",
                                    }}
                                />
                            </div>
                        )}
                        <Button color="primary" onClick={handleSend}>
                            Send
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};
