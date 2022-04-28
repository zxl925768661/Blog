// 将下载下来的二进制大对象数据转换成base64，然后展示在页面上
function handleBlob(blob) {
    let reader = new FileReader();
    reader.onload = function(evt) {
        let img = document.createElement('img');
        img.src = evt.target.result;
        document.getElementById('container').appendChild(img)
    };
    reader.readAsDataURL(blob);
}

const imgSrc = "https://tiebapic.baidu.com/forum/w%3D580%3B/sign=f88eb0f2cf82b9013dadc33b43b6ab77/562c11dfa9ec8a135455cc35b203918fa1ecc09c.jpg";


function fetchImage(url) {
    return fetch(url, {
        headers: {
            // "Referer": "", // 这里设置无效
        },
        method: "GET",  
        // referrer: "", // 将referer置空
        referrerPolicy: 'no-referrer', 
    }).then(response => response.blob());
}

fetchImage(imgSrc).then(blob => {
    handleBlob(blob);
});