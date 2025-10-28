/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */


import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { md5 } from 'js-md5';

const baseUrl = "https://edith.xiaohongshu.com";

const request = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    withCredentials: true,
});

request.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const path = axios.getUri(config).replace(baseUrl, '');
    // const sign = await sendMessage('webmsxyw', { path, body: config.data });
    config.headers["x-s"] = await seccore_signv2(path, config.data);
    config.headers["x-t"] = +new Date + "";
    config.headers["x-s-common"] = getXSCommon();
    config.headers["x-xray-traceid"] = traceId();
    config.headers["x-b3-traceid"] = xB3TraceId();
    return config;
});


interface Result {
    code: number
    data: any
    msg: string
    success: boolean
}

request.interceptors.response.use(
    (response: AxiosResponse<Result, any>) => {
        if (!response.data) {
            throw new Error("小红书API返回内容为空");
        }
        const { data, msg, success } = response.data
        if (!success) {
            throw new Error(msg || '请求失败')
        }
        return data
    }
);

export default request;


function xB3TraceId() {
    for (var e = "", r = 0; r < 16; r++)
        e += "abcdef0123456789".charAt(Math.floor(16 * Math.random()));
    return e
}

function traceId() {
    // @ts-ignore
    const random = (bits) => Math.floor(Math.random() * (1 << bits));
    const e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : Date.now();
    const part1 = (BigInt(e) << 23n) | BigInt(random(23));
    const part2 = (BigInt(random(32)) << 32n) | BigInt(random(32));
    return part1.toString(16).padStart(16, "0") + part2.toString(16).padStart(16, "0");
}

// @ts-ignore
async function seccore_signv2(e, a) {
    // @ts-ignore
    const _type_of = function (t) {
        return t && "undefined" != typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t
    };
    var r = window.toString
        , c = e;
    "[object Object]" === r.call(a) || "[object Array]" === r.call(a) || (void 0 === a ? "undefined" : (
        _type_of)(a)) === "object" && null !== a ? c += JSON.stringify(a) : "string" == typeof a && (c += a);
    var d = (md5)([c].join(""));
    var s = await sendMessage("mnsv2", [c, d]);
    // @ts-ignore
    var f = {
        x0: '4.2.6',
        x1: "xhs-pc-web",
        // @ts-ignore
        x2: window['xsecplatform'] || "PC",
        x3: s,
        x4: a ? void 0 === a ? "undefined" : (_type_of)(a) : ""
    };
    return "XYS_" + encrypt_b64Encode(encrypt_encodeUtf8(JSON.stringify(f)))
}

//---------- x-s-common ------------- //

function getXSCommon() {
    const f = localStorage["b1"];
    const l = (tb)("".concat("").concat("").concat(f));
    const p = localStorage["b1b1"] || "1";
    const o = os_getOS();
    const h = {
        s0: getPlatform(o),
        s1: "",
        x0: p,
        x1: "4.2.6",
        x2: o,
        x3: "xhs-pc-web",
        x4: "4.83.1",
        x5: getCookie("a1"),
        x6: "",
        x7: "",
        x8: f,
        x9: l,
        x10: 0,
        x11: "normal",
    };
    return encrypt_b64Encode(encrypt_encodeUtf8(JSON.stringify(h)));
}


