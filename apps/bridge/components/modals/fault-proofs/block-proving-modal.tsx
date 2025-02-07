import { IconAlert } from "@/components/icons";
import { optimismFaultProofs } from "@/constants/links";
import { useModal } from "@/hooks/use-modal";

import { Button } from "../../ui/button";
import { Dialog, DialogContent } from "../../ui/dialog";

export const BlockProvingModal = () => {
  const modal = useModal("BlockProving");

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.close}>
      <DialogContent>
        <div className="flex flex-col gap-8 p-6">
          <div className="flex flex-col gap-4 pt-6">
            <div className="animate-bounce mx-auto">
              <IconAlert className="w-16 h-16" />
            </div>
            <h1 className="font-heading text-xl  text-left">
              Base Mainnet Fault Proof upgrade
            </h1>
            <div className="text-xs text-left md:text-sm prose-sm  leading-relaxed  text-muted-foreground text-pretty">
              <p>
                The Base Mainnet Fault Proof upgrade has been targeted for
                October 30th.
              </p>
              <p>
                Please come back after the upgrade is complete to prove your
                withdrawal.
              </p>
              <p>
                Find out more at{" "}
                <a
                  href={optimismFaultProofs}
                  target="_blank"
                  className="text-foreground underline"
                >
                  optimism.io
                </a>{" "}
                or check the{" "}
                <a
                  href="https://help.superbridge.app/en/articles/9759328-fault-proof-upgrade"
                  target="_blank"
                  className="text-foreground underline"
                >
                  FAQs
                </a>
                .
              </p>
            </div>
          </div>

          <Button onClick={modal.close}>Ok</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
