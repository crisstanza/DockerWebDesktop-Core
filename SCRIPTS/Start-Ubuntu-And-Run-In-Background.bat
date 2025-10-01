@echo off
echo "Starting Ubuntu-24.04 in background..."
wsl -d Ubuntu-24.04 -u root -- export DWD_SETTINGS_HOME=%DWD_SETTINGS_HOME% ; export DWD_DEBUG=%DWD_DEBUG% ; nohup dotnet run --project ../DockerWebDesktop &