// @ts-ignore
function a0_0x1131() { var n = ["xUKNL", "jUrZI", "rviFu", "join", "get", "LjDtD", "ZJHyP", "wOmGY", "enumera", "aONWR", "string", "kQpMi", "mZPJZ", "Ysiay", "czxKn", "|5|6|4|", "prototy", "jklmnop", "MuYbw", "diDwk", "TRFtx", "drDHI", "WLARA", "xyz0123", "asBytes", "|6|0|1|", "JOtEi", "Oialn", "OQrEi", "uPnXq", "VWXYZab", "cIbFa", "qYuta", "QDOZZ", "MahgM", "iRXZq", "22098XlFGYn", "mmLKn", "jMcIE", "stringi", "[object", "nYqUQ", "jSgjk", "ucyEo", "iewJI", "vgTwl", "DnNGR", "oBytes", "Xtwzk", "aqlTy", "JWnPK", "1|0|2|4", "qrstuvw", "_gg", "QLthP", "FJIWy", "yRnhISG", "pjUsr", "KAwuh", "Thhoa", "jarkJ", "WjRNN", "asStrin", "x3VT16I", "357835LaQWjW", "SkIJl", "size", "iyorr", "iHUeL", "tTanW", "tNusJ", "NiSrP", "eAt", "TCArD", "a2r1ZQo", "iamspam", "bOnfu", "UNSKg", "HIJKLMN", "ZfMKC", "bJhXU", "zwAAc", "JYxWY", "lUAFM97", "mwaRe", "EzYWD", "replace", "uOtUJ", "__esMod", "ViQWI", "aCMFL", "EAKSd", "ule", "pqnFP", "qYDsL", "270726pnaYfG", "glBZG", "OwjMq", "YGrjc", "ZhAcd", "JDqFL", "456789+", "kEjQs", "lWhbD", "OaLTI", "dXlgm", "cVte9UJ", "ctor", "hwomB", "wDtJz", "constru", "ABHuC", "zDETq", "SYNeA", "BGbij", "ionFq", "QzaNS", "7|3|5|4", "YlZGp", "Bjniw", "ZITuN", "KPTzH", "HrBeq", "xobsT", "kXJkC", "QSrEZ", "ENXtO", "FYbRJ", "wOcza/L", "_hh", "dVXMb", "ppkua", "WgamZ", "HuwCW", "362424fnLCuh", "charCod", "HhPqg", "ODunI", "eJzqq", "charAt", "JGAgI", "ZmserbB", "TURcG", "WyrqF", "iYJzH", "VIwfH", "tzzOB", "YgiCH", "byyMQ", "ELxEv", "0DSfdik", "HRihr", "_ii", "aDsrp", "ble", "jTGtW", "configu", "cXiYW", "56kSpAsC", "158KIldlA", "oHQtNP+", "BHavO", "PCIlh", "QatIf", "IKyqh", "Words", "Qwnrg", "44lQAgNu", "cdefghi", "nTwxD", "RHteb", "coqPr", "rJwmI", "aBoeK", "default", "exports", "rceYY", "isArray", "mdKKO", "kzxWE", "DeBtm", "tjjUn", "vJEcD", "LpfE8xz", "bin", "HKazo", "rable", "call", "wordsTo", "zBiyt", "GrsGL", "fqulF", "jevwl", "mxfLj", "xlUnt", "q42KWYj", "endian", "eEqDc", "oyGAZ", "bytesTo", "OzjuJ", "IfwWq", "ize", "6648810piiNEz", "lTHdy", "vDLZJ", "stringT", "A4NjFqY", "GkjTz", "eooJA", "substr", "veNiI", "LYfDp", "ljKsP", "jJYWG", "bcYAf", "srikB", "utf8", "qTbeY", "yqRzd", "|3|5", "bjbAy", " Array]", "rMbXP", "u5wPHsO", "test", "gMIMC", "Deyqv", " argume", "ABCDEFG", "undefin", "split", "QTlsj", "_isBuff", "OPQRSTU", "Illegal", "loSen", "navigat", "ObwNo", "qPbcq", "7182692QogvXX", "tvqSn", "DGptJ", "HhTfW", "avIYx", "defineP", "PFQbW", "CjFyM", "toStrin", "yMWXS", "yMyOy", "0XTdDgM", "eXkru", "_blocks", "indexOf", "mbBQr", "lBuRH", "HzGjH", "HNErV", "mEokX", "userAge", "UpmtD", "sgomx", "KDfKS", "OTbSq", "lxMGW", "0|3|2|1", "dfWyB", "lWzAd", "eyXTL", "5624qreyZK", "pow", "IJstz", "LMlMB", "INlwI", "lRulU", "TCgZh", "_digest", "UBhIl", "fLtZZ", "FYSKq", "2|8|0", "IoCeZ", " Object", "UuTvI", "lNKLD", "String", "Bytes", "rBVvW", "KblCWi+", "pRaIH", "roperty", "vTINI", "atLE", "functio", "Udqoy", "nt ", "htSWx", "hEwRK", "encodin", "sCSVK", "VuAZF", "xeIIy", "RBjMb", "taTrq", "vDLFJ", "bPkya", "HzimH", "nCffO", "BWbtU", "2|8", "slice", "lxMGQ", "tTiwe", "JDhJB", "rCode", "gNDzY", "wJkyu", "cCZFe", "RNGSl", "floor", "clYIu", "vLiwz", "BiNSE", "MtYWB", "fromCha", "StNOc", "|7|5|3|", "9|1|4|6", "length", "UNYAE", "pngG8yJ", "hasOwnP", "pYeWu", "wTjkk", "Bvk6/7=", "KTmgk", "bIGxm", "readFlo", "LFZch", "_ff", "1|3|4|2", "binary", "LLdJZ", "ZofOU", "6399uFPxTQ", "push", "YntPT", "kSGXO", "random", "HfpCU", "hECvuRX", "getTime", "iwSyV", "alert", "LKMcb", "DJVdg", "Hex", "URzKO", "CxjtF", "ZVOCs", "isBuffe", "vGpbT", "rotl", "udFrB", "CnbsH", "crLST"]; return (a0_0x1131 = function () { return n })() } function a0_0x3693(n, r) { var t = a0_0x1131(); return (a0_0x3693 = function (n, r) { return t[n -= 131] })(n, r) } function a0_0x10f4ac(n, r) { return a0_0x3693(r - -570, n) } function encrypt_encodeChunk(n, r, t) { function e(n, r) { return a0_0x10f4ac(n, r - x) } for (var u, o = 165, c = 246, i = 205, f = 353, a = 162, l = 17, s = 351, p = 191, y = 139, I = 79, b = 86, v = 233, T = 270, x = 166, Y = { hwomB: function (n, r) { return n < r }, iHUeL: function (n, r) { return n & r }, ELxEv: function (n, r) { return n << r }, lBuRH: function (n, r) { return n << r }, SkIJl: function (n, r) { return n & r }, JYxWY: function (n, r) { return n + r }, CxjtF: function (n, r) { return n(r) } }, k = [], J = r; Y[e(-63, -o)](J, t); J += 3)u = Y[e(-c, -i)](Y[e(-166, -124)](n[J], 16), 16711680) + Y[e(-f, -205)](Y[e(a, -l)](n[J + 1], 8), 65280) + Y[e(-s, -208)](n[Y[e(-350, -p)](J, 2)], 255), k[e(y, 73)](Y[e(I, b)](encrypt_tripletToBase64, u)); return k[e(-v, -T)]("") } function encrypt_tripletToBase64(n) { function r(n, r) { return a0_0x10f4ac(r, n - v) } var t = 11, e = 15, u = 199, o = 34, c = 4, i = 102, f = 276, a = 205, l = 218, s = 11, p = 115, y = 34, I = 161, b = 123, v = 335, T = {}; T[r(205, 328)] = function (n, r) { return n + r }, T[r(t, 53)] = function (n, r) { return n >> r }, T[r(e, u)] = function (n, r) { return n & r }, T[r(o, c)] = function (n, r) { return n >> r }, T[r(-i, -f)] = function (n, r) { return n & r }; var x = T; return x[r(a, l)](encrypt_lookup[63 & x[r(s, -75)](n, 18)], encrypt_lookup[x[r(e, p)](x[r(y, I)](n, 12), 63)]) + encrypt_lookup[n >> 6 & 63] + encrypt_lookup[x[r(-i, -b)](n, 63)] } function encrypt_encodeUtf8(n) { function r(n, r) { return a0_0x10f4ac(n, r - T) } for (var t = 185, e = 410, u = 480, o = 222, c = 194, i = 165, f = 147, a = 290, l = 460, s = 472, p = 497, y = 462, I = 286, b = 209, v = 223, T = 590, x = { bIGxm: function (n, r) { return n(r) }, MahgM: function (n, r) { return n < r }, czxKn: function (n, r) { return n === r }, clYIu: function (n, r) { return n + r } }, Y = x[r(477, 488)](encodeURIComponent, n), k = [], J = 0; x[r(333, t)](J, Y[r(e, u)]); J++) { var d = Y[r(o, 290)](J); if (x[r(c, i)](d, "%")) { var j = Y[r(f, a)](x[r(574, 472)](J, 1)) + Y[r(l, 290)](x[r(605, s)](J, 2)), q = parseInt(j, 16); k[r(592, p)](q), J += 2 } else k[r(y, p)](d[r(217, I) + r(b, v)](0)) } return k } function encrypt_b64Encode(n) { function r(n, r) { return a0_0x10f4ac(r, n - -E) } for (var t = 664, e = 634, u = 448, o = 599, c = 315, i = 416, f = 512, a = 361, l = 406, s = 487, p = 496, y = 333, I = 630, b = 639, v = 548, T = 582, x = 447, Y = 468, k = 375, J = 331, d = 149, j = 382, q = 265, w = 625, g = 570, h = 551, B = 582, _ = 581, D = 638, W = 618, L = 606, z = 429, Z = 651, m = 667, C = 817, H = 333, O = 567, S = 747, A = 561, G = 570, K = 676, M = 840, E = 240, F = { udFrB: function (n, r) { return n % r }, cCZFe: function (n, r) { return n === r }, jevwl: function (n, r) { return n - r }, aqlTy: function (n, r) { return n + r }, rceYY: function (n, r) { return n >> r }, OwjMq: function (n, r) { return n & r }, kSGXO: function (n, r) { return n << r }, veNiI: function (n, r) { return n === r }, QLthP: function (n, r) { return n + r }, wDtJz: function (n, r) { return n + r }, nYqUQ: function (n, r) { return n & r }, TCArD: function (n, r) { return n << r }, RHteb: function (n, r) { return n - r }, mZPJZ: function (n, r) { return n < r }, zDETq: function (n, r, t, e) { return n(r, t, e) }, YlZGp: function (n, r) { return n > r } }, N = (r(-413, -442) + r(-t, -e) + "7")[r(-u, -o)]("|"), U = 0; ;) { switch (N[U++]) { case "0": var P; continue; case "1": var Q = []; continue; case "2": var R = F[r(-c, -i)](X, 3); continue; case "3": var X = n[r(-350, -f)]; continue; case "4": F[r(-a, -l)](R, 1) ? (P = n[F[r(-s, -p)](X, 1)], Q[r(-y, -346)](F[r(-I, -b)](encrypt_lookup[F[r(-503, -v)](P, 2)] + encrypt_lookup[F[r(-T, -741)](F[r(-331, -x)](P, 4), 63)], "=="))) : F[r(-Y, -k)](R, 2) && (P = F[r(-J, -d)](n[X - 2], 8) + n[F[r(-s, -j)](X, 1)], Q[r(-333, -q)](F[r(-w, -505)](F[r(-g, -h)](encrypt_lookup[P >> 10], encrypt_lookup[F[r(-B, -_)](P >> 4, 63)]) + encrypt_lookup[F[r(-D, -W)](F[r(-L, -z)](P, 2), 63)], "="))); continue; case "5": var V = 16383; continue; case "6": for (var $ = 0, nn = F[r(-509, -Z)](X, R); F[r(-m, -C)]($, nn); $ += V)Q[r(-H, -153)](F[r(-O, -S)](encrypt_encodeChunk, n, $, F[r(-A, -413)]($ + V, nn) ? nn : F[r(-G, -501)]($, V))); continue; case "7": return Q[r(-K, -M)]("") }break } } var encrypt_lookup = ["Z", "m", "s", "e", "r", "b", "B", "o", "H", "Q", "t", "N", "P", "+", "w", "O", "c", "z", "a", "/", "L", "p", "n", "g", "G", "8", "y", "J", "q", "4", "2", "K", "W", "Y", "j", "0", "D", "S", "f", "d", "i", "k", "x", "3", "V", "T", "1", "6", "I", "l", "U", "A", "F", "M", "9", "7", "h", "E", "C", "v", "u", "R", "X", "5"], encrypt_mcr = function (n) { function r(n, r) { return a0_0x10f4ac(r, n - G) } var t = 67, e = 15, u = 164, o = 126, c = 137, i = 39, f = 176, a = 72, l = 56, s = 21, p = 35, y = 34, I = 35, b = 18, v = 25, T = 185, x = 1149, Y = 744, k = 1295, J = 1248, d = 1310, j = 1096, q = 1166, w = 1095, g = 1196, h = 1180, B = 1039, _ = 976, D = 1347, W = 1117, L = 1168, z = 1233, Z = 1157, m = 1006, C = 1122, H = 1277, O = 1288, S = 1271, A = 986, G = 162, K = {}; K[r(-73, -66)] = function (n, r) { return n === r }, K[r(t, 186)] = function (n, r) { return n < r }, K[r(-e, -u)] = function (n, r) { return n ^ r }, K[r(e, -o)] = function (n, r) { return n & r }, K[r(-c, -i)] = function (n, r) { return n < r }, K[r(-175, -f)] = function (n, r) { return n ^ r }, K[r(-59, a)] = function (n, r) { return n ^ r }, K[r(-l, -s)] = function (n, r) { return n >>> r }, K[r(p, y)] = function (n, r) { return n >>> r }; for (var M, E, F = K, N = 3988292384, U = 256, P = []; U--; P[U] = F[r(I, -66)](M, 0))for (E = 8, M = U; E--;)M = F[r(e, b)](M, 1) ? F[r(35, v)](M, 1) ^ N : F[r(I, T)](M, 1); return function (n) { function t(n, t) { return r(t - 1181, n) } if (F[t(x, 1108)](function (n) { return typeof n }(n), t(Y, 914))) { for (var e = 0, u = -1; F[t(k, J)](e, n[t(d, 1233)]); ++e)u = F[t(j, q)](P[F[t(w, g)](u, 255) ^ n[t(h, B) + t(1022, _)](e)], u >>> 8); return F[t(D, 1166)](u, -1) ^ N } for (e = 0, u = -1; F[t(W, 1044)](e, n[t(L, z)]); ++e)u = F[t(Z, m)](P[F[t(1229, C)](F[t(H, g)](u, 255), n[e])], F[t(O, 1125)](u, 8)); return F[t(S, C)](F[t(A, 1122)](u, -1), N) } }();

