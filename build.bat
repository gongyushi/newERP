@echo off
CLS
ECHO.
ECHO ================================
ECHO ��������
ECHO ================================
:init

xcopy /Y /E .\dist\* ..\public\
move /Y ..\public\index.html ..\resources\views\index.blade.php

ECHO Done��
ECHO.
pause