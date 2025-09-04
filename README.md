# Launcher

This electron application aim to create launcher for PSDK Games, it gives what's necessary to update and run the game!

## How it work

The launcher is a single page application that handle all the different view thanks to a state. The single page allows us to run animation over the elements of the page.

### State Machine

The state machine is handled inside `LauncherContext.tsx`, we have 10 states:

- `loading`: when the launcher loads its configuration
- `licence_checking` : when the launcher is checking for licence
- `bad_licence` : when the launcher finds a bad licence. The user cannot start the game.
- `checking`: when the launcher is checking for update
- `update_waiting`: when the launcher is waiting for the user to say "Yes I want to download updates"
- `updating`: when the launcher is downloading and applying updates
- `play_waiting`: when the launcher is waiting for the user to say "Yes I want to play"
- `starting`: when the launcher is starting the game
- `playing` : when the launcher is playing the game
- `editing_options`: when the launcher let user edit game options

Here's the state diagram:

```mermaid
stateDiagram-v2

LoadConfig: LoadConfig
note right of LoadConfig: loading

CheckLicence: Checking for licence
note left of CheckLicence: licence_checking

BadLicence: Bad licence
note left of BadLicence: bad_licence

state no_licence <<choice>>

CheckUpdate: Checking for update
note right of CheckUpdate: checking

state any_update <<choice>>

PlayMode: Ready To Play
note left of PlayMode: play_waiting

OptionMode: Edit Options
note left of OptionMode: editing_options

StartGame: Starting the Game
note left of StartGame: starting

UpdateMode: Waiting user to Update
note left of UpdateMode: update_waiting

DlAllUpdates: Downloading all updates
note right of DlAllUpdates: updating

PlayGame: Playing the Game
note right of PlayGame: playing

[*] --> LoadConfig
LoadConfig --> CheckLicence
CheckLicence --> no_licence
no_licence --> BadLicence: bad licence found
no_licence --> CheckUpdate: good licence found
BadLicence --> [*]
CheckUpdate --> any_update
any_update --> UpdateMode: new updates detected
any_update --> PlayMode: no updates detected / failed to find them
UpdateMode --> DlAllUpdates: clicked Update
DlAllUpdates --> PlayMode: downloaded all updates
PlayMode --> StartGame: clicked Play
StartGame --> [*]
PlayMode --> OptionMode: clicked Options
OptionMode --> PlayMode: clicked close
StartGame --> PlayGame: Game started
PlayGame --> PlayMode: closed the Game
```

> Note: To see the diagram please install the vscode extension `bierner.markdown-mermaid`.  
> You might need to re-open preview.
