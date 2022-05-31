const { randomBytes, createHash } = require('crypto');
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
// const key = randomBytes(16).toString('base64');
const key = '8ZuOAG3PepR31z9HtJCkso==';
let val = createHash('sha1').update(key + GUID).digest('base64');
console.log(val);   // vQCeyABRRt6oKfebHddaBNvaTR4=