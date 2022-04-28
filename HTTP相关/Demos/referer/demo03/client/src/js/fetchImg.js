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

const imgSrc = "https://localhost:8000";


function fetchImage(url) {
    return fetch(url, {
        headers: {
            // "Referer": "", // 这里设置无效
        },
        method: "GET",  
        // referrer: "", // 将referer置空
        referrerPolicy: 'unsafe-url', 
    }).then(response => response.blob());
}

fetchImage(imgSrc).then(blob => {
    handleBlob(blob);
});