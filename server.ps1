# Servidor HTTP local leve em PowerShell (sem precisar instalar Node ou Python)
param([int]$Port = 8080)

$root = $PSScriptRoot
$url = "http://localhost:$Port/"

$mimeTypes = @{
  ".html"        = "text/html; charset=utf-8"
  ".css"         = "text/css; charset=utf-8"
  ".js"          = "application/javascript; charset=utf-8"
  ".mjs"         = "application/javascript; charset=utf-8"
  ".json"        = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".svg"         = "image/svg+xml"
  ".png"         = "image/png"
  ".jpg"         = "image/jpeg"
  ".ico"         = "image/x-icon"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "====================================================" -ForegroundColor Green
Write-Host " Barra & Chao rodando em: $url" -ForegroundColor Green
Write-Host " Pressione Ctrl+C para encerrar o servidor." -ForegroundColor Yellow
Write-Host "===================================================="

Start-Process $url

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $relPath = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }

    $filePath = Join-Path $root ($relPath -replace '/', '\')

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $response.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
      $response.Headers.Add("Cache-Control", "no-store")
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
    }
    $response.Close()
  }
} finally {
  $listener.Stop()
}
