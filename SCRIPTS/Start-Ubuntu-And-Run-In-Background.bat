@echo off
echo Starting Ubuntu-24.04 in background...
echo Wait some seconds and then you can now close this window.
wsl -d Ubuntu-24.04 -u root -- export DWD_SETTINGS_HOME=%DWD_SETTINGS_HOME% ; export DWD_CHECK_FOR_UPDATES_INTERVAL=%DWD_CHECK_FOR_UPDATES_INTERVAL% ; export DWD_DEBUG=%DWD_DEBUG% ; nohup dotnet run --project ../DockerWebDesktop ^>/dev/null 2^>^&1 &
