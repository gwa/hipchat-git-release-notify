# HipChat git release notify

> Sends a notification to a HipChat room with the latest git tag or commit hash.

## Usage

Use as part of your CI process.

```bash
npm install hipchat-git-release-notify
./node_modules/.bin/hipchat-git-release-notify [server identifier] [project URL] [HipChat room ID] [HipChat token]
```

### Arguments

The following command line arguments are required:

* `[server identifier]`: A string identifing the project or server, e.g. `MyProject STAGING`.
* `[project URL]`: A URL used in the notification message.
* `[HipChat room ID]`: The HipChat room ID, available from the [HipChat website](https://www.hipchat.com/rooms).
* `[HipChat room ID]`: A HipChat room token, that can be created on the [HipChat website](https://www.hipchat.com/rooms).
