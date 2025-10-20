@echo off
echo Starting Ubuntu-24.04 in background...
echo You can now close this window.
wsl -d Ubuntu-24.04 -u root -- export DWD_SETTINGS_HOME=%DWD_SETTINGS_HOME% ; export DWD_DEBUG=%DWD_DEBUG% ; nohup dotnet run --project ../DockerWebDesktop ^>/dev/null 2^>^&1 &
