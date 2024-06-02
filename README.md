# EduSchedule

## Running the app

Make sure to add the appropriate envirnment variables in the root as a .env file:

```.env
DATABASE_URL="file:./dev.db"
ADMIN_UID = "XXXXXXXXXXXXXXXXX"
IHU_OAUTH_CLIENT_ID = "XXXXXXXXXXXXXXXXX"
IHU_OAUTH_CLIENT_SECRET = "XXXXXXXXXXXXXXXXX"
IHU_OAUTH_REDIRECT_URI = "http://localhost:3000/auth/callback"
```

```sh
# Development
npm run dev

# Production
npm run build
npm start
```

## Running the app forever in a linux server:

First create a new systemd service in e.g. `/lib/systemd/system/eduschedule.service`:

```
[Unit]
Description=EduSchedule
After=network.target

[Service]
Type=simple
User=<USER_NAME>
WorkingDirectory=<DIRECTORY_THE_APP_IS_ON>
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```sh
# Start the service
sudo systemctl start eduschedule.service

# Check that the service is running
sudo systemctl status eduschedule.service

# Enable the service to run when the linux OS starts
sudo systemctl enable eduschedule.service
```
