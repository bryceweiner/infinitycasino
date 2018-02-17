// Thanks to @xavierlepretre for providing the basis of this function
// https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6

// This allows you to poll for a transaction receipt being mined, and allows you to 
// circumvent the faulty metamask event watchers.
// In standard web3.js, a getTransactionReceipt returns null if the tx has not been
// mined yet. This will only return the actual receipt after the tx has been mined.

function getTransactionReceiptMined(txHash) {
    const self = this;
    const transactionReceiptAsync = function(resolve, reject) {
        web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
            if (error) {
                reject(error);
            } else if (receipt == null) {
                setTimeout(
                    () => transactionReceiptAsync(resolve, reject), 500);
            } else {
                resolve(receipt);
            }
        });
    }
    return new Promise(transactionReceiptAsync);
};

function hexToOctal(hexString){
    var hexAlphabet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    var hexToBinaryDecoder = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111'];
    var octalToBinaryDecoder = ['000', '001', '010', '011', '100', '101', '110', '111'];
    var octalAlphabet = ['0', '1', '2', '3', '4', '5', '6', '7'];

    var binaryString = '';
    var hexChar;
    var binaryQuad;

    for (var i = 0; i < hexString.length; i++){
        hexChar = hexString.charAt(i);
        binaryQuad = hexToBinaryDecoder[hexAlphabet.indexOf(hexChar)];

        binaryString += binaryQuad;
    }

    var octalString = '';
    var binaryTriple;
    var octalChar;

    for (var j = 0; j < binaryString.length; j += 3){
        binaryTriple = binaryString.slice(j, j+3);
        octalChar = octalAlphabet[octalToBinaryDecoder.indexOf(binaryTriple)];

        octalString += octalChar;
    }

    return octalString;
}

