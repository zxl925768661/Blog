var buf1 = Buffer.from('abcdefghijkl');
var buf2 = Buffer.from('RUNOOB');

//将 buf2 插入到 buf1 指定位置上
buf2.copy(buf1, 3);

console.log(buf1.toString());

let _bufferLength = 'abcdefghijkl'.length, _dataReadPosition = 3, _dataWritePosition = 1;
let _buffer = Buffer.from('abcdefghijkl');
let dataTailLen = _bufferLength - _dataReadPosition;
let tempBuffer = Buffer.alloc(12);

_buffer.copy(tempBuffer, 0, _dataReadPosition, _bufferLength);

_buffer.copy(tempBuffer, dataTailLen, 0, _dataWritePosition);


console.log(tempBuffer.toString())


let headBuffer = Buffer.alloc(4);
_buffer.copy(headBuffer, 0, _dataReadPosition, _dataReadPosition + 4)
console.log(headBuffer.toString())


const msg = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
let buf = Buffer.from(msg)
let fuck = Buffer.alloc(512).fill(msg, 0, msg.length)

console.log(fuck, fuck.toString(), fuck[500])



console.log(buf.copy(Buffer.alloc(128), 0), '-------')
buf.write('fuck')
console.log(buf.toString())

let fuck1= Buffer.concat([Buffer.from('\r\n'), buf])
console.log(buf.length, fuck1, fuck1.toString(), fuck1.length, '--===')