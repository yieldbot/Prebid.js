import {expect} from 'chai';
import {assert} from 'chai';
import YieldbotAdapter from '../../../src/adapters/yieldbot';
import bidManager from '../../../src/bidmanager';
import adLoader from '../../../src/adloader';

let adapter;
let sandbox;
let yieldbotLibStub;
let YldbotLoadScript;

const bidderRequest = {
  bidderCode: 'yieldbot',
  bidder: 'yieldbot',
  bidderRequestId: '187a340cb9ccc5',
  bids: [
    {
      bidId: '2640ad280208cc',
      sizes: [[300, 250], [300, 600]],
      bidder: 'yieldbot',
      bidderRequestId: '187a340cb9ccc5',
      params: { psn: '1234', slot: 'medrec' },
      requestId: '5f297a1f-3163-46c2-854f-b55fd2e74ece',
      placementCode: 'div-gpt-ad-1460505748561-0'
    },
    {
      bidId: '35751f10be5b6b',
      sizes: [[728, 90], [970, 90]],
      bidder: 'yieldbot',
      bidderRequestId: '187a340cb9ccc5',
      params: { psn: '1234', slot: 'leaderboard' },
      requestId: '5f297a1f-3163-46c2-854f-b55fd2e74ece',
      placementCode: 'div-gpt-ad-1460505661639-0'
    }
  ]
};

const YB_BID_FIXTURE = {
  medrec: {
    ybot_ad: 'y',
    ybot_slot: 'medrec',
    ybot_cpm: '200',
    ybot_size: '300x250'
  },
  leaderboard: {
    ybot_ad: 'y',
    ybot_slot: 'leaderboard',
    ybot_cpm: '100',
    ybot_size: '728x90'
  }
};


function createYieldbotMockLib() {
  window.yieldbot = {
    _initialized: false,
    pub: (psn) => {},
    defineSlot: (slotName, optionalDomIdOrConfigObject, optionalTime) => {},
    enableAsync: () => {},
    go: () => { window.yieldbot._initialized = true; },
    nextPageview: (slots, callback) => {},
    updateState: (data) => {
    },
    getSlotCriteria: (slotName) => {
      return YB_BID_FIXTURE[slotName] || {ybot_ad: "n"};
    }
  };
}

function restoreYieldbotMockLib() {
  window.yieldbot = null;
}

function mockLoadAndBidRequest() {
  window.ybotq = window.ybotq || [];
  window.ybotq.forEach(fn => {
    fn.apply(window.yieldbot);
  });
  window.ybotq = [];
}

before(function() {
  pbjs._bidsRequested.push(bidderRequest);
});

describe('Yieldbot adapter tests', function() {

  beforeEach(function() {
    adapter = new YieldbotAdapter();
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  let yieldbotStub;
  describe('callBids', function() {
    beforeEach(function () {
      createYieldbotMockLib();
      sandbox.stub(adLoader, 'loadScript');
      yieldbotStub = sandbox.stub(window.yieldbot);
    });

    afterEach(() => {
      restoreYieldbotMockLib();
    });

    it('should request the yieldbot library', function() {
      adapter.callBids(bidderRequest);
      mockLoadAndBidRequest();
      sinon.assert.calledOnce(adLoader.loadScript);
      sinon.assert.calledWith(adLoader.loadScript, '//cdn.yldbt.com/js/yieldbot.intent.js');
    });

    it('should set a yieldbot psn', function() {
      adapter.callBids(bidderRequest);
      mockLoadAndBidRequest();
      sinon.assert.called(yieldbotStub.pub);
      sinon.assert.calledWith(yieldbotStub.pub, '1234');
    });

    it('should define yieldbot slots', function() {
      adapter.callBids(bidderRequest);
      mockLoadAndBidRequest();
      sinon.assert.calledTwice(yieldbotStub.defineSlot);
      sinon.assert.calledWith(yieldbotStub.defineSlot, 'medrec', {sizes: [[300, 250], [300, 600]]});
      sinon.assert.calledWith(yieldbotStub.defineSlot, 'leaderboard', {sizes: [[728, 90], [970, 90]]});
    });

    it('should enable yieldbot async mode', function() {
      adapter.callBids(bidderRequest);
      mockLoadAndBidRequest();
      sinon.assert.called(yieldbotStub.enableAsync);
    });

    it('should handle yieldbot updateState callback', function() {
      adapter.callBids(bidderRequest);
      mockLoadAndBidRequest();
      sinon.assert.calledOnce(yieldbotStub.updateState);
    });
  });
});
