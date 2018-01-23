import * as utils from 'src/utils';
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
   * @property {number} USER_ID_TIMEOUT
   * @property {number} VISIT_ID_TIMEOUT
   * @property {number} SESSION_ID_TIMEOUT
   * @property {string} REQUEST_PARAMS Request Url query parameter names
   * @property {string} REQUEST_PARAMS.ADAPTER_VERSION The version of the YieldbotAdapter code. See [VERSION]{@link module:modules/YieldbotBidAdapter.CONSTANTS}.
   * @property {string} REQUEST_PARAMS.USER_ID First party user identifier
   * @property {string} REQUEST_PARAMS.SESSION_ID Publisher site visit session identifier
   * @property {string} REQUEST_PARAMS.PAGEVIEW_ID Page visit identifier
   * @property {string} REQUEST_PARAMS.AD_REQUEST_ID Yieldbot ad request identifier
   * @property {string} REQUEST_PARAMS.AD_REQUEST_SLOT Yieldbot ad markup request slot name <pre>&lt;slot name&gt;:&lt;width&gt;x&lt;height&gt;</pre>
   * @property {string} REQUEST_PARAMS.PAGEVIEW_DEPTH Counter for page visits in a session
   * @property {string} REQUEST_PARAMS.BID_SLOT_NAME Yieldbot slot name to request bid for
   * @property {string} REQUEST_PARAMS.BID_SLOT_SIZE Dimensions for the respective bid slot name
   * @property {string} REQUEST_PARAMS.LOCATION The page visit location Url
   * @property {string} REQUEST_PARAMS.SCREEN_DIMENSIONS User-agent screen dimensions
   * @property {string} REQUEST_PARAMS.TIMEZONE_OFFSET Number of hours offset from UTC
   * @property {string} REQUEST_PARAMS.LANGUAGE Language and locale of the user-agent
   * @property {string} REQUEST_PARAMS.NAVIGATION_PLATFORM User-agent browsing platform
   * @property {string} REQUEST_PARAMS.USER_AGENT User-Agent string
   * @property {string} REQUEST_PARAMS.NAVIGATION_START_TIME Performance timing navigationStart
   * @property {string} REQUEST_PARAMS.ADAPTER_LOADED_TIME Adapter code interpreting started timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.BID_REQUEST_TIME Yieldbot bid request sent timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.BID_RESPONSE_TIME Yieldbot bid response processing started timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.AD_REQUEST_TIME Yieldbot ad creative request sent timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.AD_RENDER_TIME Yieldbot ad creative render started timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.AD_IMPRESSION_TIME Yieldbot ad impression rerquest sent  timestamp, in milliseconds since the UNIX epoch
   * @property {string} REQUEST_PARAMS.END_REQUEST_PARAMS Yieldbot request query parameters termination character
   * @property {string} REQUEST_PARAMS.SESSION_BLOCKED Yieldbot ads blocked by user opt-out or suspicious activity detected during session
   * @property {string} [REQUEST_PARAMS.BID_TYPE] Yieldbot bid request type: initial or refresh
   * @property {string} [REQUEST_PARAMS.LAST_PAGEVIEW_ID] Last Yieldbot page visit identifier
   * @property {string} [REQUEST_PARAMS.LAST_PAGEVIEW_TIME] Time in milliseconds since the last page visit
   * @property {string} [REQUEST_PARAMS.REFERRER] URI of the page that linked to respective page visit location and identifier
   * @property {string} [REQUEST_PARAMS.INTERSECTION_OBSERVER_AVAILABLE] Indicator that the user-agent supports the Intersection Observer API
   * @property {string} [REQUEST_PARAMS.IFRAME_TYPE] Indicator to specify Yieldbot creative rendering occured in a same (<code>so</code>) or cross (<code>co</code>) origin iFrame
   * @property {string} [REQUEST_PARAMS.ADAPTER_ERROR] Yieldbot error description parameter
   * @private
   * @TODO optional properties
   */
  CONSTANTS: {
    VERSION: 'pbjs-1.0.0',
    DEFAULT_BID_REQUEST_URL_PREFIX: '//i.yldbt.com/m/',
    REQUEST_API_VERSION: 'v1',
    SESSION_ID_TIMEOUT: 180000,
    USER_ID_TIMEOUT: 2592000000,
    VISIT_ID_TIMEOUT: 2592000000,
    COOKIE_PREFIX: '__ybot',
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
      NAVIGATION_START: 'cts_ns',
      ADAPTER_LOADED_TIME: 'cts_js',
      BID_REQUEST_TIME: 'cts_ini',
      BID_RESPONSE_TIME: 'cts_res',
      AD_REQUEST_TIME: 'cts_ad',
      AD_RENDER_TIME: 'cts_rend',
      AD_IMPRESSION_TIME: 'cts_imp',
      ADAPTER_ERROR: 'apie',
      INTERSECTION_OBSERVER_AVAILABLE: 'ioa',
      IFRAME_TYPE: 'it',
      SESSION_BLOCKED: 'sb',
      BID_TYPE: 'bt',
      TERMINATOR: 'e'
    },
    COOKIES: {
      SESSION_BLOCKED: 'n',
      SESSION_ID: 's',
      USER_ID: 'u',
      PREVIOUS_VISIT: 'v'
    }
  },

  /**
   * @typeDef {YieldbotBidState} YieldbotBidState
   * @property {string} userId
   * @property {string} sessionId
   * @property {string} pageviewId
   * @property {number} sessionDepth
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */
  /**
   * Internal Yieldbot adapter bid and ad markup request state
   * @property {Object.<string, module:modules/YieldbotBidAdapter.YieldbotBidState>} {*} the ad/bid identifier
   * @memberof module:modules/YieldbotBidAdapter
   * @inner
   * @private
   * @example
   {
     "2b7e31676ce17": {
       "userId": "jcfdub4tu6t0zags",
       "sessionId": "jcfdub3vzykq8tjykx",
       "pageviewId": "jbgxsxqxyxvqm2oud7",
       "sessionDepth": 1
     }
   }
   */
  bidRequestData: {},

  _isInitialized: false,
  initialize: function() {
    if (!this._isInitialized) {




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
    console.log('buildRequests', bidRequests);
    const requests = [];
    if (!this._optOut) {
      const requestParams = this.buildBidRequestParams(bidRequests);
      requestParams[this.CONSTANTS.REQUEST_PARAMS.BID_REQUEST_TIME] = Date.now();
      requests.push({
        method: 'GET',
        url: 'http://localhost:8087/frotz-mumble.json', // build Url with prefix constant and psn
        data: requestParams,
        bidRequests: bidRequests
      });
    }
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

    /** @TODO formalize user sync iframe html src
     if (syncOptions.iframeEnabled) {
     userSyncs.push({
     type: 'iframe',
     url: '//cdn.yldbt.com/js/yb_usersync.html'
     });
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
     {
       "errors": [],
       "warnings": [],
       "pvi": "jcj55dnwg9urszzf23",
       "optout": false,
       "block_session": false,
       "subdomain_iframe": "ads-adseast-vpc",
       "url_prefix": "http://ads-adseast-vpc.yldbt.com/m/",
       "slots": [{
         "slot": "medrec",
         "size": "300x250",
         "cpm": "300"
       }],
       "third_party_keys": {
         "hashed_ip": "5f04a50d0df1bf6e20d47bad464b8442",
         "vi": "jcfdub3vzykq8tjykx",
         "uuid": "jcfdub4tu6t0zags"
       },
       "user_syncs": [
         "https://idsync.rlcdn.com/456839.gif?partner_uid=vjcfdub3vzykq8tjykx"
       ]
     }
    */

    /*
     * Yieldbot bidRequestData
     {
       "2b7e31676ce17": {
         "userId": "jcfdub4tu6t0zags",
         "sessionId": "jcfdub3vzykq8tjykx",
         "pageviewId": "jbgxsxqxyxvqm2oud7",
         "sessionDepth": 1
       }
     }
     */

    /*
     * medrec:300x250
     * http://ads-adslocal.yldbt.com/m/1234/ad/creative.js?v=v2017-11-13%7Cc454d60&vi=jcrvox3iizqzlxc38k&si=jcrvtw8iy5f9xe8108&ri=jcrvvd59iqu2mgcfan&slot=medrec%3A300x250&pvi=jcrvvc97rt7z9ams6a&cts_res=1516726623753&cts_ad=1516726624080&ioa&it=so&e

     v:       v2017-11-13|c454d60
     vi:      jcrvox3iizqzlxc38k
     si:      jcrvtw8iy5f9xe8108
     ri:      jcrvvd59iqu2mgcfan
     slot:    medrec:300x250
     pvi:     jcrvvc97rt7z9ams6a
     cts_res: 1516726623753
     cts_ad:  1516726624080
     ioa:
     it:      so
     e:

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

    // const serverBody = serverResponse.body;
    // const headerValue = serverResponse.headers.get('some-response-header')

    console.log('interpretResponse.serverResponse.body:', serverResponse.body);
    console.log('interpretResponse.bidRequest:', bidRequest);

    const optOut = serverResponse.optout || false;
    const bidResponses = [];
    if (!optOut) {
      const slotBids = serverResponse.body && serverResponse.body.slots ? serverResponse.body.slots : [];
      slotBids.forEach((bid) => {
        const slot = bid.slot;
        const size = bid.size;
        const cpm = bid.cpm;

        const bidResponse = {
          requestId: bidRequest.bidRequests[0].bidId,
          cpm: 2,
          width: 250,
          height: 300,
          creativeId: this.newId(),
          currency: 'USD',
          netRevenue: true,
          ttl: 180, // [s]
          //ad: '<h2>It works...</h2><div style="background: lemonchiffon;"><p>However, HTML needs viewability script and pixel call</p><p>Preference would be to have a GET request in both <code>ad:</code> and <code>adUrl:</code> cases return the <code>&lt;html&gt;</code> element containing all parts of the creative including scripts.</p></div>'
          adUrl: 'http://localhost:8087/yb-creative.html'
        };
        bidResponses.push(bidResponse);
      });
    }
    return bidResponses;
  },

  /**
   * Builds the Yieldbot bid request Url query parameters
   * @param {BidRequest[]} bidRequests A non-empty list of bid requests which should be sent to the Server
   * @returns {object} query parameter key/value object
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */
  buildBidRequestParams: function(bidRequests) {
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
    params[this.CONSTANTS.REQUEST_PARAMS.NAVIGATION_START] = this._navigationStart;
    params[this.CONSTANTS.REQUEST_PARAMS.BID_REQUEST_TIME] = Date.now(); // reset in buildRequests

    params[this.CONSTANTS.REQUEST_PARAMS.ADAPTER_VERSION] = this.CONSTANTS.VERSION;

    const userId = this.userId;
    const sessionId = this.sessionId;
    const pageviewId = this.newId();
    params[this.CONSTANTS.REQUEST_PARAMS.USER_ID] = userId;
    params[this.CONSTANTS.REQUEST_PARAMS.SESSION_ID] = sessionId;
    params[this.CONSTANTS.REQUEST_PARAMS.PAGEVIEW_ID] = pageviewId;
    /*
     * Yieldbot bidRequestData
     {
       "2b7e31676ce17": {
         "userId": "jcfdub4tu6t0zags",
         "sessionId": "jcfdub3vzykq8tjykx",
         "pageviewId": "jbgxsxqxyxvqm2oud7",
         "sessionDepth": 1
       }
     }
     */
    const slotSizesParams = this._getUniqueSlotSizes(bidRequests);
    params[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_NAME] = slotSizesParams[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_NAME] || '';
    params[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_SIZE] = slotSizesParams[this.CONSTANTS.REQUEST_PARAMS.BID_SLOT_SIZE] || '';

    params[this.CONSTANTS.REQUEST_PARAMS.USER_AGENT] = navigator.userAgent;
    params[this.CONSTANTS.REQUEST_PARAMS.NAVIGATOR_PLATFORM] = navigator.platform;
    params[this.CONSTANTS.REQUEST_PARAMS.LANGUAGE] = navigator.browserLanguage ? navigator.browserLanguage : navigator.language;
    params[this.CONSTANTS.REQUEST_PARAMS.TIMEZONE_OFFSET] = (new Date()).getTimezoneOffset() / 60;
    params[this.CONSTANTS.REQUEST_PARAMS.SCREEN_DIMENSIONS] = `${window.screen.width}x${window.screen.height}`;

    params[this.CONSTANTS.REQUEST_PARAMS.LOCATION] = utils.getTopWindowUrl();
    params[this.CONSTANTS.REQUEST_PARAMS.REFERRER] = utils.getTopWindowReferrer();

    params[this.CONSTANTS.REQUEST_PARAMS.TERMINATOR] = '';
    return params;
  },

  /**
   * Gets unique slot name and sizes for query parameters object
   * @param {BidRequest[]} bidRequests A non-empty list of bid requests which should be sent to the Server
   * @returns {object} query parameters object <code>{sn: '', ssz: ''}</code>
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */
  _getUniqueSlotSizes: function(bidRequests) {
    const params = {};
    try {
      const slotBids = {};
      bidRequests.forEach((bid) => {
        slotBids[bid.params.slot] = slotBids[bid.params.slot] || [];
        utils.parseSizesInput(bid.sizes).forEach(sz => {
          if (!slotBids[bid.params.slot].some(existingSize => existingSize === sz)) {
            slotBids[bid.params.slot].push(sz);
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
    } catch (err) {}
    return params;
  },

  /**
   * Builds the Yieldbot creative tag html.
   *
   * @param {String} slot Slot name
   * @param {String} size Dimensions of the slot
   * @memberof module:modules/YieldbotBidAdapter
   * @private
   */
  buildCreative: function (slot, size) {
    // http://ads-adseast-vpc.yldbt.com/m/1234/ad/creative.js?
    // v=v2017-11-13%7Cc454d60&
    // vi=jb40ztc9qjst7opy&
    // si=jbgxsxqyssuisp5wi6&
    // ri=jbgxsyrlx9fxnr1hbl&
    // slot=medrec%3A300x250&
    // pvi=jbgxsxqxyxvqm2oud7&
    // cts_res=1513887960749&
    // cts_ad=1513887961090&
    // ioa&
    // it=so&
    // e

    // https://ads-adslocal.yldbt.com/m/bfec/ad/impression.gif
    // v:v2017-11-13|c454d60
    // vi:jbdtnyx1fot1e25buv
    // si:jbwykoijzma0cyxitf
    // pvi:jbwyn7zpmvaf8nmt99
    // ri:jbwyn85fe0izcf5as9
    // cts_rend:1514856831994
    // cts_imp:1514856832018
    // e:
    return '<script type="text/javascript" src="//cdn.yldbt.com/js/yieldbot.intent.js"></script>' +
      '<script type="text/javascript">var ybotq = ybotq || [];' +
      'ybotq.push(function () {yieldbot.renderAd(\'' + slot + ':' + size + '\');});</script>';
  },

  hasLocalStorage: function() { return true; },
  cookiesEnabled: function() { return true; },
  getCookie: function(name) {
    const cookies = document.cookie.split(';');
    let value = null;
    for (let idx = 0; idx < cookies.length; idx++) {
      const item = cookies[idx].split('=');
      const itemName = item[0].replace(/^\s+|\s+$/g, '');
      if (itemName == name) {
        value = item.length > 1 ? item[1].replace(/^\s+|\s+$/g, '') : null;
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
  interpretResponse: YieldbotAdapter.createDelegate(YieldbotAdapter, YieldbotAdapter.interpretResponse)
};

YieldbotAdapter._navigationStart = Date.now();
registerBidder(spec);
