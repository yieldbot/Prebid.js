import * as utils from 'src/utils';
import { formatQS as buildQueryString } from '../src/url';
import { registerBidder } from 'src/adapters/bidderFactory';

/**
 * @module {BidderSpec} modules/YieldbotBidAdapter
 * @description Adapter for requesting bids from Yieldbot
 * @see BidderSpec
 * @author [elljoh]{@link https://github.com/elljoh}
 * @private
 */
export const YieldbotAdapter = {
  _cookiesEnabled: !utils.isSafariBrowser() && utils.cookiesAreEnabled(),
  _adapterLoaded: Date.now(),
  _navigationStart: 0,
  /**
   * @description Yieldbot adapter internal constants
   * @constant
   * @memberof module:modules/YieldbotBidAdapter
   * @property {string} VERSION Yieldbot adapter version string: <pre>'pbjs-{major}.{minor}.{patch}'</pre>
   * @property {string} DEFAULT_BID_REQUEST_URL_PREFIX Request Url prefix to use when ad server response has not provided availability zone specific prefix
   * @property {string} REQUEST_API_VERSION Yieldbot request API Url path parameter
   * @property {string} REQUEST_API_PATH_BID Yieldbot bid request API path component
   * @property {string} REQUEST_API_PATH_CREATIVE Yieldbot ad markup request API path component
   * @property {string} REQUEST_PARAMS_TERMINATOR Yieldbot request query parameters termination character
   * @property {number} USER_ID_TIMEOUT
   * @property {number} VISIT_ID_TIMEOUT
   * @property {number} SESSION_ID_TIMEOUT
   * @property {string} COOKIE_PREFIX Prefix string of first-party cookies set by Yieldbot
   * @property {object} IFRAME_TYPE the iFrame type in which a ad markup request is made
   * @property {string} IFRAME_TYPE.NONE not in an iFrame
   * @property {string} IFRAME_TYPE.SAME_ORIGIN in an iFrame with the same origin aka "friendly"
   * @property {string} IFRAME_TYPE.CROSS_ORIGIN in an iFrame with a different origin aka "unfriendly"
   * @property {object} REQUEST_PARAMS Request Url query parameter names
   * @property {string} REQUEST_PARAMS.ADAPTER_VERSION The version of the YieldbotAdapter code. See [VERSION]{@link module:modules/YieldbotBidAdapter.CONSTANTS}.
   * @property {string} REQUEST_PARAMS.USER_ID First party user identifier
   * @property {string} REQUEST_PARAMS.SESSION_ID Publisher site visit session identifier
   * @property {string} REQUEST_PARAMS.PAGEVIEW_ID Page visit identifier
   * @property {string} REQUEST_PARAMS.AD_REQUEST_ID Yieldbot ad request identifier
   * @property {string} REQUEST_PARAMS.AD_REQUEST_SLOT Slot name for Yieldbot ad markup request e.g. <pre>&lt;slot name&gt;:&lt;width&gt;x&lt;height&gt;</pre>
   * @property {string} REQUEST_PARAMS.PAGEVIEW_DEPTH Counter for page visits in a session
   * @property {string} [REQUEST_PARAMS.LAST_PAGEVIEW_ID] Pageview identifier for the last pageview within the session TTL
   * @property {string} REQUEST_PARAMS.BID_SLOT_NAME Yieldbot slot name to request bid for
   * @property {string} REQUEST_PARAMS.BID_SLOT_SIZE Dimensions for the respective bid slot name
   * @property {string} REQUEST_PARAMS.LOCATION The page visit location Url
   * @property {string} REQUEST_PARAMS.REFERRER The referring page Url
   * @property {string} REQUEST_PARAMS.SCREEN_DIMENSIONS User-agent screen dimensions
   * @property {string} REQUEST_PARAMS.TIMEZONE_OFFSET Number of hours offset from UTC
   * @property {string} REQUEST_PARAMS.LANGUAGE Language and locale of the user-agent
   * @property {string} REQUEST_PARAMS.NAVIGATION_PLATFORM User-agent browsing platform
   * @property {string} REQUEST_PARAMS.USER_AGENT User-Agent string
   * @property {string} [REQUEST_PARAMS.LAST_PAGEVIEW_TIME] Time in milliseconds since the last page visit
   * @property {string} REQUEST_PARAMS.NAVIGATION_START_TIME Performance timing navigationStart
   * @property {string} REQUEST_PARAMS.ADAPTER_LOADED_TIME Adapter code interpreting started timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.BID_REQUEST_TIME Yieldbot bid request sent timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.BID_RESPONSE_TIME Yieldbot bid response processing started timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.AD_REQUEST_TIME Yieldbot ad creative request sent timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.AD_RENDER_TIME Yieldbot ad creative render started timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.AD_IMPRESSION_TIME Yieldbot ad impression rerquest sent  timestamp, in milliseconds since the UNIX epoch
   * @property {string} [REQUEST_PARAMS.INTERSECTION_OBSERVER_AVAILABLE] Indicator that the user-agent supports the Intersection Observer API
   * @property {string} [REQUEST_PARAMS.IFRAME_TYPE] Indicator to specify Yieldbot creative rendering occured in a same (<code>so</code>) or cross (<code>co</code>) origin iFrame
   * @property {string} [REQUEST_PARAMS.BID_TYPE] Yieldbot bid request type: initial or refresh
   * @property {string} REQUEST_PARAMS.CALLBACK Ad creative render callback
   * @property {string} REQUEST_PARAMS.SESSION_BLOCKED Yieldbot ads blocked by user opt-out or suspicious activity detected during session
   * @property {string} [REQUEST_PARAMS.ADAPTER_ERROR] Yieldbot error description parameter
   * @property {object} COOKIES Cookie name suffixes set by Yieldbot. See also <code>CONSTANTS.COOKIE_PREFIX</code>
   * @property {string} COOKIES.SESSION_BLOCKED The user session is blocked for bids
   * @property {string} COOKIES.SESSION_ID The user session identifier
   * @property {string} COOKIES.PAGEVIEW_DEPTH The session pageview depth
   * @property {string} COOKIES.USER_ID The Yieldbot first-party user identifier
   * @property {string} COOKIES.LAST_PAGEVIEW_ID The last pageview identifier within the session TTL
   * @property {string} COOKIES.PREVIOUS_VISIT The time in [ms] since the last visit within the session TTL
   * @property {string} COOKIES.URL_PREFIX Geo/IP proximity request Url domain
   * @private
   * @TODO Document parameter optionality for properties
   */
  CONSTANTS: {
    VERSION: 'pbjs-yb-1.0.0',
    DEFAULT_BID_REQUEST_URL_PREFIX: '//i.yldbt.com/m/',
    REQUEST_API_VERSION: '/v1',
    REQUEST_API_PATH_BID: '/init',
    REQUEST_API_PATH_CREATIVE: '/ad/creative.js',
    REQUEST_PARAMS_TERMINATOR: '&e',
    USER_ID_TIMEOUT: 2592000000,
    VISIT_ID_TIMEOUT: 2592000000,
    SESSION_ID_TIMEOUT: 180000,
    COOKIE_PREFIX: '__ybot',
    IFRAME_TYPE: {
      NONE: 'none',
      SAME_ORIGIN: 'so',
      CROSS_ORIGIN: 'co'
    },
    REQUEST_PARAMS: {
      ADAPTER_VERSION: 'v',
      USER_ID: 'vi',
      SESSION_ID: 'si',
      PAGEVIEW_ID: 'pvi',
      AD_REQUEST_ID: 'ri',
      AD_REQUEST_SLOT: 'slot',
      PAGEVIEW_DEPTH: 'pvd',
      LAST_PAGEVIEW_ID: 'lpvi',
      BID_SLOT_NAME: 'sn',
      BID_SLOT_SIZE: 'ssz',
      LOCATION: 'lo',
      REFERRER: 'r',
      SCREEN_DIMENSIONS: 'sd',
      TIMEZONE_OFFSET: 'to',
      LANGUAGE: 'la',
      NAVIGATOR_PLATFORM: 'np',
      USER_AGENT: 'ua',
      LAST_PAGEVIEW_TIME: 'lpv',
      NAVIGATION_START_TIME: 'cts_ns',
      ADAPTER_LOADED_TIME: 'cts_js',
      BID_REQUEST_TIME: 'cts_ini',
      BID_RESPONSE_TIME: 'cts_res',
      AD_REQUEST_TIME: 'cts_ad',
      AD_RENDER_TIME: 'cts_rend',
      AD_IMPRESSION_TIME: 'cts_imp',
      INTERSECTION_OBSERVER_AVAILABLE: 'ioa',
      IFRAME_TYPE: 'it',
      BID_TYPE: 'bt',
      CALLBACK: 'cb',
      MEDIA_TYPE: 'mtp',
      SESSION_BLOCKED: 'sb',
      ADAPTER_ERROR: 'apie',
      TERMINATOR: 'e'
    },
    COOKIES: {
      SESSION_BLOCKED: 'n',
      SESSION_ID: 'si',
      PAGEVIEW_DEPTH: 'pvd',
      USER_ID: 'vi',
      LAST_PAGEVIEW_ID: 'lpvi',
      PREVIOUS_VISIT: 'v',
      URL_PREFIX: 'c'
    }
  },

  /**
   * Bid mapping key to the Prebid internal bidRequestId<br>
   * Format <code>{pageview id}:{slot name}:{width}x{height}</code>
   * @typeDef {YieldbotBidRequestKey} YieldbotBidRequestKey
   * @type {string}
   * @example "jbgxsxqxyxvqm2oud7:leaderboard:728x90"
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */

  /**
   * Internal Yieldbot adapter bid and ad markup request state
   * <br>
   * When interpreting a server response, the associated requestId is lookeded up
   * in this map when creating a {@link Bid} response object.
   * @type {object}
   * @property {Object.<module:modules/YieldbotBidAdapter.YieldbotBidRequestKey, string>} {*} Yieldbot bid to requestId mapping item
   * @memberof module:modules/YieldbotBidAdapter
   * @inner
   * @private
   * @example
   * {
   *   "jbgxsxqxyxvqm2oud7:leaderboard:728x90": "2b7e31676ce17",
   *   "jbgxsxqxyxvqm2oud7:medrec:300x250": "2b7e31676cd89",
   *   "jcrvvd6eoileb8w8ko:medrec:300x250": "2b7e316788ca7"
   * }
   */
  _bidRequestParamMap: {},

  _pageviewDepth: 0,
  _isInitialized: false,
  initialize: function() {
    if (!this._isInitialized) {
      this._pageviewDepth = parseInt(this.getCookie(this.CONSTANTS.COOKIES.PAGEVIEW_DEPTH), 10) || 0;

      this._isInitialized = true;
    }
  },

  /**
   * Is the user session blocked by the Yieldbot adserver.<br>
   * The Yieldbot adserver may return <code>"block_session": true</code> in a bid response.
   * A session may be blocked for efficiency (i.e. Yieldbot has decided no to bid for the session),
   * security and/or fraud detection.
   * @returns {boolean}
   * @readonly
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */
  get isSessionBlocked() {
    const cookieName = this.CONSTANTS.COOKIE_PREFIX + this.CONSTANTS.COOKIES.SESSION_BLOCKED;
    const cookieValue = this.getCookie(cookieName);
    let sessionBlocked = cookieValue ? parseInt(cookieValue, 10) || 0 : 0;
    if (sessionBlocked) {
      this.setCookie(cookieName, 1, this.CONSTANTS.SESSION_ID_TIMEOUT, '/');
    }
    return !!sessionBlocked;
  },

  get userId() {
    const cookieName = this.CONSTANTS.COOKIE_PREFIX + this.CONSTANTS.COOKIES.USER_ID;
    let cookieValue = this.getCookie(cookieName);
    if (!cookieValue) {
      cookieValue = this.newId();
      this.setCookie(cookieName, cookieValue, this.CONSTANTS.USER_ID_TIMEOUT, '/');
    }
    return cookieValue;
  },

  get sessionId() {
    const cookieName = this.CONSTANTS.COOKIE_PREFIX + this.CONSTANTS.COOKIES.SESSION_ID;
    let cookieValue = this.getCookie(cookieName);
    if (!cookieValue) {
      cookieValue = this.newId();
      this.setCookie(cookieName, cookieValue, this.CONSTANTS.SESSION_ID_TIMEOUT, '/');
    }
    return cookieValue;
  },

  get previousVisitTime() {
    const cookieName = this.CONSTANTS.COOKIE_PREFIX + this.CONSTANTS.COOKIES.PREVIOUS_VISIT;
    let cookieValue = this.getCookie(cookieName);
    if (!cookieValue) {
      this.setCookie(cookieName, cookieValue, this.CONSTANTS.SESSION_ID_TIMEOUT, '/');
    }
    return cookieValue;
  },

  /**
   * Get/set the request base url used to form bid and ad markup requests.
   * @param {string} [prefix] the bidder request base url
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */
  urlPrefix: function(prefix) {
    const cookieName = this.CONSTANTS.COOKIE_PREFIX + this.CONSTANTS.COOKIES.URL_PREFIX;
    let cookieValue = prefix || this.getCookie(cookieName);
    if (!cookieValue) {
      cookieValue = this.CONSTANTS.DEFAULT_BID_REQUEST_URL_PREFIX;
    }
    this.setCookie(cookieName, cookieValue, this.CONSTANTS.SESSION_ID_TIMEOUT, '/');
    return cookieValue;
  },

  /**
   * @property {string} the bidder identifier code
   * @memberof module:modules/YieldbotBidAdapter
   */
  get code() { return 'yieldbot'; },

  /**
   * @property {string[]} [aliases] A list of aliases which should also resolve to this bidder.
   * @memberof module:modules/YieldbotBidAdapter
   */
  get aliases() { return []; },

  /**
   * @property {MediaType[]} [supportedMediaTypes]: A list of Media Types which the adapter supports.
   * @memberof module:modules/YieldbotBidAdapter
   */
  get supportedMediaTypes() { return ['banner']; },

  /**
   * Determines whether or not the given bid request is valid.
   *
   * @param {BidRequest} bid The bid params to validate.
   * @return boolean True if this is a valid bid, and false otherwise.
   * @memberof module:modules/YieldbotBidAdapter
   */
  isBidRequestValid: function(bid) {
    const ret = bid &&
            bid.params &&
            utils.isStr(bid.params.psn, 'String') &&
            utils.isStr(bid.params.slot, 'String') &&
            utils.isArray(bid.sizes, 'Array') &&
            !!bid.params.psn &&
      !!bid.params.slot;
    return ret;
  },

  /**
   * Make a server request from the list of BidRequests.
   *
   * @param {BidRequest[]} bidRequests A non-empty list of bid requests which should be sent to the Server.
   * @param {object} bidderRequest request containing bids ()valid or otherwise) and bidder specific info
   * @return ServerRequest Info describing the request to the server.
   * @memberof module:modules/YieldbotBidAdapter
   */
  buildRequests: function(bidRequests, bidderRequest) {
    const requests = [];
    if (!this._optOut) {
      const searchParams = this.initBidRequestParams(bidRequests);
      searchParams[this.CONSTANTS.REQUEST_PARAMS.BID_REQUEST_TIME] = Date.now();

      const pageviewId = searchParams[this.CONSTANTS.REQUEST_PARAMS.PAGEVIEW_ID];

      const yieldbotSlotParams = this.getSlotRequestParams(pageviewId, bidRequests);

      searchParams[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_NAME] =
        yieldbotSlotParams[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_NAME] || '';

      searchParams[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_SIZE] =
        yieldbotSlotParams[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_SIZE] || '';

      const bidUrl = this.CONSTANTS.DEFAULT_BID_REQUEST_URL_PREFIX +
              yieldbotSlotParams.psn +
              this.CONSTANTS.REQUEST_API_VERSION +
              this.CONSTANTS.REQUEST_API_PATH_BID;

      requests.push({
        method: 'GET',
        url: bidUrl,
        data: searchParams,
        yieldbotSlotParams: yieldbotSlotParams,
        options: {
          withCredentials: true,
          customHeaders: {
            Accept: 'application/json'
          }
        }
      });
    }

    console.log('requests', requests);
    return requests;
  },

  /**
   * Register the user sync pixels which should be dropped after the auction.
   *
   * @param {SyncOptions} syncOptions Which user syncs are allowed?
   * @param {ServerResponse[]} serverResponses List of server's responses.
   * @return {UserSync[]} The user syncs which should be dropped.
   * @memberof module:modules/YieldbotBidAdapter
   */
  getUserSyncs: function(syncOptions, serverResponses) {
    const userSyncs = [];
    /*
     {
       "user_syncs": [
         "https://idsync.rlcdn.com/456839.gif?partner_uid=vjcfdub3vzykq8tjykx"
       ]
     }
     */
    if (syncOptions.pixelEnabled && serverResponses.length > 0 && utils.isArray(serverResponses[0].body.user_syncs)) {
      const responseUserSyncs = serverResponses[0].body.user_syncs;
      responseUserSyncs.forEach((pixel) => {
        userSyncs.push({
          type: 'image',
          url: pixel
        });
      });
    }
    return userSyncs;
  },

  /**
   * Unpack the response from the server into a list of bids.
   *
   * @param {ServerResponse} serverResponse A successful response from the server.
   * @return {Bid[]} An array of bids which were nested inside the server.
   * @memberof module:modules/YieldbotBidAdapter
   */
  interpretResponse: function(serverResponse, bidRequest) {
    /*
     *
     * leaderboard:728x90
     * http://ads-adslocal.yldbt.com/m/1234/ad/creative.js?v=v2017-11-13%7Cc454d60&vi=jcrvox3iizqzlxc38k&si=jcrvtw8iy5f9xe8108&ri=jcrvvd6eoileb8w8ko&slot=leaderboard%3A728x90&pvi=jcrvvc97rt7z9ams6a&cts_res=1516726623753&cts_ad=1516726624121&ioa&it=so&e
     v:       v2017-11-13|c454d60
     vi:      jcrvox3iizqzlxc38k
     si:      jcrvtw8iy5f9xe8108
     ri:      jcrvvd6eoileb8w8ko
     slot:    leaderboard:728x90
     pvi:     jcrvvc97rt7z9ams6a
     cts_res: 1516726623753
     cts_ad:  1516726624121
     ioa:
     it:      so
     e:
     *
     */

    const bidResponses = [];
    const responseBody = serverResponse && serverResponse.body ? serverResponse.body : {};
    const slotBids = responseBody.slots && responseBody.slots.length > 0 ? responseBody.slots : null;
    const optOut = responseBody.optout || false;
    if (!optOut && slotBids) {
      const bidData = {};
      bidData[this.CONSTANTS.REQUEST_PARAMS.ADAPTER_VERSION] = this.CONSTANTS.VERSION;
      // bidData[this.CONSTANTS.REQUEST_PARAMS.MEDIA_TYPE] = 'json';
      bidData[this.CONSTANTS.REQUEST_PARAMS.USER_ID] = bidRequest.data.vi || this.CONSTANTS.VERSION + '-vi';
      bidData[this.CONSTANTS.REQUEST_PARAMS.SESSION_ID] = bidRequest.data.si || this.CONSTANTS.VERSION + '-si';
      bidData[this.CONSTANTS.REQUEST_PARAMS.PAGEVIEW_ID] = bidRequest.data.pvi || this.CONSTANTS.VERSION + '-pvi';

      slotBids.forEach((bid) => {
        const sizeParts = bid.size ? bid.size.split('x') : [1, 1];
        const width = sizeParts[0] || 1;
        const height = sizeParts[1] || 1;
        const cpm = parseInt(bid.cpm, 10) / 100.0 || 0;

        const searchParams = Object.assign({}, bidData);

        searchParams[this.CONSTANTS.REQUEST_PARAMS.AD_REQUEST_ID] = this.newId();
        searchParams[this.CONSTANTS.REQUEST_PARAMS.CALLBACK] = 'ybotCb' + this.newId();
        searchParams[this.CONSTANTS.REQUEST_PARAMS.AD_REQUEST_SLOT] = `${bid.slot}:${bid.size || '1x1'}`;
        searchParams[this.CONSTANTS.REQUEST_PARAMS.IFRAME_TYPE] = this.iframeType(window);
        searchParams[this.CONSTANTS.REQUEST_PARAMS.INTERSECTION_OBSERVER_AVAILABLE] = this.intersectionObserverAvailable(window);

        const urlPrefix = responseBody.url_prefix || this.CONSTANTS.DEFAULT_BID_REQUEST_URL_PREFIX;
        const queryString = buildQueryString(searchParams) || '';
        const yieldbotSlotParams = bidRequest.yieldbotSlotParams || null;
        const publisherNumber = yieldbotSlotParams ? yieldbotSlotParams.psn || '' : '';
        const adUrl = urlPrefix +
                publisherNumber +
                this.CONSTANTS.REQUEST_API_PATH_CREATIVE +
                '?' +
                queryString +
                this.CONSTANTS.REQUEST_PARAMS_TERMINATOR;

        const paramKey = bidData[this.CONSTANTS.REQUEST_PARAMS.PAGEVIEW_ID] +
                ':' +
                bid.slot +
                ':' +
                bid.size || '';
        const bidIdMap = yieldbotSlotParams && yieldbotSlotParams.bidIdMap ? bidRequest.yieldbotSlotParams.bidIdMap : {};
        const requestId = bidIdMap[paramKey] || '';
        const bidResponse = {
          requestId: requestId,
          cpm: cpm,
          width: width,
          height: height,
          creativeId: this.newId(),
          currency: 'USD',
          netRevenue: true,
          ttl: this.CONSTANTS.SESSION_ID_TIMEOUT / 1000, // [s]
          ad: '<div>' + adUrl + '</div>'
        };
        bidResponses.push(bidResponse);
      });
    }
    return bidResponses;
  },

  iframeType: function (win) {
    let it = this.CONSTANTS.IFRAME_TYPE.NONE;
    while (win !== window.top) {
      try {
        win = win.parent;
        const doc = win.document;
        it = doc ? this.CONSTANTS.IFRAME_TYPE.SAME_ORIGIN : this.CONSTANTS.IFRAME_TYPE.CROSS_ORIGIN;
      } catch (e) {
        it = this.CONSTANTS.IFRAME_TYPE.CROSS_ORIGIN;
      }
    }
    return it;
  },

  intersectionObserverAvailable: function (win) {
    // https://github.com/w3c/IntersectionObserver/blob/gh-pages/polyfill/intersection-observer.js#L23-L25
    return win &&
      win.IntersectionObserver &&
      win.IntersectionObserverEntry &&
      win.IntersectionObserverEntry.prototype &&
      'intersectionRatio' in win.IntersectionObserverEntry.prototype;
  },

  /**
   * @typeDef {YieldbotBidParams} YieldbotBidParams
   * @property {string} psn Yieldbot publisher customer number
   * @property {object} searchParams bid request Url search parameters
   * @property {object} searchParams.sn slot names
   * @property {object} searchParams.szz slot sizes
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */
  /**
   * Builds the Yieldbot bid request Url query parameters
   * @param {BidRequest[]} bidRequests A non-empty list of bid requests which should be sent to the Server
   * @returns {YieldbotBidParams} query parameter key/value object
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */
  initBidRequestParams: function(bidRequests) {
    /*
     v=v2017-11-13%7Cc454d60
     vi=jb40ztc9qjst7opy
     si=jbgxsxqyssuisp5wi6
     pvi=jbgxsxqxyxvqm2oud7
     pvd=1
     sn=medrec%7Cleaderboard
     ssz=300x250.300x600%7C728x90
     lo=http%3A//localhost%3A8084/pubfood/examples/provider/bid/yieldbot/yieldbot-ex1.html
     r=
     sd=2560x1440
     to=5
     la=en-US
     np=MacIntel
     ua=Mozilla/5.0%20%28Macintosh%3B%20Intel%20Mac%20OS%20X%2010_12_6%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/63.0.3239.108%20Safari/537.36
     lpv=3666894
     cts_ns=1513887959303
     cts_js=1513887959761
     cts_ini=1513887959774
     e
     */
    const params = {};

    params[this.CONSTANTS.REQUEST_PARAMS.ADAPTER_LOADED_TIME] = this._adapterLoaded;
    params[this.CONSTANTS.REQUEST_PARAMS.NAVIGATION_START_TIME] = this._navigationStart;
    params[this.CONSTANTS.REQUEST_PARAMS.ADAPTER_VERSION] = this.CONSTANTS.VERSION;

    const userId = this.userId;
    const sessionId = this.sessionId;
    const pageviewId = this.newId();
    params[this.CONSTANTS.REQUEST_PARAMS.USER_ID] = userId;
    params[this.CONSTANTS.REQUEST_PARAMS.SESSION_ID] = sessionId;
    params[this.CONSTANTS.REQUEST_PARAMS.PAGEVIEW_DEPTH] = this._pageviewDepth + 1;
    params[this.CONSTANTS.REQUEST_PARAMS.PAGEVIEW_ID] = pageviewId;

    params[this.CONSTANTS.REQUEST_PARAMS.USER_AGENT] = navigator.userAgent;
    params[this.CONSTANTS.REQUEST_PARAMS.NAVIGATOR_PLATFORM] = navigator.platform;
    params[this.CONSTANTS.REQUEST_PARAMS.LANGUAGE] = navigator.browserLanguage ? navigator.browserLanguage : navigator.language;
    params[this.CONSTANTS.REQUEST_PARAMS.TIMEZONE_OFFSET] = (new Date()).getTimezoneOffset() / 60;
    params[this.CONSTANTS.REQUEST_PARAMS.SCREEN_DIMENSIONS] = window.screen.width + 'x' + window.screen.height;

    params[this.CONSTANTS.REQUEST_PARAMS.LOCATION] = utils.getTopWindowUrl();
    params[this.CONSTANTS.REQUEST_PARAMS.REFERRER] = utils.getTopWindowReferrer();

    params[this.CONSTANTS.REQUEST_PARAMS_TERMINATOR] = '';

    return params;
  },

  /**
   * @typeDef {YieldbotBidSlots} YieldbotBidSlots
   * @property {string} psn Yieldbot publisher site identifier taken from bidder params
   * @property {string} sn slot names
   * @property {string} szz slot sizes
   * @property {object} bidIdMap Yieldbot bid to Prebid bidId mapping
   * @memberof module:modules/YieldbotBidAdapter
   *
  /**
   * Gets unique slot name and sizes for query parameters object
   * @param {BidRequest[]} bidRequests A non-empty list of bid requests which should be sent to the Server
   * @returns {YieldbotBidSlots} publisher identifier and slots to bid on
   * @memberof module:modules/YieldbotBidAdapter
   */
  getSlotRequestParams: function(pageviewId, bidRequests) {
    const params = {};
    const bidIdMap = {};
    bidRequests = bidRequests || [];
    pageviewId = pageviewId || '';
    try {
      const slotBids = {};
      bidRequests.forEach((bid) => {
        slotBids[bid.params.slot] = slotBids[bid.params.slot] || [];
        params.psn = params.psn || bid.params.psn || '';
        utils.parseSizesInput(bid.sizes).forEach(sz => {
          const slotName = bid.params.slot;
          if (!slotBids[slotName].some(existingSize => existingSize === sz)) {
            slotBids[bid.params.slot].push(sz);
            const paramKey = pageviewId + ':' + slotName + ':' + sz;
            this._bidRequestParamMap[paramKey] = bid.bidId;
            bidIdMap[paramKey] = bid.bidId;
          }
        });
      });

      const nm = [];
      const sz = [];
      for (let idx in slotBids) {
        const slotName = idx;
        const slotSizes = slotBids[idx];
        nm.push(slotName);
        sz.push(slotSizes.join('.'));
      }
      params[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_NAME] = nm.join('|');
      params[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_SIZE] = sz.join('|');

      params.bidIdMap = bidIdMap;
    } catch (err) {}
    return params;
  },

  cookiesEnabled: function() { return true; },
  getCookie: function(name) {
    const cookies = document.cookie.split(';');
    let value = null;
    for (let idx = 0; idx < cookies.length; idx++) {
      const item = cookies[idx].split('=');
      const itemName = item[0].replace(/^\s+|\s+$/g, '');
      if (itemName == name) {
        value = item.length > 1 ? decodeURIComponent(item[1].replace(/^\s+|\s+$/g, '')) : null;
        break;
      }
    }
    return value;
  },
  setCookie: function(name, value, expireMillis, path, domain, secure) {
    const expireTime = expireMillis ? new Date(Date.now() + expireMillis).toGMTString() : '';
    const dataValue = encodeURIComponent(value);
    const docLocation = path || '';
    const pageDomain = domain || '';
    const httpsOnly = secure ? ';secure' : '';

    const cookieStr = `${name}=${dataValue};expires=${expireTime};path=${docLocation};domain=${pageDomain}${httpsOnly}`;
    document.cookie = cookieStr;
  },
  deleteCookie: function(name, path, domain, secure) {
    return this.setCookie(name, '', -1, path, domain, secure);
  },
  /**
   * Generate a new Yieldbot format id<br>
   * Base 36 and lowercase: <[ms] since epoch><[base36]{10}>
   * @example "jbgxsyrlx9fxnr1hbl"
   * @private
   */
  newId: function() {
    return (+new Date()).toString(36) + 'xxxxxxxxxx'
      .replace(/[x]/g, function() {
        return (0 | Math.random() * 36).toString(36);
      });
  },

  /**
   * Create a delegate function with 'this' context of the YieldbotAdapter object.
   * @param {Object} instance Object for 'this' context in function apply
   * @param {Function} fn Function to execute in instance context
   * @memberof module:modules/YieldbotBidAdapter
   */
  createDelegate: function(instance, fn) {
    var outerArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      return fn.apply(instance, outerArgs.length > 0 ? Array.prototype.slice.call(arguments, 0).concat(outerArgs) : arguments);
    };
  }
};

YieldbotAdapter.initialize();

export const spec = {
  code: YieldbotAdapter.code,
  aliases: YieldbotAdapter.aliases,
  supportedMediaTypes: YieldbotAdapter.supportedMediaTypes,
  isBidRequestValid: YieldbotAdapter.createDelegate(YieldbotAdapter, YieldbotAdapter.isBidRequestValid),
  buildRequests: YieldbotAdapter.createDelegate(YieldbotAdapter, YieldbotAdapter.buildRequests),
  interpretResponse: YieldbotAdapter.createDelegate(YieldbotAdapter, YieldbotAdapter.interpretResponse),
  getUserSyncs: YieldbotAdapter.createDelegate(YieldbotAdapter, YieldbotAdapter.getUserSyncs)
};

YieldbotAdapter._navigationStart = Date.now();
registerBidder(spec);
