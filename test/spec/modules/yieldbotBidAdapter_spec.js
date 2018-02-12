import { expect } from 'chai';
import find from 'core-js/library/fn/array/find';
import { newBidder } from 'src/adapters/bidderFactory';
import AdapterManager from 'src/adaptermanager';
import { auctionManager } from 'src/auctionManager';
import * as utils from 'src/utils';
import * as urlUtils from 'src/url';
import events from 'src/events';
import { YieldbotAdapter, spec } from 'modules/yieldbotBidAdapter';

before(function() {
  YieldbotAdapter.clearAllCookies();
});
describe('Yieldbot Adapter Unit Tests', function() {
  const ALL_SEARCH_PARAMS = ['apie', 'bt', 'cb', 'cts_ad', 'cts_imp', 'cts_ini', 'cts_js', 'cts_ns', 'cts_rend', 'cts_res', 'e', 'ioa', 'it', 'la', 'lo', 'lpv', 'lpvi', 'mtp', 'np', 'pvd', 'pvi', 'r', 'ri', 'sb', 'sd', 'si', 'slot', 'sn', 'ssz', 'to', 'ua', 'v', 'vi'];

  const BID_LEADERBOARD_728x90 = {
    bidder: 'yieldbot',
    params: {
      psn: '1234',
      slot: 'leaderboard'
    },
    adUnitCode: '/0000000/leaderboard',
    transactionId: '3bcca099-e22a-4e1e-ab60-365a74a87c19',
    sizes: [728, 90],
    bidId: '2240b2af6064bb',
    bidderRequestId: '1e878e3676fb85',
    auctionId: 'c9964bd5-f835-4c91-916e-00295819f932'
  };

  const BID_MEDREC_300x600 = {
    bidder: 'yieldbot',
    params: {
      psn: '1234',
      slot: 'medrec'
    },
    adUnitCode: '/0000000/side-bar',
    transactionId: '3bcca099-e22a-4e1e-ab60-365a74a87c20',
    sizes: [300, 600],
    bidId: '332067957eaa33',
    bidderRequestId: '1e878e3676fb85',
    auctionId: 'c9964bd5-f835-4c91-916e-00295819f932'
  };

  const BID_MEDREC_300x250 = {
    bidder: 'yieldbot',
    params: {
      psn: '1234',
      slot: 'medrec'
    },
    adUnitCode: '/0000000/medrec',
    transactionId: '3bcca099-e22a-4e1e-ab60-365a74a87c21',
    sizes: [[300, 250]],
    bidId: '49d7fe5c3a15ed',
    bidderRequestId: '1e878e3676fb85',
    auctionId: 'c9964bd5-f835-4c91-916e-00295819f932'
  };

  const BID_SKY160x600 = {
    bidder: 'yieldbot',
    params: {
      psn: '1234',
      slot: 'skyscraper'
    },
    adUnitCode: '/0000000/side-bar',
    transactionId: '3bcca099-e22a-4e1e-ab60-365a74a87c21',
    sizes: [160, 600],
    bidId: '49d7fe5c3a16ee',
    bidderRequestId: '1e878e3676fb85',
    auctionId: 'c9964bd5-f835-4c91-916e-00295819f932'
  };

  const AD_UNITS = [
    {
      transactionId: '3bcca099-e22a-4e1e-ab60-365a74a87c19',
      code: '/00000000/leaderboard',
      sizes: [728, 90],
      bids: [
        {
          bidder: 'yieldbot',
          params: {
            psn: '1234',
            slot: 'leaderboard'
          }
        }
      ]
    },
    {
      transactionId: '3bcca099-e22a-4e1e-ab60-365a74a87c20',
      code: '/00000000/medrec',
      sizes: [[300, 250]],
      bids: [
        {
          bidder: 'yieldbot',
          params: {
            psn: '1234',
            slot: 'medrec'
          }
        }
      ]
    },
    {
      transactionId: '3bcca099-e22a-4e1e-ab60-365a74a87c21',
      code: '/00000000/multi-size',
      sizes: [[300, 600]],
      bids: [
        {
          bidder: 'yieldbot',
          params: {
            psn: '1234',
            slot: 'medrec'
          }
        }
      ]
    },
    {
      transactionId: '3bcca099-e22a-4e1e-ab60-365a74a87c22',
      code: '/00000000/skyscraper',
      sizes: [[160, 600]],
      bids: [
        {
          bidder: 'yieldbot',
          params: {
            psn: '1234',
            slot: 'skyscraper'
          }
        }
      ]
    }
  ];

  const INTERPRET_RESPONSE_BID_REQUEST = {
    method: 'GET',
    url: '//i.yldbt.com/m/1234/v1/init',
    data: {
      cts_js: 1518184900582,
      cts_ns: 1518184900582,
      v: 'pbjs-yb-1.0.0',
      vi: 'jdg00eijgpvemqlz73',
      si: 'jdg00eil9y4mcdo850',
      pvd: 6,
      pvi: 'jdg03ai5kp9k1rkheh',
      lpv: 1518184868108,
      lpvi: 'jdg02lfwmdx8n0ncgc',
      bt: 'init',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
      np: 'MacIntel',
      la: 'en-US',
      to: 5,
      sd: '2560x1440',
      lo: 'http://localhost:9999/test/spec/e2e/gpt-examples/gpt_yieldbot.html',
      r: '',
      e: '',
      sn: 'leaderboard|medrec|medrec|skyscraper',
      ssz: '728x90|300x250|300x600|160x600',
      cts_ini: 1518184900591
    },
    yieldbotSlotParams: {
      psn: '1234',
      sn: 'leaderboard|medrec|medrec|skyscraper',
      ssz: '728x90|300x250|300x600|160x600',
      bidIdMap: {
        'jdg03ai5kp9k1rkheh:leaderboard:728x90': '2240b2af6064bb',
        'jdg03ai5kp9k1rkheh:medrec:300x250': '49d7fe5c3a15ed',
        'jdg03ai5kp9k1rkheh:medrec:300x600': '332067957eaa33',
        'jdg03ai5kp9k1rkheh:skyscraper:160x600': '49d7fe5c3a16ee'
      }
    },
    options: {
      withCredentials: true,
      customHeaders: {
        Accept: 'application/json'
      }
    }
  };

  const INTERPRET_RESPONSE_SERVER_RESPONSE = {
    body: {
      pvi: 'jdg03ai5kp9k1rkheh',
      subdomain_iframe: 'ads-adseast-vpc',
      url_prefix: 'http://ads-adseast-vpc.yldbt.com/m/',
      slots: [
        {
          slot: 'leaderboard',
          cpm: '800',
          size: '728x90'
        },
        {
          slot: 'medrec',
          cpm: '300',
          size: '300x250'
        },
        {
          slot: 'medrec',
          cpm: '800',
          size: '300x600'
        },
        {
          slot: 'skyscraper',
          cpm: '300',
          size: '160x600'
        }
      ],
      user_syncs: [
        'https://usersync.dd9693a32aa1.com/00000000.gif?p=a',
        'https://usersync.3b19503b37d8.com/00000000.gif?p=b',
        'https://usersync.5cb389d36d30.com/00000000.gif?p=c'
      ]
    },
    headers: {}
  };

  let FIXTURE_AD_UNITS, FIXTURE_SERVER_RESPONSE, FIXTURE_BID_REQUEST, FIXTURE_BID_REQUESTS, FIXTURE_BIDS;
  beforeEach(function() {
    FIXTURE_AD_UNITS = utils.deepClone(AD_UNITS);
    FIXTURE_BIDS = {
      BID_LEADERBOARD_728x90: utils.deepClone(BID_LEADERBOARD_728x90),
      BID_MEDREC_300x600: utils.deepClone(BID_MEDREC_300x600),
      BID_MEDREC_300x250: utils.deepClone(BID_MEDREC_300x250),
      BID_SKY160x600: utils.deepClone(BID_SKY160x600)
    };

    FIXTURE_BID_REQUEST = utils.deepClone(INTERPRET_RESPONSE_BID_REQUEST);
    FIXTURE_SERVER_RESPONSE = utils.deepClone(INTERPRET_RESPONSE_SERVER_RESPONSE);
    FIXTURE_BID_REQUESTS = [
      FIXTURE_BIDS.BID_LEADERBOARD_728x90,
      FIXTURE_BIDS.BID_MEDREC_300x600,
      FIXTURE_BIDS.BID_MEDREC_300x250,
      FIXTURE_BIDS.BID_SKY160x600
    ];
  });

  afterEach(function() {
    YieldbotAdapter._optOut = false;
    YieldbotAdapter.clearAllCookies();
  });

  describe('Adapter exposes BidderSpec API', function() {
    it('code', function() {
      expect(spec.code).to.equal('yieldbot');
    });
    it('supportedMediaTypes', function() {
      expect(spec.supportedMediaTypes).to.deep.equal(['banner']);
    });
    it('isBidRequestValid', function() {
      expect(spec.isBidRequestValid).to.be.a('function');
    });
    it('buildRequests', function() {
      expect(spec.buildRequests).to.be.a('function');
    });
    it('interpretResponse', function() {
      expect(spec.interpretResponse).to.be.a('function');
    });
  });

  describe('CONSTANTS.REQUEST_PARAMS', function() {
    it('should have all request search params defined and no more', function() {
      const requestParamsValues = utils.getKeys(YieldbotAdapter.CONSTANTS.REQUEST_PARAMS)
        .map(key => utils.getValue(YieldbotAdapter.CONSTANTS.REQUEST_PARAMS, key));
      expect(Object.values(requestParamsValues.sort())).to.deep.equal(ALL_SEARCH_PARAMS.sort());
    });
  });
  describe('isBidRequestValid', function() {
    let bid = {
      bidder: 'yieldbot',
      'params': {
        psn: 'foo',
        slot: 'bar'
      },
      sizes: [[300, 250], [300, 600]]
    };

    it('valid parameters', function() {
      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          psn: 'foo',
          slot: 'bar'
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(true);
    });

    it('undefined parameters', function() {
      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(false);

      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          psn: 'foo'
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(false);

      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          slot: 'bar'
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(false);
    });

    it('falsey string parameters', function() {
      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          psn: '',
          slot: 'bar'
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(false);

      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          psn: 'foo',
          slot: ''
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(false);

      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          psn: 'foo',
          slot: 0
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(false);
    });

    it('parameters type invalid', function() {
      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          psn: 'foo',
          slot: 0
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(false);

      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          psn: { name: 'foo' },
          slot: 'bar'
        },
        sizes: [[300, 250], [300, 600]]
      })).to.equal(false);
    });

    it('invalid sizes type', function() {
      expect(spec.isBidRequestValid({
        bidder: 'yieldbot',
        'params': {
          psn: 'foo',
          slot: 'bar'
        },
        sizes: {}
      })).to.equal(true);
    });
  });

  describe('getSlotRequestParams', function() {
    const EMPTY_SLOT_PARAMS = { sn: '', ssz: '', bidIdMap: {} };

    it('should default to empty slot params', function() {
      expect(YieldbotAdapter.getSlotRequestParams('')).to.deep.equal(EMPTY_SLOT_PARAMS);
      expect(YieldbotAdapter.getSlotRequestParams()).to.deep.equal(EMPTY_SLOT_PARAMS);
      expect(YieldbotAdapter.getSlotRequestParams('', [])).to.deep.equal(EMPTY_SLOT_PARAMS);
      expect(YieldbotAdapter.getSlotRequestParams(0, [])).to.deep.equal(EMPTY_SLOT_PARAMS);
    });

    it('should build slot bid request parameters', function() {
      const bidRequests = [
        FIXTURE_BIDS.BID_LEADERBOARD_728x90,
        FIXTURE_BIDS.BID_MEDREC_300x600,
        FIXTURE_BIDS.BID_MEDREC_300x250
      ];
      const slotParams = YieldbotAdapter.getSlotRequestParams('f0e1d2c', bidRequests);

      expect(slotParams.psn).to.equal('1234');
      expect(slotParams.sn).to.equal('leaderboard|medrec');
      expect(slotParams.ssz).to.equal('728x90|300x600.300x250');

      let bidId = slotParams.bidIdMap['f0e1d2c:leaderboard:728x90'];
      expect(bidId).to.equal('2240b2af6064bb');

      bidId = slotParams.bidIdMap['f0e1d2c:medrec:300x250'];
      expect(bidId).to.equal('49d7fe5c3a15ed');

      bidId = slotParams.bidIdMap['f0e1d2c:medrec:300x600'];
      expect(bidId).to.equal('332067957eaa33');
    });

    it('should build slot bid request parameters in order of bidRequests', function() {
      const bidRequests = [
        FIXTURE_BIDS.BID_MEDREC_300x600,
        FIXTURE_BIDS.BID_LEADERBOARD_728x90,
        FIXTURE_BIDS.BID_MEDREC_300x250
      ];

      const slotParams = YieldbotAdapter.getSlotRequestParams('f0e1d2c', bidRequests);

      expect(slotParams.psn).to.equal('1234');
      expect(slotParams.sn).to.equal('medrec|leaderboard');
      expect(slotParams.ssz).to.equal('300x600.300x250|728x90');

      let bidId = slotParams.bidIdMap['f0e1d2c:leaderboard:728x90'];
      expect(bidId).to.equal('2240b2af6064bb');

      bidId = slotParams.bidIdMap['f0e1d2c:medrec:300x250'];
      expect(bidId).to.equal('49d7fe5c3a15ed');

      bidId = slotParams.bidIdMap['f0e1d2c:medrec:300x600'];
      expect(bidId).to.equal('332067957eaa33');
    });

    it('should exclude slot bid requests with malformed sizes', function() {
      const bid = FIXTURE_BIDS.BID_MEDREC_300x250;
      bid.sizes = ['300x250'];
      const bidRequests = [bid, FIXTURE_BIDS.BID_LEADERBOARD_728x90];
      const slotParams = YieldbotAdapter.getSlotRequestParams('affffffe', bidRequests);
      expect(slotParams.psn).to.equal('1234');
      expect(slotParams.sn).to.equal('leaderboard');
      expect(slotParams.ssz).to.equal('728x90');
    });
  });

  describe('getCookie', function() {
    it('should return null if cookie name not found', function() {
      const cookieName = YieldbotAdapter.newId();
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });
  });

  describe('setCookie', function() {
    it('should set a root path first-party cookie with temporal expiry', function() {
      const cookieName = YieldbotAdapter.newId();
      const cookieValue = YieldbotAdapter.newId();

      YieldbotAdapter.setCookie(cookieName, cookieValue, YieldbotAdapter.CONSTANTS.USER_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(cookieValue);

      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should set a root path first-party cookie with session expiry', function() {
      const cookieName = YieldbotAdapter.newId();
      const cookieValue = YieldbotAdapter.newId();

      YieldbotAdapter.setCookie(cookieName, cookieValue, null, '/');
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(cookieValue);

      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should fail to set a cookie x-domain', function() {
      const cookieName = YieldbotAdapter.newId();
      const cookieValue = YieldbotAdapter.newId();

      YieldbotAdapter.setCookie(cookieName, cookieValue, null, '/', `${cookieName}.com`);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });
  });

  describe('clearAllcookies', function() {
    it('should delete all first-party cookies', function() {
      let label, cookieName, cookieValue;
      for (label in YieldbotAdapter.CONSTANTS.COOKIES) {
        if (YieldbotAdapter.CONSTANTS.COOKIES.hasOwnProperty(label)) {
          cookieName = YieldbotAdapter.CONSTANTS.COOKIES[label];
          YieldbotAdapter.setCookie(cookieName, 1, YieldbotAdapter.CONSTANTS.USER_ID_TIMEOUT, '/');
        }
      };

      for (label in YieldbotAdapter.CONSTANTS.COOKIES) {
        if (YieldbotAdapter.CONSTANTS.COOKIES.hasOwnProperty(label)) {
          cookieName = YieldbotAdapter.CONSTANTS.COOKIES[label];
          cookieValue = YieldbotAdapter.getCookie(cookieName);
          expect(!!cookieValue).to.equal(true);
        }
      };

      YieldbotAdapter.clearAllCookies();

      for (label in YieldbotAdapter.CONSTANTS.COOKIES) {
        if (YieldbotAdapter.CONSTANTS.COOKIES.hasOwnProperty(label)) {
          cookieName = YieldbotAdapter.CONSTANTS.COOKIES[label];
          cookieValue = YieldbotAdapter.getCookie(cookieName);
          expect(cookieValue).to.equal(null);
        }
      };
    });
  });

  describe('sessionBlocked', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.SESSION_BLOCKED;
    beforeEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
    });

    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should return true if cookie value is interpreted as non-zero', function() {
      YieldbotAdapter.setCookie(cookieName, '1', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked, 'cookie value: the string "1"').to.equal(true);

      YieldbotAdapter.setCookie(cookieName, '10.01', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked, 'cookie value: the string "10.01"').to.equal(true);

      YieldbotAdapter.setCookie(cookieName, '-10.01', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked, 'cookie value: the string "-10.01"').to.equal(true);

      YieldbotAdapter.setCookie(cookieName, 1, YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked, 'cookie value: the number 1').to.equal(true);
    });

    it('should return false if cookie name not found', function() {
      expect(YieldbotAdapter.sessionBlocked).to.equal(false);
    });

    it('should return false if cookie value is interpreted as zero', function() {
      YieldbotAdapter.setCookie(cookieName, '0', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked, 'cookie value: the string "0"').to.equal(false);

      YieldbotAdapter.setCookie(cookieName, '.01', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked, 'cookie value: the string ".01"').to.equal(false);

      YieldbotAdapter.setCookie(cookieName, '-.9', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked, 'cookie value: the string "-.9"').to.equal(false);

      YieldbotAdapter.setCookie(cookieName, 0, YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked, 'cookie value: the number 0').to.equal(false);
    });

    it('should return false if cookie value source is a non-numeric string', function() {
      YieldbotAdapter.setCookie(cookieName, 'true', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked).to.equal(false);
    });

    it('should return false if cookie value source is a boolean', function() {
      YieldbotAdapter.setCookie(cookieName, true, YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.sessionBlocked).to.equal(false);
    });

    it('should set sessionBlocked', function() {
      YieldbotAdapter.sessionBlocked = true;
      expect(YieldbotAdapter.sessionBlocked).to.equal(true);
      YieldbotAdapter.sessionBlocked = false;
      expect(YieldbotAdapter.sessionBlocked).to.equal(false);

      YieldbotAdapter.sessionBlocked = 1;
      expect(YieldbotAdapter.sessionBlocked).to.equal(true);
      YieldbotAdapter.sessionBlocked = 0;
      expect(YieldbotAdapter.sessionBlocked).to.equal(false);

      YieldbotAdapter.sessionBlocked = '1';
      expect(YieldbotAdapter.sessionBlocked).to.equal(true);
      YieldbotAdapter.sessionBlocked = '';
      expect(YieldbotAdapter.sessionBlocked).to.equal(false);
    });
  });

  describe('userId', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.USER_ID;
    beforeEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
    });

    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should set a user Id if cookie does not exist', function() {
      const userId = YieldbotAdapter.userId;
      expect(userId).to.match(/[0-9a-z]{18}/);
    });

    it('should return user Id if cookie exists', function() {
      const expectedUserId = YieldbotAdapter.newId();
      YieldbotAdapter.setCookie(cookieName, expectedUserId, YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      const userId = YieldbotAdapter.userId;
      expect(userId).to.equal(expectedUserId);
    });
  });

  describe('sessionId', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.SESSION_ID;
    beforeEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
    });

    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should set a session Id if cookie does not exist', function() {
      const sessionId = YieldbotAdapter.sessionId;
      expect(sessionId).to.match(/[0-9a-z]{18}/);
    });

    it('should return session Id if cookie exists', function() {
      const expectedSessionId = YieldbotAdapter.newId();
      YieldbotAdapter.setCookie(cookieName, expectedSessionId, YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      const sessionId = YieldbotAdapter.sessionId;
      expect(sessionId).to.equal(expectedSessionId);
    });
  });

  describe('lastPageviewId', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.LAST_PAGEVIEW_ID;

    beforeEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
    });

    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should return empty string if cookie does not exist', function() {
      const lastBidId = YieldbotAdapter.lastPageviewId;
      expect(lastBidId).to.equal('');
    });

    it('should set an id string', function() {
      const id = YieldbotAdapter.newId();
      YieldbotAdapter.lastPageviewId = id;
      const lastBidId = YieldbotAdapter.lastPageviewId;
      expect(lastBidId).to.equal(id);
    });
  });

  describe('lastPageviewTime', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.PREVIOUS_VISIT;

    beforeEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
    });

    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should return zero if cookie does not exist', function() {
      const lastBidTime = YieldbotAdapter.lastPageviewTime;
      expect(lastBidTime).to.equal(0);
    });

    it('should set a timestamp', function() {
      const ts = Date.now();
      YieldbotAdapter.lastPageviewTime = ts;
      const lastBidTime = YieldbotAdapter.lastPageviewTime;
      expect(lastBidTime).to.equal(ts);
    });
  });

  describe('pageviewDepth', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.PAGEVIEW_DEPTH;

    beforeEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
    });

    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should return one (1) if cookie does not exist', function() {
      const pageviewDepth = YieldbotAdapter.pageviewDepth;
      expect(pageviewDepth).to.equal(1);
    });

    it('should increment the integer string for depth', function() {
      let pageviewDepth = YieldbotAdapter.pageviewDepth;
      expect(pageviewDepth).to.equal(1);

      pageviewDepth = YieldbotAdapter.pageviewDepth;
      expect(pageviewDepth).to.equal(2);
    });
  });

  describe('urlPrefix', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.URL_PREFIX;
    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should set the default prefix if cookie does not exist', function(done) {
      const urlPrefix = YieldbotAdapter.urlPrefix();
      expect(urlPrefix).to.equal(YieldbotAdapter.CONSTANTS.DEFAULT_REQUEST_URL_PREFIX);
      done();
    });

    it('should return prefix if cookie exists', function() {
      YieldbotAdapter.setCookie(cookieName, 'somePrefixUrl', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      const urlPrefix = YieldbotAdapter.urlPrefix();
      expect(urlPrefix).to.equal('somePrefixUrl');
    });

    it('should reset prefix if default already set', function() {
      const defaultUrlPrefix = YieldbotAdapter.urlPrefix();
      expect(defaultUrlPrefix).to.equal(YieldbotAdapter.CONSTANTS.DEFAULT_REQUEST_URL_PREFIX);

      let urlPrefix = YieldbotAdapter.urlPrefix('somePrefixUrl');
      expect(urlPrefix, 'reset prefix').to.equal('somePrefixUrl');

      urlPrefix = YieldbotAdapter.urlPrefix();
      expect(urlPrefix, 'subsequent request').to.equal('somePrefixUrl');
    });
  });

  describe('initBidRequestParams', function() {
    it('should build common bid request state parameters', function() {
      const params = YieldbotAdapter.initBidRequestParams(
        [
          {
            'params': {
              psn: '1234',
              slot: 'medrec'
            },
            sizes: [[300, 250], [300, 600]]
          }
        ]
      );

      const expectedParamKeys = [
        'v',
        'vi',
        'si',
        'pvi',
        'pvd',
        'lpvi',
        'bt',
        'lo',
        'r',
        'sd',
        'to',
        'la',
        'np',
        'ua',
        'lpv',
        'cts_ns',
        'cts_js',
        'e'
      ];

      const missingKeys = [];
      expectedParamKeys.forEach((item) => {
        if (item in params === false) {
          missingKeys.push(item);
        }
      });
      const extraKeys = [];
      Object.keys(params).forEach((item) => {
        if (!find(expectedParamKeys, param => param === item)) {
          extraKeys.push(item);
        }
      });

      expect(
        missingKeys.length,
        `\nExpected: ${expectedParamKeys}\nMissing keys: ${JSON.stringify(missingKeys)}`)
        .to.equal(0);
      expect(
        extraKeys.length,
        `\nExpected: ${expectedParamKeys}\nExtra keys: ${JSON.stringify(extraKeys)}`)
        .to.equal(0);
    });
  });

  describe('buildRequests', function() {
    it('should not return bid requests if optOut', function() {
      YieldbotAdapter._optOut = true;
      const requests = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS);
      expect(requests.length).to.equal(0);
    });

    it('should not return bid requests if sessionBlocked', function() {
      YieldbotAdapter.sessionBlocked = true;
      const requests = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS);
      expect(requests.length).to.equal(0);
      YieldbotAdapter.sessionBlocked = false;
    });

    it('should re-enable requests when sessionBlocked expires', function() {
      const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.SESSION_BLOCKED;
      YieldbotAdapter.setCookie(
        cookieName,
        1,
        YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT,
        '/');
      let requests = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS);
      console.log(requests);
      expect(requests.length).to.equal(0);
      YieldbotAdapter.deleteCookie(cookieName);
      requests = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS);
      expect(requests.length).to.equal(1);
    });

    it('should return a single BidRequest object', function() {
      const requests = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS);
      expect(requests.length).to.equal(1);
    });

    it('should have expected server options', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      const expectedOptions = {
        withCredentials: true,
        customHeaders: {
          Accept: 'application/json'
        }
      };
      expect(request.options).to.eql(expectedOptions);
    });

    it('should be a GET request', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      expect(request.method).to.equal('GET');
    });

    it('should have bid request specific params', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      expect(request.data).to.not.equal(undefined);

      const expectedParamKeys = [
        'v',
        'vi',
        'si',
        'pvi',
        'pvd',
        'lpvi',
        'bt',
        'lo',
        'r',
        'sd',
        'to',
        'la',
        'np',
        'ua',
        'sn',
        'ssz',
        'lpv',
        'cts_ns',
        'cts_js',
        'cts_ini',
        'e'
      ];

      const missingKeys = [];
      expectedParamKeys.forEach((item) => {
        if (item in request.data === false) {
          missingKeys.push(item);
        }
      });
      const extraKeys = [];
      Object.keys(request.data).forEach((item) => {
        if (!find(expectedParamKeys, param => param === item)) {
          extraKeys.push(item);
        }
      });

      expect(
        missingKeys.length,
        `\nExpected: ${expectedParamKeys}\nMissing keys: ${JSON.stringify(missingKeys)}`)
        .to.equal(0);
      expect(
        extraKeys.length,
        `\nExpected: ${expectedParamKeys}\nExtra keys: ${JSON.stringify(extraKeys)}`)
        .to.equal(0);
    });

    it('should have the correct bidUrl form', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      const bidUrl = '//i.yldbt.com/m/1234/v1/init';
      expect(request.url).to.equal(bidUrl);
    });

    it('should set the bid request slot/bidId mapping', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      expect(request.yieldbotSlotParams).to.not.equal(undefined);
      expect(request.yieldbotSlotParams.bidIdMap).to.not.equal(undefined);

      const map = {};
      map[request.data.pvi + ':leaderboard:728x90'] = '2240b2af6064bb';
      map[request.data.pvi + ':medrec:300x250'] = '49d7fe5c3a15ed';
      map[request.data.pvi + ':medrec:300x600'] = '332067957eaa33';
      map[request.data.pvi + ':skyscraper:160x600'] = '49d7fe5c3a16ee';
      expect(request.yieldbotSlotParams.bidIdMap).to.eql(map);
    });

    it('should set the bid request publisher number', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      expect(request.yieldbotSlotParams.psn).to.equal('1234');
    });

    it('should have unique slot name parameter', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      expect(request.yieldbotSlotParams.sn).to.equal('leaderboard|medrec|skyscraper');
    });

    it('should have slot sizes parameter', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      expect(request.yieldbotSlotParams.ssz).to.equal('728x90|300x600.300x250|160x600');
    });

    it('should use edge server Url prefix if set', function() {
      const cookieName = YieldbotAdapter.CONSTANTS.COOKIES.URL_PREFIX;
      YieldbotAdapter.setCookie(
        cookieName,
        'http://close.edge.adserver.com/',
        YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT,
        '/');

      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      expect(request.url).to.match(/^http:\/\/close\.edge\.adserver\.com\//);
    });

    it('should be adapter loaded before navigation start time', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      const timeDiff = request.data.cts_ns - request.data.cts_js;
      expect(timeDiff >= 0, 'adapter loaded < nav').to.equal(true);
    });

    it('should be navigation start before bid request time', function() {
      const request = YieldbotAdapter.buildRequests(FIXTURE_BID_REQUESTS)[0];
      const timeDiff = request.data.cts_ini - request.data.cts_ns;
      expect(timeDiff >= 0, 'nav start < request').to.equal(true);
    });
  });

  describe('interpretResponse', function() {
    it('should not return Bids if optOut', function() {
      YieldbotAdapter._optOut = true;
      const responses = YieldbotAdapter.interpretResponse();
      expect(responses.length).to.equal(0);
    });

    it('should not return Bids if no server response slot bids', function() {
      FIXTURE_SERVER_RESPONSE.body.slots = [];
      const responses = YieldbotAdapter.interpretResponse(FIXTURE_SERVER_RESPONSE, FIXTURE_BID_REQUEST);
      expect(responses.length).to.equal(0);
    });

    it('should not include Bid if missing cpm', function() {
      delete FIXTURE_SERVER_RESPONSE.body.slots[1].cpm;
      const responses = YieldbotAdapter.interpretResponse(
        FIXTURE_SERVER_RESPONSE,
        FIXTURE_BID_REQUEST
      );
      expect(responses.length).to.equal(3);
    });

    it('should not include Bid if missing size', function() {
      delete FIXTURE_SERVER_RESPONSE.body.slots[2].size;
      const responses = YieldbotAdapter.interpretResponse(
        FIXTURE_SERVER_RESPONSE,
        FIXTURE_BID_REQUEST
      );
      expect(responses.length).to.equal(3);
    });

    it('should not include Bid if missing slot', function() {
      delete FIXTURE_SERVER_RESPONSE.body.slots[3].slot;
      const responses = YieldbotAdapter.interpretResponse(
        FIXTURE_SERVER_RESPONSE,
        FIXTURE_BID_REQUEST
      );
      expect(responses.length).to.equal(3);
    });

    it('should have a valid creativeId', function() {
      const responses = YieldbotAdapter.interpretResponse(
        FIXTURE_SERVER_RESPONSE,
        FIXTURE_BID_REQUEST
      );
      expect(responses.length).to.equal(4);
      responses.forEach((bid) => {
        expect(bid.creativeId).to.match(/[0-9a-z]{18}/);
        const containerDivId = 'ybot-' + bid.creativeId;
        const re = new RegExp(containerDivId);
        expect(re.test(bid.ad)).to.equal(true);
      });
    });

    it('should specify Net revenue type for bid', function() {
      const responses = YieldbotAdapter.interpretResponse(
        FIXTURE_SERVER_RESPONSE,
        FIXTURE_BID_REQUEST
      );
      expect(responses[0].netRevenue).to.equal(true);
    });

    it('should specify USD currency for bid', function() {
      const responses = YieldbotAdapter.interpretResponse(
        FIXTURE_SERVER_RESPONSE,
        FIXTURE_BID_REQUEST
      );
      expect(responses[1].currency).to.equal('USD');
    });

    it('should set edge server Url prefix', function() {
      FIXTURE_SERVER_RESPONSE.body.url_prefix = 'http://close.edge.adserver.com/';
      const responses = YieldbotAdapter.interpretResponse(
        FIXTURE_SERVER_RESPONSE,
        FIXTURE_BID_REQUEST
      );
      const edgeServerUrlPrefix = YieldbotAdapter.getCookie(YieldbotAdapter.CONSTANTS.COOKIES.URL_PREFIX);
      expect(edgeServerUrlPrefix).to.match(/^http:\/\/close\.edge\.adserver\.com\//);
      expect(responses[0].ad).to.match(/http:\/\/close\.edge\.adserver\.com\//);
    });
  });

  describe('getUserSyncs', function() {
    let responses;
    beforeEach(function () {
      responses = [FIXTURE_SERVER_RESPONSE];
    });
    it('should return empty Array when server response property missing', function() {
      delete responses[0].body.user_syncs;
      const userSyncs = YieldbotAdapter.getUserSyncs({ pixelEnabled: true }, responses);
      expect(userSyncs.length).to.equal(0);
    });

    it('should return empty Array when server response property is empty', function() {
      responses[0].body.user_syncs = [];
      const userSyncs = YieldbotAdapter.getUserSyncs({ pixelEnabled: true }, responses);
      expect(userSyncs.length).to.equal(0);
    });

    it('should return empty Array pixel disabled', function() {
      const userSyncs = YieldbotAdapter.getUserSyncs({ pixelEnabled: false }, responses);
      expect(userSyncs.length).to.equal(0);
    });

    it('should return empty Array pixel option not provided', function() {
      const userSyncs = YieldbotAdapter.getUserSyncs({ pixelNotHere: true }, responses);
      expect(userSyncs.length).to.equal(0);
    });

    it('should return image type pixels', function() {
      const userSyncs = YieldbotAdapter.getUserSyncs({ pixelEnabled: true }, responses);
      expect(userSyncs).to.eql(
        [
          { type: 'image', url: 'https://usersync.dd9693a32aa1.com/00000000.gif?p=a' },
          { type: 'image', url: 'https://usersync.3b19503b37d8.com/00000000.gif?p=b' },
          { type: 'image', url: 'https://usersync.5cb389d36d30.com/00000000.gif?p=c' }
        ]
      );
    });
  });

  describe('Auction Behavior', function() {
    AdapterManager.bidderRegistry['yieldbot'] = newBidder(spec);
    let sandbox, server, xhr, fakeRequests;
    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      server = sinon.fakeServer.create();
      server.respondImmediately = true;

      xhr = sinon.useFakeXMLHttpRequest();
      fakeRequests = [];
      xhr.onCreate = function (xhr) {
        fakeRequests.push(xhr);
      };
      FIXTURE_SERVER_RESPONSE.user_syncs = [];
    });

    afterEach(function() {
      sandbox.restore();
      YieldbotAdapter._bidRequestCount = 0;
    });

    function auctionDetails(auctionCount, adUnits, adUnitCodes, requestCb, done, quit) {
      const cb = () => {
        if (requestCb) {
          try {
            requestCb(fakeRequests[auctionCount]);
            if (quit) {
              done();
            }
          } catch (err) {
            done(err);
          }
        }
      };
      return {
        adUnits: adUnits,
        adUnitCodes: adUnitCodes,
        callback: cb
      };
    };

    const AUCTIONS = { FIRST: 0, SECOND: 1 };
    it('should build auction bids', function(done) {
      const auctionBids = [];
      const bidResponseHandler = (event) => {
        auctionBids.push(event);
      };
      const auctionEndHandler = (event) => {
        try {
          events.off('bidResponse', bidResponseHandler);
          events.off('auctionEnd', auctionEndHandler);
          expect(auctionBids.length, 'Auction bids').to.equal(4);
          done();
        } catch (err) {
          done(err);
        }
      };
      events.on('bidResponse', bidResponseHandler);
      events.on('auctionEnd', auctionEndHandler);

      const firstAdUnits = FIXTURE_AD_UNITS;
      const firstAdUnitCodes = FIXTURE_AD_UNITS.map(unit => unit.code);
      const firstAuction = auctionManager.createAuction(
        auctionDetails(
          AUCTIONS.FIRST,
          firstAdUnits,
          firstAdUnitCodes
        )
      );
      firstAuction.callBids();
      fakeRequests[AUCTIONS.FIRST].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(FIXTURE_SERVER_RESPONSE.body)
      );
    });

    it('should provide multiple auctions with correct bid cpms', function(done) {
      const auctionBids = [];
      let auctionCount = 0;
      let firstAuctionId = '';
      let secondAuctionId = '';
      /*
       * 'bidResponse' event handler checks for respective adUnit auctions and bids
       */
      const bidResponseHandler = (event) => {
        try {
          const expr = `${event.adUnitCode}`;
          switch (true) {
            case expr === '/00000000/leaderboard' && event.auctionId === firstAuctionId:
              expect(event.cpm, 'leaderboard, first auction cpm').to.equal(8);
              break;
            case expr === '/00000000/medrec' && event.auctionId === firstAuctionId:
              expect(event.cpm, 'medrec, first auction cpm').to.equal(3);
              break;
            case expr === '/00000000/multi-size' && event.auctionId === firstAuctionId:
              expect(event.cpm, 'multi-size, first auction cpm').to.equal(8);
              break;
            case expr === '/00000000/skyscraper' && event.auctionId === firstAuctionId:
              expect(event.cpm, 'skyscraper, first auction cpm').to.equal(3);
              break;
            case expr === '/00000000/medrec' && event.auctionId === secondAuctionId:
              expect(event.cpm, 'medrec, second auction cpm').to.equal(1.11);
              break;
            case expr === '/00000000/multi-size' && event.auctionId === secondAuctionId:
              expect(event.cpm, 'multi-size, second auction cpm').to.equal(2.22);
              break;
            case expr === '/00000000/skyscraper' && event.auctionId === secondAuctionId:
              expect(event.cpm, 'skyscraper, second auction cpm').to.equal(3.33);
              break;
            default:
              done(new Error(`Bid response to assert not found: ${expr}:${event.size}:${event.auctionId}, [${firstAuctionId}, ${secondAuctionId}]`));
          }
        } catch (err) {
          done(err);
        }
        auctionBids.push(event);
      };
      const auctionEndHandler = (event) => {
        try {
          auctionCount++;
          if (auctionCount === 2) {
            events.off('bidResponse', bidResponseHandler);
            events.off('auctionEnd', auctionEndHandler);
            expect(auctionBids.length, 'Auction bids').to.equal(7);
            done();
          }
        } catch (err) {
          done(err);
        }
      };
      events.on('bidResponse', bidResponseHandler);
      events.on('auctionEnd', auctionEndHandler);

      /*
       * First auction
       */
      const firstAdUnits = FIXTURE_AD_UNITS;
      const firstAdUnitCodes = FIXTURE_AD_UNITS.map(unit => unit.code);
      const firstAuction = auctionManager.createAuction(
        auctionDetails(
          AUCTIONS.FIRST,
          firstAdUnits,
          firstAdUnitCodes
        )
      );
      firstAuctionId = firstAuction.getAuctionId();
      firstAuction.callBids();
      fakeRequests[AUCTIONS.FIRST].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(FIXTURE_SERVER_RESPONSE.body)
      );

      /*
       * Second auction with different bid values and fewer slots
       */
      FIXTURE_AD_UNITS.shift();
      const FIXTURE_SERVER_RESPONSE_2 = utils.deepClone(FIXTURE_SERVER_RESPONSE);
      FIXTURE_SERVER_RESPONSE_2.user_syncs = [];
      FIXTURE_SERVER_RESPONSE_2.body.slots.shift();
      FIXTURE_SERVER_RESPONSE_2.body.slots.forEach((bid, idx) => { const num = idx + 1; bid.cpm = `${num}${num}${num}`; });
      const secondAdUnits = FIXTURE_AD_UNITS;
      const secondAdUnitCodes = FIXTURE_AD_UNITS.map(unit => unit.code);
      const secondAuction = auctionManager.createAuction(
        auctionDetails(
          AUCTIONS.SECOND,
          secondAdUnits,
          secondAdUnitCodes
        )
      );

      secondAuctionId = secondAuction.getAuctionId();
      secondAuction.callBids();
      fakeRequests[AUCTIONS.SECOND].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(FIXTURE_SERVER_RESPONSE_2.body)
      );
    });

    it('should have refresh bid type after the first auction', function(done) {
      const firstAdUnits = FIXTURE_AD_UNITS;
      const firstAdUnitCodes = FIXTURE_AD_UNITS.map(unit => unit.code);
      const firstAuction = auctionManager.createAuction(
        auctionDetails(
          AUCTIONS.FIRST,
          firstAdUnits,
          firstAdUnitCodes,
          (request, done) => {
            const url = urlUtils.parse(
              request.url,
              { noDecodeWholeURL: true }
            );
            const searchParams = url.search;
            expect(searchParams.bt, 'First auction bid type').to.equal('init');
          },
          done,
          false
        )
      );
      firstAuction.callBids();
      fakeRequests[AUCTIONS.FIRST].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(FIXTURE_SERVER_RESPONSE.body)
      );

      const secondAdUnits = FIXTURE_AD_UNITS;
      const secondAdUnitCodes = FIXTURE_AD_UNITS.map(unit => unit.code);
      const secondAuction = auctionManager.createAuction(
        auctionDetails(
          AUCTIONS.SECOND,
          secondAdUnits,
          secondAdUnitCodes,
          (request) => {
            const url = urlUtils.parse(
              request.url,
              { noDecodeWholeURL: true }
            );
            const searchParams = url.search;
            expect(searchParams.bt, 'Second auction bid type').to.equal('refresh');
          },
          done,
          true
        )
      );
      secondAuction.callBids();
      fakeRequests[AUCTIONS.SECOND].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(FIXTURE_SERVER_RESPONSE.body)
      );
    });
  });
});
