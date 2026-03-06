# cmux Browser Commands — Complete Reference

All commands use the format: `cmux browser [surface:N] <subcommand> [args]`

Surface can be passed positionally or via `--surface surface:N`.

## Table of Contents

1. [Opening & Navigation](#opening--navigation)
2. [Waiting](#waiting)
3. [Screenshots & Snapshots](#screenshots--snapshots)
4. [DOM Interaction](#dom-interaction)
5. [JavaScript & Injection](#javascript--injection)
6. [Inspection & Getters](#inspection--getters)
7. [Element Finding](#element-finding)
8. [Tabs](#tabs)
9. [Frames](#frames)
10. [Dialogs & Downloads](#dialogs--downloads)
11. [Cookies & Storage](#cookies--storage)
12. [State Persistence](#state-persistence)
13. [Console & Errors](#console--errors)

---

## Opening & Navigation

```bash
# Open browser in new split (returns surface ref)
cmux browser open https://example.com
cmux browser open-split https://example.com

# Navigate existing surface
cmux browser surface:N navigate https://example.com --snapshot-after

# History
cmux browser surface:N back
cmux browser surface:N forward
cmux browser surface:N reload --snapshot-after

# URL
cmux browser surface:N url              # get current URL

# Focus
cmux browser surface:N focus-webview
cmux browser surface:N is-webview-focused
```

## Waiting

Block until a condition is met. Essential after navigation or clicks.

```bash
cmux browser surface:N wait --load-state complete --timeout-ms 15000
cmux browser surface:N wait --selector "#checkout" --timeout-ms 10000
cmux browser surface:N wait --text "Order confirmed"
cmux browser surface:N wait --url-contains "/dashboard"
cmux browser surface:N wait --function "window.__appReady === true"
```

## Screenshots & Snapshots

```bash
# Screenshot — saves PNG, viewable with Read tool
cmux browser surface:N screenshot --out /tmp/page.png

# Snapshot — structured accessibility tree (text, not visual)
cmux browser surface:N snapshot --interactive --compact
cmux browser surface:N snapshot --selector "main" --max-depth 5
cmux browser surface:N snapshot --interactive --cursor
```

## DOM Interaction

All mutating actions support `--snapshot-after` for immediate verification.

```bash
# Click
cmux browser surface:N click "button[type='submit']" --snapshot-after
cmux browser surface:N dblclick ".item-row"

# Hover & Focus
cmux browser surface:N hover "#menu"
cmux browser surface:N focus "#email"

# Checkboxes
cmux browser surface:N check "#terms"
cmux browser surface:N uncheck "#newsletter"

# Text input
cmux browser surface:N type "#search" "query text"        # types key by key
cmux browser surface:N fill "#email" "user@example.com"    # sets value directly
cmux browser surface:N fill "#email" ""                    # clears input

# Keyboard
cmux browser surface:N press Enter
cmux browser surface:N press Tab
cmux browser surface:N keydown Shift
cmux browser surface:N keyup Shift

# Select dropdown
cmux browser surface:N select "#region" "us-east"

# Scrolling
cmux browser surface:N scroll --dy 800 --snapshot-after
cmux browser surface:N scroll --selector "#log-view" --dx 0 --dy 400
cmux browser surface:N scroll-into-view "#pricing"
```

## JavaScript & Injection

```bash
# Eval — execute JS and return result
cmux browser surface:N eval "document.title"
cmux browser surface:N eval "document.querySelectorAll('.item').length"
cmux browser surface:N eval "window.scrollTo(0, 600); 'done'"

# Script injection
cmux browser surface:N addinitscript "window.__ready = true;"    # before page load
cmux browser surface:N addscript "document.querySelector('#x')?.focus()"  # into running page
cmux browser surface:N addstyle "#debug { display: none !important; }"    # inject CSS
```

**Important**: `eval` returns the result of the expression. For void expressions, append
a string return: `eval "doSomething(); 'ok'"`. Expressions that block (like `alert()`)
will timeout.

## Inspection & Getters

```bash
# Page metadata
cmux browser surface:N get title
cmux browser surface:N get url

# Content extraction
cmux browser surface:N get text "h1"
cmux browser surface:N get html "main"
cmux browser surface:N get value "#email"

# Attributes & measurements
cmux browser surface:N get attr "a.primary" --attr href
cmux browser surface:N get count ".row"
cmux browser surface:N get box "#checkout"
cmux browser surface:N get styles "#total" --property color

# State queries
cmux browser surface:N is visible "#checkout"
cmux browser surface:N is enabled "button[type='submit']"
cmux browser surface:N is checked "#terms"
```

## Element Finding

Find elements by accessibility properties.

```bash
cmux browser surface:N find role button --name "Continue"
cmux browser surface:N find text "Order confirmed"
cmux browser surface:N find label "Email"
cmux browser surface:N find placeholder "Search"
cmux browser surface:N find alt "Product image"
cmux browser surface:N find title "Open settings"
cmux browser surface:N find testid "save-btn"

# Positional
cmux browser surface:N find first ".row"
cmux browser surface:N find last ".row"
cmux browser surface:N find nth 2 ".row"

# Visual debugging
cmux browser surface:N highlight "#checkout"
```

## Tabs

Browser tabs map to surfaces in the active browser tab group.

```bash
cmux browser surface:N tab list
cmux browser surface:N tab new https://example.com/pricing
cmux browser surface:N tab switch 1
cmux browser surface:N tab switch surface:7
cmux browser surface:N tab close
cmux browser surface:N tab close surface:7
```

## Frames

```bash
cmux browser surface:N frame "iframe[name='checkout']"    # enter iframe
cmux browser surface:N click "#pay-now"                    # interact inside frame
cmux browser surface:N frame main                          # return to main frame
```

## Dialogs & Downloads

```bash
# Dialogs
cmux browser surface:N dialog accept
cmux browser surface:N dialog accept "Confirmed"
cmux browser surface:N dialog dismiss

# Downloads
cmux browser surface:N download --path /tmp/report.csv --timeout-ms 30000
```

## Cookies & Storage

```bash
# Cookies
cmux browser surface:N cookies get
cmux browser surface:N cookies get --name session_id
cmux browser surface:N cookies set session_id abc123 --domain example.com --path /
cmux browser surface:N cookies clear --name session_id
cmux browser surface:N cookies clear --all

# Local storage
cmux browser surface:N storage local set theme dark
cmux browser surface:N storage local get theme
cmux browser surface:N storage local clear

# Session storage
cmux browser surface:N storage session set flow onboarding
cmux browser surface:N storage session get flow
cmux browser surface:N storage session clear
```

## State Persistence

Save and restore full browser state (cookies + storage + URL).

```bash
cmux browser surface:N state save /tmp/session.json
cmux browser surface:N state load /tmp/session.json
```

## Console & Errors

```bash
cmux browser surface:N console list
cmux browser surface:N console clear
cmux browser surface:N errors list
cmux browser surface:N errors clear
```
