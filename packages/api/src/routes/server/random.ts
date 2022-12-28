import {defaultServerIcon} from "@core/api";
import {client} from "@core/redis";
import {Request, Response} from "express";

export const randomServer = async (req: Request, res: Response) => {
    const publicServers = JSON.parse(await client.get("public") || `["mc.hypixel.net:25565"]`),
        selectedServer = publicServers[Math.floor(Math.random() * publicServers.length)],
        host = selectedServer.split(":")[0],
        port = selectedServer.split(":")[1],
        serverData = JSON.parse(await client.hGet(`server:${selectedServer}`, "data"));

    return res.send({
        "server_name": `${host}${port != "25565" ? `:${port}` : ""}`,
        "motd": !serverData.motd.html ? serverData.motd : serverData.motd.html.replace(/\n/g, "<br>"),
        "favicon": serverData.favicon ? serverData.favicon : defaultServerIcon,
        "latency": !serverData.roundTripLatency ? "0ms" : `${serverData.roundTripLatency}ms`,
        "version": !serverData.version.name ? serverData.version.replace(/</g, "&lt;").replace(/>/g, "&gt;")
            : serverData.version.name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
        "version_number": !serverData.version.protocol ? "" : ` (${serverData.version.protocol})`,
        "player_count": !serverData.players ? "0/0" : `${serverData.players.online}/${serverData.players.max}`
    });
}