# cmux Concepts & Reference

## Hierarchy

```
Window (macOS window, ⌘⇧N)
  └── Workspace (sidebar entry, ⌘N)
        └── Pane (split region, ⌘D / ⌘⇧D)
              └── Surface (tab within pane, ⌘T)
                    └── Panel (terminal or browser content)
```

| Level | What it is | Created by | Env var |
|-------|-----------|-----------|---------|
| Window | macOS window | `⌘⇧N` | — |
| Workspace | Sidebar entry | `⌘N` | `CMUX_WORKSPACE_ID` |
| Pane | Split region | `⌘D` / `⌘⇧D` | pane ID |
| Surface | Tab within pane | `⌘T` | `CMUX_SURFACE_ID` |
| Panel | Terminal or browser | automatic | panel ID |

## ID Formats

Commands accept three ID formats:
- **Refs**: `surface:2`, `pane:3`, `workspace:1` (default output)
- **UUIDs**: Full UUIDs
- **Indexes**: Numeric position

Control output format: `--id-format refs|uuids|both`

## Keyboard Shortcuts

### Workspaces
| Shortcut | Action |
|----------|--------|
| `⌘N` | New workspace |
| `⌘1`–`⌘8` | Jump to workspace 1-8 |
| `⌘9` | Jump to last workspace |
| `⌘⇧W` | Close workspace |
| `⌘⇧R` | Rename workspace |

### Surfaces (tabs within pane)
| Shortcut | Action |
|----------|--------|
| `⌘T` | New surface |
| `⌘W` | Close surface |
| `⌘⇧[` / `⌘⇧]` | Previous/next surface |
| `⌃1`–`⌃9` | Jump to surface 1-9 |

### Split Panes
| Shortcut | Action |
|----------|--------|
| `⌘D` | Split right |
| `⌘⇧D` | Split down |
| `⌥⌘←/→/↑/↓` | Focus pane directionally |
| `⌥⌘D` | Split browser right |
| `⌥⌘⇧D` | Split browser down |

### Browser
| Shortcut | Action |
|----------|--------|
| `⌘⇧L` | Open browser surface |
| `⌘L` | Focus address bar |
| `⌘]` | Forward |
| `⌘R` | Reload page |
| `⌥⌘I` | Developer tools |

### Notifications
| Shortcut | Action |
|----------|--------|
| `⌘⇧I` | Show notifications panel |
| `⌘⇧U` | Jump to latest unread |

### Terminal
| Shortcut | Action |
|----------|--------|
| `⌘K` | Clear scrollback |
| `⌘C` | Copy (with selection) |
| `⌘V` | Paste |
| `⌘+` / `⌘-` | Font size |
| `⌘0` | Reset font size |
| `⌘F` | Find |

## Configuration

Config file locations (checked in order):
1. `~/.config/ghostty/config`
2. `~/Library/Application Support/com.mitchellh.ghostty/config`

```ini
# Example config
font-family = JetBrains Mono
font-size = 14
theme = One Dark
scrollback-limit = 50000
unfocused-split-opacity = 0.85
working-directory = ~/code
```

### Automation Mode (Settings → App)

| Mode | Description |
|------|-------------|
| Off | Socket disabled |
| cmux processes only | Default — only spawned processes connect |
| allowAll | Any local process (env override only) |

### Browser Link Behavior

In Settings, configure:
- **Hosts to Open in Embedded Browser** — which links open in cmux browser
- **HTTP Hosts Allowed** — defaults: localhost, 127.0.0.1, ::1, 0.0.0.0, *.localtest.me

## Claude Code Integration

### Notification hooks

Create `~/.claude/hooks/cmux-notify.sh`:
```bash
#!/bin/bash
cmux notify --title "$1" --body "$2"
```

Configure in `~/.claude/settings.json` to fire on Stop/PostToolUse events.

### Sending notifications from scripts

```bash
# After build
bun build && cmux notify --title "Build Success" || cmux notify --title "Build Failed"

# OSC 777 (works in any terminal)
printf '\e]777;notify;Title;Body\a'
```
