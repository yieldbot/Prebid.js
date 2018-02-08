import { expect } from 'chai';
import { YieldbotAdapter, spec } from 'modules/yieldbotBidAdapter';
import { newBidder } from 'src/adapters/bidderFactory';
import AdapterManager from 'src/adaptermanager';
import * as utils from 'src/utils';

describe('Yieldbot Adapter Unit Tests', function() {
  let _adUnits, _bidRequests;
  beforeEach(function() {
    _adUnits = [
      {
        transactionId:'3bcca099-e22a-4e1e-ab60-365a74a87c19',
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
        transactionId:'3bcca099-e22a-4e1e-ab60-365a74a87c20',
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
        transactionId:'3bcca099-e22a-4e1e-ab60-365a74a87c21',
        code: '/00000000/multi-size',
        sizes: [[300,600]],
        bids: [
          {
            bidder: 'yieldbot',
            params: {
              psn: '1234',
              slot: 'sidebar'
            }
          }
        ]
      },
      {
        transactionId:'3bcca099-e22a-4e1e-ab60-365a74a87c22',
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
    _bidRequests = AdapterManager.makeBidRequests(_adUnits, Date.now(), 1234567890, 1000);
  });
  describe('Adapter spec API', function() {
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
    const bidLeaderboard728x90 = {
      bidder: 'yieldbot',
      params: {
        psn: '1234',
        slot: 'leaderboard'
      },
      adUnitCode: '/0000000/leaderboard',
      transactionId:'3bcca099-e22a-4e1e-ab60-365a74a87c19',
      sizes: [728,90],
      bidId: '2240b2af6064bb',
      bidderRequestId: '1e878e3676fb85',
      auctionId: 'c9964bd5-f835-4c91-916e-00295819f932'
    };

    const bidMedrec300x600 = {
      bidder: 'yieldbot',
      params: {
        psn: '1234',
        slot: 'medrec'
      },
      adUnitCode: '/0000000/side-bar',
      transactionId:'3bcca099-e22a-4e1e-ab60-365a74a87c20',
      sizes: [300, 600],
      bidId: '332067957eaa33',
      bidderRequestId: '1e878e3676fb85',
      auctionId: 'c9964bd5-f835-4c91-916e-00295819f932'
    };

    const bidMedrec300x250 = {
      bidder: 'yieldbot',
      params: {
        psn: '1234',
        slot: 'medrec'
      },
      adUnitCode: '/0000000/side-bar',
      transactionId:'3bcca099-e22a-4e1e-ab60-365a74a87c21',
      sizes: [[300, 250]],
      bidId: '49d7fe5c3a15ed',
      bidderRequestId: '1e878e3676fb85',
      auctionId: 'c9964bd5-f835-4c91-916e-00295819f932'
    };

    const bidSky160x600 = {
      bidder: 'yieldbot',
      params: {
        psn: '1234',
        slot: 'skyscraper'
      },
      adUnitCode: '/0000000/side-bar',
      transactionId:'3bcca099-e22a-4e1e-ab60-365a74a87c21',
      sizes: [160, 600],
      bidId: '49d7fe5c3a16ee',
      bidderRequestId: '1e878e3676fb85',
      auctionId: 'c9964bd5-f835-4c91-916e-00295819f932'
    };

    const EMPTY_SLOT_PARAMS = { sn: '', ssz: '', bidIdMap: {} };

    it('should default to empty slot params', function() {
      expect(YieldbotAdapter.getSlotRequestParams('')).to.deep.equal(EMPTY_SLOT_PARAMS);
      expect(YieldbotAdapter.getSlotRequestParams()).to.deep.equal(EMPTY_SLOT_PARAMS);
      expect(YieldbotAdapter.getSlotRequestParams('', [])).to.deep.equal(EMPTY_SLOT_PARAMS);
      expect(YieldbotAdapter.getSlotRequestParams(0, [])).to.deep.equal(EMPTY_SLOT_PARAMS);
    });

    it('should build slot bid request parameters', function() {
      const bidRequests = [bidLeaderboard728x90, bidMedrec300x600, bidMedrec300x250];
      const slotParams = YieldbotAdapter.getSlotRequestParams('f0e1d2c', bidRequests);

      console.log(slotParams);
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
      const bidRequests = [bidMedrec300x600, bidLeaderboard728x90, bidMedrec300x250];
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
      const bid = utils.deepClone(bidMedrec300x250);
      bid.sizes = ['300x250'];
      const bidRequests = [bid, bidLeaderboard728x90];
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

  describe('isSessionBlocked', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIE_PREFIX + YieldbotAdapter.CONSTANTS.COOKIES.SESSION_BLOCKED;

    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should return true if cookie value is interpreted as non-zero', function() {
      YieldbotAdapter.setCookie(cookieName, '1', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked, 'cookie value: the string "1"').to.equal(true);

      YieldbotAdapter.setCookie(cookieName, '10.01', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked, 'cookie value: the string "10.01"').to.equal(true);

      YieldbotAdapter.setCookie(cookieName, '-10.01', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked, 'cookie value: the string "-10.01"').to.equal(true);

      YieldbotAdapter.setCookie(cookieName, 1, YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked, 'cookie value: the number 1').to.equal(true);
    });

    it('should return false if cookie name not found', function() {
      expect(YieldbotAdapter.isSessionBlocked).to.equal(false);
    });

    it('should return false if cookie value is interpreted as zero', function() {
      YieldbotAdapter.setCookie(cookieName, '0', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked, 'cookie value: the string "0"').to.equal(false);

      YieldbotAdapter.setCookie(cookieName, '.01', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked, 'cookie value: the string ".01"').to.equal(false);

      YieldbotAdapter.setCookie(cookieName, '-.9', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked, 'cookie value: the string "-.9"').to.equal(false);

      YieldbotAdapter.setCookie(cookieName, 0, YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked, 'cookie value: the number 0').to.equal(false);
    });

    it('should return false if cookie value source is a non-numeric string', function() {
      YieldbotAdapter.setCookie(cookieName, 'true', YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked).to.equal(false);
    });

    it('should return false if cookie value source is a boolean', function() {
      YieldbotAdapter.setCookie(cookieName, true, YieldbotAdapter.CONSTANTS.SESSION_ID_TIMEOUT, '/');
      expect(YieldbotAdapter.isSessionBlocked).to.equal(false);
    });
  });

  describe('userId', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIE_PREFIX + YieldbotAdapter.CONSTANTS.COOKIES.USER_ID;

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
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIE_PREFIX + YieldbotAdapter.CONSTANTS.COOKIES.SESSION_ID;

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

  describe('urlPrefix', function() {
    const cookieName = YieldbotAdapter.CONSTANTS.COOKIE_PREFIX + YieldbotAdapter.CONSTANTS.COOKIES.URL_PREFIX;

    afterEach(function() {
      YieldbotAdapter.deleteCookie(cookieName);
      expect(YieldbotAdapter.getCookie(cookieName)).to.equal(null);
    });

    it('should set the default prefix if cookie does not exist', function() {
      const urlPrefix = YieldbotAdapter.urlPrefix();
      expect(urlPrefix).to.equal(YieldbotAdapter.CONSTANTS.DEFAULT_REQUEST_URL_PREFIX);
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
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.ADAPTER_VERSION,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.USER_ID,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.SESSION_ID,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.PAGEVIEW_ID,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.BID_TYPE,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.PAGEVIEW_DEPTH,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.LAST_PAGEVIEW_ID,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.LOCATION,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.REFERRER,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.SCREEN_DIMENSIONS,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.TIMEZONE_OFFSET,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.LANGUAGE,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.NAVIGATOR_PLATFORM,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.USER_AGENT,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.LAST_PAGEVIEW_TIME,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.NAVIGATION_START_TIME,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.ADAPTER_LOADED_TIME,
        YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.TERMINATOR
      ];

      const missingKeys = [];
      expectedParamKeys.forEach((item) => {
        if (item in params === false) {
          missingKeys.push(item);
        }
      });
      expect(missingKeys.length, `Missing keys: ${JSON.stringify(missingKeys)}`).to.equal(0);
    });
  });

  describe('buildRequests', function() {
    it('should not return bid requests if optOut', function() {
      YieldbotAdapter._optOut = true;

      const requests = YieldbotAdapter.buildRequests(_bidRequests);
      expect(requests.length).to.equal(0);
    });
    it('sd', function() {});
    it('sd', function() {});
    it('sd', function() {});
    it('sd', function() {});

  });

  describe.skip('TODO: functional buildRequests', function() {
    let sandbox, server, xhr, requests;
    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      server = sinon.fakeServer.create();
      server.respondImmediately = true;

      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];
      xhr.onCreate = function (xhr) {
        requests.push(xhr);
      };
    });

    afterEach(function() {
      sandbox.restore();
    });

    const serverResponse = {
      pvi: 'jdeqc5bigwlu083v48',
      subdomain_iframe: 'ads-adseast-vpc',
      url_prefix: 'http://ads-adseast-vpc.yldbt.com/m/',
      integration_test: true,
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
          slot: 'sidebar',
          cpm: '800',
          size: '300x600'
        },
        {
          slot: 'skyscraper',
          cpm: '300',
          size: '160x600'
        }
      ]
    };

    it('should provide bidRequests for interpretResponse', function() {

    });

    it('should do something', function() {
      AdapterManager.bidderRegistry['yieldbot'] = newBidder(spec);

      console.log('bidRequests', _bidRequests);
      server.respondWith(
        [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(serverResponse)
        ]
      );
      AdapterManager.callBids(_adUnits, _bidRequests, () => {
        console.log('addBidResponse', arguments);
      }, () => {
        console.log('doneCb', arguments);
      });
      console.log('server.requests', server.requests);
    });

    it('should do something else', function(done) {
      AdapterManager.bidderRegistry['yieldbot'] = newBidder(spec);

      const ret = AdapterManager.callBids(_adUnits, _bidRequests, () => {}, () => {
        return () => {
          console.log('done', requests);
        };
      });

      requests[0].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(serverResponse));

      done();
    });
  });

  describe.skip('TODO: functional interpretResponse', () => {
    const ybotResponse = {
      pvi: 'jbgxsxqxyxvqm2oud7',
      subdomain_iframe: 'ads-adseast-vpc',
      url_prefix: 'http://ads-adseast-vpc.yldbt.com/m/',
      integration_test: true,
      warnings: [],
      slots: [
        {
          slot: 'medrec',
          cpm: '300',
          size: '300x250'
        }, {
          slot: 'leaderboard',
          cpm: '800',
          size: '728x90'
        }
      ]
    };

    it('should build bids from response', function() {

    });
  });

  describe.skip('test stuff', function() {
    it('some stuff', function() {
      expect([]).to.deep.equal([]);
    });
  });
});
