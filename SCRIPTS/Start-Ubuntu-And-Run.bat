@echo off
echo Starting Ubuntu-24.04...
set DWD_DEBUG=true
wsl -d Ubuntu-24.04 -u root -- export DWD_SETTINGS_HOME=%DWD_SETTINGS_HOME% ; export DWD_CHECK_FOR_UPDATES_INTERVAL=%DWD_CHECK_FOR_UPDATES_INTERVAL% ; export DWD_DEBUG=%DWD_DEBUG% ; dotnet run --project ../DockerWebDesktop
pause
