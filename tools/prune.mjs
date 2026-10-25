// Folds the fixed Truiter config into CPFT's script.js and removes dead code.
// Usage: node prune.mjs <in> <out>
import fs from 'node:fs'
import recast from 'recast'
import * as babelParser from '@babel/parser'
import _traverse from '@babel/traverse'
import * as t from '@babel/types'
const traverse = _traverse.default ?? _traverse

const FOLD = {
  enabled: true,
  debug: false,
  debugLogTimelineStats: false,
  // Home timeline
  alwaysUseLatestTweets: true,
  hideForYouTimeline: false,
  sortFollowing: 'mostRecent',
  hideManageTimelines: false,
  retweets: 'hide',
  quoteTweets: 'ignore',
  mutableQuoteTweets: false,
  hideSeeNewTweets: true,
  hideWhoToFollowEtc: true,
  hideInlinePrompts: true,
  fullWidthContent: true,
  fullWidthMedia: true,
  // UI improvements
  addAddMutedWordMenuItem: false,
  fastBlock: true,
  hideUnavailableQuoteTweets: true,
  hideProfileRetweets: false,
  hideNotificationLikes: false,
  hideNotificationRetweets: false,
  hideSuggestedContentSearch: true,
  defaultToLatestSearch: false,
  tweakQuoteTweetsPage: true,
  // X fixes
  replaceLogo: false,
  revertMediaCarousel: true,
  revertProfileTabs: false,
  revertTwemoji: true,
  darkModeTheme: 'lightsOut',
  hideViews: true,
  hideVerifiedNotificationsTab: true,
  restoreTweetSource: true,
  addFocusedTweetAccountLocation: true,
  addUserHoverCardAccountLocation: true,
  restoreLinkHeadlines: true,
  restoreQuoteTweetsLink: true,
  restoreOtherInteractionLinks: true,
  sortReplies: 'relevant',
  hideSortRepliesMenu: false,
  twitterBlueChecks: 'replace',
  hideTwitterBlueReplies: false,
  showPremiumReplyBusiness: true,
  showPremiumReplyFollowedBy: true,
  showPremiumReplyFollowing: true,
  showPremiumReplyGovernment: true,
  showBlueReplyFollowersCount: false,
  showBlueReplyFollowersCountAmount: '1000000',
  hideTwitterBlueUpsells: true,
  hideGrokNav: false,
  hideGrokTweets: false,
  hideEditImage: true,
  hideJobsNav: true,
  hideSubscriptions: true,
  hideMoney: false,
  disableNflFeatures: true,
  // UI tweaks
  dontUseChirpFont: false,
  disableTweetTextFormatting: false,
  navBaseFontSize: false,
  navDensity: 'default',
  dropdownMenuFontWeight: true,
  uninvertFollowButtons: true,
  followButtonStyle: 'monochrome',
  bypassAgeVerification: true,
  unblurSensitiveContent: true,
  // Sidebar
  hideSidebarContent: true,
  showRelevantPeople: false,
  hideLiveBroadcasts: false,
  hideSuggestedFollows: false,
  hideTodaysNews: false,
  hideWhatsHappening: false,
  // Remove algorithmic content
  hideExplorePageContents: true,
  hideMoreFromThisAuthor: true,
  hideMoreTweets: true,
  // Reduce "engagement"
  hideMetrics: false,
  hideBookmarkMetrics: true,
  hideFollowingMetrics: true,
  hideLikeMetrics: true,
  hideQuoteTweetMetrics: true,
  hideReplyMetrics: true,
  hideRetweetMetrics: true,
  hideTotalTweetsMetrics: true,
  reducedInteractionMode: false,
  hideComposeTweet: true,
  disableHomeTimeline: false,
  disabledHomeTimelineRedirect: 'notifications',
  hideNotifications: 'ignore',
  // Hide UI items
  hideBookmarkButton: false,
  showBookmarkButtonUnderFocusedTweets: true,
  hideShareTweetButton: true,
  hideViewActivityLinks: true,
  hideTimelineTweetBox: false,
  hideAccountSwitcher: true,
  hideMessagesDrawer: true,
  hideExploreNav: false,
  hideExploreNavWithSidebar: true,
  hideConnectNav: true,
  hideChatNav: false,
  hideCalls: false,
  hideHistoryNav: false,
  hideCreatorStudioNav: true,
  // Hide "More" menu items
  hideListsNav: false,
  hideCommunitiesNav: false,
  hideBusinessNav: true,
  hideAdsNav: true,
  hideSpacesNav: true,
  // Mobile only (defaults)
  hideLiveBroadcastBar: false,
  hideMessagesBottomNavItem: false,
  preventNextVideoAutoplay: true,
  // Experiments
  customCss: '',
}

