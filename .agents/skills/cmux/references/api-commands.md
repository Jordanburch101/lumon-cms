# cmux API Commands — Complete Reference

## Table of Contents

1. [Workspace Management](#workspace-management)
2. [Pane & Surface Management](#pane--surface-management)
3. [Terminal I/O](#terminal-io)
4. [Notifications](#notifications)
5. [Sidebar Metadata](#sidebar-metadata)
6. [Window Management](#window-management)
7. [Utility Commands](#utility-commands)

---

## Workspace Management

```bash
# List all workspaces
cmux list-workspaces [--json]

# Current workspace
cmux current-workspace [--json]

# Create new workspace
cmux new-workspace [--command "shell command"]

# Select/switch workspace
cmux select-workspace --workspace <id|ref>

# Close workspace
cmux close-workspace --workspace <id|ref>

# Rename workspace
cmux rename-workspace [--workspace <id|ref>] "new name"

# Workspace action (custom actions)
cmux workspace-action --action <name> [--workspace <id|ref>] [--title <text>]

# Reorder workspace
cmux reorder-workspace --workspace <id|ref> --index <n>
cmux reorder-workspace --workspace <id|ref> --before <id|ref>
cmux reorder-workspace --workspace <id|ref> --after <id|ref>
```

## Pane & Surface Management

```bash
# Create splits
cmux new-split right [--workspace <id>] [--surface <id>]
cmux new-split down [--workspace <id>] [--surface <id>]
cmux new-split left
cmux new-split up

# Create pane with specific type
cmux new-pane [--type terminal|browser] [--direction left|right|up|down] [--url <url>]

# Create new surface (tab within a pane)
cmux new-surface [--type terminal|browser] [--pane <id>] [--url <url>]

# List panes and surfaces
cmux list-panes [--workspace <id>]
cmux list-pane-surfaces [--workspace <id>] [--pane <id>]

# Focus pane
cmux focus-pane --pane <id> [--workspace <id>]

# Close surface
cmux close-surface [--surface <id>] [--workspace <id>]

# Move surface between panes
cmux move-surface --surface <id> [--pane <id>] [--before <id>] [--after <id>]

# Drag surface to create split
cmux drag-surface-to-split --surface <id> left|right|up|down

# Resize pane
cmux resize-pane --pane <id> -L|-R|-U|-D [--amount <n>]

# Swap panes
cmux swap-pane --pane <id> --target-pane <id>

# Break pane out / join pane
cmux break-pane [--pane <id>] [--surface <id>] [--no-focus]
cmux join-pane --target-pane <id> [--pane <id>] [--surface <id>]
```

## Terminal I/O

```bash
# Read terminal screen content
cmux read-screen [--surface <id>] [--scrollback] [--lines <n>]
# alias: capture-pane

# Send text to terminal (use \n for enter)
cmux send [--surface <id>] "echo hello\n"
cmux send [--workspace <id>] [--surface <id>] "ls -la"

# Send key press
cmux send-key [--surface <id>] enter|tab|escape|backspace|up|down|left|right

# Send to specific panel
cmux send-panel --panel <id> "command"
cmux send-key-panel --panel <id> enter

# Pipe pane output to command
cmux pipe-pane --command "tee /tmp/log.txt" [--surface <id>]

# Clear terminal history
cmux clear-history [--surface <id>]

# Respawn pane (restart shell)
cmux respawn-pane [--surface <id>] [--command <cmd>]

# Copy/paste buffers
cmux set-buffer [--name <name>] "text"
cmux list-buffers
cmux paste-buffer [--name <name>] [--surface <id>]
```

## Notifications

```bash
# Send notification
cmux notify --title "Title" [--subtitle "Sub"] [--body "Body"]
cmux notify --title "Build done" --body "No errors" [--workspace <id>]

# List and clear
cmux list-notifications
cmux clear-notifications
```

Notification lifecycle: Received → Unread → Read → Cleared.
Desktop alerts are suppressed when cmux window is focused.

## Sidebar Metadata

### Status Pills

Key-value pairs shown in the workspace sidebar. Persist until cleared.

```bash
# Set status (key, value, optional icon and color)
cmux set-status <key> <value> [--icon <name>] [--color <#hex>] [--workspace <id>]

# Examples
cmux set-status build "compiling" --icon hammer --color "#ff9500"
cmux set-status deploy "v1.2.3"
cmux set-status tests "passing" --icon checkmark --color "#34c759"

# Clear and list
cmux clear-status <key> [--workspace <id>]
cmux list-status [--workspace <id>]
```

### Progress Bar

```bash
cmux set-progress <0.0-1.0> [--label <text>] [--workspace <id>]
cmux clear-progress [--workspace <id>]

# Examples
cmux set-progress 0.0 --label "Starting..."
cmux set-progress 0.5 --label "Building..."
cmux set-progress 1.0 --label "Done"
```

### Sidebar Logs

```bash
# Log levels: info, progress, success, warning, error
cmux log "message" [--level <level>] [--source <name>] [--workspace <id>]

# Examples
cmux log "Build started"
cmux log --level error --source build "Compilation failed"
cmux log --level success --source test "All 42 tests passed"

# List and clear
cmux list-log [--limit <n>] [--workspace <id>]
cmux clear-log [--workspace <id>]
```

### Full Sidebar State

```bash
# Dump all metadata (cwd, git branch, ports, status, progress, logs)
cmux sidebar-state [--workspace <id>]
```

## Window Management

```bash
cmux list-windows
cmux current-window
cmux new-window
cmux focus-window --window <id>
cmux close-window --window <id>
cmux rename-window "new title"

# Move workspace to another window
cmux move-workspace-to-window --workspace <id> --window <id>

# Navigate between windows
cmux next-window
cmux previous-window
cmux last-window
```

## Utility Commands

```bash
# Health checks
cmux ping
cmux capabilities [--json]

# Identify current context (workspace, surface, pane)
cmux identify [--json] [--workspace <id>] [--no-caller]

# Surface health check
cmux surface-health [--workspace <id>]

# Flash (visual indicator)
cmux trigger-flash [--surface <id>]

# Refresh surfaces
cmux refresh-surfaces

# Find window by content
cmux find-window [--content] [--select] <query>

# Wait for signal (inter-process sync)
cmux wait-for [-S|--signal] <name> [--timeout <seconds>]

# Display message
cmux display-message [-p|--print] <text>
```

## Socket API (for scripts)

Socket path: `/tmp/cmux.sock` (override with `CMUX_SOCKET_PATH`)

### Python

```python
import json, os, socket

SOCKET_PATH = os.environ.get("CMUX_SOCKET_PATH", "/tmp/cmux.sock")

def rpc(method, params=None, req_id=1):
    payload = {"id": req_id, "method": method, "params": params or {}}
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as sock:
        sock.connect(SOCKET_PATH)
        sock.sendall(json.dumps(payload).encode("utf-8") + b"\n")
        return json.loads(sock.recv(65536).decode("utf-8"))

rpc("notification.create", {"title": "Done", "body": "From Python!"})
```

### Shell

```bash
SOCK="${CMUX_SOCKET_PATH:-/tmp/cmux.sock}"
printf '{"id":"1","method":"workspace.list","params":{}}\n' | nc -U "$SOCK"
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `CMUX_WORKSPACE_ID` | Auto-set: current workspace ID |
| `CMUX_SURFACE_ID` | Auto-set: current surface ID |
| `CMUX_SOCKET_PATH` | Override socket path (default: `/tmp/cmux.sock`) |
| `CMUX_SOCKET_MODE` | Access mode: `cmuxOnly`, `allowAll`, `off` |
| `CMUX_SOCKET_PASSWORD` | Socket auth password |

## Detection

```bash
# Check if running inside cmux
command -v cmux &>/dev/null && [ -n "${CMUX_WORKSPACE_ID:-}" ] && echo "in cmux"
```
