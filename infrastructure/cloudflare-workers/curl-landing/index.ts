import * as cloudflare from "@pulumi/cloudflare";

const account = new cloudflare.Account('fabien.sh', {
    name: 'fabien.sh'
}, {protect: true});

const zone = new cloudflare.Zone("fabien.sh", {
    accountId: account.id,
    plan: 'free',
    zone: 'fabien.sh',
}, {protect: true,});

const script = new cloudflare.WorkerScript('curl-landing', {
    accountId: account.id,
    content: `/**
 * Returns whether a request has a User-Agent
 * hinting the requests comes from the curl CLI tool or library
 *
 * @param {Request} request
 * @return {boolean}
 */
const isCurlUserAgent = (request) => {
  return request.headers.get('user-agent')?.startsWith('curl/');
}

export default {
  async fetch(request, env, ctx) {
    if (isCurlUserAgent(request)) {
      return Response.json(
        {
          roles: ['cloud-engineer', 'platform-engineer', 'sre'],
          status: 'freelance',
          available: true,
          topics: ['dev', 'infrastructure', 'platform']
        },
        {
          status: 203,
          statusText: 'Non-Authoritative Information'
        });
    }

    return fetch(request);
  },
};
`,
    name: 'curl-landing',
    module: true,
}, {protect: true});

new cloudflare.WorkerRoute('main', {
    pattern: 'fabien.sh/*',
    scriptName: script.name,
    zoneId: zone.id,
}, {protect: true});
