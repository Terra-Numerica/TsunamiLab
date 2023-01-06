start microsoft-edge:http://localhost:8000/
$wshell = New-Object -ComObject wscript.shell;
$wshell.AppActivate('Google - Microsoft Edge')
sleep 2
$wshell.SendKeys('{F11}')








