# 内容协商
当我们需要验证服务器是否提供正确的响应头时，HEAD 请求非常有用。
如果你想确保你的服务器支持 Brotli 或者 Gzip，你可以在 curl 命令中发送一个伪造的接受编码请求头；这可以像这样完成：

curl --HEAD -H "accept-encoding: br" https://onitroad.com/
如果我们想检查 GZIP，我们可以这样做：

curl --HEAD -H "accept-encoding: gzip" https://onitroad.com/
如果客户端支持多个压缩，它可以按优先顺序列出它们：

accept-encoding: br, gzip

# 发送 HTTP HEAD 请求，我们可以使用 --HEAD 选项  
curl --HEAD http://onitroad.com/Examples/ip.php

“-I”也可以用来代替“--HEAD”

如果要显示详细信息，请使用 -verbose 或者 -v 选项。
这样做还会显示有关 TLS 握手的信息。

curl --verbose --HEAD --silent https://onitroad.com/
“-s”或者“--silent”选项激活“静默模式”，这将隐藏进度条。

为了使示例更加用户友好，我使用了完整的选项名称 (--OPTION_NAME) 而不是短版本 (-O)。