# PowerShell script to set up a scheduled task for checking survey target completion

$scriptPath = "$PSScriptRoot\check-survey-targets.js"
$nodePath = "C:\Program Files\nodejs\node.exe"
$workingDir = "$PSScriptRoot\.."

# Task name and description
$taskName = "SIGLA-SurveyTargetCheck"
$taskDescription = "Checks for completed survey targets and triggers ML analysis"

# Create the scheduled task
Write-Host "Creating scheduled task: $taskName"

# Check if the task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task already exists. Removing existing task..."
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create a new task action
$action = New-ScheduledTaskAction -Execute $nodePath -Argument $scriptPath -WorkingDirectory $workingDir

# Create a trigger to run the task every 15 minutes
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 15)

# Set the principal (run with highest privileges)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Create the task settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Register the scheduled task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description $taskDescription

Write-Host "Scheduled task created successfully. The task will run every 15 minutes."
Write-Host "Task details:"
Get-ScheduledTask -TaskName $taskName | Format-List