import Express, {Request, Response} from "express";

export const app = Express();

import {server} from "./routes/server";
import {stats} from "./routes/stats";
import {blog} from "./routes/blog";

app.use(Express.static(`${__dirname}/static`));

app.get("/server/:address", async function (req: Request, res: Response) {
    await server(req, res);
});

app.get("/server/:address/stats", async function (req: Request, res: Response) {
    await stats(req, res);
});

app.get("/blog/:id", async function (req: Request, res: Response) {
    await blog(req, res);
});