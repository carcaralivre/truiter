void function() {

const XMLHttpRequest_open = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function(method, url) {
  if (!userSortedFollowing && url.includes('/HomeLatestTimeline')) {
    if (method.toUpperCase() == 'GET') {
      try {
        let request = new URL(url)
        let params = new URLSearchParams(request.search)
        let variables = JSON.parse(decodeURIComponent(params.get('variables')))
        if (typeof variables?.enableRanking == 'boolean') {
          if (variables.enableRanking != false) {
            variables.enableRanking = false
            params.set('variables', JSON.stringify(variables))
            url = `${request.origin}${request.pathname}?${params.toString()}`
          }
        } else {
          warn('sortFollowing: typeof variables.enableRanking is', typeof variables?.enableRanking)
        }
      } catch (e) {
        error('sortFollowing: error patching enableRanking', e)
      }
    } else {
      // @ts-expect-error
      this._method = method.toUpperCase()
      // @ts-expect-error
      this._url = url
    }
  }

  return XMLHttpRequest_open.apply(this, [method, url])
}

const XMLHttpRequest_send = XMLHttpRequest.prototype.send
XMLHttpRequest.prototype.send = function(body) {
  if (
    !body ||
    // @ts-expect-error
    this._method != 'POST' || !this._url
  ) return XMLHttpRequest_send.apply(this, [body])

  if (!userSortedFollowing &&
      // @ts-expect-error
      this._url?.includes('/HomeLatestTimeline')) {
    try {
      let data = JSON.parse(body)
      if (data?.variables != null && typeof data.variables == 'object') {
        let variables = data.variables
        if (typeof variables?.enableRanking == 'boolean') {
          if (variables.enableRanking != false) {
            variables.enableRanking = false
            body = JSON.stringify(data)
          }
        } else {
          warn('sortFollowing: typeof variables.enableRanking is', typeof variables?.enableRanking)
        }
      }
    } catch (e) {
      error('sortFollowing: error patching enableRanking', e)
    }
  }

  return XMLHttpRequest_send.apply(this, [body])
}

/** @type {boolean} */
let desktop
/** @type {boolean} */
let mobile
let isSafari = navigator.userAgent.includes('Safari/') && !/Chrom(e|ium)\//.test(navigator.userAgent)

/** @type {HTMLHtmlElement} */
let $html
/** @type {HTMLElement} */
let $body
/** @type {HTMLElement} */
let $reactRoot
/** @type {string} */
let lang
/** @type {string} */
let dir
/** @type {boolean} */
let ltr

//#region Default config
/**
 * @type {import("./types").Config}
 */
const config = {
  listRetweets: 'ignore'
}
//#endregion

//#region Locales
/**
 * @type {Record<string, import("./types").Locale>}
 */
const locales = {
  en: {
    ACCOUNT_BASED_IN_FN: function (e) {
      return 'Account based in ' + e.country
    },
    ADD_ANOTHER_TWEET: 'Add another Tweet',
    ADD_MUTED_WORD: 'Add muted word',
    GROK_ACTIONS: 'Grok actions',
    HOME: 'Home',
    LIKES: 'Likes',
    LIVE_ON_X: 'Live on X',
    MOST_RELEVANT: 'Most relevant',
    MUTE_THIS_CONVERSATION: 'Mute this conversation',
    POST_ALL: 'Post all',
    POST_UNAVAILABLE: 'This post is unavailable.',
    PROFILE_SUMMARY: 'Profile Summary',
    QUOTE: 'Quote',
    QUOTES: 'Quotes',
    QUOTE_TWEET: 'Quote Tweet',
    QUOTE_TWEETS: 'Quote Tweets',
    RECENT: 'Recent',
    RELEVANT: 'Relevant',
    REPOST: 'Repost',
    REPOSTS: 'Reposts',
    RETWEET: 'Retweet',
    RETWEETED_BY: 'Retweeted by',
    RETWEETS: 'Retweets',
    SHARED: 'Shared',
    SHARED_TWEETS: 'Shared Tweets',
    SHOW: 'Show',
    SHOW_MORE_REPLIES: 'Show more replies',
    SORT_BY: 'Sort by',
    SORT_REPLIES: 'Sort replies',
    TURN_OFF_QUOTE_TWEETS: 'Turn off Quote Tweets',
    TURN_OFF_RETWEETS: 'Turn off Retweets',
    TURN_ON_RETWEETS: 'Turn on Retweets',
    TWEET: 'Tweet',
    TWEETS: 'Tweets',
    TWEET_ALL: 'Tweet all',
    TWEET_INTERACTIONS: 'Tweet interactions',
    TWEET_YOUR_REPLY: 'Tweet your reply',
    TWITTER: 'Twitter',
    UNDO_RETWEET: 'Undo Retweet',
    VIEW: 'View',
    WHATS_HAPPENING: "What's happening?",
  },

  pt: {
    ACCOUNT_BASED_IN_FN: function (e) {
      return 'Conta com base em ' + e.country
    },
    ADD_ANOTHER_TWEET: 'Adicionar outro Tweet',
    ADD_MUTED_WORD: 'Adicionar palavra silenciada',
    GROK_ACTIONS: 'Ações do Grok',
    HOME: 'Página Inicial',
    LIKES: 'Curtidas',
    LIVE_ON_X: 'Ao vivo no X',
    MOST_RELEVANT: 'Mais relevante',
    MUTE_THIS_CONVERSATION: 'Silenciar esta conversa',
    POST_ALL: 'Postar tudo',
    POST_UNAVAILABLE: 'Este post está indisponível.',
    PROFILE_SUMMARY: 'Resumo do perfil',
    QUOTE: 'Comentar',
    QUOTES: 'Comentários',
    QUOTE_TWEET: 'Comentar o Tweet',
    QUOTE_TWEETS: 'Tweets com comentário',
    RECENT: 'Recente',
    RELEVANT: 'Relevante',
    REPOST: 'Repostar',
    RETWEET: 'Retweetar',
    RETWEETED_BY: 'Retweetado por',
    SHARED: 'Compartilhado',
    SHARED_TWEETS: 'Tweets Compartilhados',
    SHOW: 'Mostrar',
    SHOW_MORE_REPLIES: 'Mostrar mais respostas',
    SORT_BY: 'Classificar por',
    SORT_REPLIES: 'Ordenar respostas',
    TURN_OFF_QUOTE_TWEETS: 'Desativar Tweets com comentário',
    TURN_OFF_RETWEETS: 'Desativar Retweets',
    TURN_ON_RETWEETS: 'Ativar Retweets',
    TWEET: 'Tweetar',
    TWEET_ALL: 'Tweetar tudo',
    TWEET_INTERACTIONS: 'Interações com Tweet',
    TWEET_YOUR_REPLY: 'Tweetar sua resposta',
    UNDO_RETWEET: 'Desfazer Retweet',
    VIEW: 'Ver',
    WHATS_HAPPENING: 'O que está acontecendo?',
  }
}

/**
 * @param {import("./types").LocaleFunctionKey} key
 */
function getFn(key) {
  return (locales[lang] || locales['en'])[key] || locales['en'][key];
}

/**
 * @param {import("./types").LocaleStringKey} key
 */
function getString(key) {
  return (locales[lang] || locales['en'])[key] || locales['en'][key];
}
//#endregion

//#region Constants
/** @enum {string} */
const PagePaths = {
  ACCESSIBILITY_SETTINGS: '/settings/accessibility',
  ADD_MUTED_WORD: '/settings/add_muted_keyword',
  COMPOSE_TWEET: '/compose/post',
  CONNECT: '/i/connect',
  DISPLAY_SETTINGS: '/settings/display',
  HISTORY: '/i/history',
  HOME: '/home',
  NOTIFICATION_TIMELINE: '/i/timeline',
  PROFILE_SETTINGS: '/settings/profile',
  SEARCH: '/search',
}

/** @enum {string} */
const Selectors = {
  BLOCK_MENU_ITEM: '[data-testid="block"]',
  DESKTOP_TIMELINE_HEADER: 'div[data-testid="primaryColumn"] > div > div:first-of-type',
  MODAL_TIMELINE: 'section > h1 + div[aria-label] > div',
  MOBILE_TIMELINE_HEADER: 'div[data-testid="TopNavBar"]',
  NAV_HOME_LINK: 'a[data-testid="AppTabBar_Home_Link"]',
  PRIMARY_COLUMN: 'div[data-testid="primaryColumn"]',
  PRIMARY_NAV_DESKTOP: 'header nav',
  PRIMARY_NAV_MOBILE: '#layers nav',
  PROMOTED_TWEET_CONTAINER: '[data-testid="placementTracking"]',
  SIDEBAR: 'div[data-testid="sidebarColumn"]',
  SORT_REPLIES_PATH: 'svg path[d="M14 6V3h2v8h-2V8H3V6h11zm7 2h-3.5V6H21v2zM8 16v-3h2v8H8v-3H3v-2h5zm13 2h-9.5v-2H21v2z"]',
  TIMELINE: 'div[data-testid="primaryColumn"] section > h1 + div[aria-label] > div',
  TIMELINE_HEADING: 'h2[role="heading"]',
  TWEET: '[data-testid="tweet"]',
  VERIFIED_TICK: 'svg[data-testid="icon-verified"]',
  X_LOGO_PATH: 'svg path[d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"]',
  X_DARUMA_LOGO_PATH: 'svg path[d="M18.436 1.92h3.403l-7.433 8.495 8.745 11.563h-6.849l-5.363-7.012-6.136 7.012H1.4l7.951-9.088L.96 1.92h7.02l4.848 6.41 5.608-6.41zm-1.194 18.021h1.886L6.958 3.851H4.933l12.308 16.09z"]',
}

/** @enum {string} */
const Svgs = {
  BLUE_LOGO_PATH: 'M16.5 3H2v18h15c3.038 0 5.5-2.46 5.5-5.5 0-1.4-.524-2.68-1.385-3.65-.08-.09-.089-.22-.023-.32.574-.87.908-1.91.908-3.03C22 5.46 19.538 3 16.5 3zm-.796 5.99c.457-.05.892-.17 1.296-.35-.302.45-.684.84-1.125 1.15.004.1.006.19.006.29 0 2.94-2.269 6.32-6.421 6.32-1.274 0-2.46-.37-3.459-1 .177.02.357.03.539.03 1.057 0 2.03-.35 2.803-.95-.988-.02-1.821-.66-2.109-1.54.138.03.28.04.425.04.206 0 .405-.03.595-.08-1.033-.2-1.811-1.1-1.811-2.18v-.03c.305.17.652.27 1.023.28-.606-.4-1.004-1.08-1.004-1.85 0-.4.111-.78.305-1.11 1.113 1.34 2.775 2.22 4.652 2.32-.038-.17-.058-.33-.058-.51 0-1.23 1.01-2.22 2.256-2.22.649 0 1.235.27 1.647.7.514-.1.997-.28 1.433-.54-.168.52-.526.96-.992 1.23z',
  MUTE: '<g><path d="M18 6.59V1.2L8.71 7H5.5C4.12 7 3 8.12 3 9.5v5C3 15.88 4.12 17 5.5 17h2.09l-2.3 2.29 1.42 1.42 15.5-15.5-1.42-1.42L18 6.59zm-8 8V8.55l6-3.75v3.79l-6 6zM5 9.5c0-.28.22-.5.5-.5H8v6H5.5c-.28 0-.5-.22-.5-.5v-5zm6.5 9.24l1.45-1.45L16 19.2V14l2 .02v8.78l-6.5-4.06z"></path></g>',
  PROMOTED_PATH: 'M19.498 3h-15c-1.381 0-2.5 1.12-2.5 2.5v13c0 1.38 1.119 2.5 2.5 2.5h15c1.381 0 2.5-1.12 2.5-2.5v-13c0-1.38-1.119-2.5-2.5-2.5zm-3.502 12h-2v-3.59l-5.293 5.3-1.414-1.42L12.581 10H8.996V8h7v7z',
  RETWEET: '<g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g>',
  RETWEETS_OFF: '<g><path d="M3.707 21.707l18-18-1.414-1.414-2.088 2.088C17.688 4.137 17.11 4 16.5 4H11v2h5.5c.028 0 .056 0 .084.002l-10.88 10.88c-.131-.266-.204-.565-.204-.882V7.551l2.068 1.93 1.365-1.462L4.5 3.882.068 8.019l1.365 1.462 2.068-1.93V16c0 .871.278 1.677.751 2.334l-1.959 1.959 1.414 1.414zM18.5 9h2v7.449l2.068-1.93 1.365 1.462-4.433 4.137-4.432-4.137 1.365-1.462 2.067 1.93V9zm-8.964 9l-2 2H13v-2H9.536z"></path></g>',
  TWITTER_FEATHER_PLUS_PATH: 'M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z',
  TWITTER_HOME_ACTIVE_PATH: 'M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z',
  TWITTER_HOME_INACTIVE_PATH: 'M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5h-13c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z',
  TWITTER_LOGO_PATH: 'M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z',
  X_HOME_ACTIVE_PATH: 'M10.059 2.593c1.175-.784 2.707-.784 3.882 0l6.5 4.333C21.415 7.575 22 8.668 22 9.838V18.5c0 1.933-1.567 3.5-3.5 3.5h-4.25v-5.25c0-1.243-1.007-2.25-2.25-2.25s-2.25 1.007-2.25 2.25V22H5.5C3.567 22 2 20.433 2 18.5V9.838c0-1.17.585-2.263 1.559-2.912l6.5-4.333z',
  X_HOME_INACTIVE_PATH: 'M20 9.838c0-.502-.25-.97-.668-1.248l-6.5-4.333c-.504-.336-1.16-.336-1.664 0l-6.5 4.333C4.251 8.868 4 9.336 4 9.838V18.5c0 .828.672 1.5 1.5 1.5h3v-3.5c0-1.933 1.567-3.5 3.5-3.5s3.5 1.567 3.5 3.5V20h3c.828 0 1.5-.672 1.5-1.5V9.838zm2 8.662c0 1.933-1.567 3.5-3.5 3.5h-5v-5.5c0-.829-.672-1.5-1.5-1.5s-1.5.671-1.5 1.5V22h-5C3.567 22 2 20.433 2 18.5V9.838c0-1.17.585-2.263 1.559-2.912l6.5-4.333c1.175-.784 2.707-.784 3.882 0l6.5 4.333C21.415 7.575 22 8.668 22 9.838V18.5z',
  PLUS_PATH: 'M10.938 4.5H9.9c-1.136 0-1.929 0-2.546.05-.605.05-.953.143-1.216.277-.564.288-1.023.747-1.31 1.31-.135.264-.228.612-.277 1.218C4.5 7.97 4.5 8.765 4.5 9.9v4.2c0 1.136 0 1.929.05 2.546.05.605.143.953.277 1.216.288.565.747 1.023 1.31 1.31.264.135.612.228 1.217.277.617.05 1.41.051 2.546.051h4.2c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277.565-.288 1.023-.746 1.31-1.31.135-.264.228-.612.277-1.217.05-.617.051-1.41.051-2.546v-1.037h2V14.1c0 1.103.001 1.992-.058 2.709-.06.728-.185 1.368-.487 1.96-.48.941-1.245 1.707-2.185 2.186-.593.302-1.233.428-1.961.488-.718.058-1.606.057-2.71.057H9.9c-1.103 0-1.991.001-2.709-.058-.728-.06-1.368-.185-1.96-.487-.941-.48-1.707-1.245-2.186-2.185-.302-.593-.428-1.233-.487-1.961-.059-.718-.058-1.606-.058-2.71V9.9c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96.48-.941 1.245-1.707 2.185-2.186.593-.302 1.233-.428 1.961-.487.718-.059 1.606-.058 2.71-.058h1.037v2z',
}

const THEME_BLUE = 'rgb(29, 155, 240)'
const THEME_COLORS = new Map([
  ['blue500', THEME_BLUE],
  ['yellow500', 'rgb(255, 212, 0)'],
  ['magenta500', 'rgb(249, 24, 128)'],
  ['purple500', 'rgb(120, 86, 255)'],
  ['orange500', 'rgb(255, 122, 0)'],
  ['green500', 'rgb(0, 186, 124)'],
])
const HIGH_CONTRAST_LIGHT = new Map([
  ['blue500', 'rgb(0, 56, 134)'],
  ['yellow500', 'rgb(111, 62, 0)'],
  ['magenta500', 'rgb(137, 10, 70)'],
  ['purple500', 'rgb(82, 52, 183)'],
  ['orange500', 'rgb(137, 43, 0)'],
  ['green500', 'rgb(0, 97, 61)'],
])
const HIGH_CONTRAST_DARK = new Map([
  ['blue500', 'rgb(107, 201, 251)'],
  ['yellow500', 'rgb(255, 235, 107)'],
  ['magenta500', 'rgb(251, 112, 176)'],
  ['purple500', 'rgb(172, 151, 255)'],
  ['orange500', 'rgb(255, 173, 97)'],
  ['green500', 'rgb(97, 214, 163)'],
])
// <body> pseudo-selector for pages the full-width content feature works on
const FULL_WIDTH_BODY_PSEUDO = ':not(.Search)'
// Matches any notification count at the start of the title
const TITLE_NOTIFICATION_RE = /^\(\d+\+?\) /
// The Communities nav item takes you to /yourusername/communities
const URL_COMMUNITIES_RE = /^\/[a-zA-Z\d_]{1,20}\/communities(?:\/explore)?\/?$/
const URL_COMMUNITY_RE = /^\/i\/communities\/\d+(?:\/about)?\/?$/
const URL_COMMUNITY_MEMBERS_RE = /^\/i\/communities\/\d+\/(?:members|moderators)\/?$/
const URL_DISCOVER_COMMUNITIES_RE = /^\/i\/communities\/suggested\/?/
const URL_LIST_RE = /\/i\/lists\/\d+\/?$/
const URL_LISTS_RE = /^\/[a-zA-Z\d_]{1,20}\/lists\/?$/
const URL_MEDIA_RE = /\/(?:photo|video)\/\d\/?$/
const URL_MEDIAVIEWER_RE = /^\/[a-zA-Z\d_]{1,20}\/status\/\d+\/mediaviewer$/i
// Matches URLs which show one of the tabs on a user profile page
const URL_PROFILE_RE = /^\/([a-zA-Z\d_]{1,20})(?:\/(affiliates|with_replies|superfollows|highlights|articles|media|likes))?\/?$/
// Matches URLs which show a user's Followers you know / Followers / Following tab
const URL_PROFILE_FOLLOWS_RE = /^\/[a-zA-Z\d_]{1,20}\/(?:verified_followers|follow(?:ing|ers|ers_you_follow)|creator-subscriptions\/subscriptions)\/?$/
/** Matches the start of any individual Tweet URL, capturing the user and id */
const URL_TWEET_BASE_RE = /^\/([a-zA-Z\d_]{1,20})\/status\/(\d+)/
/** Matches the entire URL when viewing an individual Tweet, including optional end slash */
const URL_TWEET_RE = /^\/([a-zA-Z\d_]{1,20})\/status\/(\d+)\/?$/
/** Matches Tweet interactions page URLs, capturing the path segment for the current tab */
const URL_TWEET_INTERACTIONS_RE = /^\/[a-zA-Z\d_]{1,20}\/status\/\d+\/(quotes|retweets|reposts|likes)\/?$/

// The Twitter Media Assist exension adds a new button at the end of the action
// bar (#346).
const TWITTER_MEDIA_ASSIST_BUTTON_SELECTOR = '.tva-download-icon, .tva-modal-download-icon'

/** `true` when a 'Block @${user}' menu item was clicked in the last popup. */
let blockMenuItemClicked = false

/** `true` when a 'Block @${user}' menu item was seen in the last popup. */
let blockMenuItemSeen = false

/** `true` if the user has used the Following "Sort by" menu */
let userSortedFollowing = false

/** Notification count in the title (including any spaces), e.g. `'(1) '`. */
let currentNotificationCount = ''

/** The last notification count we hid from the title. */
let hiddenNotificationCount = ''

/**
 * Title of the page features are being applied to.
 *
 * Normally this is document.title without the site suffix or notification
 * count, but we also use it to "navigate" to the virtual Retweets / Shared
 * Tweets tab on Home without changing the URL.
 */
let currentPage = ''

/**
 * URL pathname of the page features are being applied to, even when the URL
 * points to a desktop modal.
 */
let currentPagePath = ''

/**
 * URL pathname from the last handled title change, used to detect subsequent
 * navigation and modal transitions.
 */
let lastUrlPath = ''

/** Whether the URL from the last handled title change was a desktop modal. */
let lastUrlWasModal = false

/**
 * React Native stylesheet rule for the blur filter for sensitive content.
 * @type {CSSStyleRule}
 */
let filterBlurRule = null

/**
 * React Native stylesheet rule for the Chirp font-family.
 * @type {CSSStyleRule}
 */
let fontFamilyRule = null

/** @type {string} */
let fontSize = null

/** @type {Map<string, import("./types").Disconnectable>} */
let globalObservers = new Map()

/** Set to `true` when a Home/Following heading or Home nav link is used. */
let homeNavigationIsBeingUsed = false

/** Set to `true` when the media modal is open on desktop. */
let isDesktopMediaModalOpen = false

/** Set to `true` when the compose tweet modal is open on desktop. */
let isDesktopComposeTweetModalOpen = false

/** @type {HTMLElement} */
let $desktopComposeTweetModalPopup = null

/**
 * Popup container currently being observed, which can survive app re-renders.
 * @type {HTMLElement}
 */
let $popupContainer = null

/**
 * flex-direction on the element wrapping the app is used to determine the
 * current mode (mobile or desktop).
 */
let lastFlexDirection = null

/**
 * Cache for the last page title which was used for the Home timeline.
 * @type {string}
 */
let lastHomeTimelineTitle = null

/**
 * Observers and pending setup to clean up when the current modal changes.
 * @type {Map<string, import("./types").Disconnectable>}
 */
let modalObservers = new Map()

/**
 * `true` after the app has initialised.
 * @type {boolean}
 */
let observingPageChanges = false

/**
 * MutationObservers active on the current page, or anything else we want to
 * clean up when the user moves off the current page.
 * @type {Map<string, import("./types").Disconnectable>}
 */
let pageObservers = new Map()

/** @type {number} */
let selectedHomeTabIndex = -1

/**
 * Title for the fake timeline used to separate out retweets and quote tweets.
 * @type {string}
 */
let separatedTweetsTimelineTitle = null

/**
 * The current "Color" setting.
 * @type {string}
 */
let themeColor = THEME_BLUE

/**
 * `true` when "For you" was the last tab selected on the Home timeline.
 */
let wasForYouTabSelected = false

function isOnAccessibilitySettingsPage() {
  return currentPagePath == PagePaths.ACCESSIBILITY_SETTINGS
}

function isOnCallsPage() {
  return currentPagePath.startsWith('/i/calls')
}

function isOnChatPage() {
  return currentPagePath.startsWith('/i/chat')
}

function isOnCommunitiesPage() {
  return URL_COMMUNITIES_RE.test(currentPagePath)
}

function isOnCommunityPage() {
  return URL_COMMUNITY_RE.test(currentPagePath)
}

function isOnCommunityMembersPage() {
  return URL_COMMUNITY_MEMBERS_RE.test(currentPagePath)
}

function isOnDiscoverCommunitiesPage() {
  return URL_DISCOVER_COMMUNITIES_RE.test(currentPagePath)
}

function isOnDisplaySettingsPage() {
  return currentPagePath == PagePaths.DISPLAY_SETTINGS
}

function isOnExplorePage() {
  return currentPagePath == '/explore' || currentPagePath.startsWith('/explore/')
}

function isOnFollowListPage() {
  return URL_PROFILE_FOLLOWS_RE.test(currentPagePath)
}

function isOnGrokPage() {
  return currentPagePath.startsWith('/i/grok')
}

function isOnHistoryPage() {
  return currentPagePath.startsWith(PagePaths.HISTORY)
}

function isOnIndividualTweetPage() {
  return URL_TWEET_RE.test(currentPagePath)
}

function isOnOwnTweetPage(tweetPath = currentPagePath) {
  let screenName = getUserScreenName()
  return screenName != null && screenName == tweetPath.match(URL_TWEET_BASE_RE)?.[1]
}

function isOnListPage() {
  return URL_LIST_RE.test(currentPagePath)
}

function isOnListsPage() {
  return URL_LISTS_RE.test(currentPagePath)
}

function isOnHomeTimelinePage() {
  return currentPagePath == PagePaths.HOME
}

function isOnComposeTweetPage() {
  return lastUrlPath.startsWith(PagePaths.COMPOSE_TWEET)
}

function isOnNotificationsPage() {
  return currentPagePath.startsWith('/notifications')
}

function isOnPremiumSignupPage() {
  return lastUrlPath.startsWith('/i/premium_sign_up')
}

function isOnProfilePage() {
  let profilePathUsername = currentPagePath.match(URL_PROFILE_RE)?.[1]
  if (!profilePathUsername) return false
  // twitter.com/user and its sub-URLs put @user in the title
  return currentPage.toLowerCase().includes(`${ltr ? '@' : ''}${profilePathUsername.toLowerCase()}${!ltr ? '@' : ''}`)
}

function isOnQuoteTweetsPage() {
  return currentPagePath.match(URL_TWEET_INTERACTIONS_RE)?.[1] == 'quotes'
}

function isOnSearchPage() {
  return currentPagePath.startsWith('/search') || currentPagePath.startsWith('/hashtag/')
}

function isOnSeparatedTweetsTimeline() {
  return currentPage == separatedTweetsTimelineTitle
}

function isOnSettingsPage() {
  return currentPagePath.startsWith('/settings')
}

function shouldHideSidebar() {
  return isOnExplorePage() || isOnDiscoverCommunitiesPage()
}

function shouldShowSeparatedTweetsTab() {
  return false;
}
//#endregion

//#region Utility functions
function addQuestionMark(text, add) {
  if (!add) return text
  return ltr ? `${text}?` : `؟${text}`
}

function addStyle(css = '') {
  let $style = document.createElement('style')
  if (css) {
    $style.textContent = css
  }
  document.head.appendChild($style)
  return $style
}

/**
 * @param {Element} $svg
 */
function blueCheck($svg) {
  if (!$svg) {
    return
  }
  $svg.classList.add('cpft_blue_check')
  // Safari doesn't support using `d: path(…)` to replace paths in an SVG, so
  // we have to manually patch the path in it.
  if (isSafari) {
    $svg.firstElementChild.firstElementChild.setAttribute('d', Svgs.BLUE_LOGO_PATH)
  }
}

/**
 * @param {string} str
 * @returns {string}
 */
function dedent(str) {
  str = str.replace(/^[ \t]*\r?\n/, '')
  let indent = /^[ \t]+/m.exec(str)
  if (indent) str = str.replace(new RegExp('^' + indent[0], 'gm'), '')
  return str.replace(/(\r?\n)[ \t]+$/, '$1')
}

/**
 * @param {Map<string, import("./types").Disconnectable>} observers
 * @param {'global' | 'page' | 'modal'} scope
 */
function disconnectObservers(observers, scope) {
  if (observers.size == 0) return
  log(
    `disconnecting ${observers.size} ${scope} observer${s(observers.size)}`,
    Array.from(observers.keys())
  )
  logObserverDisconnects = false
  for (let observer of observers.values()) observer.disconnect()
  logObserverDisconnects = true
}

/**
 * @param {MutationRecord[]} mutations
 * @param {($el: Node) => boolean | HTMLElement} fn - return `true` to use [$el]
 * as the result, or return a different HTMLElement to use it as the result.
 * @returns {Node | HTMLElement | null}
 */
function findAddedNode(mutations, fn) {
  for (let mutation of mutations) {
    for (let el of mutation.addedNodes) {
      let result = fn(el)
      if (result) {
        return result === true ? el : result
      }
    }
  }
  return null
}

/**
 * @param {Element} $el
 * @param {Element} $ancestor
 */
function getClosestChild($el, $ancestor) {
  let $child = $el
  while ($child && $child.parentElement !== $ancestor) {
    $child = $child.parentElement
  }
  return $child
}

/** Read the URL and underlying page together for navigation decisions. */
function getCurrentRoute() {
  let urlPath = location.pathname
  let history = desktop ? getTopLevelProps()?.history : null
  let isModal = Boolean(history?.getIsModalRoute?.())
  let pagePath = urlPath
  if (isModal) {
    pagePath = history.getLastNonModalLocationPathname?.() || getRenderedPagePath(urlPath)
  }
  return {urlPath, pagePath, isModal}
}

/** @param {string} fallbackPath */
function getRenderedPagePath(fallbackPath) {
  // Direct modal URLs have no previous route, find the rendered fallback page
  let $column = document.querySelector(Selectors.PRIMARY_COLUMN)
  if (!$column) return fallbackPath
  let reactFiberKey = Object.keys($column).find(key => key.startsWith('__reactFiber$'))
  for (let fiber = $column[reactFiberKey], depth = 0; fiber && depth < 50; fiber = fiber.return, depth++) {
    let routePath = (fiber.stateNode?.props || fiber.memoizedProps)?.location?.pathname
    if (typeof routePath == 'string' && routePath != fallbackPath) return routePath
  }
  return fallbackPath
}

/**
 * @param {string} selector
 * @param {{
 *   name?: string
 *   stopIf?: () => boolean
 *   timeout?: number
 *   context?: Document | HTMLElement
 * }?} options
 * @returns {Promise<HTMLElement | null>}
 */
function getElement(selector, {
  name = null,
  stopIf = null,
  timeout = Infinity,
  context = document,
} = {}) {
  return new Promise((resolve) => {
    let startTime = Date.now()
    let rafId
    let timeoutId

    function stop($element, reason) {
      if ($element == null) {
        warn(`stopped waiting for ${name || selector} after ${reason}`)
      }
      else if (Date.now() > startTime) {
        log(`${name || selector} appeared after ${Date.now() - startTime}ms`)
      }
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      resolve($element)
    }

    if (timeout !== Infinity) {
      timeoutId = setTimeout(stop, timeout, null, `${timeout}ms timeout`)
    }

    function queryElement() {
      if (stopIf?.() === true) {
        stop(null, 'stopIf condition met')
        return
      }

      let $element = context.querySelector(selector)
      if ($element) {
        stop($element)
      }
      else {
        rafId = requestAnimationFrame(queryElement)
      }
    }

    queryElement()
  })
}

function getTopLevelProps() {
  if (!$reactRoot?.firstElementChild) {
    return
  }
  let reactPropsKey = Object.keys($reactRoot.firstElementChild).find(key => key.startsWith('__reactProps'))
  if (reactPropsKey) {
    return $reactRoot.firstElementChild[reactPropsKey].children?.props?.children?.props
  }
}

function getState() {
  let props = getTopLevelProps()
  if (props) {
    let state = props.store?.getState()
    if (state) return state
  }
}

let accountLocationCache = new Map()

async function getAccountLocation(screenName) {
  if (!accountLocationCache.has(screenName)) {
    let csrfToken = document.cookie.split('; ').find(c => c.startsWith('ct0='))?.split('=')[1]
    let response = await fetch(
      `/i/api/graphql/XRqGa7EeokUU5kppkh13EA/AboutAccountQuery?variables=${encodeURIComponent(JSON.stringify({screenName}))}`,
      {
        credentials: 'include',
        headers: {
          'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
          'content-type': 'application/json',
          'x-twitter-active-user': 'yes',
          'x-twitter-auth-type': 'OAuth2Session',
          'x-twitter-client-language': lang,
          ...(csrfToken && {'x-csrf-token': csrfToken}),
        }
      }
    )
    if (response.ok) {
      try {
        let body = await response.json()
        accountLocationCache.set(screenName, body.data?.user_result_by_screen_name?.result?.about_profile)
      } catch(e) {
        error('error getting account location for', screenName, e)
      }
    } else {
      error(response.status, 'response getting account location for', screenName)
    }
  }
  return accountLocationCache.get(screenName)
}

function getStateEntities() {
  let state = getState()
  if (state) {
    if (state.entities) return state.entities
  }
}

function getUserScreenName() {
  let state = getState()
  return state?.entities?.users?.entities?.[state?.session?.user_id]?.screen_name
}

function getThemeColorFromState() {
  let localState = getState()?.settings?.local
  let color = localState?.themeColor
  let highContrast = localState?.highContrastEnabled
  $body.classList.toggle('HighContrast', highContrast)
  if (color) {
    if (THEME_COLORS.has(color)) {
      let colors = THEME_COLORS
      if (highContrast) colors = getColorScheme() == 'Default' ? HIGH_CONTRAST_LIGHT : HIGH_CONTRAST_DARK
      return colors.get(color)
    }
  }
}

/**
 * Gets cached tweet info from React state.
 */
function getTweetInfo(tweetId) {
  let tweetEntities = getStateEntities()?.tweets?.entities
  if (tweetEntities) {
    let tweetInfo = tweetEntities[tweetId]
    return tweetInfo
  }
}

/**
 * Gets cached user info from React state.
 * @returns {import("./types").UserInfoObject}
 */
function getUserInfo() {
  /** @type {import("./types").UserInfoObject} */
  let userInfo = {}
  let userEntities = getStateEntities()?.users?.entities
  if (userEntities) {
    for (let user of Object.values(userEntities)) {
      userInfo[user.screen_name] = {
        following: user.following,
        followedBy: user.followed_by,
        followersCount: user.followers_count,
      }
    }
  }
  return userInfo
}

/**
 * @param {*} value
 * @returns {value is string}
 */
function isString(value) {
  return Object.getPrototypeOf(value) === String.prototype
}

function log(...args) {}

function warn(...args) {}

function error(...args) {
  console.log(`❌ ${currentPage ? `(${currentPage})` : ''}`, ...args)
}

let logObserverDisconnects = true

/**
 * Convenience wrapper for the MutationObserver API:
 * - Observers have associated names
 * - Optional leading call for callback
 * - Observers are stored in a scope map
 * - Observers already in the given scope will be disconnected
 * - MutationObserver options default to `{childList: true}`
 * @param {Node} $target
 * @param {MutationCallback} callback
 * @param {string | {
 *   leading?: boolean
 *   logElement?: boolean
 *   name: string
 *   observers: Map<string, import("./types").Disconnectable>
 *   onDisconnect?: () => void
 * }} nameOrOptions
 * @param {MutationObserverInit} mutationObserverOptions
 * @returns {import("./types").NamedMutationObserver}
 */
function observeElement($target, callback, nameOrOptions, mutationObserverOptions = {childList: true}) {
  // Passing just a name opts out of the rest of the wrapper features
  if (isString(nameOrOptions)) {
    let observer = Object.assign(new MutationObserver(callback), {name: nameOrOptions})
    observer.observe($target, mutationObserverOptions)
    return observer
  }

  let {leading, logElement, name, observers, onDisconnect} = nameOrOptions

  let observer = Object.assign(new MutationObserver(callback), {name})
  let disconnect = observer.disconnect.bind(observer)
  let disconnected = false
  observer.disconnect = () => {
    if (disconnected) return
    disconnected = true
    disconnect()
    onDisconnect?.()
    observers.delete(name)
    if (logObserverDisconnects) {
      log(`disconnected ${name} observer`)
    }
  }

  if (observers.has(name)) {
    log(`disconnecting existing ${name} observer`)
    logObserverDisconnects = false
    observers.get(name).disconnect()
    logObserverDisconnects = true
  }

  observers.set(name, observer)
  if (logElement) {
    log(`observing ${name}`, $target)
  } else {
    log(`observing ${name}`)
  }
  observer.observe($target, mutationObserverOptions)
  if (leading) {
    callback([], observer)
  }
  return observer
}

/**
 * @param {string} page
 * @returns {() => boolean}
 */
function pageIsNot(page) {
  return function() {
    let pageChanged = page != currentPage
    if (pageChanged) {
      log('pageIsNot', {page, currentPage})
    }
    return pageChanged
  }
}

/**
 * @param {string} path
 * @returns {() => boolean}
 */
function pathIsNot(path) {
  return () => path != lastUrlPath
}

/**
 * Register pending modal setup so disconnecting modalObservers cancels it too.
 * @param {string} name
 * @returns {() => boolean}
 */
function registerModalSetup(name) {
  let cancelled = false
  modalObservers.get(name)?.disconnect()
  let setup = {
    name,
    disconnect() {
      cancelled = true
      if (modalObservers.get(name) == setup) modalObservers.delete(name)
    },
  }
  modalObservers.set(name, setup)
  return () => cancelled
}

/**
 * @template T
 * @param {() => T} fn
 */
function run(fn) {
  return fn()
}

/**
 * @param {number} n
 * @returns {string}
 */
function s(n) {
  return n == 1 ? '' : 's'
}

function storeConfigChanges(changes) {
  window.postMessage({type: 'cpftConfigChange', changes})
}
//#endregion

//#region Global observers
/**
 * Update theme hooks and colours when <body>'s backgroundColor changes.
 */
function observeBodyBackgroundColor() {
  let lastBackgroundColor = null

  observeElement($body, () => {
    let backgroundColor = $body.style.backgroundColor
    if (backgroundColor == lastBackgroundColor) return

    $body.classList.toggle('Default', backgroundColor == 'rgb(255, 255, 255)')
    $body.classList.toggle('LightsOut', backgroundColor == 'rgb(0, 0, 0)' || backgroundColor == 'rgb(5, 5, 5)')

    if (lastBackgroundColor != null) {
      // This also updates body.HighContrast
      updateThemeColor()
    }
    styleEmbed.update()
    lastBackgroundColor = backgroundColor
  }, {
    leading: true,
    name: '<body> style attribute for background colour changes',
    observers: globalObservers,
  }, {
    attributes: true,
    attributeFilter: ['style']
  })
}

const styleEmbed = (() => {
  /** @type {Set<{darkModeStyle: HTMLStyleElement, notificationStyle: HTMLStyleElement, rafId: number | null}>} */
  let embeddedStyles = new Set()

  function updateStyles() {
    let media = 'not all'
    for (let {darkModeStyle, notificationStyle} of embeddedStyles) {
      darkModeStyle.media = media
      notificationStyle.media = 'not all'
    }
  }

  /**
   * @param {string} selector
   * @param {string} rootSelector
   * @param {Document | HTMLElement} context
   */
  function styleEmbed(selector, rootSelector, context = document) {
    let darkModeStyle = document.createElement('style')
    darkModeStyle.textContent = dedent(`
      ${rootSelector}[data-theme="dark"] {
        --x-bg-primary: var(--cpft-background);
        --x-bg-secondary: var(--cpft-raised-bg);
        --x-bg-tertiary: var(--cpft-raised-bg);
        --x-bg-modal: var(--cpft-raised-bg);
        --x-bg-sheets: var(--cpft-raised-bg);
        /* Tailwind & shadcn */
        --background: 210 34% 13%;
        --border: 206 16% 26%;
        --color-background: 210 34% 13%;
        --color-gray-50: 213 25% 16%;
        --color-gray-100: 211 34% 24%;
      }
    `)
    let notificationStyle = document.createElement('style')
    notificationStyle.textContent = dedent(`
      [data-testid="xchat-drawer-unread-badge"] {
        display: none !important;
      }
    `)
    let styles = {darkModeStyle, notificationStyle, rafId: null}
    embeddedStyles.add(styles)
    updateStyles()

    function disconnect() {
      if (styles.rafId != null) cancelAnimationFrame(styles.rafId)
      darkModeStyle.remove()
      notificationStyle.remove()
      embeddedStyles.delete(styles)
    }

    function attachStyles() {
      styles.rafId = null
      if (!context.isConnected) {
        disconnect()
        return
      }
      let $host = context.querySelector(selector)
      let $shadowRoot = $host?.shadowRoot
      let $root = $shadowRoot?.querySelector(rootSelector)
      // Wait for the embed, its shadow root and initial render
      if (!$root) {
        styles.rafId = requestAnimationFrame(attachStyles)
        return
      }
      $shadowRoot.append(darkModeStyle, notificationStyle)
    }

    attachStyles()
    return {disconnect}
  }
  styleEmbed.update = updateStyles
  return styleEmbed
})()

/** @param {HTMLElement} $drawerLayer */
function observeChatDrawer($drawerLayer) {
  let selector = '[data-testid="xchatEmbedDrawer"]'
  /** @type {Element | null} */
  let $embed = null
  /** @type {{disconnect()} | null} */
  let styles = null

  return observeElement($drawerLayer, () => {
    let $host = $drawerLayer.querySelector(selector)
    if ($host == $embed) return

    styles?.disconnect()
    $embed = $host
    styles = $embed ? styleEmbed(selector, ':is([data-xchat-root], [data-xchat-portal])', $drawerLayer) : null
  }, {
    leading: true,
    name: 'Chat embed drawer',
    observers: globalObservers,
    onDisconnect() {
      styles?.disconnect()
    },
  })
}

/**
 * @param {HTMLElement} $popup
 */
async function observeDesktopComposeTweetModal($popup) {
  $popup.classList.add('ComposeTweetModal')
  return
}

/**
 * The timeline Tweet box is removed when you navigate to a pinned Communities
 * tab and re-added when you navigate to another Home timeline tab.
 */
async function observeDesktopHomeTimelineTweetBox() {
  let $container = await getElement('div[data-testid="primaryColumn"] > div', {
    name: 'Home timeline Tweet box container',
    stopIf: pageIsNot(currentPage),
  })
  if (!$container) return

  /**
   * @param {HTMLElement} $tweetBox
   */
  async function observeTweetBox($tweetBox) {
    $tweetBox.classList.add('TweetBox')
  }

  /** @type {HTMLElement} */
  let $timelineTweetBox = $container.querySelector(':scope > div:has([data-testid^="tweetTextarea"]')
  if ($timelineTweetBox) {
    observeTweetBox($timelineTweetBox)
  }

  observeElement($container, (mutations) => {
    for (let mutation of mutations) {
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement)) continue
        if ($addedNode.querySelector('[data-testid^="tweetTextarea"]')) {
          $timelineTweetBox = $addedNode
          observeTweetBox($timelineTweetBox)
        }
      }
      for (let $removedNode of mutation.removedNodes) {
        if (!($removedNode instanceof HTMLElement)) continue
        if ($removedNode === $timelineTweetBox) {
          $timelineTweetBox = null
          pageObservers.get('Tweet box editor root')?.disconnect()
        }
      }
    }
  }, {
    name: 'Home timeline Tweet box container',
    observers: pageObservers,
  })
}

