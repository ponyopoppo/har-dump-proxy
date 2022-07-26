import express from 'express';
import { DEFAULT_PROXY_OPTIONS, PollyProxy } from './PollyProxy';
import bodyParser from 'body-parser';
import fs from 'fs';

let proxy: PollyProxy = PollyProxy.create(DEFAULT_PROXY_OPTIONS);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded());
app.get('/', (_req, res) => {
    const recordings = fs.readdirSync('./recordings');
    res.render('index', {
        target: proxy.options.target,
        listenPort: proxy.options.listenPort,
        recordings,
    });
});

app.get('/recordings/:filename', (req, res) => {
    res.download(
        `./recordings/${req.params.filename}/recording.har`,
        `${req.params.filename}.har`
    );
});

app.post('/proxy/update', async (req, res) => {
    try {
        await proxy.stop();
        proxy = PollyProxy.create({
            target: req.body.target,
            listenPort: Number(req.body.listenPort),
        });
        res.redirect('/');
    } catch (e: any) {
        console.error(e);
        res.send(e.message);
    }
});

app.post('/proxy/stop', async (req, res) => {
    try {
        await proxy.stop();
        res.redirect('/');
    } catch (e: any) {
        console.error(e);
        res.send(e.message);
    }
});

const PORT = parseInt(process.env.PORT || '31311');
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