MoonMissionSlots = {
    // contract data
    dial1Layout: [[15], [30, 35, 41, 43, 45, 49, 54], [51], [9, 21, 22, 27, 37], [1, 6, 26, 28, 40, 52, 56, 59, 60], [3, 25, 32, 34, 38, 42, 57, 61, 62], [2, 4, 5, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 23, 24, 29, 31, 33, 36, 39, 44, 46, 47, 48, 50, 53, 55, 58, 63, 64]],
    dial2Layout: [[14, 15, 16], [5], [34, 42, 44, 46, 57, 58, 61], [7, 8, 22, 23, 36, 37, 56], [1, 27, 28, 52, 59, 64], [25, 31, 32, 38, 41, 47, 53, 54], [2, 3, 4, 6, 9, 10, 11, 12, 13, 17, 18, 19, 20, 21, 24, 26, 29, 30, 33, 35, 39, 40, 43, 45, 48, 49, 50, 51, 55, 60, 62, 63]],
    dial3Layout: [[17], [41, 43, 45, 47, 49, 54], [4, 44, 51, 61, 62, 64], [2, 11, 22, 25, 28, 37], [1, 7, 8, 23, 29, 40, 59], [3, 24, 32, 38, 42, 57], [5, 6, 9, 10, 12, 13, 14, 15, 16, 18, 19, 20, 21, 26, 27, 30, 31, 33, 34, 35, 36, 39, 46, 48, 50, 52, 53, 55, 56, 58, 60, 63]],

    // geLayout: [[43], [42,43,44], [45]],
    // seLayout: [[4,11,12,13,14,15,58], [10], [11,12,13,14,15,16]],
    // beLayout: [[28], [21,22,23,24,25,26,27], [26,27,28,29,30,31]],
    // gpLayout: [[6,37,49,51,55], [5,6,35,36,50,51,52], [6,7,39,51,56,60]],
    // spLayout: [[1,2,3,32,33,34,50,54,56], [1,2,31,32,55,56], [1,2,3,35,36,52,57]],
    // bpLayout: [[20,21,22,23,27,29,60,61,62], [14,15,16,17,59,60,61,62], [20,21,22,53,61,62]],
    // bLayout: [[4,6,7,8,9,15,16,17,18,23,24,25,29,30,34,35,37,38,39,40,41,43,44,45,46,47,51,52,56,58,62,63], [2,3,6,7,8,10,11,12,17,18,19,27,28,29,32,33,36,37,38,39,40,44,45,46,47,48,52,53,56,57,62,63], [3,4,7,8,9,16,17,18,22,23,24,31,32,33,36,37,39,40,41,42,43,45,46,47,48,49,53,54,57,58,62,63]],
    maxBet: null,
    minBet: null,
    maxSpins: 84, // this is hard coded into the contract.
    player: null, // players ethereum address.
    playerBalance: null, // players balance in wei
    // data when credits are purchased.
    betPerCredit: null,
    credits: null,
    // data when credits are given by contract
    onCredit: 1,
    spinData: null,
    totalProfit: null,
    dial1Type: null,
    dial2Type: null,
    dial3Type: null,
    // web3 stuff
    web3Provider: null,
    Slots: null,
    slotsInstance: null,

    init: function() {
        MoonMissionSlots.initWeb3();
        MoonMissionSlots.bindInitialEvents();
    },

    initWeb3: function(){
        setTimeout(function(){
            if (typeof web3 !== 'undefined'){
                console.log('getting web3');
                MoonMissionSlots.web3Provider = web3.currentProvider;

                web3.version.getNetwork( (error, result) => {
                    if (error || result !== '4'){
                        launchWrongNetworkModal('Moon Mission Slots');
                        return;
                    }
                    else {
                        return MoonMissionSlots.initContract(web3);
                    }
                });
            }
            else {
                launchNoMetaMaskModal('Moon Mission Slots');
                return;
            }
        }, 500);
    },

    initContract: function(web3){
        $.getJSON('./abi/SlotsABI.json', function(data){
            // get contract ABI and init
            var slotsAbi = data;

            MoonMissionSlots.Slots = web3.eth.contract(slotsAbi);
            MoonMissionSlots.slotsInstance = MoonMissionSlots.Slots.at('0x2411d2263811E5b216a7Cc747eAbc6DB00B8F207');

            return MoonMissionSlots.getContractDetails(web3);

        });
    },

    getContractDetails: function(web3){
        var amountWagered = MoonMissionSlots.slotsInstance.AMOUNTWAGERED.call(function(error, result){
            if (error){
                console.log('could not retreive balance!');
            }
            else {
                $('#amt-wagered').html(web3.fromWei(result, "ether").toString().slice(0,7));
            }
        });
        var gamesPlayed = MoonMissionSlots.slotsInstance.DIALSSPUN.call(function(error, result){
            if (error){
                console.log('could not get dials spun');
            }
            else {
                var games = result.dividedBy(3);
                $('#games-played').html(games.toString());
            }
        });
        var minBet = MoonMissionSlots.slotsInstance.MINBET.call(function(error, result){
            if (error){
                console.log('could not get min bet');
            }
            else {
                $('#min-bet').html(web3.fromWei(result, "ether").toString().slice(0,7));
                MoonMissionSlots.minBet = result;
            }
        });
        var maxBet = MoonMissionSlots.slotsInstance.MAXWIN_inTHOUSANDTHPERCENTS.call(function(error, result){
            if (error){
                console.log('could not get bet limit');
            }
            else {
                var maxWin = parseFloat(String(result));
                
                MoonMissionSlots.slotsInstance.BANKROLL.call(function(error, result){
                    if (error){
                        console.log('could not get bankroll!');
                    }
                    else {
                        // result = new BigNumber(result.toString());
                        var max = result.times(maxWin).dividedBy(1000).dividedBy(5000).toFixed(0);                        
                        $('#max-bet').html(web3.fromWei(max, "ether").toString().slice(0,7));
                        MoonMissionSlots.maxBet = new BigNumber(max);
                    }
                });
            }
        });
        var gamePaused = MoonMissionSlots.slotsInstance.GAMEPAUSED.call(function(error, result){
            if (error){
                console.log('could not get game paused');
            }
            else {
                if (result === true){
                    alert('Game is paused! No bets please!');
                }
            }
        });

        return MoonMissionSlots.getPlayerDetails(web3);
    },

    getPlayerDetails: function(web3){
        var accounts = web3.eth.accounts;
        if (accounts.length === 0){
            launchNoLoginModal('Moon Mission Slots');
        }
        else {
            var playersAccount = accounts[0];
            $('#players-address').html(String(playersAccount));

            var playersBalance = web3.eth.getBalance(playersAccount, function(error, result){
                if (error){
                    console.log('could not get players balance');
                }
                else {
                    $('#players-balance').html(web3.fromWei(result, "ether").toString());
                    MoonMissionSlots.playerBalance = result;
                }
            });
            MoonMissionSlots.player = playersAccount;
            return playersAccount;
        }
    },

    bindInitialEvents: function() {
        $('#buy-credits').click(function(){ MoonMissionSlots.buyCredits(); });
        $('#spin-wheel').click(function(){ MoonMissionSlots.spinWheel(); });
    },

    buyCredits: function() {
        var credits = numberSpinsValue();
        var betPerCredit = $('#bet-per-spin').val();

        MoonMissionSlots.credits = parseInt(credits);
        MoonMissionSlots.betPerCredit = new BigNumber(betPerCredit);
        MoonMissionSlots.onCredit = 1;
        MoonMissionSlots.totalProfit = new BigNumber(0);

        var totalBet = MoonMissionSlots.betPerCredit.times(credits);

        player = MoonMissionSlots.getPlayerDetails(web3);
        MoonMissionSlots.slotsInstance.play(credits, {value: web3.toWei(totalBet, "ether"), from: player}, async function(error, result){
            if (error) {
                console.log('error while purchasing credits ---', error);
            }
            else {
                $('#game-info').show();
                $('#game-info').html('transaction waiting to be mined...');
                var txHash = result;
                var txReceipt = await getTransactionReceiptMined(txHash);

                console.log('logs', txReceipt.logs);

                if (txReceipt.logs.length === 0){
                    $('#game-info').html('UH OH! Transaction seemed to fail! Please try again, or check etherscan for more info...')
                }
                else if (txReceipt.logs.length === 1){
                    var data = txReceipt.logs[0]['data'];
                    
                    MoonMissionSlots.parseData(data);
                }
                else if (txReceipt.logs.length === 2){
                    $('#game-info').html('transaction mined! getting provably fair randomness! spins will be ready in a sec...');
                    // BuyCredits topic
                    var resultTopic = '0xc97a66505c1c68fd69c7d907e99a861eb4cf9a33460059bee6f6ec5a9e677931';
                    // Ledger Proof Failed topic
                    var failTopic = '0x2576aa524eff2f518901d6458ad267a59debacb7bf8700998dba20313f17dce6';
                    // get oraclize query id from the logs...
                    var oraclizeQueryId = txReceipt.logs[1]['topics'][1];
                    // now watch for the oraclize callback with this queryId
                    var watchForResult = web3.eth.filter({topics: [resultTopic, oraclizeQueryId], fromBlock: 'pending', to: MoonMissionSlots.slotsInstance.address});
                    var watchForFail = web3.eth.filter({topics: [failTopic, oraclizeQueryId], fromBlock: 'pending', to: MoonMissionSlots.slotsInstance.address});

                    console.log(txReceipt.logs);
                    console.log(oraclizeQueryId);
                    console.log(watchForResult);
                    
                    watchForResult.watch(function(error, result){
                        if (error) {
                            console.log('could not get result from oraclize', error);
                        }
                        else {
                            watchForResult.stopWatching();
                            watchForFail.stopWatching();

                            var data = result.data;
                            console.log(data);

                            MoonMissionSlots.parseData(data);
                        }
                    });

                    watchForFail.watch(function(error, result){
                        if (error) {
                            console.log('fail event triggered, but errored', error)
                        }
                        else {
                            watchForResult.stopWatching();
                            watchForFail.stopWatching();

                            $('#game-info').html('We apologize, but the random number has not passed our test of provable randomness, so all your ether has been refunded. Please feel free to play again, or read more about our instantly provable randomness generation here (((((LINK HERE)))))). We strive to bring the best online gambling experience at Infinity Casino, and occasionally the random numbers generated do not pass our stringent testing.');
                        }
                    });
                }
            }
        });
    },

    calculateMaxBet: function(){
        // reduce the maxBet somewhat, so we don't get accidental reverts
        var maxBet = new BigNumber(MoonMissionSlots.maxBet.times(0.95).toFixed(0));
        console.log('click max bet', maxBet);
        return maxBet
    },

    calculateMinBet: function(){
        return MoonMissionSlots.minBet;
    },

    parseData: function(data){
        // there are 8 uint265's worth of data for slots
        // each uint256 starts with one zero, so delete that.
        var parsedData = data.slice(3,66) + data.slice(67, 130) + data.slice(131, 193) + data.slice(194, 256);
        parsedData += data.slice(257, 318) + data.slice(319, 382) + data.slice(383, 445) + data.slice(446, 508);

        // now convert parsedData to octal, each dial is represented in octal notation.
        parsedData_octal = hexToOctal(parsedData);
        console.log('all data', data);
        console.log('octal data', parsedData_octal);

        MoonMissionSlots.spinData = parsedData_octal;

        $('#spins-remaining').text(MoonMissionSlots.credits);
        $('#total-profit').text('0');

        $('#game-info').hide();
        $('#place-bets').hide();
        $('#spin-bets').show();

    },

    spinWheel: function() {

        // disable the spin button while the wheel is spinning
        $('#spin-wheel').addClass('disabled');
        $('#spin-wheel').off('click');

        MoonMissionSlots.dial1Type = parseInt(MoonMissionSlots.spinData[0], 10);
        MoonMissionSlots.dial2Type = parseInt(MoonMissionSlots.spinData[1], 10);
        MoonMissionSlots.dial3Type = parseInt(MoonMissionSlots.spinData[2], 10);

        MoonMissionSlots.spinData = MoonMissionSlots.spinData.slice(3);

        var dial1Location = String(MoonMissionSlots.dial1Layout[MoonMissionSlots.dial1Type][Math.floor(Math.random() * MoonMissionSlots.dial1Layout[MoonMissionSlots.dial1Type].length)]);
        var dial2Location = String(MoonMissionSlots.dial2Layout[MoonMissionSlots.dial2Type][Math.floor(Math.random() * MoonMissionSlots.dial2Layout[MoonMissionSlots.dial2Type].length)]);
        var dial3Location = String(MoonMissionSlots.dial3Layout[MoonMissionSlots.dial3Type][Math.floor(Math.random() * MoonMissionSlots.dial3Layout[MoonMissionSlots.dial3Type].length)]);

        // spin through all combinations, and then blindly search for the previously determined dial position
        MoonMissionSlots.animateWheel('#dial-1', 0, dial1Location, false);
        MoonMissionSlots.animateWheel('#dial-2', 0, dial2Location, false);
        MoonMissionSlots.animateWheel('#dial-3', 0, dial3Location, false);
    },

    animateWheel: function(dialId, numberChanges, dialLocation, searching){

        var currentLocation;

        // dial 1 search & stop after 32 spins
        // dial 2 search & stop after 96 spins
        // dial 3 search & stop after 160 spins
        if ((dialId === '#dial-1' && (numberChanges > 0 || searching)) || (dialId === '#dial-2' && (numberChanges > 64 || searching)) || (dialId === '#dial-3' && (numberChanges > 128 || searching))){
            // get the current location from the id of the dial in the middle of the view (4th down)
            currentLocation = $(dialId + ' div:nth-child(4)')[0].id.slice(7);

            // start "search"... aka spin 64 more times and slowly come to a stop
            if (!searching && currentLocation === dialLocation){
                MoonMissionSlots.doWheelAnimation(dialId, 1, dialLocation, true);
            }
            // done with search, display a payout if there is one & the third dial is done spinning!
            else if (searching && numberChanges === 64){
                if (dialId === '#dial-3'){
                    console.log('DONE!!!!!!!');
                    // if the third dial is done spinning (means they all are done spinning), animate the payment
                    MoonMissionSlots.animatePayment();
                }
                console.log('HERE!!!!!!!');
                // finished!

            }
            // keep going like normal!
            else {
                MoonMissionSlots.doWheelAnimation(dialId, numberChanges + 1, dialLocation, searching);
            }
        }
        // not searching, just keep spinning fast
        else {
            MoonMissionSlots.doWheelAnimation(dialId, numberChanges + 1, dialLocation, false); 
        }
        
    },

    doWheelAnimation: function(dialId, numberChanges, dialLocation, searching){
        var animationSpeed;

        if (! searching){
            // set animation speed high, wheel is still spinning fast.
            animationSpeed = 15;
        }
        // if the wheel is searching for a stop, then gradually slow and stop on the correct element
        else {
            animationSpeed = 15 + (1.5 * numberChanges);
        }
        // NOW DO THE ANIMATION...

        // clone and append this picture to the bottom of the wheel
        $(dialId + ' div:first-child').clone().appendTo($(dialId));

        // animate the wheel with simple picture shrinking animation with a variable speed to simulate the wheel spinning.
        $(dialId + ' div:first-child').animate({height: '0'}, animationSpeed, 'linear', () => {
            // delete the shrunken (and now cloned) div
            $(dialId + ' div:first-child').remove();

            // Call animate wheel again...
            MoonMissionSlots.animateWheel(dialId, numberChanges, dialLocation, searching);
        });
    },

    animatePayment: function(){
        var winningsMultiple = 0;

        if (MoonMissionSlots.dial1Type === 2 && MoonMissionSlots.dial2Type === 1 && MoonMissionSlots.dial3Type === 0){
            winningsMultiple = 5000;
        }
        else if (MoonMissionSlots.dial1Type === 0 && MoonMissionSlots.dial2Type === 0 && MoonMissionSlots.dial3Type === 0){
            winningsMultiple = 1777;
        }
        else if (MoonMissionSlots.dial1Type === 1 && MoonMissionSlots.dial2Type === 1 && MoonMissionSlots.dial3Type === 1){
            winningsMultiple = 250;
        }
        else if (MoonMissionSlots.dial1Type === 2 && MoonMissionSlots.dial2Type === 2 && MoonMissionSlots.dial3Type === 2){
            winningsMultiple = 250;
        }
        else if (MoonMissionSlots.dial1Type >= 0 && MoonMissionSlots.dial1Type <= 2 && MoonMissionSlots.dial2Type >= 0 && MoonMissionSlots.dial2Type <= 2 && MoonMissionSlots.dial3Type >= 0 && MoonMissionSlots.dial3Type <= 2){
            winningsMultiple = 95;
        }
        else if (MoonMissionSlots.dial1Type === 5 && MoonMissionSlots.dial1Type === 4 && MoonMissionSlots.dial3Type === 3){
            winningsMultiple = 90;
        }
        else if (MoonMissionSlots.dial1Type === 3 && MoonMissionSlots.dial2Type === 3 && MoonMissionSlots.dial3Type === 3){
            winningsMultiple = 50;
        }
        else if (MoonMissionSlots.dial1Type === 4 && MoonMissionSlots.dial2Type === 4 && MoonMissionSlots.dial3Type === 4){
            winningsMultiple = 25;
        }
        else if ((MoonMissionSlots.dial1Type === 3 && ((MoonMissionSlots.dial2Type == 4 && MoonMissionSlots.dial3Type === 5) || (MoonMissionSlots.dial2Type === 5 && MoonMissionSlots.dial3Type === 4)))
            || (MoonMissionSlots.dial1Type === 4 && ((MoonMissionSlots.dial2Type == 3 && MoonMissionSlots.dial3Type === 5) || (MoonMissionSlots.dial2Type === 5 && MoonMissionSlots.dial3Type === 3)))
            || MoonMissionSlots.dial1Type === 5 && MoonMissionSlots.dial2Type === 3 && MoonMissionSlots.dial3Type === 4){

            winningsMultiple = 20;
        }
        else if (MoonMissionSlots.dial1Type === 5 && MoonMissionSlots.dial2Type === 5 && MoonMissionSlots.dial3Type === 5){
            winningsMultiple = 10;
        }
        else if (MoonMissionSlots.dial1Type >= 3 && MoonMissionSlots.dial1Type <= 5 && MoonMissionSlots.dial2Type >= 3 && MoonMissionSlots.dial2Type <= 5 && MoonMissionSlots.dial3Type >= 3 && MoonMissionSlots.dial3Type <= 5){
            winningsMultiple = 3;
        }
        else if ((MoonMissionSlots.dial1Type === 0 || MoonMissionSlots.dial1Type === 3) && (MoonMissionSlots.dial2Type === 0 || MoonMissionSlots.dial2Type === 3) && (MoonMissionSlots.dial3Type === 0 || MoonMissionSlots.dial3Type === 3)){
            winningsMultiple = 3;
        }
        else if ((MoonMissionSlots.dial1Type === 1 || MoonMissionSlots.dial1Type === 4) && (MoonMissionSlots.dial2Type === 1 || MoonMissionSlots.dial2Type === 4) && (MoonMissionSlots.dial3Type === 1 || MoonMissionSlots.dial3Type === 4)){
            winningsMultiple = 2;
        }
        else if ((MoonMissionSlots.dial1Type === 2 || MoonMissionSlots.dial1Type === 5) && (MoonMissionSlots.dial2Type === 2 || MoonMissionSlots.dial2Type === 5) && (MoonMissionSlots.dial3Type === 2 || MoonMissionSlots.dial3Type === 5)){
            winningsMultiple = 2;
        }
        else if (MoonMissionSlots.dial1Type === 6 && MoonMissionSlots.dial2Type === 6 && MoonMissionSlots.dial3Type === 6){
            winningsMultiple = 1;
        }

        var winningsEther = MoonMissionSlots.betPerCredit.times(winningsMultiple);

        // add to total profit
        MoonMissionSlots.totalProfit = MoonMissionSlots.totalProfit.add(winningsEther);

        if (winningsMultiple > 0){
            $('#score-pop').text('\u25CA' + winningsEther.toString().slice(0,9)).show().animate({bottom: '70%'}, 2000, () => {

                $('#score-pop').fadeOut(600, () => {
                    // reset the css to go back down
                    $('#score-pop').css({bottom: '10%'})
                });
            });
        }

        // now update the ticker based on whether the user won or lost (red or green)
        var cssColor;
        winningsMultiple > 0 ? cssColor = {'color': 'green'} : cssColor = {'color': 'red'};

        updateTicker(MoonMissionSlots.onCredit, MoonMissionSlots.credits, MoonMissionSlots.totalProfit, cssColor);

        // roll has resolved, so increment the credits
        MoonMissionSlots.onCredit += 1;

        // possibly end game if out of credits
        if (MoonMissionSlots.onCredit > MoonMissionSlots.credits){

            setTimeout( () => {
                $('#spin-bets').hide();
                $('#place-bets').show();
                $('#spin-wheel').removeClass('disabled');
                $('#spin-wheel').click( () => {MoonMissionSlots.spinWheel()} );
            }, 5000);
        }
        // just immeiately re-enable the button for another sesh
        else {
            $('#spin-wheel').removeClass('disabled');
            $('#spin-wheel').click( () => {MoonMissionSlots.spinWheel()} );
        }
    },
};

