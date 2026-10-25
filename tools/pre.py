# Text-level edits to CPFT's script.js before pruning: no options page, so no
# live config changes; only the List "Turn on/off Retweets" toggle is stored.
import sys
src, dst = sys.argv[1:]
s = open(src).read()

def cut(start, end, new, keep_end=False):
    global s
    a = s.index(start)
    b = s.index(end, a)
    s = s[:a] + new + s[b if keep_end else b + len(end):]

cut('/**\n * @param {Partial<import("./types").Config>} changes\n */\nfunction configChanged(changes) {', 'main()\n', '''/**
 * Re-applies everything when switching between the mobile and desktop layouts.
 */
function versionChanged() {
  log('version changed to', config.version)
  fontSize = desktop ? $html.style.fontSize : null
  configureCss()
  configureFont()
  configureDynamicCss()
  configureThemeCss()
  configureCustomCss()
  observePopups()
  observeSideNavItems()
  if (!configureSeparatedTweetsTimelineTitle()) {
    processCurrentPage()
  }
}

// Stored config (only listRetweets, which the List menu toggles) is injected
// into a <script> element by content.js.
let $settings = /** @type {HTMLScriptElement} */ (document.querySelector('script#cpftSettings'))
if ($settings) {
  try {
    Object.assign(config, JSON.parse($settings.innerText))
  } catch(e) {
    error('error parsing initial settings', e)
  }
}

''', keep_end=True)

old = '''    if (version != config.version) {
      log('setting version to', version)
      config.version = version
      // Let the options page know which version is being used
      storeConfigChanges({version})
    }
'''
assert old in s
s = s.replace(old, '    config.version = version\n')
assert '      configChanged({version})\n' in s
s = s.replace('      configChanged({version})\n', '      versionChanged()\n')
# Full width (and no sidebar column) on every page, not just Home, Lists and
# Communities. Search results keep the sidebar: the query box lives there.
old = "const FULL_WIDTH_BODY_PSEUDO = ':is(.Community, .List, .HomeTimeline)'"
assert old in s
s = s.replace(old, "const FULL_WIDTH_BODY_PSEUDO = ':not(.Search)'")
# Body classes for the pages that have X's own no-sidebar layout, so styles.css
# can leave their spacing alone (the original only marks Explore and Settings).
old = "  $body.classList.toggle('Explore', isOnExplorePage())\n"
assert old in s
s = s.replace(old, old + """  $body.classList.toggle('Calls', isOnCallsPage())
  $body.classList.toggle('Chat', isOnChatPage())
  $body.classList.toggle('Grok', isOnGrokPage())
""")
# Every page gets the layout X itself uses on Chat/Calls/Grok: the nav hugs
# the left edge and the content fills the window. The original only does
# that when no sidebar exists; where it hides the sidebar it keeps a 990px
# centred column. Drop that column and use the no-sidebar rules everywhere.
old = """          /* Use full width when the sidebar is visible */
          body.Sidebar${FULL_WIDTH_BODY_PSEUDO} ${Selectors.PRIMARY_COLUMN},
          body.Sidebar${FULL_WIDTH_BODY_PSEUDO} ${Selectors.PRIMARY_COLUMN} > div:first-child > div:last-child {
            max-width: 990px;
          }
"""
assert old in s
s = s.replace(old, "")
assert s.count("body:not(.Sidebar)${FULL_WIDTH_BODY_PSEUDO}") == 5
s = s.replace("body:not(.Sidebar)${FULL_WIDTH_BODY_PSEUDO}", "body${FULL_WIDTH_BODY_PSEUDO}")
open(dst, 'w').write(s)
