import { useState } from "react";
import * as BootNotificationComposer from "../composer/components/BootNotificationComposer/presets";
import * as HeartbeatConfComposer from "../composer/components/HeartbeatConfComposer/presets";
import { ParsedOcppCallMessage } from "./useConnection";

export type ConfigMap = {
    [k: string]: OcppCallProcessor;
};

export type OcppCallProcessor = {
    mode: "payload-builder" | "raw-builder";
    rawMessageBuilder: string;
    payloadBuilder: string;
};

const defaultConfigMap: ConfigMap = {
    Authorize: {
        mode: "payload-builder",
        rawMessageBuilder: "",
        payloadBuilder: `{
  idTagInfo: {
    status: "Accepted"
  }
}`,
    },
    BootNotification: {
        mode: "payload-builder",
        rawMessageBuilder: "",
        payloadBuilder: BootNotificationComposer.accepted,
    },
    Heartbeat: {
        mode: "payload-builder",
        rawMessageBuilder: "",
        payloadBuilder: HeartbeatConfComposer.ok,
    },
    StatusNotification: {
        mode: "payload-builder",
        rawMessageBuilder: "",
        payloadBuilder: "{}",
    },
    SecurityEventNotification: {
        mode: "payload-builder",
        rawMessageBuilder: "",
        payloadBuilder: "{}",
    },
    MeterValues: {
        mode: "payload-builder",
        rawMessageBuilder: "",
        payloadBuilder: "{}",
    },
    StartTransaction: {
        mode: "payload-builder",
        rawMessageBuilder: "",
        payloadBuilder: `{
  idTagInfo: {
    status:"Accepted"
  },
  transactionId: Math.floor((Math.random() + 1) * 1000)
}`,
    },
    StopTransaction: {
        mode: "payload-builder",
        rawMessageBuilder: "",
        payloadBuilder: "{}",
    },
};

export const useCentralSystem = () => {
    const [configMap, setConfigMap] = useState(defaultConfigMap);

    const process = (ocppCall: ParsedOcppCallMessage): string => {
        const config = configMap[ocppCall.action as keyof ConfigMap];
        if (!config) {
            return `[4,"${ocppCall.uniqueId}","NotImplemented","Requested Action is not known by receiver",{}]`;
        }
        const payload = JSON.stringify(
            eval(
                `((payload)=>{const r=${
                    config.payloadBuilder
                };return r;})(${JSON.stringify(ocppCall.payload)})`
            )
        );
        return `[3,"${ocppCall.uniqueId}",${payload}]`;
    };

    const setPayloadBuilder = (action: string, value: string) => {
        setConfigMap((prevConfigMap) => ({
            ...prevConfigMap,
            [action]: {
                ...prevConfigMap[action],
                payloadBuilder: value,
            },
        }));
    };

    return { process, configMap, setPayloadBuilder };
};
