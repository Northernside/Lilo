import {client} from "@core/redis";
import {Request, Response} from "express";

export const removeServer = async (req: Request, res: Response) => {
    if (!req.body.address || !await client.exists(`server:${req.body.address}${!req.body.address.includes(":") ? ":25565" : ""}`))
        return res.send({"status": 404});

    const serverStr = `server:${req.body.address}${!req.body.address.includes(":") ? ":25565" : ""}`;
    console.log(serverStr.replace("server:", ""))
    await client.set("status", JSON.stringify(JSON.parse(await client.get("status") || "[]")
        .filter(server => server != serverStr.replace("server:", ""))));
    await client.del(`server:${req.body.address}${!req.body.address.includes(":") ? ":25565" : ""}`);
    return res.send({"status": 200});
}