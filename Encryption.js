const CryptoJS = require('crypto-js')
class Encryption {
    get encryptMethodLength() {
        var encryptMethod = this.encryptMethod;
        var aesNumber = encryptMethod.match(/\d+/)[0];
        return parseInt(aesNumber);
    }

    get encryptKeySize() {
        var aesNumber = this.encryptMethodLength;
        return parseInt(aesNumber / 8);
    }

    get encryptMethod() {
        return 'AES-256-CBC';
    }

    decrypt(encryptedString, key, interacoes) {
        var json = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encryptedString)));

        var salt = CryptoJS.enc.Hex.parse(json.salt);
        var iv = CryptoJS.enc.Hex.parse(json.iv);

        var encrypted = json.ciphertext;// no need to base64 decode.

        var iterations = parseInt(json.iterations);
        if (iterations <= 0) {
            iterations = interacoes;
        }
        var encryptMethodLength = (this.encryptMethodLength/4);// example: AES number is 256 / 4 = 64
        var hashKey = CryptoJS.PBKDF2(key, salt, {'hasher': CryptoJS.algo.SHA512, 'keySize': (encryptMethodLength/8), 'iterations': iterations});

        var decrypted = CryptoJS.AES.decrypt(encrypted, hashKey, {'mode': CryptoJS.mode.CBC, 'iv': iv});

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    encrypt(string, key, interacoes) {
        var iv = CryptoJS.lib.WordArray.random(16);// the reason to be 16, please read on `encryptMethod` property.

        var salt = CryptoJS.lib.WordArray.random(256);
        var iterations = interacoes;
        var encryptMethodLength = (this.encryptMethodLength/4);// example: AES number is 256 / 4 = 64
        var hashKey = CryptoJS.PBKDF2(key, salt, {'hasher': CryptoJS.algo.SHA512, 'keySize': (encryptMethodLength/8), 'iterations': iterations});

        var encrypted = CryptoJS.AES.encrypt(string, hashKey, {'mode': CryptoJS.mode.CBC, 'iv': iv});
        var encryptedString = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);

        var output = {
            'ciphertext': encryptedString,
            'iv': CryptoJS.enc.Hex.stringify(iv),
            'salt': CryptoJS.enc.Hex.stringify(salt),
            'iterations': iterations
        };

        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(output)));
    }
}
module.exports = Encryption;