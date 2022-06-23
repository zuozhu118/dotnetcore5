(function (factory) {
    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["/Scripts/RsaKey", "JSEncrypt"], factory);
    } else {

        // Browser globals
        factory(RSAKey, JSEncrypt);
    }
}(function (RsaKey, JSEncrypt) {
    var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var b64pad = "=";
    function hex2b64(h) {
        var i;
        var c;
        var ret = "";
        for (i = 0; i + 3 <= h.length; i += 3) {
            c = parseInt(h.substring(i, i + 3), 16);
            ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
        }
        if (i + 1 == h.length) {
            c = parseInt(h.substring(i, i + 1), 16);
            ret += b64map.charAt(c << 2);
        }
        else if (i + 2 == h.length) {
            c = parseInt(h.substring(i, i + 2), 16);
            ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
        }
        while ((ret.length & 3) > 0) {
            ret += b64pad;
        }
        return ret;
    }

    var encrypt = (typeof define === "function" && define.amd) ? new JSEncrypt.JSEncrypt() : new JSEncrypt();
    encrypt.setPublicKey(RsaKey);
    var RSAEncrypt = {};
    RSAEncrypt.encrypt = function (input) {
        var result;
        do {
            result = encrypt.getKey().encrypt(input);
        } while (result.length != 256);
        return hex2b64(result);
    };
    //如果需要加密的字符串比较长，可以分段加密，然后返回以逗号分隔的加密字符串
    RSAEncrypt.encryptSection = function (input) {
        var len = 117;//最大长度为117
        var sectionLen = input.length / len;
        var rsaLength = sectionLen % 1 === 0 ? sectionLen : Math.floor(sectionLen) + 1;
        var arr = [];
        for (i = 0; i < rsaLength; i++) {
            arr.push(RSAEncrypt.encrypt(input.substring(i * len, (i + 1) * len)));
        }
        return arr.join(',');
    };

    if (typeof exports !== 'undefined') {
        module.exports = RSAEncrypt;
    } else {
        this.RSAEncrypt = RSAEncrypt;
    }

    return RSAEncrypt;
}));