/**
 * @param {HTMLElement} $popup
 */
async function observeDesktopModalTimeline($popup) {
  let modalCancelled = registerModalSetup('media modal setup')
  // Media modals remember if they were previously collapsed, so we could be
  // waiting for the initial timeline to be either rendered or expanded.
  let $initialTimeline = await getElement(Selectors.MODAL_TIMELINE, {
    context: $popup,
    name: 'initial modal timeline',
    stopIf: modalCancelled,
  })

  if ($initialTimeline == null || modalCancelled()) return

  /**
   * @param {HTMLElement} $timeline
   */
  function observeModalTimelineItems($timeline) {
    let seen = new Map()
    observeElement($timeline, () => {
      onIndividualTweetTimelineChange($timeline, {observers: modalObservers, seen})
    }, {
      leading: true,
      name: 'modal timeline',
      observers: modalObservers,
    })

    // If other media in the modal is clicked, the timeline is replaced.
    observeElement($timeline.parentElement, (mutations) => {
      for (let mutation of mutations) {
        for (let $newTimeline of mutation.addedNodes) {
          if (!($newTimeline instanceof HTMLElement)) continue
          seen = new Map()
          observeElement($newTimeline, () => {
            onIndividualTweetTimelineChange($newTimeline, {observers: modalObservers, seen})
          }, {
            leading: true,
            name: 'modal timeline',
            observers: modalObservers,
          })
        }
      }
    }, {
      name: 'modal timeline parent',
      observers: modalObservers,
    })
  }

  /**
   * @param {HTMLElement} $timeline
   */
  function observeModalTimeline($timeline) {
    // If the inital timeline doesn't have a style attribute it's a placeholder
    if ($timeline.hasAttribute('style')) {
      observeModalTimelineItems($timeline)
    }
    else {
      let startTime = Date.now()
      observeElement($timeline.parentElement, (mutations, observer) => {
        for (let mutation of mutations) {
          for (let $addedNode of mutation.addedNodes) {
            if (!($addedNode instanceof HTMLElement)) continue
            if (Date.now() > startTime) {
              log(`modal timeline appeared after ${Date.now() - startTime}ms`, $addedNode)
            }
            observer.disconnect()
            observeModalTimelineItems($addedNode)
          }
        }
      }, {
        name: 'modal timeline parent',
        observers: modalObservers,
      })
    }
  }

  // The modal timeline can be expanded and collapsed
  let $expandedContainer = $initialTimeline.closest('[aria-expanded="true"]')
  observeElement($expandedContainer.parentElement, async (mutations) => {
    if (mutations.some(mutation => mutation.removedNodes.length > 0)) {
      modalObservers.get('modal timeline parent')?.disconnect()
      modalObservers.get('modal timeline')?.disconnect()
    }
    else if (mutations.some(mutation => mutation.addedNodes.length > 0)) {
      let $timeline = await getElement(Selectors.MODAL_TIMELINE, {
        context: $popup,
        name: 'expanded modal timeline',
        stopIf: modalCancelled,
      })
      if ($timeline == null || modalCancelled()) return
      observeModalTimeline($timeline)
    }
  }, {
    name: 'collapsible modal timeline container',
    observers: modalObservers,
  })

  observeModalTimeline($initialTimeline)
}

