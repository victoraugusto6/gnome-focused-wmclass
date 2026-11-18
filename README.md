# Focused WM Class

A tiny GNOME Shell extension that tells scripts which app has focus.

On Wayland, `xprop` and `xdotool` can't see native Wayland windows, and GNOME blocks the built-in ways to ask for the focused window (`org.gnome.Shell.Introspect` returns `AccessDenied`, `org.gnome.Shell.Eval` is disabled). This extension exposes one D-Bus method that returns the WM class (the Wayland `app_id`) of the focused window, and nothing else.

It should also work in X11 sessions, since it asks GNOME Shell rather than the display server, but that is untested.

## Example: notify when Claude Code finishes, unless you're looking at the editor

Add a `Stop` hook to `~/.claude/settings.json`. It sends a desktop notification when Claude Code finishes a response, but only if the focused window is not VS Code:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "gdbus call --session --dest org.gnome.Shell --object-path /io/github/victoraugusto6/FocusedWmClass --method io.github.victoraugusto6.FocusedWmClass.Get 2>/dev/null | grep -qi vscode || notify-send 'Claude Code' 'Finished responding'"
          }
        ]
      }
    ]
  }
}
```

To use another editor, replace `vscode` with part of its WM class (see [Usage](#usage) to find it). If the extension isn't loaded, the D-Bus call fails and the hook notifies anyway, so you never miss a notification silently.

Requires `gdbus` (from GLib) and `notify-send` (from libnotify).

## Install

```sh
git clone https://github.com/victoraugusto6/gnome-focused-wmclass.git
cp -r gnome-focused-wmclass/focused-wmclass@victoraugusto6.github.io ~/.local/share/gnome-shell/extensions/
```

Log out and back in. On Wayland, GNOME only picks up new extensions at login.

Then enable it:

```sh
gnome-extensions enable focused-wmclass@victoraugusto6.github.io
```

If `gnome-extensions info focused-wmclass@victoraugusto6.github.io` shows it as disabled by the global switch, turn on user extensions (in the Extensions app, or with `gsettings set org.gnome.shell disable-user-extensions false`). Note that this switch turns on **every** user extension that is in your enabled list, not only this one.

`metadata.json` only declares GNOME Shell 46. On another version, check `gnome-shell --version` and add it to `shell-version`.

## Usage

```sh
gdbus call --session --dest org.gnome.Shell \
  --object-path /io/github/victoraugusto6/FocusedWmClass \
  --method io.github.victoraugusto6.FocusedWmClass.Get
```

With VS Code focused this prints `('com.microsoft.VSCode',)`. It prints `('',)` when no window has focus.

## Security

GNOME restricts `Introspect` and `Eval` so that apps can't watch what you do. This extension reopens a narrow part of that on purpose. Read this before installing:

- **Any unsandboxed process running as your user can call `Get()`** and learn which app is focused, with no prompt. A malicious process could use it to know when you switch to a password manager or a browser. Flatpak and Snap apps usually can't reach `org.gnome.Shell` on the session bus.
- **Only the WM class is exposed, never the window title.** Titles leak file names, email subjects and URLs.
- **Extensions run inside GNOME Shell with full access to your session.** The whole extension is about 30 lines with no dependencies and no network access. Read `extension.js` before installing it.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
