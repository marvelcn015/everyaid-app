import { useQuery } from "@tanstack/react-query";

export const useStreamInfo = ({
    streamId
}: {
    streamId: string;
}) => {
    return useQuery({
        queryKey: ["getStreamInfo", streamId],
        queryFn: async () => {
            const res = await fetch(`/api/streams?id=${streamId}`);
            if (!res.ok) throw new Error("Failed to fetch stream info");
            const json = await res.json();

            if (!json.stream) return null;

            return {
                id: json.stream.id as string,
                title: (json.stream.title as string) || "Untitled Stream",
                description: "",
                streamer: {
                    name: (json.streamer?.display_name as string) || json.stream.streamer_wallet?.slice(0, 8) || "Unknown",
                    address: (json.streamer?.wallet_address as string) || (json.stream.streamer_wallet as string) || "",
                    avatar: (json.streamer?.avatar_url as string) || "",
                },
            };
        },
        enabled: !!streamId
    });
};
export default useStreamInfo;