function os_getOS() {
    const userAgent = window.navigator?.userAgent?.toLowerCase() || '';
    if (userAgent.indexOf('android') >= 0) return "Android";
    if (userAgent.indexOf('iphone') >= 0 || userAgent.indexOf('ipad') >= 0 || userAgent.indexOf('ipod') >= 0) return "iOS";
    if (userAgent.indexOf('macintosh')) return "Mac OS";
    if (userAgent.indexOf('windows')) return "Windows";
    if (userAgent.indexOf('linux')) return "Linux";
    return "PC";
}

// @ts-ignore
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

// @ts-ignore
function getPlatform(t) {
    switch (t) {
        case "Windows":
            return 0;
        case "Android":
            return 2;
        case "iOS":
            return 1;
        case "Mac OS":
            return 3;
        case "Linux":
            return 4;
        default:
            return 5;
    }
}

// @ts-ignore
var tb = function (e) {
    // @ts-ignore
    for (var a = 0xedb88320, r, c, d = 256, s = []; d--; s[d] = r >>> 0)
        for (c = 8,
            r = d; c--;)
            r = 1 & r ? r >>> 1 ^ a : r >>> 1;
    // @ts-ignore
    return function (e) {
        if ("string" == typeof e) {
            for (var r = 0, c = -1; r < e.length; ++r)
                // @ts-ignore
                c = s[255 & c ^ e.charCodeAt(r)] ^ c >>> 8;
            return -1 ^ c ^ a
        }
        for (var r = 0, c = -1; r < e.length; ++r)
            // @ts-ignore
            c = s[255 & c ^ e[r]] ^ c >>> 8;
        return -1 ^ c ^ a
    }
}()