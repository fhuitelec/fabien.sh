import * as cloudflare from "@pulumi/cloudflare";
import * as fs from 'fs';
import * as path from 'path';

const account = new cloudflare.Account('fabien.sh', {
    name: 'fabien.sh'
}, {protect: true});

const zone = new cloudflare.Zone("fabien.sh", {
    accountId: account.id,
    plan: 'free',
    zone: 'fabien.sh',
}, {protect: true,});

const scriptPath = path.join(__dirname, 'script', 'curl_landing.js');

const script = new cloudflare.WorkerScript('curl-landing', {
    name: 'curl-landing',
    accountId: account.id,
    content: fs.readFileSync(scriptPath, 'utf8'),
    module: true,
}, {protect: true});

new cloudflare.WorkerRoute('main', {
    pattern: 'fabien.sh/*',
    scriptName: script.name,
    zoneId: zone.id,
}, {protect: true});