const KEEP_LOCALES = new Set(['en', 'pt'])

const [input, output] = process.argv.slice(2)
const WRAP_START = 'void function() {\n'
const WRAP_END = '\n}()\n'
let code = fs.readFileSync(input, 'utf8')
if (!code.startsWith(WRAP_START) || !code.endsWith(WRAP_END)) throw new Error('unexpected wrapper')
code = code.slice(WRAP_START.length, -WRAP_END.length)
const ast = recast.parse(code, {
  parser: {parse: src => babelParser.parse(src, {sourceType: 'script', tokens: true, allowReturnOutsideFunction: true, errorRecovery: false})},
})

const unknown = new Set()

function isConst(node) {
  if (!node) return false
  if (t.isStringLiteral(node) || t.isNumericLiteral(node) || t.isBooleanLiteral(node) || t.isNullLiteral(node)) return true
  if (t.isIdentifier(node, {name: 'undefined'})) return true
  if (t.isTemplateLiteral(node)) return node.expressions.every(isConst)
  if (t.isUnaryExpression(node)) return ['!', '-', '+', 'void'].includes(node.operator) && isConst(node.argument)
  if (t.isBinaryExpression(node)) return isConst(node.left) && isConst(node.right)
  if (t.isLogicalExpression(node)) return isConst(node.left) && isConst(node.right)
  if (t.isParenthesizedExpression(node)) return isConst(node.expression)
  return false
}

function value(path) {
  let r = path.evaluate()
  if (!r.confident) throw new Error('not confident: ' + recast.print(path.node).code)
  return r.value
}

function hasLexical(block) {
  return block.body.some(s => t.isVariableDeclaration(s) && s.kind != 'var' || t.isFunctionDeclaration(s) || t.isClassDeclaration(s))
}

function replaceStatement(path, stmt) {
  if (!stmt) {
    if (path.parentPath.isIfStatement() && path.key == 'alternate') path.parentPath.node.alternate = null
    else path.remove()
    return
  }
  if (t.isBlockStatement(stmt) && (path.parentPath.isBlockStatement() || path.parentPath.isProgram()) && !hasLexical(stmt)) {
    if (stmt.body.length) path.replaceWithMultiple(stmt.body)
    else path.remove()
  } else {
    path.replaceWith(stmt)
  }
}

// 1. Fold config reads and drop unused locales.
traverse(ast, {
  MemberExpression(path) {
    let {node} = path
    if (!t.isIdentifier(node.object, {name: 'config'}) || node.computed || !t.isIdentifier(node.property)) return
    if (path.scope.getBinding('config')?.scope.path.type != 'Program' &&
        path.scope.getBinding('config')?.scope.block.type != 'FunctionExpression') return
    let key = node.property.name
    if (!(key in FOLD)) { unknown.add(key); return }
    if (path.parentPath.isAssignmentExpression({left: node}) || path.parentPath.isUpdateExpression()) {
      throw new Error('assignment to folded key ' + key)
    }
    path.replaceWith(t.valueToNode(FOLD[key]))
  },
  VariableDeclarator(path) {
    let {node} = path
    if (t.isIdentifier(node.id, {name: 'config'}) && t.isObjectExpression(node.init)) {
      node.init.properties = node.init.properties.filter(p => !(t.isIdentifier(p.key) && p.key.name in FOLD))
    }
    if (t.isIdentifier(node.id, {name: 'locales'}) && t.isObjectExpression(node.init)) {
      node.init.properties = node.init.properties.filter(p => KEEP_LOCALES.has(p.key.name ?? p.key.value))
    }
  },
})

