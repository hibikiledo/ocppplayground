import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Tab, Tabs } from "@nextui-org/react";
import { useCentralSystem } from "../../hooks/useCentralSystem";
import { CpToCsView } from "../CpToCsView";
import { CsToCpView } from "../CsToCpView";

export const TabView = (props: {
  centralSystem: ReturnType<typeof useCentralSystem>;
  onSend: (rawMessage: string) => void;
}) => {
  return (
    <>
      <div className="flex flex-col w-full p-2">
        <Tabs aria-label="Tabs">
          <Tab
            key="cp-to-cs"
            title={
              <div className="flex gap-x-1">
                <span>CP</span>
                <ArrowRightIcon width={20} />
                <span>CS</span>
              </div>
            }
          >
            <CpToCsView centralSystem={props.centralSystem} />
          </Tab>
          <Tab
            key="cs-to-cp"
            title={
              <div className="flex gap-x-1">
                <span>CS</span>
                <ArrowRightIcon width={20} />
                <span>CP</span>
              </div>
            }
          >
            <CsToCpView onSend={props.onSend} />
          </Tab>
        </Tabs>
      </div>
    </>
  );
};
