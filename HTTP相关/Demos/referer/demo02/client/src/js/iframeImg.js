function showImg(src, wrapper ) {
    let url = new URL(src);
    let frameid = 'frameimg' + Math.random();
    window.img = `<img id="tmpImg" width=400 src="${url}" alt="图片加载失败，请稍后再试"/> `;

    // 构造一个iframe
    iframe = document.createElement('iframe')
    iframe.id = frameid
    iframe.src = "javascript:parent.img;" // 通过内联的javascript，设置iframe的src
    // 校正iframe的尺寸，完整展示图片
    iframe.onload = function () {
        var img = iframe.contentDocument.getElementById("tmpImg")
        if (img) {
            iframe.height = img.height + 'px'
            iframe.width = img.width + 'px'
        }
    }
    iframe.width = 200
    iframe.height = 200
    iframe.scrolling = "no"
    iframe.frameBorder = "0"
    wrapper.appendChild(iframe)
}

showImg('https://tiebapic.baidu.com/forum/w%3D580%3B/sign=f88eb0f2cf82b9013dadc33b43b6ab77/562c11dfa9ec8a135455cc35b203918fa1ecc09c.jpg', document.querySelector('#container'))