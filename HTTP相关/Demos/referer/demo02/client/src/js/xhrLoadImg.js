// 通过ajax下载图片
function loadImage(uri) {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.onload = function() {
            resolve(xhr.response);
        };

        xhr.open("GET", uri, true);
        // 通过setRequestHeader设置header不会生效
        // 会提示 Refused to set unsafe header "Referer"
        xhr.setRequestHeader("Referer", ""); 
        xhr.send();
    });
}
  

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

const imgSrc = "http://localhost:9999";

loadImage(imgSrc).then(blob => {
    handleBlob(blob);
});