const observeFavicon = (() => {
  /** @type {HTMLLinkElement} */
  let $shortcutIcon

  async function observeFavicon() {
    $shortcutIcon = /** @type {HTMLLinkElement} */ (await getElement('link[rel~="icon"]', {
      name: 'shortcut icon'
    }))

    observeElement($shortcutIcon, () => {
      let href = $shortcutIcon.href
    }, {
      leading: true,
      name: 'shortcut icon href',
      observers: globalObservers,
    }, {
      attributes: true,
      attributeFilter: ['href'],
    })
  }

  observeFavicon.forceUpdate = function(showPip) {
    let href = $shortcutIcon.href
    href = `//abs.twimg.com/favicons/twitter${
      showPip ? '-pip' : ''
    }.3.ico`
    if (href != $shortcutIcon.href) {
      $shortcutIcon.href = href
    }
  }

  return observeFavicon
})()

/**
 * Twitter displays popups in the #layers element. It also reuses open popups
 * in certain cases rather than creating one from scratch, so we also need to
 * deal with nested popups, e.g. if you hover over the caret menu in a Tweet, a
 * popup will be created to display a "More" tootip and clicking to open the
 * menu will create a nested element in the existing popup, whereas clicking the
 * caret quickly without hovering over it will display the menu in new popup.
 * Use of nested popups can also differ between desktop and mobile, so features
 * need to be mindful of that.
 */
async function observePopups() {
  let $layers = await getElement('#layers', {
    name: 'layers',
  })
  if (!$layers || $layers == $popupContainer) return
  /** @type {HTMLElement | null} */
  let $drawerLayer = null
  /** @type {Map<HTMLElement, {disconnect()} | null>} */
  let nestedObservers = new Map()

  observeElement($layers, () => {
    // The first layer contains persistent overlays, popups are siblings
    let $firstLayer = /** @type {HTMLElement} */ ($layers.firstElementChild)
    if ($firstLayer != $drawerLayer) {
      $drawerLayer = $firstLayer
      if ($drawerLayer) observeChatDrawer($drawerLayer)
    }

    for (let [$popup, observer] of nestedObservers) {
      if ($popup.parentElement != $layers || $popup == $firstLayer) {
        observer?.disconnect()
        nestedObservers.delete($popup)
      }
    }

    // A modal can already be open if we start on its URL
    for (let $popup of $layers.children) {
      if (!($popup instanceof HTMLElement) || $popup == $firstLayer || nestedObservers.has($popup)) continue
      nestedObservers.set($popup, onPopup($popup))
    }
  }, {
    leading: true,
    name: 'popup container',
    observers: globalObservers,
    onDisconnect() {
      $popupContainer = null
      for (let observer of nestedObservers.values()) {
        observer?.disconnect()
      }
      nestedObservers.clear()
    },
  })
  $popupContainer = $layers
}

async function observeReRenderBoundary() {
  let $rerenderBoundary = await getElement('#react-root > div > div')
  observeElement($rerenderBoundary, () => {
    observePopups()
    observeSideNavItems()
    if (observingPageChanges) {
      updateThemeColor()
      if (currentPagePath) processCurrentPage()
    }
  }, {
    name: 'app re-render boundary',
    observers: globalObservers,
  })
}

async function observeTitle() {
  let $title = await getElement('title', {name: '<title>'})
  observeElement($title, () => {
    let title = $title.textContent
    if (title.match(/^Intervention for (X|Twitter)$/)) {
      return
    }
    if (title != $title.textContent) {
      document.title = title
      // If Twitter is opened in the background, changing the title might not
      // re-fire the title MutationObserver, preventing the initial page from
      // being processed.
      if (observingPageChanges && !currentPagePath) {
        onTitleChange(title)
      }
      return
    }
    if (observingPageChanges) {
      onTitleChange(title)
    }
  }, {
    leading: true,
    name: '<title>',
    observers: globalObservers,
  })
}

const observeThemeMeta = (() => {
  /** @type {HTMLElement} */
  let $themeMeta
  /** @type {string} */
  let lastDarkModeBg

  function updateContent() {
    let content = $themeMeta?.getAttribute('content')
    if (content == '#15202b' && lastDarkModeBg) {
      $themeMeta.setAttribute('content', lastDarkModeBg)
      lastDarkModeBg = null
    }
  }

  async function observeThemeMeta() {
    $themeMeta = await getElement('meta[name="theme-color"]', {
      name: 'theme <meta>',
      context: document.head || document.documentElement,
    })
    observeElement($themeMeta, () => {
      updateContent()
    }, {
      leading: true,
      name: 'theme <meta>',
      observers: globalObservers,
      onDisconnect() {
        updateContent()
      },
    }, {
      attributes: true,
      attributeFilter: ['content'],
    })
  }

  observeThemeMeta.update = function() {
    updateContent()
  }

  return observeThemeMeta
})()
//#endregion

//#region Page observers
async function observeSidebar() {
  let $primaryColumn = await getElement(Selectors.PRIMARY_COLUMN, {name: 'primary column'})
  let $sidebarContainer = $primaryColumn.parentElement
  observeElement($sidebarContainer, async () => {
    let $sidebar = /** @type {HTMLElement} */ ($sidebarContainer.querySelector(Selectors.SIDEBAR))
    log(`sidebar ${$sidebar ? 'appeared' : 'disappeared'}`)
    $body.classList.toggle('Sidebar', Boolean($sidebar))
    if (!$sidebar) {
      return
    }
    let $sidebarContents = await getElement('div[data-testid="sidebarColumn"] > div > div > div > div > div', {
      name: 'sidebar contents',
      context: $sidebarContainer,
    })
    $sidebarContents.classList.add('SidebarContents')

    // Process blue checks in the sidebar search dropdown
    if (!isOnSearchPage() && !isOnExplorePage()) {
      observeSearchForm()
    }
  }, {
    leading: true,
    name:'sidebar container',
    observers: pageObservers,
  })
}

function observeSideNavItems() {
  observeSideNavTweetButton()
}

const observeSideNavTweetButton = (() => {
  /** @type {MutationObserver} */
  let observer

  return async function observeSideNavTweetButton() {
    if (observer) {
      observer.disconnect()
      observer = null
    }

    return;
  };
})()

async function observeSearchForm() {
  let $searchForm = await getElement('form[role="search"]', {
    name: 'search form',
    stopIf: pageIsNot(currentPage),
    // The sidebar on Profile pages can be really slow
    timeout: 2000,
  })
  if (!$searchForm) return
  let $results =  /** @type {HTMLElement} */ ($searchForm.lastElementChild)
  observeElement($results, () => {
    processBlueChecks($results)
  }, {
    leading: true,
    name: 'search results',
    observers: pageObservers,
  }, {
    childList: true,
    subtree: true,
  })
}

/**
 * @param {string} page
 * @param {import("./types").TimelineOptions?} options
 */
async function observeTimeline(page, options = {}) {
  let {
    isTabbed = false,
    onTabChanged = null,
    onTimelineAppeared = null,
    tabbedTimelineContainerSelector = null,
    timelineSelector = Selectors.TIMELINE,
  } = options

  let $timeline = await getElement(timelineSelector, {
    name: 'initial timeline',
    stopIf: pageIsNot(page),
  })

  if ($timeline == null) return

  /**
   * @param {HTMLElement} $timeline
   */
  function observeTimelineItems($timeline) {
    observeElement($timeline, () => {
      onTimelineChange($timeline, page, options)
    }, {
      leading: true,
      name: 'timeline',
      observers: pageObservers,
    })
    onTimelineAppeared?.()
    if (isTabbed) {
      // When a tab which has been viewed before is revisited, the timeline is
      // replaced.
      observeElement($timeline.parentElement, (mutations) => {
        for (let mutation of mutations) {
          for (let $addedNode of mutation.addedNodes) {
            if (!($addedNode instanceof HTMLElement)) continue
            let $newTimeline = $addedNode
            onTabChanged?.()
            observeElement($newTimeline, () => {
              onTimelineChange($newTimeline, page, options)
            }, {
              leading: true,
              name: 'timeline',
              observers: pageObservers,
            })
          }
        }
      }, {
        name: 'timeline parent',
        observers: pageObservers,
      })
    }
  }

  // If the inital timeline doesn't have a style attribute it's a placeholder
  if ($timeline.hasAttribute('style')) {
    observeTimelineItems($timeline)
  }
  else {
    let startTime = Date.now()
    observeElement($timeline.parentElement, (mutations, observer) => {
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if (!($addedNode instanceof HTMLElement)) continue
          observer.disconnect()
          if (Date.now() > startTime) {
            log(`timeline appeared after ${Date.now() - startTime}ms`, $addedNode)
          }
          observeTimelineItems($addedNode)
        }
      }
    }, {
      name: 'timeline parent',
      observers: pageObservers,
    })
  }

  // On some tabbed timeline pages, the first time a new tab is navigated to,
  // the element containing the timeline is replaced with a loading spinner.
  if (isTabbed && tabbedTimelineContainerSelector) {
    let $tabbedTimelineContainer = document.querySelector(tabbedTimelineContainerSelector)
    if ($tabbedTimelineContainer) {
      let waitingForNewTimeline = false
      observeElement($tabbedTimelineContainer, async (mutations) => {
        // This is going to fire twice on a new tab, as the spinner is added
        // then replaced with the new timeline element.
        if (!mutations.some(mutation => mutation.addedNodes.length > 0) || waitingForNewTimeline) return

        waitingForNewTimeline = true
        let $newTimeline = await getElement(timelineSelector, {
          name: 'new timeline',
          stopIf: pageIsNot(page),
        })
        waitingForNewTimeline = false
        if (!$newTimeline) return

        onTabChanged?.()
        observeTimelineItems($newTimeline)
      }, {
        name: 'tabbed timeline container',
        observers: pageObservers,
      })
    }
  }
}

/**
 * @param {string} page
 */
async function observeIndividualTweetTimeline(page) {
  let $timeline = await getElement(Selectors.TIMELINE, {
    name: 'initial individual tweet timeline',
    stopIf: pageIsNot(page),
  })

  if ($timeline == null) return

  /**
   * @param {HTMLElement} $timeline
   */
  function observeTimelineItems($timeline) {
    let seen = new WeakMap()
    observeElement($timeline, () => {
      onIndividualTweetTimelineChange($timeline, {observers: pageObservers, seen})
    }, {
      leading: true,
      name: 'individual tweet timeline',
      observers: pageObservers,
    })
  }

  // If the inital timeline doesn't have a style attribute it's a placeholder
  if ($timeline.hasAttribute('style')) {
    observeTimelineItems($timeline)
  }
  else {
    let startTime = Date.now()
    observeElement($timeline.parentElement, (mutations, observer) => {
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if (!($addedNode instanceof HTMLElement)) continue
          if (Date.now() > startTime) {
            log(`individual tweet timeline appeared after ${Date.now() - startTime}ms`, $addedNode)
          }
          observer.disconnect()
          observeTimelineItems($addedNode)
        }
      }
    }, {
      name: 'individual tweet timeline parent',
      observers: pageObservers,
    })
  }
}
//#endregion

//#region Tweak functions
async function addAccountLocationToFocusedTweet($permalinkBar, screenName) {
  if ($permalinkBar.hasAttribute('cpft-account-location-added')) return
  if (!screenName) return
  let accountLocation = await getAccountLocation(screenName)
  if (!accountLocation || !accountLocation.account_based_in) return
  let $separator = document.createElement('span')
  $separator.className = 'AccountLocation cpft_separator cpft_text'
  $separator.setAttribute('aria-hidden', 'true')
  $separator.setAttribute('hidden', '')
  $separator.textContent = '·'
  let $locationLabel = document.createElement('span')
  $locationLabel.className = 'AccountLocation cpft_text'
  $locationLabel.setAttribute('hidden', '')
  $locationLabel.textContent = addQuestionMark(accountLocation.account_based_in, !accountLocation.location_accurate)
  $permalinkBar.append($separator, $locationLabel)
  $permalinkBar.setAttribute('cpft-account-location-added', '')
}

/**
 * Add a "Turn on/off Retweets" menu item to a List's menu.
 * @param {HTMLElement} $switchMenuItem
 */
async function addToggleListRetweetsMenuItem($switchMenuItem) {
  // Wait for the menu to render properly on desktop
  if (desktop) {
    $switchMenuItem = await getElement(':scope > div > div > div > [role="menuitem"]', {
      context: $switchMenuItem.parentElement,
      name: 'rendered switch menu item',
      timeout: 100,
    })
    if (!$switchMenuItem) return
  }

  let $toggleRetweets = /** @type {HTMLElement} */ ($switchMenuItem.cloneNode(true))
  $toggleRetweets.classList.add('cpft_menu_item')
  $toggleRetweets.querySelector('span').textContent = getString(`TURN_${config.listRetweets == 'ignore' ? 'OFF' : 'ON'}_RETWEETS`)
  $toggleRetweets.querySelector('svg').innerHTML = config.listRetweets == 'ignore' ? Svgs.RETWEETS_OFF : Svgs.RETWEET
  // Remove subtitle if the cloned menu item has one
  $toggleRetweets.querySelector('div[dir] + div[dir]')?.remove()
  $toggleRetweets.addEventListener('click', (e) => {
    e.preventDefault()
    config.listRetweets = config.listRetweets == 'ignore' ? 'hide' : 'ignore'
    storeConfigChanges({listRetweets: config.listRetweets})
    processCurrentPage()
    // Dismiss the menu
    let $menuLayer = /** @type {HTMLElement} */ ($switchMenuItem.closest('[role="group"]')?.firstElementChild?.firstElementChild)
    $menuLayer?.click()
  })

  $switchMenuItem.insertAdjacentElement('beforebegin', $toggleRetweets)
}

