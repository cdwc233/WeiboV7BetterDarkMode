// ==UserScript==
// @name         微博更好的深色模式
// @namespace    local.weibo-dark-mode-fix
// @version      1.0.0
// @description  给微博V7提供更好的深色模式
// @match        https://weibo.com/*
// @match        https://www.weibo.com/*
// @match        https://s.weibo.com/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    const themeModeStorageKey = 'weibo-dark-mode-fix-mode';
    const themeModes = ['dark', 'light', 'system'];
    const themeModeLabels = {
        dark: '\u5f00',
        light: '\u5173',
        system: '\u8ddf\u968f\u6d4f\u89c8\u5668'
    };
    const menuPrefix = '\u6df1\u8272\u6a21\u5f0f\uff1a';
    const preloadAttribute = 'data-weibo-tv-dark-preload';
    const searchAttribute = 'data-weibo-search-dark';
    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let preloadStyle = null;
    let searchStyle = null;
    let pending = false;
    let themeMode = readThemeMode();

    function readThemeMode() {
        const mode = GM_getValue(themeModeStorageKey, 'system');
        return themeModes.includes(mode) ? mode : 'system';
    }

    function effectiveTheme() {
        if (themeMode === 'dark') return 'dark';
        if (themeMode === 'light') return 'light';
        return systemThemeQuery.matches ? 'dark' : 'light';
    }

    function registerThemeMenu() {
        GM_registerMenuCommand(`${menuPrefix}${themeModeLabels[themeMode]}`, () => {
            const index = themeModes.indexOf(themeMode);
            themeMode = themeModes[(index + 1) % themeModes.length];
            GM_setValue(themeModeStorageKey, themeMode);
            location.reload();
        });
    }

    function setPreload(root, enabled) {
        if (!enabled) {
            root.removeAttribute(preloadAttribute);
            if (preloadStyle) preloadStyle.remove();
            preloadStyle = null;
            return;
        }

        if (!root.hasAttribute(preloadAttribute)) root.setAttribute(preloadAttribute, '');
        if (preloadStyle && preloadStyle.isConnected) return;
        preloadStyle = document.createElement('style');
        preloadStyle.textContent =
            `html[${preloadAttribute}], html[${preloadAttribute}] body { background-color: #111 !important; }` +
            `html[${preloadAttribute}] { color-scheme: dark; }`;
        (document.head || root).appendChild(preloadStyle);
    }

    function setSearchTheme(root, enabled) {
        root.toggleAttribute(searchAttribute, enabled);
        if (!enabled || (searchStyle && searchStyle.isConnected)) return;

        searchStyle = document.createElement('style');
        searchStyle.textContent = `
            html[${searchAttribute}], html[${searchAttribute}] body {
                background: #111 !important;
                color: #e7e7e7 !important;
                color-scheme: dark;
            }
            html[${searchAttribute}] .Nav_panel_YI3-j,
            html[${searchAttribute}] .m-main-nav,
            html[${searchAttribute}] .card-wrap,
            html[${searchAttribute}] .m-wrap,
            html[${searchAttribute}] .m-box,
            html[${searchAttribute}] .m-layer,
            html[${searchAttribute}] .woo-pop-wrap,
            html[${searchAttribute}] .woo-pop-content,
            html[${searchAttribute}] .woo-panel-main,
            html[${searchAttribute}] .woo-input-wrap,
            html[${searchAttribute}] .woo-dialog-main,
            html[${searchAttribute}] .woo-dialog-content {
                background-color: #191919 !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] .card-wrap *,
            html[${searchAttribute}] .m-main-nav *,
            html[${searchAttribute}] .Nav_panel_YI3-j *,
            html[${searchAttribute}] .woo-panel-main *,
            html[${searchAttribute}] .woo-dialog-main * {
                border-color: #353535;
            }
            html[${searchAttribute}] .card-wrap,
            html[${searchAttribute}] .m-main-nav,
            html[${searchAttribute}] .Nav_panel_YI3-j,
            html[${searchAttribute}] .woo-panel-main,
            html[${searchAttribute}] .woo-dialog-main,
            html[${searchAttribute}] .woo-dialog-content,
            html[${searchAttribute}] .m-wrap,
            html[${searchAttribute}] .m-box,
            html[${searchAttribute}] .m-layer,
            html[${searchAttribute}] .woo-pop-content,
            html[${searchAttribute}] input,
            html[${searchAttribute}] textarea {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .card-wrap a:not(.woo-button-main),
            html[${searchAttribute}] .m-main-nav a:not(.cur),
            html[${searchAttribute}] .Nav_panel_YI3-j a,
            html[${searchAttribute}] .card-wrap .from,
            html[${searchAttribute}] .card-wrap .woo-font,
            html[${searchAttribute}] .m-main-nav .nav-icon {
                color: #a9a9a9 !important;
            }
            /* Keep topic, mention, and other links in post bodies recognizable. */
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="feed_list_content"], .card-feed .txt) a[href],
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="feed_list_content"], .card-feed .txt) a[href] * {
                color: #ff8200 !important;
            }
            /* Quoted or reposted posts use their own legacy card surface. */
            html[${searchAttribute}] #pl_feedlist_index .card-comment .con,
            html[${searchAttribute}] #pl_feedlist_index .card-comment [node-type="feed_list_forwardContent"] {
                background-color: #131313 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            /* Toutiao article previews retain a separate, light information panel. */
            html[${searchAttribute}] #pl_feedlist_index [data-weibo-article-card] {
                background-color: #131313 !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index [data-weibo-article-card] * {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index [data-weibo-article-card] a[href*="/ttarticle"]:hover,
            html[${searchAttribute}] #pl_feedlist_index [data-weibo-article-card] a[href*="/ttarticle"]:hover * {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_pic_feedlist [data-weibo-picture-card] {
                background-color: #191919 !important;
                border-color: #353535 !important;
            }
            /* Topic-search results are direct children of the topic result list. */
            html[${searchAttribute}] body[data-weibo-topic-search] #pl_feedlist_index > div > div:hover {
                background-color: #303030 !important;
            }
            html[${searchAttribute}] body[data-weibo-topic-search] #pl_feedlist_index :is(a[href*="/weibo?q="], a.name) {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] body[data-weibo-topic-search] #pl_feedlist_index :is(a[href*="/weibo?q="], a.name):hover,
            html[${searchAttribute}] body[data-weibo-topic-search] #pl_feedlist_index :is(a[href*="/weibo?q="], a.name):hover * {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .card-comment :is(.txt, .name) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .card-comment :is(.func, .from, .act, .act a, .act button, .act .woo-font, .act svg) {
                color: #a9a9a9 !important;
                border-color: #353535 !important;
            }
            /* Expanded image viewer controls and thumbnail rail. */
            html[${searchAttribute}] #pl_feedlist_index .media.media-pic-zoom,
            html[${searchAttribute}] #pl_feedlist_index .media.media-pic-zoom :is(.choose-pic, [node-type="picChoose"], .more-pic, [node-type="recBox"]) {
                background-color: #131313 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .media.media-pic-zoom .tab :is(a, .wbicon),
            html[${searchAttribute}] #pl_feedlist_index .media.media-pic-zoom .more-pic :is(a, .close) {
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .media.media-pic-zoom .tab a:hover {
                background-color: #131313 !important;
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .media.media-pic-zoom [node-type="picChoose"] li.cur {
                border-color: #ff8200 !important;
            }
            html[${searchAttribute}] .m-note {
                background-color: #453805 !important;
                color: #f2d66a !important;
            }
            /* Search suggestions and all Woo popovers. */
            html[${searchAttribute}] .woo-pop-main,
            html[${searchAttribute}] .woo-pop-main .woo-pop-wrap-main {
                background-color: #191919 !important;
                color: #e7e7e7 !important;
                border-color: #3a3a3a !important;
            }
            html[${searchAttribute}] .woo-pop-main a,
            html[${searchAttribute}] .woo-pop-main button,
            html[${searchAttribute}] .woo-pop-main button *,
            html[${searchAttribute}] .SearchBar_result_1bQmd *,
            html[${searchAttribute}] .SearchBar_wrap_14lCd,
            html[${searchAttribute}] .SearchBar_wrap_14lCd * {
                color: #dedede !important;
            }
            html[${searchAttribute}] .woo-pop-main button:hover {
                background-color: #303030 !important;
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] :is(.woo-pop-content, .woo-pop-wrap-main) :is(button, a, span) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] :is(.woo-pop-content, .woo-pop-wrap-main) :is(button, a, span) * {
                color: inherit !important;
            }
            html[${searchAttribute}] :is(.woo-pop-content, .woo-pop-wrap-main) button:hover,
            html[${searchAttribute}] :is(.woo-pop-content, .woo-pop-wrap-main) a:hover {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .Nav_right_pDw0F .IconBox_btn_10GoC:not(.IconBox_pub_1zIJ8) {
                background-color: #2c2c2c !important;
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .Nav_right_pDw0F .IconBox_btn_10GoC:not(.IconBox_pub_1zIJ8):hover {
                background-color: #303030 !important;
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .Nav_right_pDw0F .IconBox_btn_10GoC:not(.IconBox_pub_1zIJ8) .IconBox_icon_1dS2Y {
                color: inherit !important;
            }
            html[${searchAttribute}] .SearchBar_result_1bQmd .SearchBar_maxText_Y8oAx,
            html[${searchAttribute}] .SearchBar_result_1bQmd .SearchBar_sDesc_u7VCT,
            html[${searchAttribute}] .SearchBar_result_1bQmd .SearchBar_searchIcon_2xH6V,
            html[${searchAttribute}] .SearchBar_result_1bQmd .woo-font {
                color: #969696 !important;
            }
            html[${searchAttribute}] .SearchBar_wrap_14lCd,
            html[${searchAttribute}] .SearchBar_wrap_14lCd.Nav_barForcus_L6wsV {
                background-color: #191919 !important;
                border-color: #353535 !important;
                box-shadow: none !important;
            }
            html[${searchAttribute}] .SearchBar_wrap_14lCd .woo-input-wrap {
                border-color: #454545 !important;
            }
            html[${searchAttribute}] .SearchBar_rsItem_220Kh:hover,
            html[${searchAttribute}] .SearchBar_weiboTopBox_3UYif:hover,
            html[${searchAttribute}] .woo-pop-item-main:hover {
                background-color: #303030 !important;
            }

            /* Top navigation retains its dark hover and selected state. */
            html[${searchAttribute}] .Nav_panel_YI3-j .Ctrls_alink_1L3hP:hover .Ctrls_item_3KzNH,
            html[${searchAttribute}] .Nav_panel_YI3-j .Ctrls_tab_sa2Mv[aria-current="page"] .Ctrls_item_3KzNH,
            html[${searchAttribute}] .Nav_panel_YI3-j .Ctrls_tab_sa2Mv[class*="active"] .Ctrls_item_3KzNH {
                background-color: #303030 !important;
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .Nav_panel_YI3-j .Ctrls_alink_1L3hP:hover .Ctrls_item_3KzNH :is(svg, .Ctrls_icon_2mxB4),
            html[${searchAttribute}] .Nav_panel_YI3-j .Ctrls_tab_sa2Mv[aria-current="page"] .Ctrls_item_3KzNH :is(svg, .Ctrls_icon_2mxB4),
            html[${searchAttribute}] .Nav_panel_YI3-j .Ctrls_tab_sa2Mv[class*="active"] .Ctrls_item_3KzNH :is(svg, .Ctrls_icon_2mxB4) {
                color: #bfbfbf !important;
            }

            /* Search navigation and its hover or selected states. */
            html[${searchAttribute}] .m-main-nav li > a:hover {
                background-color: #303030 !important;
            }
            html[${searchAttribute}] .m-main-nav li > a.cur {
                background-color: transparent !important;
                color: #ff8200 !important;
            }
            html[${searchAttribute}] .m-main-nav li > a:hover *,
            html[${searchAttribute}] .m-main-nav li > a.cur * {
                color: inherit !important;
            }

            /* User-search category tabs, filters, and result cards. */
            html[${searchAttribute}] .m-sub-nav,
            html[${searchAttribute}] .m-filtertab,
            html[${searchAttribute}] .m-filtertab .more-list,
            html[${searchAttribute}] .card-user-b {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] .card-user-b:hover {
                background-color: #303030 !important;
            }
            html[${searchAttribute}] .m-sub-nav li > a,
            html[${searchAttribute}] .m-filtertab :is(.filter-list > li > span, .tab-r),
            html[${searchAttribute}] .m-filtertab :is(.filter-list > li > span, .tab-r) .woo-button-icon {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .m-sub-nav li > a.cur {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] .m-sub-nav li > a:hover {
                background-color: transparent !important;
                color: #ff8200 !important;
            }
            html[${searchAttribute}] .m-filtertab .more-list li > a {
                background-color: transparent !important;
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .m-filtertab .more-list li:hover > a {
                background-color: #303030 !important;
                color: #ff8200 !important;
            }
            html[${searchAttribute}] [data-weibo-region-picker] {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] [data-weibo-region-picker] * {
                border-color: #353535 !important;
            }
            html[${searchAttribute}] [data-weibo-region-picker] :is(dt, dd, span, a) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] [data-weibo-region-picker] li > a {
                background-color: #2c2c2c !important;
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] [data-weibo-region-picker] :is(li:first-child > a, .cur > a, .current > a, .active > a) {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] [data-weibo-region-picker] li > a:hover {
                background-color: #303030 !important;
                color: #ff8200 !important;
            }
            html[${searchAttribute}] .card-user-b .info .name {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .card-user-b .info .name:hover {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] .card-user-b .info :is(p, .s-nobr) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] body.wbs-user .card-user-b .btn,
            html[${searchAttribute}] body.wbs-user .card-user-b .btn :is(button, a, .woo-button-default, .woo-button) {
                background-color: transparent !important;
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] body.wbs-user .card-user-b .btn :is(button, a, .woo-button-default, .woo-button):hover,
            html[${searchAttribute}] body.wbs-user .card-user-b :is(button.btn, a.btn):hover {
                background-color: #131313 !important;
            }
            html[${searchAttribute}] body.wbs-user .card-user-b :is(.btn, .btn :is(button, a, .woo-button-default, .woo-button))[data-weibo-followed] {
                border-color: #e7e7e7 !important;
            }
            html[${searchAttribute}] body.wbs-user .card-user-b :is(.btn, .btn :is(button, a, .woo-button-default, .woo-button)):not([data-weibo-followed]) {
                border-color: #ff8200 !important;
            }
            html[${searchAttribute}] body.wbs-user :is(.m-page2, .m-error) {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] body.wbs-user .m-page2 :is(.page-list a, .prev, .next, .page-info, .go-page) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] body.wbs-user .m-page2 .page-list li > a:hover {
                background-color: #303030 !important;
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] body.wbs-user .m-page2 .page-list li.cur > a {
                background-color: #2c2c2c !important;
                color: #ff8200 !important;
            }
            html[${searchAttribute}] body.wbs-user .m-page2 .go-input {
                background-color: #282828 !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] body.wbs-user .m-error a {
                color: #ff8200 !important;
            }

            /* Topic header and the topic-specific post editor. */
            html[${searchAttribute}] #pl_topic_header.card-topic {
                background-color: #191919 !important;
                color: #e7e7e7 !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_topic_header :is(.msg, .info, .title, .card-topic-b),
            html[${searchAttribute}] #pl_topic_header :is(h1, h1 a, .card-topic-b a) {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] #pl_topic_header .total,
            html[${searchAttribute}] #pl_topic_header .total * {
                color: #a9a9a9 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index [node-type="sendweibo"] textarea[node-type="textEl"] {
                background-color: #282828 !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
                box-shadow: none !important;
            }
            html[${searchAttribute}] #pl_feedlist_index [node-type="sendweibo"] textarea[node-type="textEl"]:focus {
                background-color: #2c2c2c !important;
                border-color: #555 !important;
                box-shadow: none !important;
            }

            /* Legacy comment composer, list, and load-more footer. */
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) textarea,
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) .input {
                background-color: #282828 !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
                box-shadow: none !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) textarea:focus {
                background-color: #2c2c2c !important;
                border-color: #555 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) textarea::placeholder {
                color: #8a8a8a !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_repeat) :is(.WB_text, [node-type="comment_content"]) a[href],
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_repeat) :is(.WB_text, [node-type="comment_content"]) a[href] * {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_repeat) :is(a.name[href], a.user_name[href], a[usercard][href]),
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_repeat) :is(a.name[href], a.user_name[href], a[usercard][href]) * {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .card-together .card-review .txt a[href],
            html[${searchAttribute}] #pl_feedlist_index .card-together .card-review .txt a[href] * {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) :is([node-type="submit"], .W_btn_a) {
                background-color: #ff8200 !important;
                color: #fff !important;
                border-color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) :is([node-type="submit"], .W_btn_a) * {
                color: inherit !important;
            }
            html[${searchAttribute}] #pl_feedlist_index [node-type="commentList"] .s-btn-a[node-type="btnText"] {
                background-color: #ff8200 !important;
                color: #fff !important;
                border-color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) .WB_cardmore,
            html[${searchAttribute}] #pl_feedlist_index .WB_cardmore {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) .WB_cardmore :is(a, span),
            html[${searchAttribute}] #pl_feedlist_index .WB_cardmore :is(a, span) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is([node-type="commentList"], .WB_feed_publish, .WB_feed_repeat) .WB_cardmore:hover :is(a, span),
            html[${searchAttribute}] #pl_feedlist_index .WB_cardmore:hover :is(a, span) {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index [node-type="feed_list_repeat"] .card-more-a,
            html[${searchAttribute}] #pl_feedlist_index [node-type="feed_list_repeat"] .card-more-a > a {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index [node-type="feed_list_repeat"] .card-more-a > a:hover,
            html[${searchAttribute}] #pl_feedlist_index [node-type="feed_list_repeat"] .card-more-a > a:hover * {
                color: #ff8200 !important;
            }

            /* Forward dialog. */
            html[${searchAttribute}] .m-layer[node-type="outer"],
            html[${searchAttribute}] .m-layer[node-type="outer"] :is(.header, .inner, .card, .card-sender) {
                background-color: #191919 !important;
                color: #e7e7e7 !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] {
                border-radius: 10px !important;
                overflow: hidden !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .header {
                border-bottom-color: #353535 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] :is(.header .title, .header .title *, .header .close) {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .tab :is(span, li) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .tab li {
                background-color: #131313 !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .tab li.selected {
                background-color: #191919 !important;
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .content,
            html[${searchAttribute}] .m-layer[node-type="outer"] .content p {
                background-color: #282828 !important;
                color: #bfbfbf !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .content a {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .num,
            html[${searchAttribute}] .m-layer[node-type="outer"] .num * {
                color: #a9a9a9 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] textarea[node-type="textEl"],
            html[${searchAttribute}] .m-layer[node-type="outer"] .input-wrap-share .input {
                background-color: #282828 !important;
                color: #e7e7e7 !important;
                border-color: #ff8200 !important;
                box-shadow: none !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] :is(.opt, .opt *) {
                color: #bfbfbf !important;
            }

            /* Advanced search dialog form controls. */
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search :is(dt, label) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search :is(.txt, .select-arrow, .select-arrow input, .select-arrow select) {
                background-color: #282828 !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
                box-shadow: none !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search dd select {
                margin-right: 0 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search dl.time [type="text"] {
                border-radius: 6px !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search .select-arrow :is(input, select):disabled,
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search .select-arrow input[readonly] {
                color: #a9a9a9 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search .select-arrow .woo-button-icon {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search :is(input[type="radio"], input[type="checkbox"]) {
                accent-color: #ff8200;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search select option {
                background-color: #282828;
                color: #e7e7e7;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search [node-type="cancel"] {
                background-color: #2c2c2c !important;
                color: #e7e7e7 !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] .m-layer[node-type="outer"] .m-adv-search [node-type="cancel"]:hover {
                background-color: #303030 !important;
            }

            /* AI search modules. */
            html[${searchAttribute}] .ai_module,
            html[${searchAttribute}] .zhisou_9000,
            html[${searchAttribute}] [class^="zhisou_title_"],
            html[${searchAttribute}] [class*=" zhisou_title_"],
            html[${searchAttribute}] .trust_item_tag,
            html[${searchAttribute}] .emoji-picker {
                background-color: #191919 !important;
                color: #e7e7e7 !important;
                border-color: #353535 !important;
            }
            /* AI search quick overview preview. */
            html[${searchAttribute}] .ai_module .summarize_preview_wrap {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] .ai_module .summarize_preview_wrap :is(.summarize_text_wrap, .deepseek_think_container, .summarize_text_content, .summarize_text_content p) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .ai_module .summarize_preview_wrap .summarize_text_content strong {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .ai_module .summarize_preview_wrap code {
                background-color: #2c2c2c !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] .ai_module .summarize_preview_wrap .quoted-auth-child {
                background-color: #2c2c2c !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] .ai_module *,
            html[${searchAttribute}] .zhisou_module_9000 *,
            html[${searchAttribute}] .zhisou_9000 * {
                border-color: #353535;
            }
            html[${searchAttribute}] .ai_module,
            html[${searchAttribute}] .ai_module *,
            html[${searchAttribute}] .zhisou_module_9000,
            html[${searchAttribute}] .zhisou_module_9000 *,
            html[${searchAttribute}] .zhisou_9000,
            html[${searchAttribute}] .zhisou_9000 * {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] .zhisou_9000_item_gray:hover,
            html[${searchAttribute}] .trust_item_tag:hover {
                background-color: #303030 !important;
            }
            /* AI answer embedded in the regular search result feed. */
            html[${searchAttribute}] #pl_feedlist_index [class^="zhisou_"],
            html[${searchAttribute}] #pl_feedlist_index [class*=" zhisou_"],
            html[${searchAttribute}] #pl_feedlist_index [class^="zhishou-"],
            html[${searchAttribute}] #pl_feedlist_index [class*=" zhishou-"],
            html[${searchAttribute}] #pl_feedlist_index .zhisou_text_container,
            html[${searchAttribute}] #pl_feedlist_index .fill_height_table {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .zhisou_text_container *,
            html[${searchAttribute}] #pl_feedlist_index [class^="zhishou-"] *,
            html[${searchAttribute}] #pl_feedlist_index [class*=" zhishou-"] * {
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .more_btn,
            html[${searchAttribute}] #pl_feedlist_index .more_btn .line {
                background-color: #191919 !important;
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .more_btn .line {
                background-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .more_btn_text {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .more_btn:hover .more_btn_text {
                color: #ff8200 !important;
            }

            /* AI answer source tracing and credibility labels. */
            html[${searchAttribute}] #pl_feedlist_index :is(.zhisou_module_9000, .zhisou_9000, [class^="zhisou_"], [class*=" zhisou_"]) :is([class*="source"], [class*="refer"], [class*="trace"], [class*="cite"], [class*="credib"], [class*="trust"]) {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is(.zhisou_module_9000, .zhisou_9000, [class^="zhisou_"], [class*=" zhisou_"]) :is([class*="source"], [class*="refer"], [class*="trace"], [class*="cite"], [class*="credib"], [class*="trust"]) * {
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index :is(.zhisou_module_9000, .zhisou_9000, [class^="zhisou_"], [class*=" zhisou_"]) :is([class*="tag"], [class*="badge"], [class*="label"]) {
                background-color: #2c2c2c !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .trust_item,
            html[${searchAttribute}] #pl_feedlist_index .trust_item_num_box,
            html[${searchAttribute}] #pl_feedlist_index .trust_item_tag_box {
                background-color: #353535 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .trust_item_label,
            html[${searchAttribute}] #pl_feedlist_index .trust_item_num {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .trust_item_tag {
                background-color: #2c2c2c !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .trust_box {
                background-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .quoted-auth-child {
                background-color: #2c2c2c !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .quoted-auth-child::before,
            html[${searchAttribute}] #pl_feedlist_index .quoted-auth-child::after {
                color: #e7e7e7 !important;
            }

            /* Right rail: hot topics and creator tools. */
            html[${searchAttribute}] #hot-band-container,
            html[${searchAttribute}] .hot-band-tabs-item,
            html[${searchAttribute}] .hot-band-tabs-item-active,
            html[${searchAttribute}] .wbpro-side {
                background-color: #191919 !important;
                color: #e7e7e7 !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #hot-band-container *,
            html[${searchAttribute}] .wbpro-side *,
            html[${searchAttribute}] .wbpro-side a {
                border-color: #353535;
            }
            html[${searchAttribute}] #hot-band-container :is(.hot-band-header-title, .hot-band-header-refresh, .hot-band-tabs-list-item-content-title),
            html[${searchAttribute}] .wbpro-side :is(.cla, .claa, .SideCard3_name_1Kc6g, .wbpro-side-opt) {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .wbpro-side .wbpro-side-card-3 :is(.cla, .claa, .SideCard3_name_1Kc6g, p):hover {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #hot-band-container .hot-band-tabs-item {
                background-color: #131313 !important;
            }
            html[${searchAttribute}] #hot-band-container .hot-band-tabs-item-active {
                background-color: #191919 !important;
                box-shadow: none !important;
            }
            html[${searchAttribute}] #hot-band-container .hot-band-tabs-list-item:hover {
                background-color: transparent !important;
            }
            html[${searchAttribute}] .wbpro-side :is(.wbpro-side-card-3, .wbpro-side-opt),
            html[${searchAttribute}] .wbpro-side :is(.wbpro-side-card-3, .wbpro-side-opt):hover {
                background-color: transparent !important;
            }
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt,
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt:hover {
                background-color: #131313 !important;
            }
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt,
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt:hover,
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt :is(a, span) {
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt :is(button, .woo-font, [class*="arrow"], [class*="icon"]),
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt:hover :is(button, .woo-font, [class*="arrow"], [class*="icon"]) {
                background-color: transparent !important;
                color: #e7e7e7 !important;
                border-color: transparent !important;
                fill: #e7e7e7 !important;
            }
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt :is(button, .woo-font, [class*="arrow"], [class*="icon"]) * {
                color: inherit !important;
                fill: inherit !important;
            }
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt:hover :is(a, span, button, .woo-font, [class*="arrow"], [class*="icon"]),
            html[${searchAttribute}] .wbpro-side .wbpro-side-opt:hover :is(button, .woo-font, [class*="arrow"], [class*="icon"]) * {
                color: #ff8200 !important;
                fill: #ff8200 !important;
            }
            html[${searchAttribute}] #hot-band-container .hot-band-footer-link {
                background-color: #131313 !important;
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #hot-band-container .hot-band-footer-link * {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #hot-band-container .hot-band-footer-link:hover {
                background-color: #131313 !important;
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #hot-band-container .hot-band-footer-link:hover * {
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_right_side .card-user-c:hover,
            html[${searchAttribute}] #pl_right_side .card-interest .item:hover {
                background-color: #303030 !important;
                box-shadow: none !important;
            }
            html[${searchAttribute}] #pl_right_side .card-user-c:hover :is(.name, p),
            html[${searchAttribute}] #pl_right_side .card-interest .item:hover :is(.info, .info a, .info p, .info span, .info dt, .info dd) {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #pl_right_side .card-user-c:hover .woo-button-default {
                background-color: #282828 !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }

            /* Result pagination and the deduplicated-results notice. */
            html[${searchAttribute}] #pl_feedlist_index .m-page2,
            html[${searchAttribute}] #pl_feedlist_index .m-error {
                background-color: #191919 !important;
                color: #bfbfbf !important;
                border-color: #353535 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .m-page2 :is(a, span, i),
            html[${searchAttribute}] #pl_feedlist_index .m-error {
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .m-page2 .page-list li > a:hover {
                background-color: #303030 !important;
                color: #e7e7e7 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .m-page2 .page-list li.cur > a {
                background-color: #2c2c2c !important;
                color: #ff8200 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .m-page2 .go-input {
                background-color: #282828 !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] #pl_feedlist_index .m-error a {
                color: #ff8200 !important;
            }

            /* Per-card overflow menu. */
            html[${searchAttribute}] #pl_feedlist_index ul[node-type="fl_menu_right"] {
                background-color: #191919 !important;
                border: 1px solid #353535 !important;
                border-radius: 10px !important;
                overflow: hidden !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35) !important;
            }
            html[${searchAttribute}] #pl_feedlist_index ul[node-type="fl_menu_right"] li,
            html[${searchAttribute}] #pl_feedlist_index ul[node-type="fl_menu_right"] li a {
                background-color: transparent !important;
                color: #bfbfbf !important;
            }
            html[${searchAttribute}] #pl_feedlist_index ul[node-type="fl_menu_right"] li:hover,
            html[${searchAttribute}] #pl_feedlist_index ul[node-type="fl_menu_right"] li:hover a {
                background-color: #303030 !important;
                color: #e7e7e7 !important;
            }

            /* Shared interactive surfaces that otherwise retain their light hover fill. */
            html[${searchAttribute}] .woo-button-default,
            html[${searchAttribute}] .woo-button-line.woo-button-default,
            html[${searchAttribute}] .woo-input-wrap {
                background-color: #282828 !important;
                color: #e7e7e7 !important;
                border-color: #454545 !important;
            }
            html[${searchAttribute}] .woo-input-wrap input::placeholder,
            html[${searchAttribute}] input::placeholder,
            html[${searchAttribute}] textarea::placeholder {
                color: #8a8a8a !important;
            }
        `;
        (document.head || root).appendChild(searchStyle);
    }

    function markUserFollowControls() {
        document.querySelectorAll('body.wbs-user .card-user-b .btn').forEach((container) => {
            const followed = /\u5df2\u5173\u6ce8/.test(container.textContent || '');
            container.toggleAttribute('data-weibo-followed', followed);
            container.querySelectorAll('button, a').forEach((control) => {
                control.toggleAttribute('data-weibo-followed', followed);
            });
        });
    }

    function markUserRegionPicker() {
        document.querySelectorAll('body.wbs-user ul').forEach((list) => {
            const labels = Array.from(list.querySelectorAll('a'), (link) => link.textContent.trim());
            if (!labels.includes('\u6240\u6709') || !labels.includes('\u5176\u4ed6') || labels.length < 20) return;
            list.parentElement?.setAttribute('data-weibo-region-picker', '');
        });
    }

    function markToutiaoArticleCards() {
        document.querySelectorAll('#pl_feedlist_index a[href*="/ttarticle"]').forEach((link) => {
            let surface = link.parentElement;
            for (let level = 0; surface && level < 5; level += 1, surface = surface.parentElement) {
                const match = getComputedStyle(surface).backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (!match) continue;
                const channels = match.slice(1).map(Number);
                if (channels.every((channel) => channel >= 230)) {
                    surface.setAttribute('data-weibo-article-card', '');
                    break;
                }
            }
        });
    }

    function markTopicSearch() {
        document.body?.toggleAttribute('data-weibo-topic-search', location.pathname === '/topic');
    }

    function markPictureCards() {
        if (location.pathname !== '/pic') return;
        const feed = document.getElementById('pl_pic_feedlist');
        if (!feed) return;

        feed.querySelectorAll('*').forEach((element) => {
            const match = getComputedStyle(element).backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!match) return;
            const channels = match.slice(1).map(Number);
            if (channels.every((channel) => channel >= 230)) {
                element.setAttribute('data-weibo-picture-card', '');
            }
        });
    }

    function repair() {
        pending = false;
        const root = document.documentElement;
        if (!root) return;

        const isSearchPage = location.hostname === 's.weibo.com';
        const theme = effectiveTheme();
        if (isSearchPage) {
            setPreload(root, false);
            markUserFollowControls();
            markUserRegionPicker();
            markToutiaoArticleCards();
            markTopicSearch();
            markPictureCards();
            setSearchTheme(root, theme === 'dark');
            return;
        }

        setSearchTheme(root, false);
        if (!/^\/tv(?:\/|$)/.test(location.pathname)) {
            setPreload(root, false);
            if (root.getAttribute('data-theme') !== theme) {
                root.setAttribute('data-theme', theme);
            }
            return;
        }

        const currentTheme = root.getAttribute('data-theme');
        setPreload(root, theme === 'dark');
        if (theme && currentTheme !== theme) {
            root.setAttribute('data-theme', theme);
        }
    }

    function scheduleRepair() {
        if (pending) return;
        pending = true;
        // Coalesce DOM updates before paint instead of waiting for another frame.
        queueMicrotask(repair);
    }

    // Covers delayed mounting, replaced navigation, and theme resets after routing.
    const observer = new MutationObserver(scheduleRepair);
    observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-theme']
    });

    window.addEventListener('pageshow', scheduleRepair);
    window.addEventListener('popstate', scheduleRepair);
    document.addEventListener('visibilitychange', scheduleRepair);
    if (systemThemeQuery.addEventListener) {
        systemThemeQuery.addEventListener('change', scheduleRepair);
    } else {
        systemThemeQuery.addListener(scheduleRepair);
    }
    registerThemeMenu();
    repair();
})();
