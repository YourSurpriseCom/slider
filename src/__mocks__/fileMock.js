const target = {};

const handler = {
    get: (_, prop) => prop,
};

const proxy = new Proxy(target, handler);

export default proxy;