function checkReactNativeStylesheet() {
  let $style = /** @type {HTMLStyleElement} */ (document.querySelector('style#react-native-stylesheet'))
  if (!$style) {
    return
  }

  let lastRulesCount = null
  let startTime = Date.now()

  function findRules() {
    for (let rule of $style.sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)) continue

      if (fontFamilyRule == null &&
          rule.style.fontFamily?.includes('TwitterChirp') &&
          !rule.style.fontFamily.includes('TwitterChirpExtendedHeavy')) {
        fontFamilyRule = rule
        configureFont()
      }

      if (filterBlurRule == null && rule.style.filter?.includes('blur(30px)')) {
        filterBlurRule = rule
        configureDynamicCss()
      }
    }

    let elapsedTime = new Intl.NumberFormat(undefined).format(Date.now() - startTime)
    if (fontFamilyRule == null || filterBlurRule == null) {
      // Stop checking when there are no new rules since the last check
      if (lastRulesCount != $style.sheet.cssRules.length) {
        lastRulesCount = $style.sheet.cssRules.length
        log(`waiting for more React Native stylesheet rules (${lastRulesCount})`)
        setTimeout(findRules, 100)
      } else {
        warn(`stopped waiting for new React Native stylesheet rules after ${elapsedTime}ms (${lastRulesCount} rules)`)
      }
    } else {
      log(`finished checking React Native stylesheet in ${elapsedTime}ms (${lastRulesCount} rules)`)
    }
  }

  findRules()
}

let History_push
let History_replace

function patchHistory() {
  let props = getTopLevelProps()
  if (!props) return
  if (!props.history) return;
  if (!props.history.push) return;
  if (props.history.push.patched) return
  History_push = props.history.push
  History_replace = props.history.replace
  props.history.push = function (...args) {
    if (args[0] != null) {
      if (typeof args[0] == 'object' && typeof args[0].pathname == 'string') {
        if (args[0].pathname.endsWith('/verified_followers')) {
          args[0].pathname = args[0].pathname.replace(/verified_followers$/, 'followers')
        }
      }
    }
    return History_push(...args)
  }
  props.history.push.patched = true
}

function interceptMediaButton() {
  document.addEventListener('click', (e) => {
    return
  }, true)
}
//#endregion

//#region CSS
const configureCss = (() => {
  let $style

  return function configureCss() {
    let cssRules = [`
      .cpft_font_family, .cpft_text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .cpft_separator {
        padding: 0 4px;
      }
      .cpft_text {
        color: var(--cpft-text-secondary);
      }
    `]
    let hideCssSelectors = [
      '.HiddenTweet',
      '.HiddenTweet + [role="separator"]',
      '.HiddenAd',
      // Hide promoted trends
      `[data-testid="trend"]:has(path[d="${Svgs.PROMOTED_PATH}"])`,
    ]
    let menuRole = `[role="${desktop ? 'menu' : 'dialog'}"]`

    // Theme colours for custom UI items
    cssRules.push(`
      body.Default {
        --cpft-active-bg: rgb(239, 243, 244);
        --cpft-border: rgb(239, 243, 244);
        --cpft-hover-bg: rgb(247, 249, 249);
        --cpft-menu-hover-bg: rgba(0, 0, 0, 0.03);
        --cpft-tab-hover-backdrop: rgba(15, 20, 25, 0.1);
        --cpft-text-primary: rgb(15, 20, 25);
        --cpft-text-secondary: rgb(83, 100, 113);
      }
      body.LightsOut {
        --cpft-active-bg: rgb(32, 35, 39);
        --cpft-border: rgb(47, 51, 54);
        --cpft-hover-bg: rgb(22, 24, 28);
        --cpft-menu-hover-bg: rgba(255, 255, 255, 0.03);
        --cpft-tab-hover-backdrop: rgba(231, 233, 234, 0.1);
        --cpft-text-primary: rgb(231, 233, 234);
        --cpft-text-secondary: rgb(113, 118, 123);
      }
      .cpft_menu_item, .cpft_menu_item a {
        background-color: transparent !important;
      }
      .cpft_menu_item:hover {
        background-color: var(--cpft-menu-hover-bg) !important;
        /* The nav menu is still using the old color */
        &:has(> a[href="/settings/add_muted_keyword"]) {
          background-color: var(--cpft-hover-bg) !important;
        }
      }
    `)

    cssRules.push('.AccountLocation[hidden] { display: inline; }')
    cssRules.push(`
      [data-testid="${desktop ? 'Dropdown' : 'sheetDialog'}"] [role="menuitem"] [dir] {
        font-weight: normal;
      }
    `)
    hideCssSelectors.push(`${menuRole} a:is([href$="/i/connect_people"], [href$="/i/follow_people"])`)
    hideCssSelectors.push(
      `${menuRole} a[href$="/creators/studio"]`,
      // Monetization and Subscriptions items in Settings
      'body.Settings a[href="/settings/monetization"]',
      'body.Settings a[href="/settings/manage_subscriptions"]',
    )
    if (desktop) {
      hideCssSelectors.push(`${Selectors.PRIMARY_NAV_DESKTOP} a[href$="/creators/studio"]`)
    }
    {
      let isImagineSelector = ':is([href^="/i/imagine"], [href^="https://grok.com/imagine"], [href^="/i/grok-redirect"])'
      hideCssSelectors.push(
        // Manually-tagged
        '.EditImage',
        // On images in Tweets
        `[data-testid="tweet"] div[aria-labelledby] a${isImagineSelector}`,
        `[data-testid="tweet"] [data-testid="tweetText"] a${isImagineSelector}`,
        // In menus
        `[role="menuitem"]${isImagineSelector}`,
        // In media modal
        `[aria-modal="true"] > div > div:first-of-type a${isImagineSelector}`,
      )
    }
    hideCssSelectors.push(
      // Under timeline tweets
      `[data-testid="tweet"][tabindex="0"] [role="group"] > div[style]:not(${TWITTER_MEDIA_ASSIST_BUTTON_SELECTOR})`,
      // Under the focused tweet
      `[data-testid="tweet"][tabindex="-1"] [role="group"] > div[style]:not(${TWITTER_MEDIA_ASSIST_BUTTON_SELECTOR})`,
    )
    hideCssSelectors.push(
      // Subscribe buttons in profile (multiple locations)
      'body.Profile [role="button"][style*="border-color: rgb(201, 54, 204)"]',
      // Subscriptions count in profile
      'body.Profile a[href$="/creator-subscriptions/subscriptions"]',
      // Subs tab in profile
      'body.Profile .SubsTab',
      // Subscribe button in focused tweet
      '[data-testid="tweet"][tabindex="-1"] [data-testid$="-subscribe"]',
      // "Subscribe to" dropdown item (desktop)
      '[data-testid="Dropdown"] > [data-testid="subscribe"]',
      // "Subscribe to" menu item (mobile)
      '[data-testid="sheetDialog"] > [data-testid="subscribe"]',
      // "Subscriber" indicator in replies from subscribers
      '[data-testid="tweet"] [data-testid="icon-subscriber"]',
      // Subscriptions tab link in Following/Follows
      `.SubscriptionsTab > [role="tab"]`,
    )
    // Subscriptions tab in Following/Follows
    cssRules.push(`
      .SubscriptionsTab {
        flex: 0;
      }
    `)
    hideCssSelectors.push('.SuggestedContent')
    hideCssSelectors.push(`${menuRole} a:is([href^="/i/premium-business"], [href^="/i/verified-orgs-signup"])`)
    if (desktop) {
      hideCssSelectors.push(`${Selectors.PRIMARY_NAV_DESKTOP} a:is([href^="/i/premium-business"], [href^="/i/verified-orgs-signup"])`)
    }
    hideCssSelectors.push(`${menuRole} a:is([href*="ads.twitter.com"], [href*="ads.x.com"])`)
    hideCssSelectors.push(
      // Jobs navigation item
      `${menuRole} a[href="/jobs"]`,
      // Jobs section in profiles
      '.Profile [data-testid="jobs"]',
    )
    hideCssSelectors.push(
      // Manually-tagged View activity link
      '.ViewActivity',
      // View post activity menu item
      `${menuRole} a[href$="/quotes"]`,
    )
    {
      hideCssSelectors.push(
        // Manually-tagged upsells
        '.PremiumUpsell',
        // Premium menu item
        `${menuRole} a[href^="/i/premium_sign_up"]`,
        // Analytics menu item
        `${menuRole} a[href="/i/account_analytics"]`,
        // "Highlight on your profile" on your tweets
        '[role="menuitem"][data-testid="highlightUpsell"]',
        // "Edit" upsell on recent tweets
        '[role="menuitem"][data-testid="editWithPremium"]',
        // Premium item in Settings
        'body.Settings a[href^="/i/premium_sign_up"]',
        // Misc upsells in your own profile
        `.OwnProfile ${Selectors.PRIMARY_COLUMN} a[href^="/i/premium_sign_up"]`,
        // Unlock Analytics button in your own profile
        '.OwnProfile [data-testid="analytics-preview"]',
        // Button in Communities header
        `body.Communities ${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} a:is([href^="/i/premium"], [href^="/i/verified"])`,
        // "This profile is verified" upsell
        '[data-testid="verified_profile_upsell"]',
        // Get Premium Analytics upsell
        '[data-testid="profileAnalyticsUpsell"]',
        // "you aren't verified yet" in Premium user profile
        '[data-testid="verified_profile_visitor_upsell"]',
        // "Upgrade to Premium+ to write longer posts" in Tweet composer
        `${mobile ? 'body.ComposeTweetPage' : ':is(.ComposeTweetModal, .TweetBox)'} [aria-live="polite"][role="status"]:has(a[href^="/i/premium_sign_up"])`,
        // Box in focused Tweet with "Upgrade to Premium+" / "Get Verified" upsell
        '[data-testid="tweet"][tabindex="-1"] [aria-live="polite"][role="status"]:has(a[href^="/i/premium_sign_up"])',
        // Upsell on the Likes tab in your own profile
        `body.OwnProfile ${Selectors.PRIMARY_COLUMN} nav + div:has(a[href^="/i/premium"])`,
      )
      // Hide Highlights and Articles tabs in your own profile if you don't have Premium
      let profileTabsList = `body.OwnProfile:not(.PremiumProfile) ${Selectors.PRIMARY_COLUMN} nav div[role="tablist"]`
      let upsellTabLinks = 'a:is([href$="/highlights"], [href$="/articles"], [href$="/highlights?mx=1"], [href$="/articles?mx=1"])'
      cssRules.push(`
        ${profileTabsList} > div:has(> ${upsellTabLinks}) {
          flex: 0;
        }
        ${profileTabsList} > div > ${upsellTabLinks} {
          display: none;
        }
      `)
    }
    cssRules.push(`
      .VerifiedFollowersTab {
        flex: 0;
      }
      .VerifiedFollowersTab > [role="tab"] {
        display: none;
      }
    `)
    // "Views" under the focused tweet
    hideCssSelectors.push('.Views')
    hideCssSelectors.push(`body.Profile ${Selectors.PRIMARY_COLUMN} aside[role="complementary"]`)
    cssRules.push(`
      .cpft_link_headline[hidden] {
        display: block;
        border-top: 1px solid var(--cpft-border);
        padding: 14px;
        line-height: normal;
      }
    `)
    hideCssSelectors.push(
      // Existing headline overlaid on the card
      '.cpft_overlay_headline',
      // From <domain> link after the card
      'div[data-testid="card.wrapper"] + div',
    )
    cssRules.push(`
      #cpftInteractionLinks[hidden] {
        display: block;
      }
      #cpftInteractionLinks a {
        text-decoration: none;
        color: var(--cpft-text-secondary);
      }
      #cpftInteractionLinks a:hover span:last-child {
        text-decoration: underline;
      }
      #cpftQuoteTweetCount, #cpftRetweetCount, #cpftLikeCount {
        margin-right: 2px;
        font-weight: 700;
        color: var(--cpft-text-primary);
      }
      /* Replaces the "View activity" link under your own tweets */
      .ViewActivity {
        display: none;
      }
    `)
    cssRules.push('.TweetSource[hidden] { display: inline; }')
    // Hide the quoted tweet, which is repeated in every quote tweet
    hideCssSelectors.push('body.QuoteTweets [data-testid="tweet"] [aria-labelledby] > div:last-child')
    cssRules.push(`
      :is(${Selectors.VERIFIED_TICK}, svg[data-testid="verificationBadge"]).cpft_blue_check path {
        d: path("${Svgs.BLUE_LOGO_PATH}");
      }
    `)

    if (shouldShowSeparatedTweetsTab()) {
      cssRules.push(`
        /* Sometimes the cloned tab has a hover background color class */
        body:not(.SeparatedTweets) #cpftSeparatedTweetsTab > [role="tab"] {
          background-color: transparent !important;
        }
        body.Desktop #cpftSeparatedTweetsTab:hover,
        body.Mobile:not(.SeparatedTweets) #cpftSeparatedTweetsTab:hover,
        body.Mobile #cpftSeparatedTweetsTab:active {
          background-color: var(--cpft-tab-hover-backdrop) !important;
        }
        body:not(.SeparatedTweets) #cpftSeparatedTweetsTab > [role="tab"] > div > div,
        body.HomeTimeline.SeparatedTweets ${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav div[role="tablist"] > div:not(#cpftSeparatedTweetsTab) > [role="tab"] > div > div {
          font-weight: normal !important;
          color: var(--cpft-text-secondary) !important;
        }
        body.SeparatedTweets #cpftSeparatedTweetsTab > [role="tab"] > div > div {
          font-weight: bold;
          color: var(--cpft-text-primary) !important;
        }
        /* Active tab underline */
        body:not(.SeparatedTweets) #cpftSeparatedTweetsTab > [role="tab"] > div > div > div,
        body.HomeTimeline.SeparatedTweets ${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav div[role="tablist"] > div:not(#cpftSeparatedTweetsTab) > [role="tab"] > div > div > div {
          height: 0 !important;
        }
        body.SeparatedTweets #cpftSeparatedTweetsTab > [role="tab"] > div > div > div {
          height: 4px !important;
          min-width: 56px;
          width: 100%;
          position: absolute;
          bottom: 0;
          border-radius: 9999px;
        }
        /* Following menu indicator */
        body.HomeTimeline.SeparatedTweets ${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav div[role="tablist"] > div:nth-child(2) > [role="tab"] svg {
          display: none;
        }
      `)
    }

    //#region Desktop-only
    if (desktop) {
      hideCssSelectors.push(`body.HomeTimeline ${Selectors.PRIMARY_COLUMN} > div > div:first-child > div[style^="transform"]`)
      cssRules.push(`
        /* Make the "What's happening" input keep its original width */
        body.HomeTimeline ${Selectors.PRIMARY_COLUMN} > div:first-child > div:nth-of-type(3) div[role="progressbar"] + div {
          max-width: 598px;
        }
        /* Use full width when the sidebar is not visible */
        body${FULL_WIDTH_BODY_PSEUDO} header[role="banner"] {
          flex-grow: 0;
        }
        body${FULL_WIDTH_BODY_PSEUDO} main[role="main"] > div {
          width: 100%;
        }
        body${FULL_WIDTH_BODY_PSEUDO} ${Selectors.PRIMARY_COLUMN} {
          max-width: unset;
          width: 100%;
        }
        body${FULL_WIDTH_BODY_PSEUDO} ${Selectors.PRIMARY_COLUMN} > div:first-child > div:first-child div,
        body${FULL_WIDTH_BODY_PSEUDO} ${Selectors.PRIMARY_COLUMN} > div:first-child > div:last-child {
          max-width: unset;
        }
      `)
      // Hide the sidebar when present
      hideCssSelectors.push(`body.Sidebar${FULL_WIDTH_BODY_PSEUDO} ${Selectors.SIDEBAR}`)
      cssRules.push(`
        header[role="banner"] > div > div > div > div:last-child {
          flex-shrink: 1 !important;
          align-items: flex-end !important;
        }
      `)
      hideCssSelectors.push(
        '[data-testid="SideNav_AccountSwitcher_Button"] > div:first-child:not(:only-child)',
        '[data-testid="SideNav_AccountSwitcher_Button"] > div:first-child + div',
      )
      hideCssSelectors.push(
        // Tabs
        `body.Explore ${Selectors.DESKTOP_TIMELINE_HEADER} nav`,
        // Content
        `body.Explore ${Selectors.TIMELINE}`,
      )
      hideCssSelectors.push('[data-testid="SideNav_NewTweet_Button"]')
      hideCssSelectors.push(`${Selectors.PRIMARY_NAV_DESKTOP} a[href$="/i/connect_people"]`)
      hideCssSelectors.push(`${Selectors.PRIMARY_NAV_DESKTOP} a[href="/jobs"]`)
      hideCssSelectors.push(`${menuRole} a[href="/i/spaces/start"]`)
      hideCssSelectors.push(
        // Nav items
        `${Selectors.PRIMARY_NAV_DESKTOP} a:is([href^="/i/premium"], [href^="/i/verified"])`,
        // Premium link in hovercard
        '[data-testid="HoverCard"] a[href^="/i/premium"]',
      )
      // Only show the first sidebar item by default
      // Re-show subsequent non-algorithmic sections on specific pages
      cssRules.push(`
        .SidebarContents > div:not(:first-of-type) {
          display: none;
        }
        body.Search .SidebarContents > div:nth-of-type(2) {
          display: block;
        }
        body.Community .SidebarContents > div:nth-of-type(3) {
          display: block;
        }
      `)
      hideCssSelectors.push(`body.HideSidebar ${Selectors.SIDEBAR}`)
      hideCssSelectors.push(
        // In media modal
        `[aria-modal="true"] div > div:first-of-type [role="group"] > div[style]:not([role]):not(${TWITTER_MEDIA_ASSIST_BUTTON_SELECTOR})`,
      )
      cssRules.push(`div[data-testid="chat-drawer-root"] { visibility: hidden; }`)
      hideCssSelectors.push(
        // Under timeline tweets
        '[data-testid="tweet"][tabindex="0"] [role="group"] > div:has(> a[href$="/analytics"])',
        // In media modal
        '[aria-modal="true"] > div > div:first-of-type [role="group"] > div:has(> a[href$="/analytics"])',
      )
      hideCssSelectors.push('#cpftSeparatedTweetsTab')
    }
    //#endregion

    //#region Mobile only
    if (mobile) {
      hideCssSelectors.push('[data-testid="FloatingActionButtons_Tweet_Button"]')
      hideCssSelectors.push(`body.HomeTimeline ${Selectors.MOBILE_TIMELINE_HEADER} ~ div[style^="transform"]:last-child`)
      // Hide explore page contents so we don't get a brief flash of them
      // before automatically switching the page to search mode.
      hideCssSelectors.push(
        // Tabs
        `body.Explore ${Selectors.MOBILE_TIMELINE_HEADER} > div > div:nth-of-type(2)`,
        // Content
        `body.Explore ${Selectors.TIMELINE}`,
      )
      hideCssSelectors.push(`${Selectors.PRIMARY_NAV_MOBILE} a[href="/jobs"]`)
      hideCssSelectors.push(
        `${Selectors.PRIMARY_NAV_MOBILE} a[href^="/i/premium"]`,
        `${Selectors.MOBILE_TIMELINE_HEADER} a[href^="/i/premium"]`,
      )
      hideCssSelectors.push(
        // In media viewer and media modal
        `body:is(.MediaViewer, .MobileMedia) [role="group"] > div[style]:not(${TWITTER_MEDIA_ASSIST_BUTTON_SELECTOR})`,
      )
      hideCssSelectors.push(
        // Under timeline tweets
        '[data-testid="tweet"][tabindex="0"] [role="group"] > div:has(> a[href$="/analytics"])',
        // In media viewer and media modal
        'body:is(.MediaViewer, .MobileMedia) [role="group"] > div:has(> a[href$="/analytics"])',
      )
    }
    //#endregion

    if (hideCssSelectors.length > 0) {
      cssRules.push(`
        ${hideCssSelectors.join(',\n')} {
          display: none !important;
        }
      `)
    }

    let css = cssRules.map(dedent).join('\n')
    if ($style == null) {
      $style = addStyle(css)
    } else {
      $style.textContent = css
    }
  };
})()

