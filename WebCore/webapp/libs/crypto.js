let wt = {
    crypto:{
        // 生成32位key
        generateKey: function () {
            var key = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            return key;
        },
        /**
         * 对数据进行加密-3des加密
         * @param {object|string} body 需要加密的内容
         * @param {string} key 32位长度的私钥==>24位密码+8位偏移
         * @returns {string} 返回加密后的内容
         */
        encrypt: function (body, key) {
            if (key.length !== 32) {
                throw Error('密钥长度必须为32位');
            }
            if (!body) {
                return '';
            }
            if ($.type(body) === "object") {
                body = JSON.stringify(body);
            }
            var keys = CryptoJS.enc.Utf8.parse(key.substr(0, 24));
            var encrypt = CryptoJS.TripleDES.encrypt(body, keys, {
                iv: CryptoJS.enc.Utf8.parse(key.substr(24, 8)),//iv偏移量
                mode: CryptoJS.mode.CBC,  //CBC模式
                //mode: CryptoJS.mode.ECB,  //ECB模式
                padding: CryptoJS.pad.Pkcs7//padding处理
            });
            return encrypt.toString();
        },
        /**
        * 对数据进行解密-3des解密
        * @param {string} body 要解密的内容
        * @param {string} key 解密的公钥
        * @returns {string} 返回解密后的内容
        */
        decrypt: function (body, key) {
            var keys = CryptoJS.enc.Utf8.parse(key);
            var decrypt = CryptoJS.TripleDES.decrypt(body, keys, {
                iv: CryptoJS.enc.Utf8.parse(key.substr(24, 8)),//iv偏移量
                mode: CryptoJS.mode.CBC,
                //mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            //解析数据后转为UTF-8  
            return decrypt.toString(CryptoJS.enc.Utf8);
        },
        decryptResponse: function (data, key) {
            var type = $.type(data);
            if (type === "object") {
                if ($.type(data.Data) === 'string') {
                    data.Data = wt.crypto.decrypt(data.Data, key);
                    try {
                        data.Data = JSON.parse(data.Data);
                    }
                    catch (e) { // non-standard
                    }
                }
            } else if (type === 'string') {
                data = wt.crypto.decrypt(data, key);
                try {
                    data = JSON.parse(data);
                }
                catch (e) { // non-standard
                    data.Data = data.Data;
                }
            }
            return data;
        },
        // 对密钥进行RSA加密
        encryptKey: function (key) {
            return RSAEncrypt.encrypt(key);
        }
    }
}