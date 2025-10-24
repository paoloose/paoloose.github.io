import { createHash } from 'crypto';
import fs from 'node:fs/promises';

function sha256(what: string) {
  return createHash('sha256').update(what).digest('hex');
}

function urlToString(url: string | URL | Request) {
    return url instanceof URL
        ? url.href
        : url instanceof Request
        ? url.url
        : url;
}

type CachedRequest<T = any> = {
    method: string,
    url: string,
    headers: { [k: string]: string; },
    response: T,
}

function hashRequest(...args: Parameters<typeof fetch>) {
    const [url, ...rest] = args;
    const urlStr = urlToString(url);

    const encodedUrl = encodeURIComponent(urlStr);
    return sha256(`${JSON.stringify(encodedUrl)}/${JSON.stringify(rest)}`);
}

export async function wfetch<T>(...args: Parameters<typeof fetch>): Promise<T> {
    const requestHash = hashRequest(...args);
    const cachedPath = `.cache/${requestHash}.json`;

    try {
        const contents = (await fs.readFile(cachedPath)).toString();
        const cachedRequest: CachedRequest<T> = JSON.parse(contents);
        return cachedRequest.response;
    } catch {
        const response = await fetch(...args);
        const data: T = await response.json();

        await fs.writeFile(cachedPath, JSON.stringify({
            method: args[1]?.method ?? 'GET',
            url: urlToString(args[0]),
            headers: Object.fromEntries(response.headers),
            response: data,
        } satisfies CachedRequest<T>, null, 2));
        return data;
    }
}
