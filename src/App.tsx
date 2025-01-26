import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { config } from "@/config";
import { useCallback, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { NanoSecondsFormatter } from "./lib/TimeFormatter";

type CheckpointResponse = {
  __typename: "Checkpoint";
  url: string;
  status: number;
  latency: number; // in nanoseconds
};

type ErrorResponse = {
  __typename: "Error";
  error: string;
};

type FinishResponse = {
  __typename: "Finish";
};

type TrackResponse = CheckpointResponse | ErrorResponse | FinishResponse;

const inputSchema = z.object({
  url: z.string().url(),
});

function App() {
  const [input, setInput] = useState<z.infer<typeof inputSchema>>({
    url: "",
  });
  const [checkpoints, setCheckpoints] = useState<CheckpointResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmitInput = useMemo(
    () => inputSchema.safeParse(input).success && !loading,
    [input, loading]
  );
  const wsConnection = useRef<WebSocket | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmitInput) {
        return;
      }

      setLoading(true);
      setError(null);
      setCheckpoints([]);

      try {
        wsConnection.current = new WebSocket(
          `${config.GetWsProtocol()}://${config.GetHost()}/ws`
        );
        wsConnection.current.onopen = () => {
          wsConnection.current?.send(JSON.stringify(input));
        };

        wsConnection.current.onmessage = (event) => {
          const response = JSON.parse(event.data) as TrackResponse;
          if (response.__typename === "Checkpoint") {
            setCheckpoints((prevCheckpoints) => [...prevCheckpoints, response]);
          } else if (response.__typename === "Error") {
            setError(response.error);
          } else if (response.__typename === "Finish") {
            wsConnection.current?.close();
          }
        };

        wsConnection.current.onclose = () => {
          setLoading(false);
          wsConnection.current = null;
        };
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }

        setError("An unknown error occurred");
        setLoading(false);
      }
    },
    [input, canSubmitInput]
  );

  return (
    <>
      <main className="min-h-screen flex flex-col items-center py-8">
        <header className="flex flex-col items-center justify-center my-16">
          <h1 className="text-6xl font-black drop-shadow-[5px_5px_2px_rgba(0,0,0,0.2)] tracking-widest italic text-shadowed text-center bg-gradient-to-r from-amber-500 to-pink-500 inline-block text-transparent bg-clip-text uppercase">
            Wheregoes
          </h1>
        </header>

        <section className="container">
          <form
            onSubmit={handleSubmit}
            className="flex items-center my-4 space-x-2"
          >
            <Input
              type="url"
              value={input.url}
              onChange={(event) => setInput({ url: event.target.value })}
              disabled={loading}
              placeholder="http://example.com"
              className="w-full text-2xl px-6 py-8 text-gray-400"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="text-2xl px-12 py-8"
                disabled={!canSubmitInput || loading}
              >
                Track
              </Button>
            </div>
          </form>
        </section>

        <section className="flex flex-col space-y-4 py-8 container max-h-[80vh] overflow-y-auto">
          {checkpoints.map((checkpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>
                  <span>{index + 1}.</span>{" "}
                  <span className="text-main">{checkpoint.url}</span>
                </CardTitle>
                <CardDescription>
                  <p>Status: {checkpoint.status}</p>
                  <p>Latecy: {NanoSecondsFormatter(checkpoint.latency)}</p>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}

          {error && (
            <Card className="bg-red-500/80">
              <CardHeader>
                <CardTitle className="text-white">{error}</CardTitle>
              </CardHeader>
            </Card>
          )}
        </section>
      </main>
    </>
  );
}

export default App;
