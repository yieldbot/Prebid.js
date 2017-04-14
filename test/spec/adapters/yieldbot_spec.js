
describe('yieldbot adapter tests', () => {

    var expect = require('chai').expect;
    var assert = require('chai').expect;
    var urlParse = require('url-parse');
    var adapter = require('src/adapters/yieldbot');
    var adLoader = require('src/adloader');
    var bidmanager = require('src/bidmanager');

    var querystringify = require('querystringify');

    window.pbjs = window.pbjs || {};
    if (typeof(pbjs)==="undefined"){
        var pbjs = window.pbjs;
    }
    let YldbotLoadScript;

    beforeEach(() => {
        YldbotLoadScript = sinon.stub(adLoader, 'loadScript');
    });

    afterEach(() => {
        YldbotLoadScript.restore();
    });


   describe('creation of bid url', function () {

        it('should be called only once', function () {

            var params = {
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

            adapter().callBids(params);

            sinon.assert.calledOnce(YldbotLoadScript);

        });

        it('should show the parameters expected', function () {

            var params = {
                bidderCode: 'yieldbot',
                bidder: 'yieldbot',
                bids: [
                        {
                            bidId: '2640ad280208cc',
                            sizes: [[300, 250], [300, 600]],
                            bidder: 'yieldbot',
                            params: { psn: '1234', slot: 'medrec' },
                            requestId: '5f297a1f-3163-46c2-854f-b55fd2e74ece',
                            placementCode: 'div-gpt-ad-1460505748561-0'
                            },

                ]
            };

            adapter().callBids(params);
            var bidUrl = YldbotLoadScript.getCall(0).args[0];

            sinon.assert.calledWith(YldbotLoadScript, bidUrl);

            var parsedBidUrl = urlParse(bidUrl);
            var parsedBidUrlQueryString = querystringify.parse(parsedBidUrl.query);

            expect(parsedBidUrl.hostname).to.equal('cdn.yldbt.com');
            expect(parsedBidUrl.pathname).to.equal('/js/yieldbot.intent.js');
        
            expect(parsedBidUrlQueryString).to.have.property('e').and.to.equal('yb');
            expect(parsedBidUrlQueryString).to.have.property('t');

            console.log('find out:', parsedBidUrlQueryString);
             var bidObj = JSON.parse(parsedBidUrlQueryString.t);

            console.log('hello there:', parsedBidUrlQueryString);
             expect(bidObj).to.have.property('bids');
             var bidObj0 = bidObj.bids[0];

            expect(bidObj0.params).to.have.property('psn').and.to.equal('1234');
            expect(bidObj0.params).to.have.property('slot').and.to.equal('medrec');
            expect(bidObj0).to.have.property('sizes').and.to.equal[[300, 250], [300, 600]];
            expect(bidObj0).to.have.property('placementCode').and.to.equal('div-gpt-ad-1460505748561-0');

        });

   });
   describe('Placing the bids by their parameters', function () {

    it('should call the parameters expected for two bids', function () {

            var params = {
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
    
         adapter().callBids(params);
         var bidUrl = YldbotLoadScript.getCall(0).args[0];

          sinon.assert.calledWith(YldbotLoadScript, bidUrl);

            var parsedBidUrl = urlParse(bidUrl);
            var parsedBidUrlQueryString = querystringify.parse(parsedBidUrl.query);

            expect(parsedBidUrl.hostname).to.equal('cdn.yldbt.com');
            expect(parsedBidUrl.pathname).to.equal('/js/yieldbot.intent.js');
        
            expect(parsedBidUrlQueryString).to.have.property('e').and.to.equal('yb');
            expect(parsedBidUrlQueryString).to.have.property('t');

            console.log('check2:', parsedBidUrlQueryString);
             var bidObj = JSON.parse(parsedBidUrlQueryString.t);

            expect(bidObj).to.have.property('bids');
            var bidObj1 = bidObj.bids[0];

            expect(bidObj1.params).to.have.property('psn').and.to.equal('1234');
            expect(bidObj1.params).to.have.property('slot').and.to.equal('medrec');
            expect(bidObj1).to.have.property('bidder').and.to.equal('yieldbot');
            expect(bidObj1).to.have.property('bidId').and.to.equal('2640ad280208cc');
            expect(bidObj1).to.have.property('placementCode').and.to.equal('div-gpt-ad-1460505748561-0');

            var bidObj2 = bidObj.bids[1];

            expect(bidObj2).to.have.property('sizes').and.to.equal[[728, 90], [970, 90]];
            expect(bidObj2.params).to.have.property('slot').and.to.equal('leaderboard');
            expect(bidObj2.params).to.have.property('psn').and.to.equal('1234');
            expect(bidObj2).to.have.property('placementCode').and.to.equal('div-gpt-ad-1460505661639-0');
      });

  });

});


  // Working on the below tests

  /*const bidderRequest = {
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


    it("sets url parameters", function () {

        adapter.callBids(bidderRequest);

        var bidUrl = YldbotLoadScript.getCall(0).args[0];
        var parsedBidUrl = urlParse(bidUrl);
        var parsedBidUrlQueryString = querystringify.parse(parsedBidUrl.query);

        expect(parsedBidUrlQueryString.hostname).to.equal('cdn.yldbt.com');
        expect(parsedBidUrlQueryString.pathname).to.equal('/js/yieldbot.intent.js');

           var bidObjArr = JSON.parse(parsedBidUrlQueryString);

            expect(bidObjArr).to.have.property('bids');
            var bidObj1 = bidObjArr.bids[0];

            expect(bidObj1.sizes).to.have.property('sizes').and.to.equal('300x250');
            expect(bidObj1.psn).to.have.property('psn').and.to.equal('1234');
            expect(bidObj1.psn).to.have.property('placementCode').and.to.equal('div-gpt-ad-1460505748561-0');
            

            var bidObj2 = bidObjArr.bids[1];

            expect(bidObj2).to.have.property('sizes').and.to.equal('728x90');
            expect(bidObj2).to.have.property('psn').and.to.equal('1234');
            expect(bidObj1.psn).to.have.property('placementCode').and.to.equal('div-gpt-ad-1460505661639-0');
  
    });
});

/*describe('yieldbot adapter tests', function () {

    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var urlParse = require('url-parse');
    var querystringify = require('querystringify');

    window.pbjs = window.pbjs || {};
    if (typeof(ybotq)==="undefined"){
        var ybotq = window.ybotq;
    }
	
    let adapter;
	let sandbox;
 
	beforeEach( function() {
        adapter = new Adapter();
		sandbox = sinon.sandbox.create();
		sandbox.stub(adLoader, 'loadScript');
	});

	afterEach( function() {
		sandbox.restore();
	});

 describe('creation of bid url', function () {
        it('should be called once', function () {

            var bidderRequest = {
                bidderCode: 'yieldbot',
                bidder: 'yieldbot',
                bids: [
                        {
		          bidId: '202c119164171c',
     		          sizes: [[300, 250], [300, 600]],
                          bidder: 'yieldbot',
                          params: { psn: '1234', slot: 'medrec' },
                          requestId: '35f5139c-dddb-46d4-8d57-bc21bab366f4',
                          placementCode: 'div-gpt-ad-1460505661639-0'
                         }

                ]
            };

            adapter.callBids(bidderRequest);

        });

        it('should have load the script', function () {
            var url = void 0;         
            url = adLoader.loadScript;
            expect(url).to.equal('//cdn.yldbt.com/js/yieldbot.intent.js');
            console.log('check my URL:', url);

        });

       it('should fix parameter name', function () {

            var bidderRequest = {
                bidderCode: 'yieldbot',
                bidder: 'yieldbot',
                bids: [
                        {
                            bidId: '2155fc9a2db648',
                            sizes: [[300, 250], [300, 600]],
                            bidder: 'yieldbot',
                            params: { psn: '1234', slot: 'medrec' },
                            requestId: '6d6802a-e3d9-49bf-b0eb-2e5e249ae54b',
                            placementCode: 'div-gpt-ad-1460505748561-0'
                        }

                ]
            };

            adapter.callBids(bidderRequest);
            
        var requestURI =  adLoader.loadScript.getCall(0).args[0];

        sinon.assert.calledWith( adLoader.loadScript, requestURI);
        console.log('what:',  adLoader.loadScript);

        var parsedBidUrl = urlParse(requestURI);
        var parsedBidUrlQueryString = querystringify.parse(parsedBidUrl.query);
        console.log('what is in this:', parsedBidUrlQueryString);

        expect(parsedBidUrl.hostname).to.equal('cdn.yldbt.com');
        expect(parsedBidUrl.pathname).to.equal('/js/yieldbot.intent.js');

        expect(parsedBidUrlQueryString).to.have.property('sizes').and.to.equal('300x250');
        expect(parsedBidUrlQueryString).to.have.property('bidId').and.to.equal('2155fc9a2db648');
        expect(parsedBidUrlQueryString).to.have.property('placementCode').and.to.equal('div-gpt-ad-1460505748561-0');
            
        });

     });
        
   describe('placement by size', function () { 

       it('should be called with specific parameters for two bids', function () {

            var bidderRequest = {
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

            adapter.callBids(bidderRequest);

            var bidUrl = ybotLoadScript.getCall(0).args[0];

            sinon.assert.calledWith(ybotLoadScript, bidUrl);

            var parsedBidUrl = urlParse(bidUrl);
            var parsedBidUrlQueryString = querystringify.parse(parsedBidUrl.query);

            expect(parsedBidUrl.hostname).to.equal('cdn.yldbt.com');
            expect(parsedBidUrl.pathname).to.equal('/js/yieldbot.intent.js');

            var bidObjArr = JSON.parse(parsedBidUrlQueryString);
            expect(bidObjArr).to.have.property('bids');
            var bidObj1 = bidObjArr.bids[0];

            expect(bidObj1.sizes).to.have.property('sizes').and.to.equal('300x250');
            expect(bidObj1.psn).to.have.property('psn').and.to.equal('1234');
            expect(bidObj1.psn).to.have.property('placementCode').and.to.equal('div-gpt-ad-1460505748561-0');
            

            var bidObj2 = bidObjArr.bids[1];

            expect(bidObj2).to.have.property('sizes').and.to.equal('728x90');
            expect(bidObj2).to.have.property('psn').and.to.equal('1234');
            expect(bidObj1.psn).to.have.property('placementCode').and.to.equal('div-gpt-ad-1460505661639-0');

      });
    
   });

}); */