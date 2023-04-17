(function (xhr: any) {
    const XHR = xhr.prototype;

    const { send } = XHR;

    XHR.send = function () {
        this.addEventListener('load', () => {
            console.log('xhr response', this.response);
            window.postMessage({ cmd: 'xhr-response', data: this.response }, '*');
        });
        // eslint-disable-next-line prefer-rest-params
        return Reflect.apply(send, this, arguments);
    };
})(XMLHttpRequest);

export default {};
