import { useIsEchos } from "@/hooks/apps/use-is-echos";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export const EchosBanner = () => {
  const isEchos = useIsEchos();

  if (!isEchos) {
    return null;
  }

  return (
    <Alert>
      <AlertTitle>Wrapping or unwrapping USDC?</AlertTitle>
      <AlertDescription>
        Make sure you're using a wallet like{" "}
        <a href="https://metamask.io/">MetaMask</a> that supports Echos, then
        visit the{" "}
        <a
          href="https://bridge.echos.fun"
          target="_blank"
          className="underline"
        >
          Echos Bridge.
        </a>
      </AlertDescription>
    </Alert>
  );
};
