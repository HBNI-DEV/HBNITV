@echo off
setlocal EnableDelayedExpansion

:: Get the current date and time from WMIC
for /f "tokens=2 delims==" %%I in ('"wmic os get localdatetime /value | findstr LocalDateTime"') do set datetime=%%I

:: Format version as: YYYY.MM.DD.HHMM
set VERSION=%datetime:~0,4%.%datetime:~4,2%.%datetime:~6,2%.%datetime:~8,2%%datetime:~10,2%

set IMAGE_NAME=jarebear/hbni-itv

echo Building Docker image: %IMAGE_NAME%:%VERSION%
docker build -t %IMAGE_NAME%:%VERSION% .

echo Tagging image as latest...
docker tag %IMAGE_NAME%:%VERSION% %IMAGE_NAME%:latest

echo Pushing versioned tag: %VERSION%
docker push %IMAGE_NAME%:%VERSION%

echo Pushing latest tag...
docker push %IMAGE_NAME%:latest

echo Done!
