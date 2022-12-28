export const srvOrigin = (host: string, port: number, srvRecord: any) => {
    if (!srvRecord)
        return `${host}:${port}`;

    return `${srvRecord.host}:${srvRecord.port}`;
}