const configureFeatureFlags = (() => {
  let isTrue
  return function configureFeatureFlags() {
    let props = getTopLevelProps()
    if (!props) return
    let featureSwitches = props?.contextProviderProps?.featureSwitches
    if (!featureSwitches) {
      return
    }

    if (isTrue) return

    isTrue = featureSwitches.isTrue
    featureSwitches.isTrue = (flag) => {
      if (flag == 'rweb_age_assurance_flow_enabled') return false
      if (flag == 'responsive_web_nfl_enabled') return false
      if (flag == 'rweb_media_carousel_enabled') return false
      if (flag == 'responsive_web_native_emojis_enabled') return false
      return isTrue(flag)
    }
  };
})()

function configureFont() {
  if (!fontFamilyRule) {
    return
  }

  let hasChirp = fontFamilyRule.style.fontFamily.includes('TwitterChirp')
  if (!hasChirp) {
    fontFamilyRule.style.fontFamily = `"TwitterChirp", ${fontFamilyRule.style.fontFamily}`
  }
}

const configureCustomCss = (() => {
  let $style

  return function configureCustomCss() {
    $style?.remove()
  };
})()

/**
 * CSS which depends on anything we need to get from the page.
 */
const configureDynamicCss = (() => {
  let $style

  return function configureDynamicCss() {
    let cssRules = []

    if (filterBlurRule != null) {
      cssRules.push(`
        ${filterBlurRule.selectorText} {
          filter: none !important;
        }
        ${filterBlurRule.selectorText} + div {
          display: none !important;
        }
      `)
    }

    let css = cssRules.map(dedent).join('\n')
    if ($style == null) {
      $style = addStyle(css)
    } else {
      $style.textContent = css
    }
  };
})()
//#endregion

/**
 * Configures – or re-configures – the separated tweets timeline title.
 *
 * If we're currently on the separated tweets timeline and…
 * - …its title has changed, the page title will be changed to "navigate" to it.
 * - …the separated tweets timeline is no longer needed, we'll change the page
 *   title to "navigate" back to the Home timeline.
 *
 * @returns {boolean} `true` if "navigation" was triggered by this call
 */
function configureSeparatedTweetsTimelineTitle() {
  let wasOnSeparatedTweetsTimeline = isOnSeparatedTweetsTimeline()
  let previousTitle = separatedTweetsTimelineTitle

  separatedTweetsTimelineTitle = null

  let titleChanged = previousTitle != separatedTweetsTimelineTitle
  if (wasOnSeparatedTweetsTimeline) {
    if (separatedTweetsTimelineTitle == null) {
      setTitle(getString('HOME'))
      return true
    }
    if (titleChanged) {
      setTitle(separatedTweetsTimelineTitle)
      return true
    }
  } else {
    if (titleChanged && previousTitle != null && lastHomeTimelineTitle == previousTitle) {
      lastHomeTimelineTitle = separatedTweetsTimelineTitle
    }
  }
}

const configureThemeCss = (() => {
  let $style

  return function configureThemeCss() {
    let cssRules = []

    if (themeColor != null) {
      cssRules.push(`
        body {
          --cpft-theme: ${themeColor};
        }
      `)
    }

    // Active tab colour for custom tabs
    if (themeColor != null && shouldShowSeparatedTweetsTab()) {
      cssRules.push(`
        body.SeparatedTweets #cpftSeparatedTweetsTab > [role="tab"] > div > div > div {
          background-color: ${themeColor} !important;
        }
      `)
    }

    // Shared styles for Following and Follow buttons
    cssRules.push(`
      [role="button"][data-testid$="-unfollow"]:not(:hover) {
        border-color: rgba(0, 0, 0, 0) !important;
      }
      [role="button"][data-testid$="-follow"] {
        background-color: rgba(0, 0, 0, 0) !important;
      }
    `)
    cssRules.push(`
      /* Following button */
      body.Default [role="button"][data-testid$="-unfollow"]:not(:hover) {
        background-color: rgb(15, 20, 25) !important;
      }
      body.Default [role="button"][data-testid$="-unfollow"]:not(:hover) > :is(div, span) {
        color: rgb(255, 255, 255) !important;
      }
      body:is(.LightsOut) [role="button"][data-testid$="-unfollow"]:not(:hover) {
        background-color: rgb(255, 255, 255) !important;
      }
      body:is(.LightsOut) [role="button"][data-testid$="-unfollow"]:not(:hover) > :is(div, span) {
        color: rgb(15, 20, 25) !important;
      }
      /* Follow button */
      body.Default [role="button"][data-testid$="-follow"] {
        border-color: rgb(207, 217, 222) !important;
      }
      body:is(.LightsOut) [role="button"][data-testid$="-follow"] {
        border-color: rgb(83, 100, 113) !important;
      }
      body.Default [role="button"][data-testid$="-follow"] > :is(div, span) {
        color: rgb(15, 20, 25) !important;
      }
      body:is(.LightsOut) [role="button"][data-testid$="-follow"] > :is(div, span) {
        color: rgb(255, 255, 255) !important;
      }
      body.Default [role="button"][data-testid$="-follow"]:hover {
        background-color: rgba(15, 20, 25, 0.1) !important;
      }
      body:is(.LightsOut) [role="button"][data-testid$="-follow"]:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
      }
    `)
    if (mobile) {
      cssRules.push(`
        body.MediaViewer [role="button"][data-testid$="follow"] {
          border: none !important;
          background: transparent !important;
        }
        body.MediaViewer [role="button"][data-testid$="follow"] > div {
          color: var(--cpft-theme) !important;
        }
      `)
    }

    let css = cssRules.map(dedent).join('\n')
    if ($style == null) {
      $style = addStyle(css)
    } else {
      $style.textContent = css
    }
  };
})()

function getColorScheme() {
  return {
    'rgb(255, 255, 255)': 'Default',
    'rgb(0, 0, 0)': 'LightsOut',
    'rgb(5, 5, 5)': 'LightsOut',
  }[$body.style.backgroundColor]
}

/**
 * Attempts to determine the type of a timeline Tweet given the element with
 * data-testid="tweet" on it, falling back to TWEET if it doesn't appear to be
 * one of the particular types we care about.
 * @param {HTMLElement} $tweet
 * @param {?boolean} [checkSocialContext]
 * @returns {import("./types").TweetType}
 */
function getTweetType($tweet, checkSocialContext = false) {
  if ($tweet.closest(Selectors.PROMOTED_TWEET_CONTAINER)) {
    return 'PROMOTED_TWEET'
  }
  if ($tweet.querySelector('[data-testid="socialContext"]')) {
    if (checkSocialContext) {
      // Assume social context tweets are Retweets if we're not checking
      let svgPath = $tweet.querySelector('svg path')?.getAttribute('d') ?? ''
      if (svgPath.startsWith('M7.471 21H.472l.029-1.027c.184')) return 'COMMUNITY_TWEET'
      if (svgPath.startsWith('M13 21l-1 2-1-2v-5H4.5v-2.287l')) return 'PINNED_TWEET'
    }
    // Quoted tweets from accounts you blocked or muted are displayed as an
    // <article> with "This Tweet is unavailable."
    if ($tweet.querySelector('article')) {
      return 'UNAVAILABLE_RETWEET'
    }
    // Quoted tweets are preceded by visually-hidden "Quote" text
    if ($tweet.querySelector('div[id^="id__"] > div[dir] > span')?.textContent.includes(getString('QUOTE'))) {
      return 'RETWEETED_QUOTE_TWEET'
    }
    return 'RETWEET'
  }
  // Quoted tweets are preceded by visually-hidden "Quote" text
  if ($tweet.querySelector('div[id^="id__"] > div[dir] > span')?.textContent.includes(getString('QUOTE'))) {
    return 'QUOTE_TWEET'
  }
  // Quoted tweets from accounts you blocked or muted are displayed as an
  // <article> with "This Tweet is unavailable."
  if ($tweet.querySelector('article')) {
    return 'UNAVAILABLE_QUOTE_TWEET'
  }
  return 'TWEET'
}

// Add 1 every time this gets broken: 6
function getVerifiedProps($svg) {
  let propsGetter = (props) => props?.children?.props?.children?.[0]?.[0]?.props
  let $parent = $svg.parentElement.parentElement
  // Verified badge button on the profile screen
  if (isOnProfilePage() && $svg.parentElement.getAttribute('role') == 'button') {
    $parent = $svg.closest('span').parentElement
  }
  // Link variant in "user followed/liked/retweeted" notifications
  else if (isOnNotificationsPage() && $parent.getAttribute('role') == 'link') {
    propsGetter = (props) => {
      let linkChildren = props?.children?.props?.children?.[0]
      return linkChildren?.[linkChildren.length - 1]?.props
    }
  }
  if ($parent.wrappedJSObject) {
    $parent = $parent.wrappedJSObject
  }
  let reactPropsKey = Object.keys($parent).find(key => key.startsWith('__reactProps$'))
  let props = propsGetter($parent[reactPropsKey])
  if (!props) {}
  else if (!('isBlueVerified' in props)) {
    warn('isBlueVerified not in React props for', $svg, {props})
  }
  return props
}

/**
 * @param {HTMLElement} $popup
 * @returns {{tookAction: boolean, onPopupClosed?: () => void}}
 */
function handlePopup($popup) {
  let result = {tookAction: false, onPopupClosed: null}

  // Automatically close the Premium sign up popup
  if (desktop && location.pathname === '/i/premium_sign_up') {
    tweakPremiumSignUpPage()
    result.tookAction = true
    return result
  }

  // Automatically close any sheet dialog which contains a Premium link
  if (desktop &&
      $popup.querySelector('[data-testid="mask"]') &&
      $popup.querySelector('[data-testid="sheetDialog"]') &&
      $popup.querySelector('a[href^="/i/premium"]')) {
    let mask = /** @type {HTMLElement} */ ($popup.querySelector('[data-testid="mask"]'))
    mask.click()
    result.tookAction = true
    return result
  }

  if (desktop && location.pathname == PagePaths.PROFILE_SETTINGS) {
    tweakProfileSettingsPage()
    result.tookAction = true
    return result
  }

  if (isOnHomeTimelinePage() &&
      !userSortedFollowing &&
      $popup.innerHTML.includes(`>${getString('SORT_BY')}<`)) {
    // Pinned Communities also have a Sort by menu, which we should ignore
    let isFollowingTabSelected = Boolean(document.querySelector(`${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav div[role="tablist"] > div:nth-child(2) > [role="tab"][aria-selected="true"]`))
    if (!isFollowingTabSelected) return result

    void (async () => {
      // The Following Sort by menu is hydrated asynchronously on desktop
      let $dropdown = await getElement(mobile ? '[data-testid="sheetDialog"]' : '[role="menu"] [data-testid="Dropdown"]', {
        name: 'Rendered Following Sort by dropdown',
        context: $popup,
      })
      let $menuItems =  /** @type {NodeListOf<HTMLElement>} */ ($dropdown.querySelectorAll('div[role="menuitem"]'))
      let $selectedSvg = $popup.querySelector('div[role="menuitem"] svg')
      for (let [index, $menuItem] of $menuItems.entries()) {
        let shouldBeSelected = index == {popular: 0, mostRecent: 1}['mostRecent']
        if (shouldBeSelected) {
          $menuItem.lastElementChild.append($selectedSvg)
        }
        $menuItem.addEventListener('click', () => {
          userSortedFollowing = true
        })
      }
    })()
    result.tookAction = true
    return result
  }

  if (desktop && !isDesktopComposeTweetModalOpen &&
      location.pathname.startsWith(PagePaths.COMPOSE_TWEET)) {
    isDesktopComposeTweetModalOpen = true
    $desktopComposeTweetModalPopup = $popup
    observeDesktopComposeTweetModal($popup)
    return {
      tookAction: true,
      onPopupClosed() {
        isDesktopComposeTweetModalOpen = false
        $desktopComposeTweetModalPopup = null
        disconnectObservers(modalObservers, 'modal')
      }
    };
  }

  if (desktop && !isDesktopMediaModalOpen &&
      URL_MEDIA_RE.test(location.pathname)) {
    isDesktopMediaModalOpen = true
    observeDesktopModalTimeline($popup)
    return {
      tookAction: true,
      onPopupClosed() {
        isDesktopMediaModalOpen = false
        disconnectObservers(modalObservers, 'modal')
      }
    };
  }

  if (isOnListPage()) {
    let $switchSvg = $popup.querySelector(`svg path[d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"]`)
    if ($switchSvg) {
      addToggleListRetweetsMenuItem($popup.querySelector(`[role="menuitem"]`))
      return {tookAction: true}
    }
  }

  if (blockMenuItemSeen && blockMenuItemClicked && $popup.querySelector('[data-testid="confirmationSheetConfirm"]')) {
    /** @type {HTMLElement} */ ($popup.querySelector('[data-testid="confirmationSheetConfirm"]')).click()
    blockMenuItemSeen = false
    blockMenuItemClicked = false
    result.tookAction = true
  }
  else if ($popup.querySelector(Selectors.BLOCK_MENU_ITEM)) {
    blockMenuItemSeen = true
    blockMenuItemClicked = false
    document.addEventListener('click', (e) => {
      if (e.target instanceof Element && e.target.closest(Selectors.BLOCK_MENU_ITEM)) {
        blockMenuItemClicked = true
      }
    }, {capture: true, once: true})
    // Create a nested observer for mobile, as it reuses the menu popup to
    // display the block dialog.
    result.tookAction = !mobile
  }
  else {
    blockMenuItemSeen = false
    blockMenuItemClicked = false
  }

  if (mobile) {
    let $sidebarSettingsLink = $popup.querySelector('a[href$="/settings"]')
    if ($sidebarSettingsLink) {
      getElement('div:has(> a[href^="https://apps.apple.com/app/apple-store/id333903271"])', {
        name: 'get the app link',
        context: $popup,
        timeout: 100,
      }).then($appAd => $appAd?.classList?.add('HiddenAd'))
    }
  }

  {
    // User typeahead dropdown
    let $typeaheadDropdown = /** @type {HTMLElement} */ ($popup.querySelector('div[id^="typeaheadDropdown"]'))
    if ($typeaheadDropdown) {
      let observer = observeElement($typeaheadDropdown, () => {
        processBlueChecks($typeaheadDropdown)
      }, 'popup typeahead dropdown')
      return {
        tookAction: true,
        onPopupClosed() {
          observer.disconnect()
        }
      };
    }
  }

  if (desktop) {
    // User hovercard popup
    let $hoverCard = /** @type {HTMLElement} */ ($popup.querySelector('[data-testid="HoverCard"]'))
    if ($hoverCard) {
      result.tookAction = true
      getElement('div[data-testid^="UserAvatar-Container"]', {
        context: $hoverCard,
        name: 'user hovercard contents',
        timeout: 500,
      }).then(($contents) => {
        if (!$contents) return
        processBlueChecks($popup)
        {
          let $followingLink = /** @type {HTMLAnchorElement} */ ($popup.querySelector('[href$="/following"]'))
          if (!$followingLink) return
          let screenName = $followingLink.pathname.split('/')[1]
          if (!screenName) return
          getAccountLocation(screenName).then((accountLocation) => {
            if (!accountLocation || !accountLocation.account_based_in) return
            let $insertionPoint = $followingLink.parentElement.parentElement.parentElement
            let fontSizeNum = parseInt(fontSize)
            $insertionPoint?.insertAdjacentHTML('afterend', `<div class="cpft_text" style="margin-top: ${fontSizeNum - 4}px; line-height: ${fontSizeNum + 1}px; font-size: ${fontSizeNum - 1}px;">
  ${addQuestionMark(getFn('ACCOUNT_BASED_IN_FN')({country: accountLocation.account_based_in}), !accountLocation.location_accurate)}
            </div>`)
          })
        }
      })
    }
  }

  // Verified account popup when you press the check button on a profile page
  if (isOnProfilePage()) {
    if (mobile) {
      let $verificationBadge = /** @type {HTMLElement} */ ($popup.querySelector('[data-testid="sheetDialog"] [data-testid="verificationBadge"]'))
      if ($verificationBadge) {
        result.tookAction = true
        let $headerBlueCheck = document.querySelector(`body.Profile ${Selectors.MOBILE_TIMELINE_HEADER} .cpft_blue_check`)
        if ($headerBlueCheck) {
          blueCheck($verificationBadge)
        }
      }
    } else {
      let $hoverCard = /** @type {HTMLElement} */ ($popup.querySelector('[data-testid="HoverCard"]'))
      if ($hoverCard) {
        result.tookAction = true
        getElement(':scope > div > div > div > svg[data-testid="verificationBadge"]', {
          context: $hoverCard,
          name: 'verified account hovercard verification badge',
          timeout: 500,
        }).then(($verificationBadge) => {
          if (!$verificationBadge) return

          let $headerBlueCheck = document.querySelector(`body.Profile ${Selectors.PRIMARY_COLUMN} > div > div:first-of-type h2 .cpft_blue_check`)
          if (!$headerBlueCheck) return

          // Wait for the hovercard to render its contents
          observeElement($popup, (mutations, observer) => {
            blueCheck($popup.querySelector('svg[data-testid="verificationBadge"]'))
            observer.disconnect()
          }, {
            name: 'verified popup render',
            observers: pageObservers,
           }, {
            childList: true,
            subtree: true,
          })
        })
      }
    }
  }

  return result
}

function isBlueVerified($svg) {
  let props = getVerifiedProps($svg)
  return Boolean(props && props.isBlueVerified && !(
    props.verifiedType || (
      props.affiliateBadgeInfo?.userLabelType == 'BusinessLabel' &&
      props.affiliateBadgeInfo?.description == 'X'
    )
  ))
}

/**
 * @returns {import("./types").VerifiedType}
 */
function getVerifiedType($svg) {
  let props = getVerifiedProps($svg)
  if (props) {
    if (props.affiliateBadgeInfo?.userLabelType == 'BusinessLabel' &&
        props.affiliateBadgeInfo?.description == 'X')
      // Ignore Twitter associated checks
      return null
    if (props.verifiedType == 'Business')
      return 'BUSINESS'
    if (props.verifiedType == 'Government')
      return 'GOVERNMENT'
    if (props.isBlueVerified)
      return 'BLUE'
  }
  return null
}

/**
 * Checks if a tweet is preceded by an element creating a vertical reply line.
 * @param {HTMLElement} $tweet
 * @returns {boolean}
 */
