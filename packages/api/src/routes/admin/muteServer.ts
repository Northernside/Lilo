import {client} from "@core/redis";
import {Request, Response} from "express";

export const muteServer = async (req: Request, res: Response) => {
    if (!req.body.address)
        return res.send({"status": 404});
    
    await client.hSet(`no_notify`, `server:${req.body.address}${!req.body.address.includes(":") ? ":25565" : ""}`, "true");
    return res.send({"status": 200});
}