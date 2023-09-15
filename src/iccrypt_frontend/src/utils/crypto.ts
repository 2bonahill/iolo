import * as vetkd from "ic-vetkd-utils";
import {iccrypt_backend} from "../../../declarations/iccrypt_backend";

var RSAKey = require('rsa-key');

const hex_decode = (hexString) =>
    Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const hex_encode = (bytes) =>
    bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export async function get_aes_256_gcm_key() {
    const seed = window.crypto.getRandomValues(new Uint8Array(32));
    const tsk = new vetkd.TransportSecretKey(seed);
    //const ek_bytes_hex = await iccrypt_backend.get_encrypted_symmetric_key_for(tsk.public_key());
    const EncryptedKeyHexAndDerivationId = null;//TODO await iccrypt_backend.get_encrypted_symmetric_key_for(tsk.public_key());
    const pk_bytes_hex = await iccrypt_backend.symmetric_key_verification_key();
    //const app_backend_principal = (await agent.Actor.agentOf(iccrypt_backend).getPrincipal()); // default is the anonymous principal!

    let derivationId: Uint8Array;
    let ek_bytes_hex: String = EncryptedKeyHexAndDerivationId[0];

    if (EncryptedKeyHexAndDerivationId[1] instanceof Uint8Array) {
        derivationId = EncryptedKeyHexAndDerivationId[1];
    }
    return tsk.decrypt_and_hash(
        hex_decode(ek_bytes_hex),
        hex_decode(pk_bytes_hex),
        //app_backend_principal.toUint8Array(),
        derivationId,
        32,
        new TextEncoder().encode("aes-256-gcm")
    );
}


export async function aes_gcm_decrypt(ciphertext_hex, rawKey) {
    const iv_and_ciphertext = hex_decode(ciphertext_hex);
    const iv = iv_and_ciphertext.subarray(0, 12); // 96-bits; unique per message
    const ciphertext = iv_and_ciphertext.subarray(12);
    const aes_key = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
    let decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        aes_key,
        ciphertext
    );
    return new TextDecoder().decode(decrypted);
}

export async function aes_gcm_encrypt(message, rawKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bits; unique per message
    const aes_key = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt"]);
    const message_encoded = new TextEncoder().encode(message);
    const ciphertext_buffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        aes_key,
        message_encoded
    );
    const ciphertext = new Uint8Array(ciphertext_buffer);
    var iv_and_ciphertext = new Uint8Array(iv.length + ciphertext.length);
    iv_and_ciphertext.set(iv, 0);
    iv_and_ciphertext.set(ciphertext, iv.length);
    return hex_encode(iv_and_ciphertext);
}

// from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function str2ab(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

export function ab2base64(buffer: ArrayBuffer ) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

export function base642ab(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export function importRsaPublicKey(pem: string): Promise<CryptoKey> {
    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(
        pemHeader.length,
        pem.length - pemFooter.length
    );
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

export function importRsaPrivateKey(pem: string): Promise<CryptoKey> {

    // Convert pem (pkcs1?) to pkcs8
    var key = new RSAKey(pem);
    var pkcs8Key = key.exportKey(); // Default format is pkcs8

    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = pkcs8Key.substring(
        pemHeader.length,
        pkcs8Key.length - pemFooter.length
    );

    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);

    // convert from a binary string to an ArrayBuffer
    const privateKeyArrayBuffer = str2ab(binaryDerString);

    return window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyArrayBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );
}

export function encrypt(publicKey: CryptoKey, plaintext: string): Promise<ArrayBuffer> {
    let enc = new TextEncoder();
    let messageBuffer = enc.encode(plaintext);
    return window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        messageBuffer
    );
}

export async function decrypt(privateKey: CryptoKey, ciphertext: ArrayBuffer): Promise<string> {
    let messageDecrypted = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        ciphertext
    );
    let dec = new TextDecoder();
    return dec.decode(messageDecrypted);
}