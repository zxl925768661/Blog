const EventEmitter = require('events').EventEmitter;
const StackBuffer = function (bufferLength) {
    const _event = new EventEmitter();
    let _dataHeadLen = 2; 
    let _bufferLength = bufferLength || 512; // buffer默认长度
    let _buffer = Buffer.alloc(bufferLength || _bufferLength); // 申请内存
    let _dataLen = 0; // 已经接收数据的长度

    let _dataWritePosition = 0; // 数据存储起始位置
    let _dataReadPosition = 0; // 数据存储结束位置


    this.putData = function (data) {
        if (data == undefined) {
            return;
        }
    
        //要拷贝数据的起始位置
        let dataStart = 0;
        // 要拷贝数据的结束位置
        let dataLength = data.length;
        // 缓存剩余可用空间
        let availableLen = _bufferLength - _dataLen;

        // buffer剩余空间不足够存储本次数据
        if (availableLen < dataLength) {
            // 以512字节为基数扩展Buffer空间
            let exLength = Math.ceil((_dataLen + dataLength) / 512) * 512;
            let tempBuffer = Buffer.alloc(exLength);
            _bufferLength = exLength;

            // 需要重新打包

            // 数据存储在buffer的尾部+头部的顺序
            if (_dataWritePosition < _dataReadPosition) {
                let dataTailLen = _bufferLength - _dataReadPosition;

                // 将 `_buffer` 字节 _dataReadPosition 到 _bufferLength 复制到 `tempBuffer` 中，从 `tempBuffer` 的字节 0 开始
                _buffer.copy(tempBuffer, 0, _dataReadPosition, _bufferLength);

                // 将 `_buffer` 字节 0 到 _dataWritePosition 复制到 `tempBuffer` 中，从 `tempBuffer` 的字节 dataTailLen 开始
                _buffer.copy(tempBuffer, dataTailLen, 0, _dataWritePosition);
            } else {
                _buffer.copy(tempBuffer, 0, _dataReadPosition, _dataWritePosition);
            }
            _buffer = tempBuffer;
            tempBuffer = null;

            _dataReadPosition = 0;
            _dataWritePosition = _dataLen;
            data.copy(_buffer, _dataWritePosition, dataStart, dataStart + dataLength);

            _dataWritePosition += dataLength;
        } // 数据长度超出buffer空间
        else if (_dataWritePosition + dataLength > _bufferLength) {
            /*   分两次存储到buffer：
             *   1、存储在原数据尾部 
             *   2、存储在原数据头部
            */
            // buffer尾部剩余空间的长度
            let bufferTailLength = _bufferLength - _dataWritePosition;
             
            // 数据尾部位置
            let dataEndPosition = dataStart + bufferTailLength;
            data.copy(_buffer, _dataWritePosition, dataStart, dataEndPosition);

            _dataWritePosition = 0;
            dataStart = dataEndPosition;

            // data剩余未拷贝进缓存的长度
            let unDataCopyLen = dataLength - bufferTailLength;
            data.copy(_buffer, _dataWritePosition, dataStart, dataStart + unDataCopyLen);
            
            // 记录buffer可写位置
            _dataWritePosition = _dataWritePosition + unDataCopyLen;
        }
        // 剩余空间足够存储数据 
        else {
            // 拷贝数据到buffer
            data.copy(_buffer, _dataWritePosition, dataStart, dataStart + dataLength);
           
            // 记录buffer可写位置
            _dataWritePosition = _dataWritePosition + dataLength;
        }
        // 记录数据长度
        _dataLen = _dataLen + dataLength;
        // 读取数据
        getData();
    
    }

    // 获取数据
    function getData() {
        while (true) {
            // 没有数据可读,不够解析出包头
            if (getDataLen() <= _dataHeadLen) {
                break;
            }
            // 解析包头长度
            // 尾部最后剩余可读字节长度
            let buffLastCanReadLen = _bufferLength - _dataReadPosition;
            let dataLen = 0;
            let headBuffer = Buffer.alloc(_dataHeadLen);
            // 数据包为分段存储，不能直接解析出包头
            if (buffLastCanReadLen < _dataHeadLen) {
                // 取出第一部分头部字节
                _buffer.copy(headBuffer, 0, _dataReadPosition, _buffer.length);
                // 取出第二部分头部字节
                let unReadHeadLen = _dataHeadLen - buffLastCanReadLen;
                _buffer.copy(headBuffer, buffLastCanReadLen, 0, unReadHeadLen);
                
                dataLen = headBuffer.readInt16BE() + _dataHeadLen;
            }
            else {
                _buffer.copy(headBuffer, 0, _dataReadPosition, _dataReadPosition + _dataHeadLen);
                dataLen = headBuffer.readInt16BE();
                dataLen += _dataHeadLen;
            }
            // 数据长度不够读取，直接返回
            if (getDataLen() < dataLen) {
                break;
            }
            // 数据够读，读取数据包 
            else {
                let readData = Buffer.alloc(dataLen);
                // 数据是分段存储，需要分两次读取
                if (_bufferLength - _dataReadPosition < dataLen) {
                    let firstPartLen = _bufferLength - _dataReadPosition;
                    // 读取第一部分，直接到字符尾部的数据
                    _buffer.copy(readData, 0, _dataReadPosition, firstPartLen + _dataReadPosition);
                    // 读取第二部分，存储在开头的数据
                    let secondPartLen = dataLen - firstPartLen;
                    _buffer.copy(readData, firstPartLen, 0, secondPartLen);
                    _dataReadPosition = secondPartLen;
                }
                // 直接读取数据
                else {
                    _buffer.copy(readData, 0, _dataReadPosition, _dataReadPosition + dataLen);
                    _dataReadPosition += dataLen;
                }

                try {
                    // console.log('emit data');
                    _event.emit('data', readData);
                    _dataLen -= readData.length;
                    // 已经读取完所有数据
                    if (_dataReadPosition === _dataWritePosition) {
                        break;
                    }
                } catch (e) {
                    _event.emit('error', e);
                }
            }
        }
    }

    this.publishMsg = function (msg) {
        const bodyBuf = Buffer.from(msg);
        const headerBuf = Buffer.alloc(_dataHeadLen);
    
        headerBuf.writeInt16BE(bodyBuf.byteLength, 0);
    
        const msgBuf = Buffer.alloc(headerBuf.length + bodyBuf.length);
        // 拷贝缓冲区
        headerBuf.copy(msgBuf, 0, 0, headerBuf.length);
        bodyBuf.copy(msgBuf, headerBuf.length, 0, bodyBuf.length);
    
        return msgBuf;
    };

    // 获取缓存数据长度
    function getDataLen() {
        let dataLen = 0;
        // 缓存全满
        if (_dataLen === _bufferLength && _dataWritePosition >= _dataReadPosition) {
            dataLen = _bufferLength;
        }
        // 缓存全部数据读空
        else if (_dataWritePosition >= _dataReadPosition) {
            dataLen = _dataWritePosition - _dataReadPosition;
        }
        else {
            dataLen = _bufferLength - _dataReadPosition + _dataWritePosition;
        }

        return dataLen;
    }

    // 数据包接收完整后触发事件
    this.onMsgRecv = function (callback) {
        _event.on('data', (data) => {
            const headLen = _dataHeadLen;
            const head = Buffer.alloc(headLen);
            data.copy(head, 0, 0, headLen);

            const dataLen = head.readInt16BE();
            const body = Buffer.alloc(dataLen);
            data.copy(body, 0, headLen, headLen + dataLen);

            callback(body);
        });
    };


}

module.exports = exports = StackBuffer; 

