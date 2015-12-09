[Setup]
AppName=InsteadMan
AppVerName=InsteadMan 2.0.1
DefaultDirName={pf}\InsteadMan
DefaultGroupName=Games
UninstallDisplayIcon={app}\InsteadMan.exe
OutputDir=.\temp
OutputBaseFilename=insteadman-2.0.1
AllowNoIcons=true
SetupIconFile=..\..\src\resources\imageslogo.ico
ChangesAssociations=yes

[Languages]
Name: en; MessagesFile: compiler:Default.isl
Name: ru; MessagesFile: compiler:Languages\Russian.isl

[Files]
Source: ..\nw-builder\InsteadMan\win32\*; DestDir: {app}; Flags: replacesameversion recursesubdirs

[CustomMessages]
CreateDesktopIcon=Create a &desktop icon
LaunchGame=Launch &InsteadMan
UninstallMsg=Uninstall InsteadMan
RmSettingsMsg=Would you like to remove settings?

[Tasks]
Name: desktopicon; Description: {cm:CreateDesktopIcon}

[Run]
Filename: {app}\InsteadMan.exe; Description: {cm:LaunchGame}; WorkingDir: {app}; Flags: postinstall

[Icons]
Name: {commondesktop}\InsteadMan; Filename: {app}\InsteadMan.exe; WorkingDir: {app}; Tasks: desktopicon
Name: {group}\InsteadMan; Filename: {app}\InsteadMan.exe; WorkingDir: {app}
Name: {group}\{cm:UninstallMsg}; Filename: {uninstallexe}

[UninstallDelete]
Name: {app}; Type: dirifempty

[Code]
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  case CurUninstallStep of
    usPostUninstall:
      begin
        if MsgBox(CustomMessage('RmSettingsMsg'), mbConfirmation, MB_YESNO or MB_DEFBUTTON2) = idYes then
        begin
          // remove settings and saved games manually
          DelTree(ExpandConstant('{localappdata}\instead\manager'), True, True, True);
          DelTree(ExpandConstant('{localappdata}\insteadman'), True, True, True);
        end;
      end;
  end;
end;