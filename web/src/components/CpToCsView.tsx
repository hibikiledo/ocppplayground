import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react";
import clsx from "clsx";
import { useId, useState } from "react";
import { OcppCallProcessor, useCentralSystem } from "../hooks/useCentralSystem";
import { CodeEditor } from "./CodeEditor/CodeEditor";

export const CpToCsView = (props: {
    centralSystem: ReturnType<typeof useCentralSystem>;
}) => {
    const actions = Object.keys(props.centralSystem.configMap);
    const [activeAction, setActiveAction] = useState("");
    return (
        <>
            <ul>
                {actions.map((action) => {
                    return (
                        <li
                            key={action}
                            className={clsx(
                                "border-b-1 p-2 grid grid-cols-[1fr_auto] items-center gap-2",
                                "hover:bg-foreground-100"
                            )}
                        >
                            <div>{action}</div>
                            <Button
                                size="sm"
                                variant="light"
                                onClick={() => setActiveAction(action)}
                            >
                                Configure
                            </Button>
                            <Modal
                                isOpen={activeAction === action}
                                onClose={() => setActiveAction("")}
                            >
                                <ModalContent>
                                    {(onClose) => (
                                        <>
                                            <ConfigurationForm
                                                action={action}
                                                config={
                                                    props.centralSystem
                                                        .configMap[action]
                                                }
                                                onSubmit={(value) => {
                                                    props.centralSystem.setPayloadBuilder(
                                                        action,
                                                        value
                                                    );
                                                    onClose();
                                                }}
                                                onDiscard={onClose}
                                            />
                                        </>
                                    )}
                                </ModalContent>
                            </Modal>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};

const ConfigurationForm = (props: {
    config: OcppCallProcessor;
    action: string;
    onSubmit: (value: string) => void;
    onDiscard: () => void;
}) => {
    const config = props.config;
    const [value, setValue] = useState(config.payloadBuilder);

    const formId = useId();
    return (
        <>
            <ModalHeader className="flex flex-col gap-1">
                {props.action}
            </ModalHeader>
            <ModalBody>
                <form
                    id={formId}
                    onSubmit={(e) => {
                        e.preventDefault();
                        props.onSubmit(value);
                    }}
                >
                    <CodeEditor
                        value={value}
                        onChange={setValue}
                        minHeight="300px"
                    />
                </form>
            </ModalBody>
            <ModalFooter>
                <Button
                    form={formId}
                    type="submit"
                    variant="solid"
                    color="primary"
                >
                    Save
                </Button>
            </ModalFooter>
        </>
    );
};
