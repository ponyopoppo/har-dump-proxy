import httpProxy from 'http-proxy';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import NodeHttpAdapter from '@pollyjs/adapter-node-http';

Polly.register(FSPersister);
Polly.register(NodeHttpAdapter);

interface Options {
    target: string;
    listenPort: number;
}

export const DEFAULT_PROXY_OPTIONS: Options = {
    target: 'https://www.google.com/',
    listenPort: 8000,
};

export class PollyProxy {
    static create(options: Options) {
        return new PollyProxy(
            new Polly(`proxy_${Date.now()}`, {
                adapters: ['node-http'],
                persister: 'fs',
                recordFailedRequests: true,
            }),
            httpProxy
                .createProxyServer({
                    target: options.target,
                    secure: false,
                    changeOrigin: true,
                    autoRewrite: true,
                    headers: {
                        referer: '',
                    },
                })
                .listen(options.listenPort)
                .on('error', (err, req, res) => {
                    console.error('proxy error', err);
                    res.end();
                }),
            options
        );
    }

    private constructor(
        private polly: Polly,
        private proxy: httpProxy,
        public options: Options
    ) {}

    async stop() {
        await this.polly.stop();
        this.proxy.close();
    }
}
