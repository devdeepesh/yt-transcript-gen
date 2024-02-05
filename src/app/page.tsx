"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useCompletion } from "ai/react";

export default function Home() {
    const [transcript, setTranscript] = useState("asdf");
    const [summary, setSummary] = useState("");
    const [url, setUrl] = useState("");
    const { toast } = useToast();

    const input = summary || transcript;

    const { complete, completion, isLoading, error } = useCompletion({
        api: "/api/summary",
    });

    const copyToClipboard = async (text: string) => {
        try {
            await window.navigator.clipboard.writeText(text);
            setTimeout(
                toast({
                    title: "Success",
                    description: "Copied",
                }).dismiss,
                3000
            );
        } catch (error) {
            setTimeout(
                toast({
                    title: "Error",
                    description: "Error Copying",
                }).dismiss,
                3000
            );
        }
    };

    const getTranscript = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/transcript", {
                method: "POST",
                body: JSON.stringify({ url }),
            });
            const { data, success, message } = await res.json();

            if (!success) {
                setTimeout(
                    toast({
                        title: "Error",
                        description: message,
                    }).dismiss,
                    3000
                );
            } else {
                setTranscript(() => data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getSummary = async (inWords?: number) => {
        try {
            complete("", {
                body: {
                    transcript,
                    inWords,
                },
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (error) {
            setTimeout(
                toast({
                    title: "Error",
                    description: error.message,
                }).dismiss,
                3000
            );
        }
    }, [error, toast]);

    useEffect(() => {
        setSummary(completion);
    }, [completion]);

    return (
        <main className="flex justify-center pt-12">
            <div className="max-w-3xl w-full">
                <form className="mt-12 flex gap-4" onSubmit={getTranscript}>
                    <Input
                        id="youtube-url"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter Youtube URL"
                        className="min-w-96"
                    />
                    <Button type="submit">Get Video Transcript</Button>
                </form>
                {input && (
                    <div className="mt-12 flex flex-wrap gap-6 justify-center">
                        <Textarea
                            value={input}
                            readOnly
                            className="w-full h-52 overflow-auto resize-none"
                        />
                        <Button
                            disabled={isLoading}
                            onClick={() => copyToClipboard(input)}
                        >
                            Copy
                        </Button>
                        <Button
                            disabled={isLoading}
                            onClick={() => getSummary()}
                        >
                            Summary
                        </Button>
                        <Button
                            disabled={isLoading}
                            onClick={() => getSummary(100)}
                        >
                            Short Summary
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
