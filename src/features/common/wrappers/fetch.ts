const proxy = import.meta.env.FETCH_PROXY;

export function wfetch(...args: Parameters<typeof fetch>) {
    // if (import.meta.env.DEV && proxy) {
    //     const [_, ...args2] = args;
    //     return fetch(proxy, ...args2);
    // }
    return fetch(...args);
}
