import { expect } from 'chai';
import { YieldbotAdapter, spec } from 'modules/yieldbotBidAdapter';
import { newBidder } from 'src/adapters/bidderFactory';
import AdapterManager from 'src/adaptermanager';
import * as utils from 'src/utils';

describe.only('Yieldbot Adapter Unit Tests', function() {

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

  describe('getUniqueSlotSizes', function() {
    it('should be empty with falsey sizes', function() {
      expect(YieldbotAdapter.getUniqueSlotSizes('')).to.deep.equal([]);
      expect(YieldbotAdapter.getUniqueSlotSizes(0)).to.deep.equal([]);
    });

    it('should be empty invalid sizes type', function() {
      expect(YieldbotAdapter.getUniqueSlotSizes(true)).to.deep.equal([]);
      expect(YieldbotAdapter.getUniqueSlotSizes(function() {})).to.deep.equal([]);
      expect(YieldbotAdapter.getUniqueSlotSizes(87)).to.deep.equal([]);
      expect(YieldbotAdapter.getUniqueSlotSizes({})).to.deep.equal([]);
    });

    it('should be empty with empty sizes', function() {
      expect(YieldbotAdapter.getUniqueSlotSizes([])).to.deep.equal([]);
    });

    it('should be empty with numeric sizes', function() {
      expect(YieldbotAdapter.getUniqueSlotSizes([[300, 250], [300, 250], [300, 600]])).to.deep.equal([]);
    });

    it('should be empty with array string sizes', function() {
      expect(YieldbotAdapter.getUniqueSlotSizes(
        [
          ['300', '250'],
          ['300', '250'],
          ['300', '600']
        ])).to.deep.equal([]);
    });

    it('should be empty with string of sizes', function() {
      expect(YieldbotAdapter.getUniqueSlotSizes('300x250,300x250,300x600'))
        .to.deep.equal([]);
    });

    it('should be unique with array of formatted string sizes', function() {
      expect(YieldbotAdapter.getUniqueSlotSizes(['300x250', '300x250', '300x600']))
        .to.deep.equal([['300', '250'], ['300', '600']]);
    });
  });

  describe('getUniqueSlotSizes with utils.parseSizesInput', function() {
    it('should be empty with malformed sizes', function() {
      const sizes = utils.parseSizesInput('300250,300|250,300#600');
      expect(YieldbotAdapter.getUniqueSlotSizes(sizes))
        .to.deep.equal([]);
    });

    it('should be unique with string of sizes', function() {
      const sizes = utils.parseSizesInput('300x250,300x250,300x600');
      expect(YieldbotAdapter.getUniqueSlotSizes(sizes))
        .to.deep.equal([['300', '250'], ['300', '600']]);
    });

    it('should be empty with array of string sizes', function() {
      const sizes = utils.parseSizesInput(['300x250', '300x250', '300x600']);
      expect(YieldbotAdapter.getUniqueSlotSizes(sizes))
        .to.deep.equal([]);
    });

    it('should be unique array sizes', function() {
      const sizes = utils.parseSizesInput(
        [
          ['300', '250'],
          ['300', '250'],
          ['300', '600']
        ]);
      expect(YieldbotAdapter.getUniqueSlotSizes(sizes))
        .to.deep.equal(
          [
            ['300', '250'],
            ['300', '600']
          ]);
    });

    it('should be unique string and array sizes', function() {
      const sizes = utils.parseSizesInput(
        [
          ['300x250'],
          ['300', '250'],
          ['300', '250'],
          ['300', '600'],
          ['300', '600'],
          ['728', '90']
        ]);
      expect(YieldbotAdapter.getUniqueSlotSizes(sizes))
        .to.deep.equal(
          [
            ['300', '250'],
            ['300', '600'],
            ['728', '90']
          ]);
    });
  });

  describe('getCookie', function() {
    it('should return if cookie name not found', function() {
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

  describe('buildBidRequestParams', function() {
    it('should build all parameters', function() {
      const params = YieldbotAdapter.buildBidRequestParams(
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
        'sn',
        'ssz',
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
        'cts_ini',
        'e'
      ];

      const missingKeys = [];

      expectedParamKeys.forEach((item) => {
        if (item in params === false) {
          missingKeys.push(item);
        }
      });
      expect(missingKeys.length, `Missing keys: ${JSON.stringify(missingKeys)}`).to.equal(0);
    });

    it('should build unique slot sizes', function() {
      const bidRequests = [
        {
          'params': {
            psn: '1234',
            slot: 'medrec'
          },
          sizes: [[300, 250], [300, 600]]
        },
        {
          'params': {
            psn: '1234',
            slot: 'medrec'
          },
          sizes: [[300, 250], [300, 600]]
        },
        {
          'params': {
            psn: '1234',
            slot: 'leaderboard'
          },
          sizes: [970, 90]
        },
        {
          'params': {
            psn: '1234',
            slot: 'footerboard'
          },
          sizes: [728, 90]
        },
        {
          'params': {
            psn: '1234',
            slot: 'leaderboard'
          },
          sizes: [[728, 90], [970, 90]]
        },
        {
          'params': {
            psn: '1234',
            slot: 'medrec'
          },
          sizes: [[160, 600], [300, 250], [300, 600]]
        }
      ];
      const params = YieldbotAdapter.buildBidRequestParams(bidRequests);
      expect(params[YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.BID_SLOT_NAME])
        .to.equal('medrec|leaderboard|footerboard');
      expect(params[YieldbotAdapter.CONSTANTS.REQUEST_PARAMS.BID_SLOT_SIZE])
        .to.equal('300x250.300x600.160x600|970x90.728x90|728x90');
    });
  });

  describe('buildRequests', function() {
    let sandbox, server, xhr, requests;
    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      server = sinon.fakeServer.create();
      server.respondImmediately = true;

      xhr = sinon.useFakeXMLHttpRequest();
      requests= [];
      xhr.onCreate = function (xhr) {
        requests.push(xhr);
      };
    });

    afterEach(function() {
      sandbox.restore();
    });

    let bidRequests = [
      {
        'bidder': 'appnexus',
        'params': {
          'placementId': '10433394'
        },
        'adUnitCode': 'adunit-code',
        'sizes': [[300, 250], [300, 600]],
        'bidId': '30b31c1838de1e',
        'bidderRequestId': '22edbae2733bf6',
        'auctionId': '1d1a030790a475'
      },
      {
        'bidder': 'appnexus',
        'params': {
          'plac ementId': '10433394'
        },
        'adUnitCode': 'adunit-code2',
        'sizes': [],
        'bidId': '30b31c1838de1e',
        'bidderRequestId': '22edbae2733bf6',
        'auctionId': '1d1a030790a475'
      }
    ];

    const adUnits = [
      {
        code: '/19968336/header-bid-tag-0',
        sizes: [
          [
            300,
            250
          ],
          [
            300,
            600
          ]
        ],
        bids: [
          {
            bidder: 'yieldbot',
            params: {
              psn: '1234',
              slot: 'medrec'
            },
            placementCode: '/19968336/header-bid-tag-0',
            sizes: [
              [
                300,
                250
              ],
              [
                300,
                600
              ]
            ],
            bidId: '154f9cbf82df565',
            bidderRequestId: '1448569c2453b84',
            auctionId: '1ff753bd4ae5cb'
          }
        ]
      }
    ];

    it('should provide bidRequests for interpretResponse', function() {

    });

    it('should do something', function() {
      AdapterManager.bidderRegistry['yieldbot'] = newBidder(spec);
      const bidRequests = AdapterManager.makeBidRequests(adUnits, Date.now(), 1234567890, 1000);

      server.respondWith(
        [
          200,
          { "Content-Type": "application/json" },
          '[{ "id": 12, "comment": "Hey there" }]'
        ]
      );
      AdapterManager.callBids(adUnits, bidRequests, () => {
        console.log('addBidResponse', arguments);
      }, () => {
        console.log('doneCb', arguments);
      });
      console.log('server.requests', server.requests);
    });

    it('should do something else', function(done) {
      AdapterManager.bidderRegistry['yieldbot'] = newBidder(spec);
      const bidRequests = AdapterManager.makeBidRequests(adUnits, Date.now(), 1234567890, 1000);

      AdapterManager.callBids(adUnits, bidRequests, () => {}, () => {
        return () => {
          console.log('done', requests);
          done();
        };
      });

      requests[0].respond(200, { "Content-Type": "application/json" },
                          '[{ "id": 12, "comment": "Hey there" }]');

    });
  });

  describe.skip('interpretResponse', () => {

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