// 2. Simplify constant expressions and dead branches until nothing changes.
let changed = true
let rounds = 0
while (changed) {
  changed = false
  rounds++
  traverse.cache.clear()
  traverse(ast, {
    'UnaryExpression|BinaryExpression': {
      exit(path) {
        let {node} = path
        let foldable = t.isUnaryExpression(node, {operator: '!'}) || (t.isBinaryExpression(node) && ['==', '!=', '===', '!=='].includes(node.operator))
        if (foldable && isConst(node)) {
          let v = value(path)
          if (['string', 'number', 'boolean'].includes(typeof v) || v === null) {
            if (t.isStringLiteral(path.node) || (t.isBooleanLiteral(path.node))) return
            path.replaceWith(t.valueToNode(v)); changed = true
          }
        }
      },
    },
    LogicalExpression: {
      exit(path) {
        let {left, right, operator} = path.node
        if (!isConst(left)) {
          // x && true / x || false in a test position keep their meaning as x's truthiness
          if (isConst(right) && (path.parentPath.isIfStatement({test: path.node}) || path.parentPath.isConditionalExpression({test: path.node}) || path.parentPath.isUnaryExpression({operator: '!'}) || path.parentPath.isLogicalExpression())) {
            let rv = value(path.get('right'))
            if (operator == '&&' && rv && isTestContext(path)) { path.replaceWith(left); changed = true }
            else if (operator == '||' && !rv && isTestContext(path)) { path.replaceWith(left); changed = true }
            else if (operator == '&&' && !rv && isTestContext(path) && isPure(left)) { path.replaceWith(t.booleanLiteral(false)); changed = true }
            else if (operator == '||' && rv && isTestContext(path) && isPure(left)) { path.replaceWith(t.booleanLiteral(true)); changed = true }
          }
          return
        }
        let lv = value(path.get('left'))
        let pick
        if (operator == '&&') pick = lv ? right : left
        else if (operator == '||') pick = lv ? left : right
        else pick = lv == null ? right : left
        path.replaceWith(pick); changed = true
      },
    },
    ConditionalExpression: {
      exit(path) {
        if (!isConst(path.node.test)) return
        path.replaceWith(value(path.get('test')) ? path.node.consequent : path.node.alternate); changed = true
      },
    },
    IfStatement: {
      exit(path) {
        if (isConst(path.node.test)) {
          let v = value(path.get('test'))
          replaceStatement(path, v ? path.node.consequent : path.node.alternate); changed = true
          return
        }
        let {node} = path
        if (node.alternate && t.isBlockStatement(node.alternate) && node.alternate.body.length == 0) { node.alternate = null; changed = true }
        if (!node.alternate && t.isBlockStatement(node.consequent) && node.consequent.body.length == 0 && isPure(node.test)) { path.remove(); changed = true }
      },
    },
    ReturnStatement(path) {
      if (t.isIdentifier(path.node.argument, {name: 'undefined'})) { path.node.argument = null; changed = true }
    },
    BlockStatement(path) {
      let body = path.node.body
      let i = body.findIndex(s => t.isReturnStatement(s) || t.isThrowStatement(s))
      if (i != -1 && body.slice(i + 1).some(s => !t.isFunctionDeclaration(s))) {
        path.node.body = body.slice(0, i + 1).concat(body.slice(i + 1).filter(s => t.isFunctionDeclaration(s))); changed = true
      }
    },
    EmptyStatement(path) {
      if (path.parentPath.isBlockStatement() || path.parentPath.isProgram()) { path.remove(); changed = true }
    },
    ExpressionStatement(path) {
      if (isConst(path.node.expression) && !t.isStringLiteral(path.node.expression)) { path.remove(); changed = true }
    },
    // `cond ? [...] : []` folded into spreads leaves `...[]`
    SpreadElement(path) {
      if (t.isArrayExpression(path.node.argument) && path.parentPath.isArrayExpression()) {
        path.replaceWithMultiple(path.node.argument.elements); changed = true
      }
    },
  })

  // Fold never-reassigned boolean variables and calls to empty functions.
  traverse.cache.clear()
  traverse(ast, {
    Scope(path) {
      for (let binding of Object.values(path.scope.bindings)) {
        let decl = binding.path
        if (binding.constantViolations.length || !binding.referenced) continue
        if (decl.isVariableDeclarator() && t.isBooleanLiteral(decl.node.init) && decl.parentPath.node.kind != 'var') {
          for (let ref of binding.referencePaths) { ref.replaceWith(t.booleanLiteral(decl.node.init.value)); changed = true }
        } else if (decl.isFunctionDeclaration() && !decl.node.async && decl.node.body.body.length == 0) {
          for (let ref of binding.referencePaths) {
            let call = ref.parentPath
            if (!call.isCallExpression({callee: ref.node}) || !call.node.arguments.every(isPure)) continue
            if (call.parentPath.isExpressionStatement()) call.parentPath.remove()
            else call.replaceWith(t.identifier('undefined'))
            changed = true
          }
        }
      }
    },
  })

  // Remove unreferenced declarations.
  traverse.cache.clear()
  traverse(ast, {
    Scope(path) {
      for (let [name, binding] of Object.entries(path.scope.bindings)) {
        if (binding.referenced || binding.kind == 'param' || binding.kind == 'module') continue
        let decl = binding.path
        if (decl.isFunctionDeclaration()) {
          if (binding.constantViolations.length) continue
          decl.remove(); changed = true
        } else if (decl.isVariableDeclarator() && t.isIdentifier(decl.node.id)) {
          let init = decl.node.init
          if (init && !isRemovableInit(init)) continue
          if (!binding.constantViolations.every(v => v.isAssignmentExpression() && v.parentPath.isExpressionStatement() && isPure(v.node.right))) continue
          for (let v of binding.constantViolations) { v.parentPath.remove() }
          decl.remove(); changed = true
        }
      }
    },
  })
  if (rounds > 30) throw new Error('no fixpoint')
}

