import pino from 'pino';
export default pino({
    transport: {
        target: 'pino-pretty',
        options: {
            translateTime: 'HH:MM:ss Z',
            singleLine: true,
        },
    },
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    formatters: {
        bindings: () => ({}),
    },
});