function updateTicker(onRoll, totalRolls, currentProfit, cssColor){
     // since the user won, animate the status bar in green
    $('#spins-remaining').css(cssColor);
    $('#total-profit').css(cssColor);

    $('#spins-remaining').text((MoonMissionSlots.credits - MoonMissionSlots.onCredit).toString());
    $('#total-profit').text(MoonMissionSlots.totalProfit.toString().slice(0,8));

    setTimeout( () => {
        $('#spins-remaining').css({'color': 'white'});
        $('#total-profit').css({'color': 'white'});
    }, 500);
}

$(document).ready(function(){
    initUI();
    MoonMissionSlots.init();
});

function initUI(){
    spinCountValues = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,18,20,22,24,26,28,30,35,40,45,50,55,60,70,80,90,100,120,140,160,180,200,224];

    //number spins slider
    $('#number-spins').slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: spinCountValues.length - 1,
        value: 9,
        slide: function(event, ui){
            $("#current-number-spins").text(spinCountValues[ui.value]);
        }
    });

    // max and min buttons
    $('#max-bet-per-spin').click(function(){
        var maxBet = MoonMissionSlots.calculateMaxBet();
        $('#bet-per-spin').val(web3.fromWei(maxBet, "ether"));
    });

    $('#min-bet-per-spin').click(function(){
        var minBet = MoonMissionSlots.calculateMinBet();
        $('#bet-per-spin').val(web3.fromWei(minBet, "ether"));
    });

    // double and half bet buttons
    $('#double-bet-per-spin').click(function(){
        var maxBet = MoonMissionSlots.calculateMaxBet();
        var doubleBet = new BigNumber(web3.toWei($('#bet-per-spin').val(), "ether")).times(2);

        if (maxBet.lessThan(doubleBet)){
            $('#bet-per-spin').val(web3.fromWei(maxBet, "ether"));
        }
        else{
            $('#bet-per-spin').val(web3.fromWei(doubleBet, "ether"));
        }
    });

    $('#half-bet-per-spin').click(function(){
        var minBet = MoonMissionSlots.calculateMinBet();
        var halfBet = new BigNumber(web3.toWei($('#bet-per-spin').val(), "ether")).dividedBy(2);

        if (minBet.greaterThan(halfBet)){
            $('#bet-per-spin').val(web3.fromWei(minBet, "ether"));
        }
        else {
            $('#bet-per-spin').val(web3.fromWei(halfBet, "ether"));
        }
    });
}

function numberSpinsValue(){
    return spinCountValues[$('#number-spins').slider('option', 'value')];
}



