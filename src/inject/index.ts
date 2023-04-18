(function (xhr: any) {
    const XHR = xhr.prototype;

    const { open } = XHR;

    XHR.open = function (_method: string, url: string) {
        this.addEventListener('load', () => {
            // console.log('xhr response23213:', this.response);
            if (url === 'https://buyin.jinritemai.com/pc/selection/search/pmt') {
                window.postMessage({ cmd: 'products', data: this.response }, '*');
            }
        });
        // eslint-disable-next-line prefer-rest-params
        return Reflect.apply(open, this, arguments);
    };
})(XMLHttpRequest);

export default {};
