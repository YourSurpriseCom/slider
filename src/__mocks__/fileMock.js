const target = {};

const handler = {
    get: function (t, prop) {
        return prop;
    },
};

const proxy = new Proxy(target, handler);

export default proxy;
