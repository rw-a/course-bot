# Course Bot
Discord bot to manage roles and channels.

## Features
Automatically generates a channel and role for each course in a database. 
Also generates an onboarding prompt so users can easily join/leave the role+channel.

Each role is designated a color, as specified by a config file.

## Setup

### Initialising Config
Create a file `config.json` in the top directory and fill in required information following the template:

```json
{
    "token": "",
    "applicationId": "",
    "guildId": ""
}
```

### Deploying Commands
Run `npm run commands` to deploy the slash commands to your server.

## Usage (slash commands)
- `courses`: lists all the courses in the database.
- `courses_add`: adds a course to the database and generate appropriate channel/role/onboarding prompt.
- `courses_delete`: deletes a course from the database and delete appropriate channel/role/onboarding prompt.
- `sync`: automatically adds all courses in the database.
