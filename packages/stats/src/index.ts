import {client} from "@core/redis";
import {app} from "@core/api";
import {status, statusLegacy} from "minecraft-server-util";
import dotenv from "dotenv";

import {startMonitoring} from "./utils/downtime";
import {handle, resolveStatus, saveData} from "./utils/dataHandling";
import {srvOrigin} from "./utils/srvHandling";

dotenv.config();

export let notifications = null;

export const startService = async () => {
    await client.connect();
    app.listen(process.env.LILO_PORT);

    let statusServers = null,
        offlineServers = null,
        server: string;

    const loop = async function () {
        notifications = JSON.parse(await client.get("notifications") || "[]");
        statusServers = JSON.parse(await client.get("status") || "[]");
        offlineServers = JSON.parse(await client.get("offline") || "[]");

        for (server in statusServers) {
            let host = statusServers[server].split(":")[0].toLowerCase(),
                port = parseInt(statusServers[server].split(":")[1]);

            status(host, port).then(async (statusResult) => {
                const srvServer = await client.hGet(`server:${statusResult.srvRecord.host}:${statusResult.srvRecord.port}`, "data");
                if (!srvServer)
                    await client.rename(`server:${host}:${port}`, `server:${statusResult.srvRecord.host}:${statusResult.srvRecord.port}`);

                await handle(srvOrigin(host, port, statusResult.srvRecord), statusResult);
                await resolveStatus(host, port, offlineServers);
            }).catch(() => {
                statusLegacy(host, port).then(async (statusLegacyResult) => {
                    const srvServer = await client.hGet(`server:${statusLegacyResult.srvRecord.host}:${statusLegacyResult.srvRecord.port}`, "data");
                    if (!srvServer)
                        await client.rename(`server:${host}:${port}`, `server:${statusLegacyResult.srvRecord.host}:${statusLegacyResult.srvRecord.port}`);


                    await handle(srvOrigin(host, port, statusLegacyResult.srvRecord), statusLegacyResult);
                    await resolveStatus(host, port, offlineServers);
                }).catch(async () => {
                    const lastSeeen = parseInt(await client.hGet(`server:${host}:${port}`, "last_seen")) || Date.now();
                    if (lastSeeen && Date.now() - lastSeeen > 7 * 24 * 60 * 60 * 1000) {
                        await client.set("status", JSON.stringify(JSON.parse(await client.get("status") || "[]")
                            .filter(server => server != `${host}:${port}`)));
                        return await client.del(`server:${host}${port}`);
                    }

                    await saveData(`${host}:${port}`, {players: {online: 0, max: 0}, roundTripLatency: -1});
                    await startMonitoring(host, port);
                });
            });
        }

        setTimeout(loop, 60000);
    }

    await loop();
}