function isReplyToPreviousTweet($tweet) {
  let $replyLine = $tweet.firstElementChild?.firstElementChild?.firstElementChild?.firstElementChild?.firstElementChild?.firstElementChild
  if ($replyLine) {
    return getComputedStyle($replyLine).width == '2px'
  }
}

/**
 * @returns {{disconnect()}}
 */
function onPopup($popup) {
  // If handlePopup did something, we don't need to observe nested popups
  let {tookAction, onPopupClosed} = handlePopup($popup)
  if (tookAction) {
    return onPopupClosed ? {disconnect: onPopupClosed} : null
  }

  /** @type {HTMLElement} */
  let $nestedPopup

  let nestedObserver = observeElement($popup, (mutations) => {
    for (let mutation of mutations) {
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement)) continue
        $nestedPopup = $addedNode
        onPopupClosed = handlePopup($addedNode).onPopupClosed
      }
      for (let $removedNode of mutation.removedNodes) {
        if (!($removedNode instanceof HTMLElement) || $removedNode !== $nestedPopup) continue
        if (onPopupClosed) {
          onPopupClosed()
        }
      }
    }
  }, 'nested popup observer')

  let disconnect = nestedObserver.disconnect.bind(nestedObserver)
  nestedObserver.disconnect = () => {
    if (onPopupClosed) {
      onPopupClosed()
    }
    disconnect()
  }

  return nestedObserver
}

/**
 * @param {HTMLElement} $timeline
 * @param {string} page
 * @param {import("./types").TimelineOptions?} options
 */
function onTimelineChange($timeline, page, options = {}) {
  let startTime = Date.now()
  let {
    checkSocialContext = false,
    classifyTweets = true,
    hideHeadings = true,
    isUserTimeline = false,
  } = options

  let isOnHomeTimeline = isOnHomeTimelinePage()
  let isOnListTimeline = isOnListPage()
  let isOnProfileTimeline = isOnProfilePage()
  let isOnNotificationsTimeline = isOnNotificationsPage()
  let timelineHasSpecificTweetHandling = isOnHomeTimeline || isOnListTimeline || isOnProfileTimeline

  if (isUserTimeline || !timelineHasSpecificTweetHandling) {
    processBlueChecks($timeline)
  }

  if (isUserTimeline || !classifyTweets) return

  let itemTypes = {}
  let hiddenItemCount = 0
  let hiddenItemTypes = {}

  /** @type {?boolean} */
  let hidPreviousItem = null
  /** @type {{$item: Element, hideItem?: boolean}[]} */
  let changes = []

  for (let $item of $timeline.children) {
    /** @type {?import("./types").TimelineItemType} */
    let itemType = null
    /** @type {?boolean} */
    let hideItem = null
    /** @type {?HTMLElement} */
    let $tweet = $item.querySelector(Selectors.TWEET)
    /** @type {boolean} */
    let isReply = false

    if ($tweet != null) {
      itemType = getTweetType($tweet, checkSocialContext)
      if (timelineHasSpecificTweetHandling) {
        isReply = isReplyToPreviousTweet($tweet)
        if (isReply && hidPreviousItem != null) {
          hideItem = hidPreviousItem
        } else {
          if (isOnHomeTimeline) {
            hideItem = shouldHideHomeTimelineItem(itemType, page)
          }
          else if (isOnListTimeline) {
            hideItem = shouldHideListTimelineItem(itemType)
          }
          else if (isOnProfileTimeline) {
            hideItem = shouldHideProfileTimelineItem(itemType)
          }
        }

        for (let $svg of $tweet.querySelectorAll(Selectors.VERIFIED_TICK)) {
          let isBlueCheck = isBlueVerified($svg)
          if (!isBlueCheck) continue

          blueCheck($svg)

          // Don't count a tweet as blue if the check is in a quoted tweet
          let userProfileLink = $svg.closest('a[role="link"]:not([href^="/i/status"])')
          if (!userProfileLink) continue
        }
      }

      if (!hideItem) {
        restoreLinkHeadline($tweet)
      }
    }
    else if (isOnNotificationsTimeline) {
      /** @type {?import("./types").NotificationType} */
      let notificationType = null
      let $iconPath = $item.querySelector('[data-testid="notification"] svg path')?.getAttribute('d')
      if ($iconPath) {
        if ($iconPath.startsWith('M18.766 2H7.323l-4.8 12h5.324l')) {
          notificationType = 'AD'
          hideItem = true
        }
        else if ($iconPath.startsWith('M20.884 13.19c-1.351 2.48-4.00')) {
          notificationType = 'LIKE'
          hideItem = false
        }
        else if ($iconPath.startsWith('M17.863 13.44c1.477 1.58 2.366')) {
          notificationType = 'FOLLOW'
        }
        else if ($iconPath.startsWith('M4.75 3.79l4.603 4.3-1.706 1.8')) {
          notificationType = 'RETWEET'
          hideItem = false
        }
      }
      if (notificationType) {
        itemType = `NOTIFICATION_${notificationType}`
      }
    }
    else if (!timelineHasSpecificTweetHandling) {
      if ($item.querySelector(':scope > div > div > div > article')) {
        itemType = 'UNAVAILABLE'
      }
    }

    if (!timelineHasSpecificTweetHandling && !isOnNotificationsTimeline) {
      if (itemType != null) {
        hideItem = shouldHideOtherTimelineItem(itemType)
      }
    }

    // Special handling for non-Tweet timeline items
    if (itemType == null) {
      if ($item.querySelector('[data-testid="inlinePrompt"]')) {
        itemType = 'INLINE_PROMPT'
        hideItem = true
      } else if ($item.querySelector(Selectors.TIMELINE_HEADING)) {
        itemType = 'HEADING'
        hideItem = hideHeadings && true
      }
    }

    // Assume a non-identified item following an identified item is related
    if (itemType == null && hidPreviousItem != null && !isOnNotificationsTimeline) {
      hideItem = hidPreviousItem
      itemType = 'SUBSEQUENT_ITEM'
    }

    if (itemType != null) {
      itemTypes[itemType] ||= 0
      itemTypes[itemType]++
    }

    if (hideItem) {
      hiddenItemCount++
      hiddenItemTypes[itemType] ||= 0
      hiddenItemTypes[itemType]++
    }

    if (hideItem != null && $item.firstElementChild) {
      let hidden = $item.firstElementChild.classList.contains('HiddenTweet')
      if (hidden != hideItem) {
        changes.push({$item, hideItem})
      }
    }

    hidPreviousItem = hideItem
  }

  for (let change of changes) {
    change.$item.firstElementChild.classList.toggle('HiddenTweet', change.hideItem)
  }
}

/**
 * @param {HTMLElement} $timeline
 * @param {import("./types").IndividualTweetTimelineOptions} options
 */
function onIndividualTweetTimelineChange($timeline, options) {
  let startTime = Date.now()

  let {seen} = options
  let itemTypes = {}
  let hiddenItemCount = 0
  let hiddenItemTypes = {}
  let processedCount = 0

  /** @type {?boolean} */
  let hidPreviousItem
  /** @type {boolean} */
  let hideAllSubsequentItems = false
  /** @type {string} */
  let tweetPath = options.observers == modalObservers ? location.pathname : currentPagePath
  /** @type {?string} */
  let opScreenName = URL_TWEET_BASE_RE.exec(tweetPath)?.[1]?.toLowerCase()
  /** @type {string} */
  let userScreenName = getUserScreenName()
  /** @type {{$item: Element, hideItem?: boolean}[]} */
  let changes = []
  /** @type {import("./types").UserInfoObject} */
  let userInfo = getUserInfo()
  /** @type {?HTMLElement} */
  let $focusedTweet

  let items = Array.from($timeline.children)
  for (let i = 0; i < items.length; i++) {
    let $item = items[i]
    if (seen.has($item) &&
        // Reprocess Discover More Tweets if they were processed before the Discover More heading
        !(hideAllSubsequentItems && seen.get($item).hidden != true)) {
      let details = seen.get($item)
      hidPreviousItem = details.hidden
      // The focused Tweet renders before any Tweets it was a reply to
      if (details.itemType == 'FOCUSED_TWEET') {
        changes = []
        hiddenItemCount = 0
        hiddenItemTypes = {}
      }
      // The Discover More heading renders after Discover more Tweets(?)
      else if (details.itemType == 'DISCOVER_MORE_HEADING') {
        hideAllSubsequentItems = true
      }
      continue
    }

    /** @type {?import("./types").TimelineItemType} */
    let itemType = null
    /** @type {?boolean} */
    let hideItem = null
    /** @type {?HTMLElement} */
    let $tweet = $item.querySelector(Selectors.TWEET)
    /** @type {boolean} */
    let isFocusedTweet = false
    /** @type {boolean} */
    let isReply = false
    /** @type {import("./types").VerifiedType} */
    let tweetVerifiedType = null
    /** @type {?string} */
    let screenName = null
    /** @type {boolean} */
    let isOp = false
    /** @type {boolean} */
    let isUser = false

    if (hideAllSubsequentItems) {
      hideItem = true
      itemType = 'DISCOVER_MORE_TWEET'
    }
    else if ($tweet != null) {
      isFocusedTweet = $tweet.tabIndex == -1
      isReply = isReplyToPreviousTweet($tweet)
      if (isFocusedTweet) {
        itemType = 'FOCUSED_TWEET'
        hideItem = false
        $focusedTweet = $tweet
      } else {
        itemType = getTweetType($tweet)
        if (isReply && hidPreviousItem != null) {
          hideItem = hidPreviousItem
        } else {
          hideItem = shouldHideIndividualTweetTimelineItem(itemType)
        }
      }

      if (!hideItem) {
        for (let $svg of $tweet.querySelectorAll(Selectors.VERIFIED_TICK)) {
          let verifiedType = getVerifiedType($svg)
          if (!verifiedType) continue

          if (verifiedType == 'BLUE') {
            blueCheck($svg)
          }

          // Don't count a tweet as verified if the check is in a quoted tweet
          let $userProfileLink = /** @type {HTMLAnchorElement} */ ($svg.closest('a[role="link"]:not([href^="/i/status"])'))
          if (!$userProfileLink) continue

          tweetVerifiedType = verifiedType
          screenName = $userProfileLink.href.split('/').pop()
          isOp = screenName.toLowerCase() == opScreenName
          isUser = screenName == userScreenName
        }

        if (tweetVerifiedType &&
            // Don't hide the focused tweet
            !isFocusedTweet &&
            // Replies to the focused tweet don't have the reply indicator
            !isReply &&
            // Don't hide replies by the OP, as it's their thread
            !isOp &&
            // Don't hide replies by the user if they have Premium
            !isUser) {
          itemType = `${tweetVerifiedType}_REPLY`
        }
      }

      if (!hideItem) {
        restoreLinkHeadline($tweet)
      }
    }
    else {
      let $article = $item.querySelector('article')
      if ($article) {
        // Deleted or private, unless…
        itemType = 'UNAVAILABLE'
        let $button = $article.querySelector('[role="button"]')
        if ($button) {
          if ($button.textContent == getString('SHOW')) {
            itemType = 'SHOW_MORE'
          }
          else if ($button.textContent == getString('VIEW')) {
            // "This Tweet is from an account you (blocked|muted)." with a View button
            hideItem = true
          }
        }
        else if ($article.textContent == getString('POST_UNAVAILABLE')) {
          // Likely blocked or muted
          hideItem = true
        }
      } else {
        // We need to identify "Show more replies" so it doesn't get hidden if the
        // item immediately before it was hidden.
        let $button = $item.querySelector('button[role="button"]')
        if ($button) {
          if ($button?.textContent == getString('SHOW_MORE_REPLIES')) {
            itemType = 'SHOW_MORE'
          }
        }

        // Hide "More From This Author" → Up to 3 Tweets → "See more" link,
        // working backwards from "See more" once it renders.
        if (itemType == null) {
          let $userLink = $item.querySelector(':scope > div > div > a[href^="/i/user/"]')
          if ($userLink) {
            for (let headingOffset = 2; headingOffset <= 4; headingOffset++) {
              if (seen.get(items[i - headingOffset])?.itemType == 'HEADING') {
                itemType = 'SEE_MORE'
                hideItem = true
                for (let j = i - headingOffset; j < i; j++) {
                  if (j < 0 || !items[j]?.firstElementChild) continue
                  changes.push({
                    $item: items[j],
                    hideItem: true,
                  })
                }
                break
              }
            }
          }
        }

        if (itemType == null) {
          let $heading = $item.querySelector(Selectors.TIMELINE_HEADING)
          if ($heading) {
            // Discover More headings have a description next to them
            if ($heading.nextElementSibling &&
                $heading.nextElementSibling.tagName == 'DIV' &&
                $heading.nextElementSibling.getAttribute('dir') != null) {
              itemType = 'DISCOVER_MORE_HEADING'
              hideItem = true
              hideAllSubsequentItems = true
            } else {
              itemType = 'HEADING'
            }
          }
        }
      }
    }

    // Assume a non-identified item following an identified item is related
    if (itemType == null && hidPreviousItem != null) {
      hideItem = hidPreviousItem
      itemType = 'SUBSEQUENT_ITEM'
    }

    if (itemType != null) {
      itemTypes[itemType] ||= 0
      itemTypes[itemType]++
    }

    if (hideItem) {
      hiddenItemCount++
      hiddenItemTypes[itemType] ||= 0
      hiddenItemTypes[itemType]++
    }

    if (isFocusedTweet) {
      // Tweets prior to the focused tweet should never be hidden
      changes = []
      hiddenItemCount = 0
      hiddenItemTypes = {}
    }
    else if (hideItem != null && $item.firstElementChild) {
      let hidden = $item.firstElementChild.classList.contains('HiddenTweet')
      if (hidden != hideItem) {
        changes.push({$item, hideItem})
      }
    }

    hidPreviousItem = hideItem
    seen.set($item, {itemType, hidden: hideItem})
    processedCount++
  }

  for (let change of changes) {
    change.$item.firstElementChild.classList.toggle('HiddenTweet', change.hideItem)
  }

  if ($focusedTweet && !seen.has($focusedTweet)) {
    tweakFocusedTweet($focusedTweet, options)
    seen.set($focusedTweet, {itemType: 'FOCUSED_TWEET', hidden: false})
  }
}

/**
 * Title format (including notification count):
 * - LTR: (3) ${title} / X
 * - RTL: (3) X \ ${title}
 * @param {string} title
 */
function onTitleChange(title) {
  log('title changed', {title, path: location.pathname})

  // Ignore leading notification counts in titles
  let notificationCount = ''
  if (TITLE_NOTIFICATION_RE.test(title)) {
    notificationCount = TITLE_NOTIFICATION_RE.exec(title)[0]
    title = title.replace(TITLE_NOTIFICATION_RE, '')
  }

  let route = getCurrentRoute()

  // Ignore Flash of Uninitialised Title when navigating to a page for the first
  // time, except on pages we've identified as not setting a title, including
  // when they're rendered beneath a desktop modal.
  if (!title || title == 'X' || title == getString('TWITTER')) {
    // On mobile, the media viewer sets an empty title
    if (mobile && (URL_MEDIA_RE.test(route.urlPath) || URL_MEDIAVIEWER_RE.test(route.urlPath))) {}
    // On mobile, the Premium sign up page sets an empty title
    else if (mobile && route.urlPath == '/i/premium_sign_up') {}
    // On desktop, the root Settings page sets an empty title when the sidebar
    // is hidden.
    else if (desktop && route.pagePath == '/settings') {}
    // Chat has an empty title
    else if (route.pagePath.startsWith('/i/chat')) {}
    else {
      return
    }
  }

  let homeNavigationWasUsed = homeNavigationIsBeingUsed
  homeNavigationIsBeingUsed = false

  // Remove " / Twitter" or "Twitter \ " from the title
  let newPage = title
  if (newPage != 'X' && newPage != getString('TWITTER')) {
    newPage = title.slice(...(ltr ? [0, title.lastIndexOf('/') - 1] : [title.indexOf('\\') + 2]))
  }

  let hasDesktopModalRouteChanged = lastUrlPath != route.urlPath && (lastUrlWasModal || route.isModal)
  // Closing a modal can rebuild its background without changing the title
  let hasDesktopModalBeenClosed = lastUrlWasModal && !route.isModal
  lastUrlWasModal = route.isModal

  // A modal can change screens without changing the underlying page or title
  if (desktop && lastUrlPath != route.urlPath) {
    handleDesktopModalRouteChange(route.urlPath)
  }

  if (newPage == currentPage && route.pagePath == currentPagePath && !hasDesktopModalBeenClosed) {
    // The History page re-renders everything when you switch tabs
    if (route.urlPath.startsWith(PagePaths.HISTORY) && lastUrlPath != route.urlPath) {} else {
      currentNotificationCount = notificationCount
      lastUrlPath = route.urlPath
      return
    }
  }

  // Search terms are shown in the title
  if (lastUrlPath == PagePaths.SEARCH && route.urlPath == PagePaths.SEARCH) {
    currentNotificationCount = notificationCount
    return
  }

  // On desktop, stay on the separated tweets timeline when…
  if (desktop && currentPage == separatedTweetsTimelineTitle &&
      // …the title has changed back to the Home timeline…
      (newPage == getString('HOME')) &&
      // …the Home nav link or Following / Home header _wasn't_ clicked and…
      !homeNavigationWasUsed &&
      (
        // …a desktop modal route changed.
        hasDesktopModalRouteChanged ||
        // …the notification count in the title changed.
        notificationCount != currentNotificationCount
      )) {
    currentNotificationCount = notificationCount
    lastUrlPath = route.urlPath
    setTitle(separatedTweetsTimelineTitle)
    if (hasDesktopModalBeenClosed) processCurrentPage(route)
    return
  }

  // Restore display of the separated tweets timelne if it's the last one we
  // saw, and the user navigated back home without using the Home navigation
  // item.
  if (route.urlPath == PagePaths.HOME &&
      lastUrlPath != PagePaths.HOME &&
      !homeNavigationWasUsed &&
      lastHomeTimelineTitle != null &&
      separatedTweetsTimelineTitle != null &&
      lastHomeTimelineTitle == separatedTweetsTimelineTitle) {
    currentNotificationCount = notificationCount
    lastUrlPath = route.urlPath
    setTitle(separatedTweetsTimelineTitle)
    return
  }

  // Assumption: all non-FOUT, non-duplicate title changes are navigation, which
  // need the page to be re-processed.

  currentPage = newPage
  currentNotificationCount = notificationCount
  lastUrlPath = route.urlPath

  if (route.pagePath == PagePaths.HOME) {
    lastHomeTimelineTitle = currentPage
  }

  processCurrentPage(route)
}

/** @param {string} path */
function handleDesktopModalRouteChange(path) {
  if (!isDesktopComposeTweetModalOpen) return
  // Any sub-screen can replace the editor, including ones outside /compose/post
  if (lastUrlPath == PagePaths.COMPOSE_TWEET && path != PagePaths.COMPOSE_TWEET) {
    disconnectObservers(modalObservers, 'modal')
  }
  else if (lastUrlPath != PagePaths.COMPOSE_TWEET && path == PagePaths.COMPOSE_TWEET) {
    observeDesktopComposeTweetModal($desktopComposeTweetModalPopup)
  }
}

/**
 * Processes all Twitter Blue checks inside an element.
 * @param {HTMLElement} $el
 */
function processBlueChecks($el) {
  for (let $svg of $el.querySelectorAll(`${Selectors.VERIFIED_TICK}:not(.cpft_blue_check)`)) {
    if (isBlueVerified($svg)) {
      blueCheck($svg)
    }
  }
}

