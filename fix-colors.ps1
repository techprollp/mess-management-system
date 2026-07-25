$files = Get-ChildItem "C:\Users\User\.gemini\antigravity\scratch\mess-management-system-turso" -Recurse -Include *.html,*.js | Where-Object { $_.FullName -notlike "*\supabase\*" -and $_.FullName -notlike "*\mess-management-system-turso\mess*" }

foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw
    
    $newContent = $content -replace 'color:\s*#[0-9a-fA-F]{6}\s*!important', 'color: var(--text-main) !important'
    $newContent = $newContent -replace 'color:\s*black\s*!important', 'color: var(--text-main) !important'
    $newContent = $newContent -replace 'color:\s*(#1d1d1f|black)', 'color: var(--text-main)'
    $newContent = $newContent -replace 'color:\s*(#86868b|#64748b)', 'color: var(--text-secondary)'
    
    if ($content -ne $newContent) {
        Set-Content -Path $f.FullName -Value $newContent -NoNewline
        Write-Host "Updated $($f.Name)"
    }
}
