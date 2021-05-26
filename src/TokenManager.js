export function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function getAccessToken() {
    if (getCookie("access") != null) return "Bearer " + getCookie("access");
    else return null;
}

export function getRefreshToken() {
    if (getCookie("refresh") != "") return "Bearer " + getCookie("refresh");
    else return null;
}

export function setToken(access, refresh) {
    setCookie("access", access, 1);
    setCookie("refresh", refresh, 1);
}

export function removeTokens() {
    setCookie("access", "", -1);
    setCookie("refresh", "", -1);
}