function isTestContext(path) {
  let p = path.parentPath
  return p.isIfStatement({test: path.node}) || p.isConditionalExpression({test: path.node}) || p.isUnaryExpression({operator: '!'}) || (p.isLogicalExpression() && isTestContext(p))
}

function isPure(node) {
  if (t.isCallExpression(node) && t.isIdentifier(node.callee) && /^(is|should)[A-Z]/.test(node.callee.name) && node.arguments.every(isPure)) return true
  return isConst(node) || t.isIdentifier(node) || t.isArrowFunctionExpression(node) || t.isFunctionExpression(node) ||
    (t.isMemberExpression(node) && !node.computed && isPure(node.object)) ||
    (t.isUnaryExpression(node, {operator: '!'}) && isPure(node.argument)) ||
    (t.isLogicalExpression(node) && isPure(node.left) && isPure(node.right)) ||
    (t.isBinaryExpression(node) && isPure(node.left) && isPure(node.right))
}

function isRemovableInit(init) {
  if (isConst(init) || t.isFunctionExpression(init) || t.isArrowFunctionExpression(init) || t.isRegExpLiteral(init) ||
      t.isObjectExpression(init) || t.isArrayExpression(init) || t.isIdentifier(init)) return true
  if (t.isNewExpression(init) && t.isIdentifier(init.callee) && ['Map', 'Set', 'WeakMap', 'WeakSet'].includes(init.callee.name)) return true
  if (t.isCallExpression(init) && (t.isArrowFunctionExpression(init.callee) || t.isFunctionExpression(init.callee))) return true
  return false
}

// 3. Drop config keys nothing reads any more.
traverse.cache.clear()
traverse(ast, {
  VariableDeclarator(path) {
    if (!t.isIdentifier(path.node.id, {name: 'config'}) || !t.isObjectExpression(path.node.init)) return
    let used = new Set()
    traverse(ast, {MemberExpression(p) { if (t.isIdentifier(p.node.object, {name: 'config'}) && t.isIdentifier(p.node.property)) used.add(p.node.property.name) }})
    path.node.init.properties = path.node.init.properties.filter(p => used.has(p.key.name))
  },
})
fs.writeFileSync(output, WRAP_START + recast.print(ast, {quote: 'single', reuseWhitespace: true}).code + WRAP_END)
console.error('rounds', rounds, 'unfolded config keys:', [...unknown].join(', '))