function processCurrentPage(route = getCurrentRoute()) {
  // Startup can re-render before the initial page title has been handled
  if (!lastUrlPath) return
  disconnectObservers(pageObservers, 'page')
  currentPagePath = route.pagePath

  // Hooks for styling pages
  if (!$body) $body = document.body
  $body.classList.toggle('Community', isOnCommunityPage())
  $body.classList.toggle('Communities', isOnCommunitiesPage())
  $body.classList.toggle('Explore', isOnExplorePage())
  $body.classList.toggle('Calls', isOnCallsPage())
  $body.classList.toggle('Chat', isOnChatPage())
  $body.classList.toggle('Grok', isOnGrokPage())
  $body.classList.toggle('HideSidebar', shouldHideSidebar())
  $body.classList.toggle('History', isOnHistoryPage())
  $body.classList.toggle('List', isOnListPage())
  $body.classList.toggle('HomeTimeline', isOnHomeTimelinePage())
  $body.classList.toggle('Notifications', isOnNotificationsPage())
  $body.classList.toggle('Profile', isOnProfilePage())
  if (!isOnProfilePage()) {
    $body.classList.remove('OwnProfile', 'PremiumProfile')
  }
  if (!isOnFollowListPage()) {
    $body.classList.remove('Subscriptions')
  }
  $body.classList.toggle('QuoteTweets', isOnQuoteTweetsPage())
  $body.classList.toggle('Tweet', isOnIndividualTweetPage())
  $body.classList.toggle('Search', isOnSearchPage())
  $body.classList.toggle('Settings', isOnSettingsPage())
  $body.classList.toggle('MobileMedia', mobile && URL_MEDIA_RE.test(location.pathname))
  $body.classList.toggle('MediaViewer', mobile && URL_MEDIAVIEWER_RE.test(location.pathname))
  $body.classList.toggle('ComposeTweetPage', mobile && isOnComposeTweetPage())
  // Always remove this as it's a fake page
  $body.classList.remove('SeparatedTweets')

  if (desktop) {
    if (!isOnCallsPage() && !isOnChatPage() && !isOnGrokPage() && !isOnSettingsPage()) {
      observeSidebar()
    } else {
      $body.classList.remove('Sidebar')
    }
  }

  if (isOnSearchPage() || isOnExplorePage()) {
    observeSearchForm()
  }

  if (isOnHomeTimelinePage()) {
    tweakHomeTimelinePage()
  }
  else {
    removeMobileTimelineHeaderElements()
  }

  if (isOnProfilePage()) {
    tweakProfilePage()
  }
  else if (isOnFollowListPage()) {
    tweakFollowListPage()
  }
  else if (isOnIndividualTweetPage()) {
    tweakIndividualTweetPage()
  }
  else if (isOnNotificationsPage()) {
    tweakNotificationsPage()
  }
  else if (isOnSearchPage()) {
    tweakSearchPage()
  }
  else if (URL_TWEET_INTERACTIONS_RE.test(currentPagePath)) {
    tweakTweetEngagementPage()
  }
  else if (isOnListPage()) {
    tweakListPage()
  }
  else if (isOnListsPage()) {
    tweakListsPage()
  }
  else if (isOnExplorePage()) {
    tweakExplorePage()
  }
  else if (isOnHistoryPage()) {
    tweakHistoryPage()
  }
  else if (isOnCommunitiesPage()) {
    tweakCommunitiesPage()
  }
  else if (isOnCommunityPage()) {
    tweakCommunityPage()
  }
  else if (isOnCommunityMembersPage()) {
    tweakCommunityMembersPage()
  }
  else if (isOnCallsPage()) {
    tweakCallsPage()
  }
  else if (isOnChatPage()) {
    tweakChatPage()
  }
  else if (isOnDisplaySettingsPage() || isOnAccessibilitySettingsPage()) {
    tweakDisplaySettingsPage()
  }
  else if (isOnPremiumSignupPage()) {
    tweakPremiumSignUpPage()
  }

  // On mobile, these are pages instead of modals
  if (mobile) {
    if (isOnComposeTweetPage()) {
      tweakMobileComposeTweetPage()
    }
    else if (URL_MEDIAVIEWER_RE.test(lastUrlPath)) {
      tweakMobileMediaViewerPage()
    }
    else if (lastUrlPath.startsWith(PagePaths.PROFILE_SETTINGS)) {
      tweakProfileSettingsPage()
    }
  }
}

/**
 * The mobile version of Twitter reuses heading elements between screens, so we
 * always remove any elements which could be there from the previous page and
 * re-add them later when needed.
 */
function removeMobileTimelineHeaderElements() {
  if (mobile) {
    document.querySelector('#cpftSeparatedTweetsTab')?.remove()
  }
}

/**
 * @param {HTMLElement} $tweet
 */
function restoreLinkHeadline($tweet) {
  let $link = /** @type {HTMLElement} */ ($tweet.querySelector(
    // Exclude Install button cards in Grok tweets
    'div[data-testid="card.layoutLarge.media"] > a[rel][aria-label]:not([href="https://itunes.apple.com/app/id6670324846"])'
  ))
  if ($link && !$link.dataset.headlineRestored) {
    let [site, ...rest] = $link.getAttribute('aria-label').split(' ')
    let headline = rest.join(' ')
    $link.lastElementChild?.classList.add('cpft_overlay_headline')
    $link.insertAdjacentHTML('beforeend', `<div class="cpft_link_headline ${fontFamilyRule?.selectorText?.replace('.', '') || 'cpft_font_family'}" hidden>
      <div style="color: var(--cpft-text-secondary); margin-bottom: 2px;">${site}</div>
      <div style="color: var(--cpft-text-primary)">${headline}</div>
    </div>`)
    $link.dataset.headlineRestored = 'true'
  }
}

/**
 * @param {{
 *   $actionBar: HTMLElement
 *   $focusedTweet: HTMLElement
 *   tweetInfo: any
 *   isOwnTweet: boolean
 *   tweetPath: string
 * }} options
 */
function restoreTweetInteractionsLinks({$actionBar, $focusedTweet, tweetInfo, isOwnTweet, tweetPath}) {
  if (!tweetInfo) {
    return
  }

  let shouldDisplayLinks = (
    (tweetInfo.quote_count > 0) ||
    (tweetInfo.retweet_count > 0 || isOwnTweet && tweetInfo.favorite_count > 0)
  )
  let $existingLinks = $focusedTweet.querySelector('#cpftInteractionLinks')
  if (!shouldDisplayLinks || $existingLinks) {
    if (!shouldDisplayLinks) $existingLinks?.remove()
    return
  }

  let tweetLink = tweetPath.match(URL_TWEET_BASE_RE)?.[0]
  $actionBar.insertAdjacentHTML('beforebegin', `
    <div id="cpftInteractionLinks" hidden>
      <div class="${fontFamilyRule?.selectorText?.replace('.', '') || 'cpft_font_family'}" style="padding: 16px 4px; border-top: 1px solid var(--cpft-border); display: flex; gap: 20px;">
        ${tweetInfo.quote_count > 0 ? `<a id="cpftQuoteTweetsLink" class="quoteTweets" href="${tweetLink}/quotes" dir="auto" role="link">
          <span id="cpftQuoteTweetCount">
            ${Intl.NumberFormat(lang, {notation: tweetInfo.quote_count < 10000 ? 'standard' : 'compact', compactDisplay: 'short'}).format(tweetInfo.quote_count)}
          </span>
          <span>${getString(tweetInfo.quote_count == 1 ? ('QUOTE') : ('QUOTES'))}</span>
        </a>` : ''}
        ${tweetInfo.retweet_count > 0 ? `<a id="cpftRetweetsLink" data-tab="2" href="${tweetLink}/retweets" dir="auto" role="link">
          <span id="cpftRetweetCount">
            ${Intl.NumberFormat(lang, {notation: tweetInfo.retweet_count < 10000 ? 'standard' : 'compact', compactDisplay: 'short'}).format(tweetInfo.retweet_count)}
          </span>
          <span>${getString('REPOSTS')}</span>
        </a>` : ''}
        ${isOwnTweet && tweetInfo.favorite_count > 0 ? `<a id="cpftLikesLink" data-tab="3" href="${tweetLink}/likes" dir="auto" role="link">
          <span id="cpftLikeCount">
            ${Intl.NumberFormat(lang, {notation: tweetInfo.favorite_count < 10000 ? 'standard' : 'compact', compactDisplay: 'short'}).format(tweetInfo.favorite_count)}
          </span>
          <span>${getString('LIKES')}</span>
        </a>` : ''}
      </div>
    </div>
  `)

  let $links = /** @type {NodeListOf<HTMLAnchorElement>} */ ($focusedTweet.querySelectorAll('#cpftInteractionLinks a'))
  for (let $link of $links) {
    $link.addEventListener('click', (e) => {
      e.preventDefault()
      History_push?.({
        pathname: $link.pathname,
        hash: '',
        query: {},
        search: '',
      })
    })
  }
}

/**
 * Sets the page name in <title>, retaining any current notification count.
 * @param {string} page
 */
function setTitle(page) {
  let name = 'X'
  let notificationCount = (hiddenNotificationCount || currentNotificationCount)
  document.title = ltr ? (
    `${notificationCount}${page} / ${name}`
  ) : (
    `${notificationCount}${name} \\ ${page}`
  )
}

/**
 * @param {import("./types").TimelineItemType} type
 * @returns {boolean}
 */
function shouldHideIndividualTweetTimelineItem(type) {
 switch (type) {
   case 'QUOTE_TWEET':
   case 'RETWEET':
   case 'RETWEETED_QUOTE_TWEET':
   case 'TWEET':
     return false
   case 'UNAVAILABLE_QUOTE_TWEET':
   case 'UNAVAILABLE_RETWEET':
     return true;
   default:
     return true
 }
}

/**
 * @param {import("./types").TimelineItemType} type
 * @returns {boolean}
 */
function shouldHideListTimelineItem(type) {
  switch (type) {
    case 'RETWEET':
    case 'RETWEETED_QUOTE_TWEET':
      return config.listRetweets == 'hide'
    case 'UNAVAILABLE_QUOTE_TWEET':
      return true;
    case 'UNAVAILABLE_RETWEET':
      return true;
    default:
      return false
  }
}

/**
 * @param {import("./types").TimelineItemType} type
 * @param {string} page
 * @returns {boolean}
 */
function shouldHideHomeTimelineItem(type, page) {
  switch (type) {
    case 'QUOTE_TWEET':
      return shouldHideSharedTweet('ignore', page);
    case 'RETWEET':
      return selectedHomeTabIndex >= 2 ? config.listRetweets == 'hide' : shouldHideSharedTweet('hide', page);
    case 'RETWEETED_QUOTE_TWEET':
      return selectedHomeTabIndex >= 2 ? (
          config.listRetweets == 'hide'
        ) : (
          shouldHideSharedTweet('hide', page) || shouldHideSharedTweet('ignore', page)
        );
    case 'COMMUNITY_TWEET':
    case 'TWEET':
      return page == separatedTweetsTimelineTitle
    case 'UNAVAILABLE_QUOTE_TWEET':
      return true;
    case 'UNAVAILABLE_RETWEET':
      return config.listRetweets == 'hide';
    default:
      return true
  }
}

/**
 * @param {import("./types").TimelineItemType} type
 * @returns {boolean}
 */
function shouldHideProfileTimelineItem(type) {
  switch (type) {
    case 'COMMUNITY_TWEET':
    case 'PINNED_TWEET':
    case 'QUOTE_TWEET':
    case 'TWEET':
      return false
    case 'RETWEET':
    case 'RETWEETED_QUOTE_TWEET':
      return false;
    case 'UNAVAILABLE_QUOTE_TWEET':
      return true;
    default:
      return true
  }
}

/**
 * @param {import("./types").TimelineItemType} type
 * @returns {boolean}
 */
function shouldHideOtherTimelineItem(type) {
 switch (type) {
   case 'COMMUNITY_TWEET':
   case 'QUOTE_TWEET':
   case 'RETWEET':
   case 'RETWEETED_QUOTE_TWEET':
   case 'TWEET':
   case 'UNAVAILABLE':
   case 'UNAVAILABLE_QUOTE_TWEET':
   case 'UNAVAILABLE_RETWEET':
     return false
   default:
     return true
 }
}

/**
 * @param {import("./types").SharedTweetsConfig} config
 * @param {string} page
 * @returns {boolean}
 */
function shouldHideSharedTweet(config, page) {
  switch (config) {
    case 'hide': return true
    case 'ignore': return page == separatedTweetsTimelineTitle
    case 'separate': return page != separatedTweetsTimelineTitle
  }
}

function tweakCallsPage() {
  let styles = styleEmbed('[data-testid="xcallsRemoteHost"]', ':is([data-xcalls-root], [data-xcalls-portal])')
  let name = 'Calls page styles'
  pageObservers.set(name, {
    name,
    disconnect() {
      styles.disconnect()
      pageObservers.delete(name)
    },
  })
}

function tweakChatPage() {
  let styles = styleEmbed('[data-testid="xchatEmbedRoute"]', ':is([data-xchat-root], [data-xchat-portal])')
  let name = 'Chat page styles'
  pageObservers.set(name, {
    name,
    disconnect() {
      styles.disconnect()
      pageObservers.delete(name)
    },
  })
}

async function tweakHistoryPage() {
  observeTimeline(currentPage)
}

async function tweakExplorePage() {
  let $searchInput = await getElement('input[data-testid="SearchBox_Search_Input"]', {
    name: 'explore page search input',
    stopIf: () => !isOnExplorePage(),
  })
  if (!$searchInput) return

  $searchInput.focus()

  if (mobile) {
    // The back button appears after the search input is focused on mobile. When
    // you tap it or otherwise navigate back, it's replaced with the slide-out
    // menu button and Explore page contents are shown - we want to skip that.
    let $backButton = await getElement('div[data-testid="app-bar-back"]', {
      name: 'back button',
      stopIf: () => !isOnExplorePage(),
    })
    if (!$backButton) return

    observeElement($backButton.parentElement, (mutations) => {
      for (let mutation of mutations) {
        for (let $addedNode of mutation.addedNodes) {
          if (!($addedNode instanceof HTMLElement)) continue
          if ($addedNode.querySelector('[data-testid="DashButton_ProfileIcon_Link"]')) {
            history.go(-2)
            return
          }
        }
      }
    }, {
      name: 'back button parent',
      observers: pageObservers,
    })
  }
}

function tweakCommunitiesPage() {
  observeTimeline(currentPage)
}

function tweakCommunityPage() {
  observeTimeline(currentPage, {
    classifyTweets: false,
    isTabbed: true,
    tabbedTimelineContainerSelector: `${Selectors.PRIMARY_COLUMN} > div > div:last-child`,
    onTimelineAppeared() {
      // The About tab has static content at the top which can include a check
      if (/\/about\/?$/.test(currentPagePath)) {
        processBlueChecks(document.querySelector(Selectors.PRIMARY_COLUMN))
      }
    }
  })
}

function tweakCommunityMembersPage() {
  observeTimeline(currentPage, {
    classifyTweets: false,
    isTabbed: true,
    timelineSelector: 'div[data-testid="primaryColumn"] > div > div:last-child',
  })
}

function tweakDisplaySettingsPage() {
  if (desktop) {
    observeElement($html, () => {
      if (!$html.style.fontSize) return

      if ($html.style.fontSize != fontSize) {
        fontSize = $html.style.fontSize
        log(`<html> fontSize has changed to ${fontSize}`)
        configureDynamicCss()
        observePopups()
        observeSideNavItems()
      }
    }, {
      name: '<html> style attribute for font size changes',
      observers: pageObservers,
    }, {
      attributes: true,
      attributeFilter: ['style']
    })
  }
}

function restoreTweetSource($permalinkBar, tweetInfo) {
  if ($permalinkBar.hasAttribute('cpft-tweet-source-restored')) return
  if (!tweetInfo?.source_name) {
    return
  }
  let $separator = document.createElement('span')
  $separator.className = 'TweetSource cpft_separator cpft_text'
  $separator.setAttribute('aria-hidden', 'true')
  $separator.setAttribute('hidden', '')
  $separator.textContent = '·'
  let $sourceLabel = document.createElement('span')
  $sourceLabel.className = 'TweetSource cpft_text'
  $sourceLabel.setAttribute('hidden', '')
  $sourceLabel.textContent = tweetInfo.source_name
  $permalinkBar.append($separator, $sourceLabel)
  $permalinkBar.setAttribute('cpft-tweet-source-restored', '')
}

/**
 * @param {HTMLElement} $focusedTweet
 * @param {import("./types").IndividualTweetTimelineOptions} options
 */
async function tweakFocusedTweet($focusedTweet, options) {
  let {observers} = options
  let $permalinkBar = $focusedTweet.querySelector('div:has(> div > a > time)')
  let tweetPath = $permalinkBar?.querySelector('a:has(> time)')?.getAttribute('href') || (
    observers == modalObservers ? location.pathname : currentPagePath
  )
  let focusedTweetUrlMatch = tweetPath.match(URL_TWEET_BASE_RE)
  let screenName = focusedTweetUrlMatch?.[1]
  let tweetId = focusedTweetUrlMatch?.[2]
  let tweetInfo = getTweetInfo(tweetId)
  let isOwnTweet = isOnOwnTweetPage(tweetPath)

  // Tag View elements and restore Tweet source
  if ($permalinkBar) {
    $permalinkBar.children[1]?.classList.toggle('Views', true)
    $permalinkBar.children[2]?.classList.toggle('Views', true)
    restoreTweetSource($permalinkBar, tweetInfo)
    addAccountLocationToFocusedTweet($permalinkBar, screenName)
  }

  let $actionBar = /** @type {HTMLElement} */ ($focusedTweet.querySelector('div:has(> [role="group"][id^="id__"])'))
  let $underActionBar = $actionBar?.nextElementSibling
  if ($actionBar) {
    $actionBar.id = 'cpftFocusedTweetActionBar'
    restoreTweetInteractionsLinks({$actionBar, $focusedTweet, tweetInfo, isOwnTweet, tweetPath})
  }

  if ($underActionBar) {
    let $sortRepliesButton = $underActionBar.querySelector('button[aria-haspopup="menu"]')

    let $viewActivity = $underActionBar.querySelector('a[href$="/quotes"]')
    getClosestChild($viewActivity, $underActionBar)?.classList.add('ViewActivity')
  }

  if (isOwnTweet) {
    if (!$focusedTweet.hasAttribute('cpft-premium-upsells-tagged')) {
      run(async () => {
        let $premiumUpsell = await getElement('div:has(> div[style] > button ~ div a:is([href="/i/account_analytics"], [href^="/i/premium"]))', {
          context: $focusedTweet,
          name: 'own focused Tweet premium upsell',
          timeout: 500,
          stopIf: pageIsNot(currentPage)
        })
        if (!$premiumUpsell) return
        $premiumUpsell.classList.add('PremiumUpsell')
      })
      $focusedTweet.setAttribute('cpft-premium-upsells-tagged', 'true')
    }
  }
}

async function tweakFollowListPage() {
  // Fallback for direct navigation
  if (lastUrlPath.endsWith('/verified_followers')) {
    History_replace?.(lastUrlPath.replace(/verified_followers$/, 'followers'))
    return
  }

  observeTimeline(currentPage, {
    classifyTweets: false,
  })

  let $followListTabs = await getElement(`${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav`, {
    name: 'Follow list tabs',
    stopIf: () => !isOnFollowListPage(),
  })
  if ($followListTabs) {
    let $tabsContainer = $followListTabs.parentElement
    // Tabs <nav> will be replaced when dynamic tabs load
    observeElement($tabsContainer, () => {
      $tabsContainer.querySelector('div:has(> a[href$="/verified_followers"])')?.classList?.add('VerifiedFollowersTab')
      $tabsContainer.querySelector('div:has(> a[href$="/subscriptions"])')?.classList?.add('SubscriptionsTab')
    }, {
      name: 'Follow list tabs container',
      observers: pageObservers,
      leading: true,
    })
  }
}

