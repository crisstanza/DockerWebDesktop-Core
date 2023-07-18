@echo off
echo "Starting Ubuntu-22.04..."
wsl -d Ubuntu-22.04 -u root -- export DWD_SETTINGS_HOME=%DWD_SETTINGS_HOME% ; dotnet run --project ../DockerWebDesktop
pause
