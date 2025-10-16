import fastify from 'fastify';
import fs from 'fs';
import zlib from 'zlib';
import jwtLib from 'jsonwebtoken';
import config from '#server/config';
const app = fastify();
export const throwReplyDecorator = {
    getter() {
        const reply = this;
        return {
            notFound(msg) {
                return reply
                    .status(404)
                    .send({ statusCode: 404, message: msg || `Not found` });
            },
            badParams(msg) {
                return reply
                    .status(400)
                    .send({ statusCode: 400, message: msg || `Bad request parameters` });
            },
            rejected(msg) {
                return reply
                    .status(400)
                    .send({ statusCode: 400, message: msg || `Request rejected` });
            },
            misconfigured(msg) {
                return reply.status(500).send({
                    statusCode: 500,
                    message: msg || `Something is not configured`,
                });
            },
            authException(msg) {
                return reply
                    .status(401)
                    .send({ statusCode: 401, message: msg || `Wrong auth token` });
            },
            accessDenied(msg) {
                return reply.status(403).send({
                    statusCode: 403,
                    message: msg || `You don't have an access to this page`,
                });
            },
            conflict(msg) {
                return reply.status(409).send({
                    statusCode: 409,
                    message: msg || `Conflict in the current state of the resource`,
                });
            },
            gone(msg) {
                return reply.status(410).send({
                    statusCode: 410,
                    message: msg || `The requested resource is no longer available`,
                });
            },
            internalError(msg) {
                return reply.status(500).send({
                    statusCode: 500,
                    message: msg || `Internal server error`,
                });
            },
        };
    },
};
export const okReplyDecorator = function (msg) {
    const reply = this;
    return reply.status(200).send({ message: msg || undefined });
};
export const jwt = {
    sign(payload, expiresIn = '20d') {
        return new Promise((resolve) => {
            jwtLib.sign(payload, config.jwt.secret, { expiresIn }, (error, token) => {
                if (error) {
                    resolve({ success: false, error });
                }
                resolve({ success: true, data: token });
            });
        });
    },
    verify(token) {
        return new Promise((resolve) => {
            jwtLib.verify(token, config.jwt.secret, (error, payload) => {
                if (error) {
                    resolve({ success: false, error });
                }
                resolve({ success: true, data: payload });
            });
        });
    },
};
export function gzipFile(inputFilePath) {
    const outputFilePath = inputFilePath + '.gz';
    const inputBuffer = fs.readFileSync(inputFilePath);
    const compressedData = zlib.gzipSync(inputBuffer);
    fs.writeFileSync(outputFilePath, compressedData);
}