async function tweakIndividualTweetPage() {
  observeIndividualTweetTimeline(currentPage)
}

function tweakListPage() {
  observeTimeline(currentPage, {
    checkSocialContext: true,
    hideHeadings: false,
  })
}

async function tweakListsPage() {
  {
    // Hide Discover new Lists
    let $showMoreLink = await getElement('a[href="/i/lists/suggested"]', {
      name: 'Show more link',
      stopIf: pageIsNot(currentPage),
    })
    if (!$showMoreLink) return
    let $timelineItem = $showMoreLink.closest('[data-testid="cellInnerDiv"]')
    if (!$timelineItem) {
      return
    }
    let $timelineItems = $timelineItem.parentElement.children
    let showMoreIndex = Array.prototype.indexOf.call($timelineItems, $timelineItem)
    for (let i = 1; i <= showMoreIndex + 2; i++) {
      $timelineItems[i].classList.add('SuggestedContent')
    }
  }
}

function tweakHomeTimelinePage() {
  let $timelineTabs = document.querySelector(`${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav`)

  // Hook for styling when on the separated tweets tab
  $body.classList.toggle('SeparatedTweets', isOnSeparatedTweetsTimeline())

  if ($timelineTabs == null) {
    return
  }

  let $manageTimelinesButton = $timelineTabs.parentElement.nextElementSibling
  if ($manageTimelinesButton?.querySelector('path[d="M11 11V4h2v7h7v2h-7v7h-2v-7H4v-2h7z"]')) {
    $manageTimelinesButton.classList.add('ManageTimelines')
  } else {
    $manageTimelinesButton = null
  }

  tweakTimelineTabs($timelineTabs)

  function updateSelectedHomeTabIndex() {
    let $selectedHomeTabLink = $timelineTabs.querySelector('div[role="tablist"] [aria-selected="true"]')
    if ($selectedHomeTabLink) {
      selectedHomeTabIndex = Array.from($selectedHomeTabLink.parentElement.parentElement.children).indexOf($selectedHomeTabLink.parentElement)
      log({selectedHomeTabIndex})
    } else {
      selectedHomeTabIndex = -1
    }
  }

  updateSelectedHomeTabIndex()

  // If there are pinned lists, the timeline tabs <nav> will be replaced the
  // first time they load in the current session.
  observeElement($timelineTabs.parentElement, (mutations) => {
    let timelineTabsReplaced = mutations.some(mutation => Array.from(mutation.removedNodes).includes($timelineTabs))
    if (timelineTabsReplaced &&
        // On mobile, navigating to a different tabbed screen can switch tabs before the title changes
        isOnHomeTimelinePage()) {
      $timelineTabs = document.querySelector(`${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav`)
      tweakTimelineTabs($timelineTabs)
    }
  }, {
    name: 'timeline tabs nav container',
    observers: pageObservers,
  })

  observeTimeline(currentPage, {
    checkSocialContext: true,
    isTabbed: true,
    onTabChanged: () => {
      updateSelectedHomeTabIndex()
      wasForYouTabSelected = selectedHomeTabIndex == 0
    },
    tabbedTimelineContainerSelector: 'div[data-testid="primaryColumn"] > div > div:last-child',
  })

  if (desktop) {
    observeDesktopHomeTimelineTweetBox()
  }
}

async function tweakMobileComposeTweetPage() {
  function observeUserTypeaheadDropdown($tweetTextareaContainer) {
    if (!$tweetTextareaContainer) {
      return
    }

    let $dropdownContainer = $tweetTextareaContainer.parentElement.parentElement.parentElement.parentElement
    /** @type {HTMLElement} */
    let $typeaheadDropdown = $dropdownContainer.querySelector(':scope > [id^="typeaheadDropdown"]')
    function observeDropdown() {
      observeElement($typeaheadDropdown, () => {
        processBlueChecks($typeaheadDropdown)
      }, {
        name: 'Tweet box typeahead dropdown',
        observers: pageObservers,
      })
    }
    // If the list was re-rendered to display a dropdown for an additional
    // Tweet, it will already be in the DOM.
    if ($typeaheadDropdown) {
      observeDropdown()
    }
    observeElement($dropdownContainer, (mutations) => {
      for (let mutation of mutations) {
        if ($typeaheadDropdown &&
            mutations.some(mutation => Array.from(mutation.removedNodes).includes($typeaheadDropdown))) {
          pageObservers.get('Tweet box typeahead dropdown')?.disconnect()
          $typeaheadDropdown = null
        }
        for (let $addedNode of mutation.addedNodes) {
          if ($addedNode instanceof HTMLElement &&
              $addedNode.getAttribute('id')?.startsWith('typeaheadDropdown')) {
            $typeaheadDropdown = $addedNode
            observeDropdown()
          }
        }
      }
    }, {
      name:'Tweet box typeahead dropdown container',
      observers: pageObservers,
    })
  }

  let isReply = Boolean(document.querySelector('article[data-testid="tweet"]'))
  if (isReply) {
    observeUserTypeaheadDropdown(document.querySelector('main div[data-testid^="tweetTextarea"]'));
  } else {
    let $tweetTextarea =  await getElement('main div[data-testid^="tweetTextarea"]', {
      name: 'first Tweet textarea',
      stopIf: pageIsNot(currentPage),
    })
    if (!$tweetTextarea) return
    let $tweetsContainer = $tweetTextarea.closest('div:not([class])')?.parentElement
    let $tweetButtonText = document.querySelector('main button[data-testid^="tweetButton"] span > span')
    if ($tweetsContainer && $tweetButtonText) {
      // We need to re-apply tweaks every time the child list changes. When
      // you use the username typeahead dropdown in any Tweet box, the list
      // re-renders so it's the only Tweet while the dropdown is open.
      observeElement($tweetsContainer, () => {
        let $containers = document.querySelectorAll('main div[data-testid^="tweetTextarea"]')
        $containers.forEach(($container, index) => {
          if (index == 0) {
            observeUserTypeaheadDropdown($container)
          }
        })
      }, {
        leading: true,
        name: 'Tweets container',
        observers: pageObservers,
      })
    } else {
      warn('could not find all elements needed to tweak the Compose Tweet page', {$tweetsContainer, $tweetButtonText})
    }
  }
}

async function tweakMobileMediaViewerPage() {
  let $timeline = await getElement('[data-testid="vss-scroll-view"] > div', {
    name: 'media viewer timeline',
    stopIf: () => !URL_MEDIAVIEWER_RE.test(location.pathname),
  })
  if (!$timeline) return

  /** @param {HTMLVideoElement} $video */
  function processVideo($video) {
    if ($video.loop != true) {
      $video.loop = true
    }
  }

  // Process initial contents
  let $videos = $timeline.querySelectorAll('video')
  log($videos.length, `initial video${s($videos.length)}`)
  $videos.forEach(processVideo)
  processBlueChecks($timeline)

  observeElement($timeline, (mutations) => {
    for (let mutation of mutations) {
      for (let $addedNode of mutation.addedNodes) {
        if (!($addedNode instanceof HTMLElement) || $addedNode.nodeName != 'DIV') continue
        let $video = $addedNode.querySelector('video')
        if ($video) {
          processVideo($video)
        }
        {
          let $videoInfo = $addedNode.querySelector('[data-testid^="immersive-tweet-ui-content-container"]')
          if ($videoInfo) {
            processBlueChecks($addedNode)
          }
        }
      }
    }
  }, {
    name: 'media viewer timeline',
    observers: pageObservers,
  }, {childList: true, subtree: true})
}

async function tweakTimelineTabs($timelineTabs) {
  $timelineTabs.classList.add('TimelineTabs')
  let $followingTabLink = /** @type {HTMLElement} */ ($timelineTabs.querySelector('div[role="tablist"] > div:nth-child(2) > [role="tab"]'))
  if (!$followingTabLink) {
    return
  }

  if (!document.title.startsWith(separatedTweetsTimelineTitle)) {
    let isForYouTabSelected = Boolean($timelineTabs.querySelector('div[role="tablist"] > div:first-child > [role="tab"][aria-selected="true"]'))
    if (isForYouTabSelected && (!wasForYouTabSelected)) {
      $followingTabLink.click()
      wasForYouTabSelected = false
    } else {
      wasForYouTabSelected = isForYouTabSelected
    }
  }

  if (shouldShowSeparatedTweetsTab()) {
    let $newTab = /** @type {HTMLElement} */ ($timelineTabs.querySelector('#cpftSeparatedTweetsTab'))
    if ($newTab) {
      $newTab.querySelector('span').textContent = separatedTweetsTimelineTitle
    }
    else {
      let $forYouTabLink = /** @type {HTMLElement} */ ($timelineTabs.querySelector('div[role="tablist"] > div:first-child > [role="tab"]'))
      if (!$forYouTabLink) {
        return
      }
      $newTab = /** @type {HTMLElement} */ ($forYouTabLink.parentElement.cloneNode(true))
      $newTab.id = 'cpftSeparatedTweetsTab'
      $newTab.querySelector('span').textContent = separatedTweetsTimelineTitle
      let $link = $newTab.querySelector('[role="tab"]')
      if (!$link) {
        return
      }
      $link.removeAttribute('aria-selected')

      // This script assumes navigation has occurred when the document title
      // changes, so by changing the title we fake navigation to a non-existent
      // page representing the separated tweets timeline.
      $link.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!document.title.startsWith(separatedTweetsTimelineTitle)) {
          // The separated tweets tab belongs to the Following tab
          let isFollowingTabSelected = Boolean($timelineTabs.querySelector('div[role="tablist"] > div:nth-child(2) > [role="tab"][aria-selected="true"]'))
          if (!isFollowingTabSelected) {
            $followingTabLink.click()
          }
          setTitle(separatedTweetsTimelineTitle)
        }
        window.scrollTo({top: 0})
      })
      $followingTabLink.parentElement.insertAdjacentElement('afterend', $newTab)

      // Return to the Home timeline when any other tab is clicked
      $followingTabLink.parentElement.parentElement.addEventListener('click', () => {
        if (location.pathname == PagePaths.HOME && currentPage != getString('HOME')) {
          homeNavigationIsBeingUsed = true
          setTitle(getString('HOME'))
        }
      })

      // Return to the Home timeline when the Home nav link is clicked
      let $homeNavLink = await getElement(Selectors.NAV_HOME_LINK, {
        name: 'home nav link',
        stopIf: pathIsNot(lastUrlPath),
      })
      if ($homeNavLink && !$homeNavLink.dataset.cpftListener) {
        $homeNavLink.addEventListener('click', () => {
          homeNavigationIsBeingUsed = true
          if (location.pathname == PagePaths.HOME && currentPage != getString('HOME')) {
            setTitle(getString('HOME'))
          }
        })
        $homeNavLink.dataset.cpftListener = 'true'
      }

      // Click the Home nav link when the Following tab is clicked while on the
      // separated Tweets timeline to switch back to Following without opening
      // the menu.
      $followingTabLink.parentElement.addEventListener('click', (e) => {
        if (currentPage != getString('HOME') && $homeNavLink) {
          e.preventDefault()
          e.stopPropagation()
          $homeNavLink.click()
        }
      })
    }
  } else {
    removeMobileTimelineHeaderElements()
  }
}

function tweakNotificationsPage() {
  observeTimeline(currentPage, {
    isTabbed: true,
    tabbedTimelineContainerSelector: 'div[data-testid="primaryColumn"] > div > div:last-child',
  })
}

async function tweakPremiumSignUpPage() {
  let $closeButton = await getElement('[data-testid="app-bar-close"]', {
    name: 'Premium sign up close button',
    stopIf: () => location.pathname != '/i/premium_sign_up',
  })
  if ($closeButton) {
    $closeButton.click()
  }
}

async function tweakProfilePage() {
  let $initialContent = await getElement(desktop ? Selectors.PRIMARY_COLUMN : Selectors.MOBILE_TIMELINE_HEADER, {
    name: 'initial profile content',
    stopIf: pageIsNot(currentPage),
  })
  if (!$initialContent) return

  processBlueChecks($initialContent)

  let tab = currentPagePath.match(URL_PROFILE_RE)?.[2] || 'tweets'
  log(`on ${tab} tab`)
  observeTimeline(currentPage, {
    checkSocialContext: tab == 'tweets' || tab == 'with_replies',
    isUserTimeline: tab == 'affiliates'
  })

  getElement('a[href="/settings/profile"]', {
    name: 'edit profile button',
    stopIf: pageIsNot(currentPage),
    timeout: 500,
  }).then($editProfileButton => {
    $body.classList.toggle('OwnProfile', Boolean($editProfileButton))
    // This selector is _extremely_ specific to try to avoid false positives
    getElement(mobile ? (
      '[data-testid="primaryColumn"] > div > div > div > div > div > div > div > div > div:has(> div > div > div > a[href^="/i/premium"])'
    ) : (
      '[data-testid="primaryColumn"] > div > div > div > div > div > div:has(> div > div > div > a[href^="/i/premium"])'
    ), {
      name: "you aren't verified yet premium upsell",
      stopIf: pageIsNot(currentPage),
      timeout: 2000,
    }).then($upsell => {
      if ($upsell) {
        $upsell.classList.add('PremiumUpsell')
      }
    })
  })
  let $headerVerifiedIcon = document.querySelector(`${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.TIMELINE_HEADING} [data-testid="icon-verified"]`)
  $body.classList.toggle('PremiumProfile', Boolean($headerVerifiedIcon))

  {
    let $profileTabs = await getElement(`${Selectors.PRIMARY_COLUMN} nav`, {
      name: 'profile tabs',
      stopIf: pageIsNot(currentPage),
    })
    if (!$profileTabs) return
    // The Profile tabs <nav> can be replaced
    observeElement($profileTabs.parentElement, async (mutations) => {
      if (mutations.length > 0) {
        let $newProfileTabs = findAddedNode(mutations, ($el) => $el instanceof HTMLElement && $el.tagName == 'NAV')
        if ($newProfileTabs == null) return
        $profileTabs = /** @type {HTMLElement} */ ($newProfileTabs)
      }
      {
        let $subscriptionsTabLink = await getElement('a[href$="/superfollows"]', {
          context: $profileTabs,
          name: 'Subscriptions tab link',
          stopIf: pageIsNot(currentPage),
          timeout: 1000,
        })
        if ($subscriptionsTabLink) {
          $subscriptionsTabLink.parentElement.classList.add('SubsTab')
        }
      }
    }, {
      leading: true,
      name: 'profile tabs',
      observers: pageObservers,
    }, {childList: true})
  }
}

function tweakProfileSettingsPage() {
  getElement('input[type="file"] + button:has(path[d^="M17.084 7.5c0-1.163 0-1.744-.14"])', {
    name: 'profile header button (hideEditImage)',
    timeout: 2000,
  }).then($headerButton => $headerButton?.classList?.add('EditImage'))
  if (desktop) {
    getElement('div:has(> div + button path[d^="M17.084 7.5c0-1.163 0-1.744-.14"])', {
      name: 'profile Edit Photo box (hideEditImage)',
      timeout: 2000,
    }).then($editPhotoBox => $editPhotoBox?.classList?.add('EditImage'))
  }
}

function tweakSearchPage() {
  let $searchTabs = document.querySelector(`${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav`)

  observeTimeline(currentPage, {
    hideHeadings: true,
    isTabbed: true,
    tabbedTimelineContainerSelector: 'div[data-testid="primaryColumn"] > div > div:last-child',
  })

  if (desktop) {
    let $emptyFirstSidebarItem = document.querySelector(`.SidebarContents > div:first-child:empty`)
    if ($emptyFirstSidebarItem) {
      $emptyFirstSidebarItem.remove()
    }
  }
}

function tweakTweetEngagementPage() {
  let $tabs = document.querySelector(`${mobile ? Selectors.MOBILE_TIMELINE_HEADER : Selectors.PRIMARY_COLUMN} nav`)
  if ($tabs == null) {
    return
  }

  observeTimeline(currentPage, {classifyTweets: false})
}

function updateThemeColor() {
  let newThemeColor = getThemeColorFromState()
  if (!newThemeColor || newThemeColor == themeColor) return

  themeColor = newThemeColor
  configureThemeCss()
}
//#endregion

//#region Main
async function main({processImmediately = false} = {}) {
  // Don't run on non-app URLs served from x.com
  if (location.pathname.startsWith('/account/access') ||
      location.pathname.startsWith('/i/oauth2/authorize') ||
      location.pathname.startsWith('/oauth/authorize') ||
      /^\/([^/]+\/)?(tos|privacy)(\/previous(\/version_\d+)?)?/.test(location.pathname)) {
    return
  }

  // Reset state so initial setup runs again when re-enabled
  currentPage = ''
  currentPagePath = ''
  lastUrlPath = ''
  lastUrlWasModal = false
  observingPageChanges = false
  filterBlurRule = null
  fontFamilyRule = null
  fontSize = null
  lastFlexDirection = null

  observeFavicon()
  observeTitle()
  observeThemeMeta()

  let $appWrapper = await getElement('#layers + div', {name: 'app wrapper'})

  $html = document.querySelector('html')
  $body = document.body
  $reactRoot = document.querySelector('#react-root')
  lang = $html.lang
  dir = $html.dir
  ltr = dir == 'ltr'

  observeElement($appWrapper, () => {
    let flexDirection = getComputedStyle($appWrapper).flexDirection

    mobile = flexDirection == 'column'
    desktop = !mobile

    /** @type {'mobile' | 'desktop'} */
    let version = mobile ? 'mobile' : 'desktop'

    config.version = version

    if (lastFlexDirection == null) {
      log('initial config', {config, lang, version})

      // One-time setup
      checkReactNativeStylesheet()
      themeColor = getThemeColorFromState() || themeColor
      observeBodyBackgroundColor()
      observeReRenderBoundary()
      patchHistory()
      interceptMediaButton()
      if (desktop) {
        fontSize = $html.style.fontSize
      }

      // Repeatable configuration setup
      configureSeparatedTweetsTimelineTitle()
      configureCss()
      configureDynamicCss()
      configureFeatureFlags()
      configureThemeCss()
      configureCustomCss()
      observePopups()
      observeSideNavItems()

      // Start taking action on page changes
      observingPageChanges = true

      // Replay the initial title after setup if its observer ran before startup
      if ((processImmediately || !currentPagePath) && document.querySelector('title')) {
        processImmediately = false
        onTitleChange(document.title)
      }

      // Remove the loading stylesheet if the content script added one
      let $loadingStylesheet = document.querySelector('style#cpftLoading')
      if ($loadingStylesheet) {
        requestAnimationFrame(() => $loadingStylesheet.remove())
      }
    }
    else if (flexDirection != lastFlexDirection) {
      versionChanged()
    }

    $body.classList.toggle('Mobile', mobile)
    $body.classList.toggle('Desktop', desktop)

    lastFlexDirection = flexDirection
  }, {
    leading: true,
    name: 'app wrapper class attribute for version changes (mobile ↔ desktop)',
    observers: globalObservers,
  }, {
    attributes: true,
    attributeFilter: ['class']
  })
}

/**
 * Re-applies everything when switching between the mobile and desktop layouts.
 */
function versionChanged() {
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

main()
//#endregion

}()
