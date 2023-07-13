@echo off
echo "Starting Ubuntu-22.04..."
wsl -d Ubuntu-22.04 -u root -- dotnet run --project ../DockerWebDesktop
pause
