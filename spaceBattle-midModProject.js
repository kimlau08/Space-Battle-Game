//alien ship weapon ratings
const hullMin=3;       const hullMax=4;         //should be 4
const firepowerMin=2;  const firepowerMax=4;    //should be 4
const accuracyMin=0.6; const accuracyMax=0.8;   //should be 0.8

//my ship weapon ratings
const myId=0;
const myHull=20;
const myFirepower=5;
const myAccuracy=0.7;

//my bonus weapons
const hitPtIncreaseMin=1;   const hitPtIncreaseMax=myHull; //my hit point boost up to orignal hull level
const misslePower=10;  //one missle hit can destroy target alien ship
const missleCount=2;

//alien's bonus weapons
const alienShipCountMin=1; const alienShipCountMax=3;
const megaShipId=5000;
const megaPodCount=2;      const megaPodIdStart=1001;
const megaPodFirepower=6;

//Styling variables
const prologMsgStyle="color: orange; font-weight: bold;"
const targetIsHitMsgStyle="color: blue; border: 1px solid grey;"
const targetIsDestroyedMsgStyle="color: red; font-size: 16px;"
const winnerMsgStyle="color: red; font-size: 16px;"
const retreatMsgStyle="color: blue; font-size: 16px;"
const hullRestoreMsgStyle="color: purple; font-size: 16px;"


//Test utilities - run on terminal only during test run. Random choices are made in lieu of prompt
const testRun=false;
function logTestOutput(str) {
    if (testRun) {
        console.log(str);
    }
}

/*******************Global game status*****************/
//First level game board
let gameBoard = {
    alienShipCount:6,   //count used for initializing alien ship array- to be restored to 6
    myShip:{},
    alienShips:[], //array shrinks as ships are destroyed
    gameWinner:"none",

    //Initialize game board
    createMyShip : function () {
        return new shipObj(myId, myHull, myFirepower, myAccuracy);
    },
    createAlienFleet : function () {
        let fleet=[];
        for (let id=1; id<=this.alienShipCount; id++) {    //id of zero is reserved for myShip
            fleet.push(new randomShip(id));
        }
        return fleet;
    },
    printAlienFleetStatus : function (msg) {
        console.log(msg, 
            prologMsgStyle);
        for (let i=0; i<this.alienShips.length; i++) {
            console.log(`%c   alien ship: ${this.alienShips[i].shipId}. Hull: ${this.alienShips[i].hull} Laser Firepower: ${this.alienShips[i].laser.firepower} Accuracy: ${this.alienShips[i].accuracy}`,
            prologMsgStyle);
        }
    },
    printUSSShipStatus : function (msg) {
        console.log(msg,
            prologMsgStyle);
        console.log(`%cYour ship is USS Schwarzenegger with ship id: ${this.myShip.shipId}`,
        prologMsgStyle); 
        console.log(`%c   Hull: ${this.myShip.hull}  Laser Firepower: ${this.myShip.laser.firepower} Accuracy: ${this.myShip.accuracy}`,
        prologMsgStyle);
    },

    //Play game
    startGame : function () {
        this.myShip=this.createMyShip();
        this.alienShips=this.createAlienFleet(); 
    },
    playGame : function () {
        logTestOutput(this);
        //console.log(this); 
        console.log("%cThe USS Schwarzenegger is on a mission to destroy every last alien ship. It has encountered an alien fleet. Battle is about to begin...", prologMsgStyle);
        this.printAlienFleetStatus(`%cIn addition to a mega ship, the alien fleet has ${this.alienShips.length} ships:`)
        this.printUSSShipStatus("%c");

        if (!confirmAttack()) {
            console.log(`%cRetreating...Game ends`, retreatMsgStyle);
            return;
        }
        console.log(`-----------------------------Game begins-----------------------------`);
        let round=1; 
        this.gameWinner="none";
        while (this.gameWinner==="none") {
            console.log(`-------------------------------Round ${round}-------------------------------`);
            //my ship attacks the alien ship first
            let targetShip=this.findAlienTarget();
            this.myShip.attack(this, targetShip, this.myShip.laser);
            updateGameWinner(this);
            if (this.gameWinner==="none") {
                //the alien ship attacks my ship
                // (If the first alien ship was destroyed, the next alien ship attacks in its place)
                this.alienShips[0].attack(this, this.myShip, this.alienShips[0].laser);
                updateGameWinner(this);
            }
            
            logTestOutput(this);
            //console.log(this); 
            if (this.gameWinner==="none") {
                this.printAlienFleetStatus(`%cNow, the alien fleet has ${this.alienShips.length} ships remaining:`);
                this.printUSSShipStatus("%c");
                if (!confirmAttack()) {
                    console.log(`Retreating...Game ends`);
                    return;
                };
                round++;
            }
        }
    },

    findAlienTarget : function () {
        if (this.alienShips.length >= 1) {
            //console.log(`Targeting alien ship: ${this.alienShips[0].shipId}`);
            return this.alienShips[0];
        }
        return null;
    },
    findAdjAlienTarget : function (targetShip) {
        if (targetShip.shipId==myId) {
            return null;    //my ship does not have a near-by ship
        }
        if (targetShip.shipId < (this.alienShips.length)) {  //valid alien ship id includes array length
            return this.alienShips[targetShip.shipId+1];
        }
        return null; //no more alien ship in the array
    }
}


class weapon {
    firepower=0
    shipImpact=1;
    constructor (firepower, shipImpact) {
        this.firepower=firepower;
        this.shipImpact=shipImpact;
    }
    fireWeapon (targetShip) {

        let logMsg=isAlienShip(targetShip) ? `Locked on to alien ship: ${targetShip.shipId}` : `USS Schwarzenegger is being targeted`;
        console.log(logMsg);
        let acc=randomInRange(0, 1);
        if (acc < targetShip.accuracy) {
            let hitReport=isAlienShip(targetShip) ? "%cSuccessful hit!!!" : "%cUSS Schwarzenegger is hit!";
            console.log(`${hitReport}`, targetIsHitMsgStyle);
            return true;    //target ship has been hit
        }
        if (isAlienShip(targetShip)) {
            console.log("Missed!?");
        } else {
            console.log("Weapon missed. USS Schwarzenegger is undamaged");
        }
        return false;
    }
}

class shipObj {
    shipId=0
    hull=0
    accuracy=0
    laser={}
    constructor (id, hull, laserPower, acc) {
        this.shipId=id;
        this.hull=hull;
        this.laser=new weapon(laserPower, 1); //laser take effect on one ship at a time
        this.accuracy=acc;
    }

    get hull ()     { return this.hull; }
    /**
     * @param {number} newHull
     */
    set hull (newHull) { this.hull=newHull; }
    get accuracy () { return this.accuracy; }

    destroyAlienShip(game, aShip) {
        let j=0;
        for (; j<game.alienShips.length; j++) {
            if (game.alienShips[j].shipId==aShip.shipId) {
                break;
            }
        }
        if (j<game.alienShips.length) {  //Found alien ship in array
            game.alienShips.splice(j,1); //delete ship from array
            console.log("%cAlien ship destroyed", targetIsDestroyedMsgStyle);
        }
    }
    destroyMegaPod(game, aShip) {
        let j=0;
        for (; j<game.megaAlienShip.weaponPods.length; j++) {
            if (game.megaAlienShip.weaponPods[j].shipId==aShip.shipId) {
                break;
            }
        }
        if (j<game.megaAlienShip.weaponPods.length) {  //Found alien ship in array
            game.megaAlienShip.weaponPods.splice(j,1); //delete ship from array
            console.log("%cMega pod destroyed", targetIsDestroyedMsgStyle);
        }
    }
    destroyMegaShip(game, aShip) {
        console.log("%c******Mega ship destroyed%******", targetIsDestroyedMsgStyle);
    }

    attack(game, targetShip, weapon) {
        if (weapon.fireWeapon(targetShip)) {
            //hit target ship, and possibly adjacent ship, depending on the weapon
            let aShip=targetShip;
            let residualPower=weapon.firepower;
            let shipUnderAttack=isAlienShip(targetShip) ? `Target ship ${aShip.shipId}   ` : "USS Schwarzenegger";
            //reduce hull for each impacted ship
            for (let i=0; i<weapon.shipImpact; i++) {
                aShip.hull -= residualPower;  //reduce target hull strength
                if (aShip.hull >= 0) {
                    console.log(`${shipUnderAttack} hull reduced to: ${aShip.hull}`);
                    break; //there is no residual power to damage next ship
                }
                //Residual power will damage next ship
                residualPower=Math.abs(aShip.hull);   //hull is -1*residual power # after being destroyed
                aShip.hull=0;
                console.log(`${shipUnderAttack} hull reduced to: ${aShip.hull}`);
                    
                //destroy ship
                let nxtShip=null;
                if (aShip.hull <= 0) {
                    //aShip will be reduced to no hull. Find the next ship.
                    nxtShip=game.findAdjAlienTarget(targetShip); //need to be called before deleting aShip
                    if (isMegaPod(aShip)) {
                        this.destroyMegaPod(game, aShip);
                    } else if (isMegaShip(aShip)) {
                        this.destroyMegaShip(game, aShip);  /* to be defined */
                    } else if (isAlienShip(aShip)) {
                        this.destroyAlienShip(game, aShip);
                    } else {   
                        console.log("%cUSS Schwarzenegger has been destroyed", targetIsDestroyedMsgStyle);
                    }
                }
                
                //effect residual power on next ship
                aShip=nxtShip;
                if (aShip == null) {
                    break; //there is no adj ship
                }
            }

        }
    }
}
class randomShip extends shipObj {
    constructor (shipId) {
        super(shipId,
        randomInRange(hullMin, hullMax),
        randomInRange(firepowerMin, firepowerMax),
        randomInRange(accuracyMin, accuracyMax))
    }
}


/***************************Bonus level code ****************************/

//Bonus level game board
let bonusGameBoard = {
    alienShipCount:0,   //count used for initializing alien ship array
    myShip:{},
    alienShips:[], //array shrinks as ships are destroyed
    gameWinner:"none",
    megaAlienShip:{},


    //Initialize bonus game board
    createMyShip : function () {
        return new betterShip(myId, missleCount, myHull, myFirepower, myAccuracy);
    },
    createAlienFleet : function () {

        //Does not include mega ship
        this.alienShipCount = randomInRange(alienShipCountMin, alienShipCountMax);

        let fleet=[];
        for (let id=1; id<=this.alienShipCount; id++) {    //id of zero is reserved for myShip
            fleet.push(new randomShip(id));
        }
        return fleet;
    },
    createMegaAlienShip : function () {
        //ship id is the first unused id from the alien ships 
        return new megaShip(megaShipId, megaPodCount, megaPodFirepower);
    },


    printMegashipStatus: function(msg) {
        //specific to betterShip class (msg) 
        console.log(`%c\nAlien mega ship has ship id: ${this.megaAlienShip.shipId}`,
        prologMsgStyle);
        console.log(`%c   Hull: ${this.megaAlienShip.hull}  Laser Firepower: ${this.megaAlienShip.laser.firepower} Accuracy: ${this.megaAlienShip.accuracy}`, 
            prologMsgStyle);

        console.log(`%c\n   ${megaPodCount} weapon pods are on board the alien mega ship.`, prologMsgStyle);

        for (let i=0; i<this.megaAlienShip.weaponPods.length; i++) {
            console.log(`%c   mega pod id: ${this.megaAlienShip.weaponPods[i].shipId}. Hull: ${this.megaAlienShip.weaponPods[i].hull} Laser Firepower: ${this.megaAlienShip.weaponPods[i].laser.firepower} Accuracy: ${this.megaAlienShip.weaponPods[i].accuracy}`,
            prologMsgStyle);
        }
    },

    printAlienFleetStatus : function (msg) {
        console.log(msg, 
            prologMsgStyle);
        for (let i=0; i<this.alienShips.length; i++) {
            console.log(`%c   alien ship: ${this.alienShips[i].shipId}. Hull: ${this.alienShips[i].hull} Laser Firepower: ${this.alienShips[i].laser.firepower} Accuracy: ${this.alienShips[i].accuracy}`,
            prologMsgStyle);
        }
    },

    printUSSShipStatus : function (msg) {
        console.log(msg,
            prologMsgStyle);
        console.log(`%cYour ship is USS Schwarzenegger with ship id: ${this.myShip.shipId}`,
        prologMsgStyle); 
        console.log(`%c   Hull: ${this.myShip.hull}  Laser Firepower: ${this.myShip.laser.firepower} Accuracy: ${this.myShip.accuracy}`,
        prologMsgStyle);
        
        //specific to betterShip class
        console.log(`%c\n   ${this.myShip.missles.length} missles are on board USS Schwarzenegger. Each has firepower of ${misslePower}`, prologMsgStyle);
    },

    //Play bonus game
    startGame : function () {
        this.myShip=this.createMyShip();
        this.alienShips=this.createAlienFleet(); 
        this.megaAlienShip=this.createMegaAlienShip();
    },
    playGame : function () {
        logTestOutput(this);
        //console.log(this); 
        console.log(`%cThe alien mothership has sent a mega fleet after USS Schwarzenegger. They have been spotted in close proximity. Another battle is about to begin`, prologMsgStyle);
        this.printAlienFleetStatus(`%cThe alien fleet has ${this.alienShips.length} ships:`)
        this.printUSSShipStatus("%c");

        if (!confirmAttack()) {
            console.log(`%cRetreating...Game ends`, retreatMsgStyle);
            return;
        }
        console.log(`-----------------------------Game begins-----------------------------`);
        let round=1; 
        this.gameWinner="none";
        while (this.gameWinner==="none") {
            console.log(`-------------------------------Round ${round}-------------------------------`);
            //my ship attacks the alien ship first
            let wpn=this.myShip.laser;
            if (this.confirmLaunchMissle()) {
                wpn=this.myShip.missles[0]; //Use first available missle
            }
            let targetShip=this.findAlienTarget();
            this.myShip.attack(this, targetShip, wpn);
            updateGameWinner(this);
            if (this.gameWinner==="none") {
                //the alien ship attacks my ship
                // (If the first ship was destroyed, the next ship attacks in its place)
                this.alienShips[0].attack(this, this.myShip, this.alienShips[0].laser);
                updateGameWinner(this);
            }
            
            logTestOutput(this);
            //console.log(this); 
            if (this.gameWinner==="none") {
                this.printAlienFleetStatus(`%cNow, the alien fleet has ${this.alienShips.length} ships remaining:`);
                this.printUSSShipStatus("%c");

                //boost USS Schwarzenegger ship hit points/hull
                this.myShip.increaseHitPt();

                if (!confirmAttack()) {
                    console.log(`Retreating...Game ends`);
                    return;
                };
                round++;
            }
        }

        this.battleTheMegaPodsAndMegaShip();
    },

    battleTheMegaPodsAndMegaShip : function () {
        logTestOutput(this);
        //console.log(this); 
        console.log(`%cThe mega ship is here. It has brought with it mega pods which USS Schwarzenegger must battle first`, prologMsgStyle);
        this.printMegashipStatus("%c")
        this.printUSSShipStatus("%c");

        if (!confirmAttack()) {
            console.log(`%cRetreating...Game ends`, retreatMsgStyle);
            return;
        }

        let round=1; 
        this.gameWinner="none";
        let targetShip={};
        while (this.gameWinner==="none") {
            console.log(`-------------------------------Mega Round ${round}-------------------------------`);
            //my ship attacks the alien ship first
            let wpn=this.myShip.laser;
            if (this.confirmLaunchMissle()) {
                wpn=this.myShip.missles.shift(); //Use first available missle
            }
            if (targetShip!=this.megaAlienShip) {  //do not change mega ship target. It is engaging mega ship now
                targetShip=this.findPodTarget();
            }
            this.myShip.attack(this, targetShip, wpn);
            //Update battle winner
            targetShip==this.megaAlienShip ? updateMegaShipBattleWinner(this) :  updatePodBattleWinner(this);
            if (this.gameWinner==="none") {
                //the alien ship attacks my ship
                // (If the first ship was destroyed, the next ship attacks in its place)
                if (targetShip==this.megaAlienShip) {
                    this.megaAlienShip.attack(this, this.myShip, this.megaAlienShip.laser)
                } else {
                    this.megaAlienShip.weaponPods[0].attack(this, this.myShip, this.megaAlienShip.weaponPods[0].laser);
                }
                //Update battle winner
                targetShip==this.megaAlienShip ? updateMegaShipBattleWinner(this) :  updatePodBattleWinner(this);
            }
            
            logTestOutput(this);
            //console.log(this); 
            if (this.gameWinner==="none") {
                this.printMegashipStatus(`%cNow, the alien fleet has ${this.alienShips.length} ships remaining:`);
                this.printUSSShipStatus("%c");

                //boost USS Schwarzenegger ship hit points/hull
                this.myShip.increaseHitPt();

                if (!confirmAttack()) {
                    console.log(`Retreating...Game ends`);
                    return;
                };
                round++;
            } else if ((this.gameWinner==="USS Schwarzenegger") && isMegaPod(targetShip)) {
                //The mega pods have been defeated. Bring on the mega ship
                console.log(`%c\n\nThere is nothing between USS Schwarzenegger and the mega ship now. Good Luck!`, prologMsgStyle);
                
                this.gameWinner="none"; //reset for battle with mega ship next
                targetShip=this.megaAlienShip;
            }
        }
    },

    findPodTarget  : function () {  //to be changed to prompt
        if (this.megaAlienShip.weaponPods.length >= 1) {
            return this.megaAlienShip.weaponPods[0];         //Always pick the first pod
        }
        return null;
    },
    findAlienTarget  : function () {  //to be changed to prompt
        if (this.alienShips.length >= 1) {
            let t=randomInRange(0, this.alienShips.length-1);
            console.log(`Targeting alien ship: ${this.alienShips[t].shipId}`);
            return this.alienShips[t];
        }
        return null;
    },
    confirmLaunchMissle  : function () {
        if (testRun) {
            if (this.myShip.missles.length>=1) {
                console.log(`Missle Launching. Remaining missles: ${this.myShip.missles.length-1}`)
                return true;  //always launch missle for now
            }
            return false;
        } else {
            if (this.myShip.missles.length>=1) {
                let attackChoices=["1", "2"];
                let choice="";
                while (choice === "") {
                    choice=window.prompt(`Do you want to use a missle or laser ? \nYou current have ${this.myShip.missles.length} missles. \nEnter 1 for missle, 2 for laser`, "1");
                    if (!attackChoices.includes(choice)) {
                        choice=""; //choice not allowed
                        window.alert(`Pleae enter 1 to attack or 2 to retreat`);
                    } else {
                        break;
                    }
                }
                if (choice === "1") {
                    console.log(`Missle Launching. Remaining missles: ${this.myShip.missles.length-1}`)
                    return true;
                };
                return false; 
            } else {
                return false;  //no more missle
            }
        }
    },
    //findAdjAlienTraget is called before the targetShip has been deleted
    findAdjAlienTarget  : function (targetShip) { 
        if (isMegaPod(targetShip)) {
            return this.findAdjMegaPod(targetShip);
        }
        if (isAlienShip(targetShip)) {
            return this.findAdjAlienShip(targetShip);
        }
        return null; //no other fleet
    },
    findAdjAlienShip : function (targetShip) {
        if (this.alienShips.length<=1) {
            return null;    //only one alien ship left. There is no adjacnent ship
        }

        //Locate targetShip in array
        let i=0;
        for (; i<this.alienShips.length; i++) {
            if (targetShip.shipId == this.alienShips[i].shipId) {
                break;  //found target ship
            }
        }
        if (i < this.alienShips.length) {
            i = (i+1) % this.alienShips.length; //round-robin to first elem of array if needed
            return this.alienShips[i];
        } else {
            return null; //did not found targetShip
        }
    },
    findAdjMegaPod : function (targetShip) {
        if (this.megaAlienShip.weaponPods.length<=1) {
            return null;    //only one pod left. There is no adjacnent ship
        }

        //Locate targetShip in array
        let i=0;
        for (; i<this.megaAlienShip.weaponPods.length; i++) {
            if (targetShip.shipId == this.megaAlienShip.weaponPods[i].shipId) {
                break;  //found target ship
            }
        }
        if (i < this.megaAlienShip.weaponPods.length) {
            i = (i+1) % this.megaAlienShip.weaponPods.length; //round-robin to first elem of array if needed
            return this.megaAlienShip.weaponPods[i];
        } else {
            return null; //did not found targetShip
        }
    },
}

class betterShip extends shipObj {
    missles = []
    constructor (shipId, missleCount, myId, myHull, myFirepower, myAccuracy) {
        super(shipId, myId, myHull, myFirepower, myAccuracy);

        //Create missles
        for (let i=0; i<missleCount; i++) {
            this.missles.push(new weapon(misslePower, 2));  //missle take effect on target and the next ship
        }
    }
    increaseHitPt() {
        if (this.hull < myHull) { //increase hull strength up to original level
            this.hull = randomInRange(this.hull+1, myHull);  //min incr of 1 up to restoring original hull
        }
        console.log(`%cUSS Schwarzenegger hull strength is restored to ${this.hull}`, hullRestoreMsgStyle);
    }
    launchMissle(targetShip) {
        let missle=this.missles.shift();
        return missle.fireWeapon(targetShip);
    }
}

class megaShip extends randomShip {
    weaponPods = []
    constructor (shipId, podCount, podFirepower) {
        super(shipId);

        this.hull=2*myHull;     //mega ship hull is twice as initial hull on my ship

        //Create weapon pods
        for (let i=0; i<podCount; i++) {
            this.weaponPods.push(new randomShip(megaPodIdStart+i)); //pods affect a ship at a time
            this.weaponPods[i].laser.firepower=podFirepower;
        }
    }
}

/***********************Functions*********************/
function randomInRange(min, max) {
    //return a random integer between min and max
    return Math.floor(Math.random()*(max-min))+min;
}

function isAlienShip(ship) {
    return (ship.shipId != myId) ;
}
function isMegaShip(ship) {
    return (ship.shipId == megaShipId) ;
}
function isMegaPod(ship) {
    return (ship.shipId >= megaPodIdStart )  &&    (ship.shipId < megaPodIdStart+megaPodCount )
}

function updateGameWinner(game) {
    if(game.myShip.hull <= 0) {
        game.gameWinner="alien ships"
    } else if (game.alienShips.length ==0) {
        game.gameWinner="USS Schwarzenegger";
        console.log(`%c*****There are no more alien ships*****`, winnerMsgStyle)
    }
    if (game.gameWinner != "none") {
        console.log(`%c*****Winner is ${game.gameWinner}*****`, winnerMsgStyle)
    }
}
function updatePodBattleWinner(game) {
    if(game.myShip.hull <= 0) {
        game.gameWinner="alien mega weapon pods";
    } else if (game.megaAlienShip.weaponPods.length ==0) {
        game.gameWinner="USS Schwarzenegger";
        console.log(`%c*****There are no more mega weapon pods*****`, winnerMsgStyle)
    }
} 
function updateMegaShipBattleWinner(game) {
    if(game.myShip.hull <= 0) {
        game.gameWinner="alien mega ship";
    } else if (game.megaAlienShip.hull <= 0) {
        game.gameWinner="USS Schwarzenegger";
        console.log(`%c*****Congradulations! You've won the space battle*****`, winnerMsgStyle)
    }
}
function confirmAttack () {
    if (testRun) {
        return true;  //always continue to attack for testing
    };

    let attackChoices=["1", "2"];
    let choice="";
    while (choice === "") {
        choice=window.prompt(`Do you want to attack or retreat ? \nEnter 1 to attack, 2 to retreat`, "1");
        if (!attackChoices.includes(choice)) {
            choice=""; //choice not allowed
            window.alert(`Pleae enter 1 to attack or 2 to retreat`);
        } else {
            break;
        }
    }
    if (choice === "1") {
        return true;
    };
    return false;
}

function confirmAdvancingToBonusLevel () {
    if (testRun) {
        return true;  //always continue to attack for testing
    };

    let continueChoices=["1", "2"];
    let choice="";
    while (choice === "") {
        choice=window.prompt(`Do you want to continue to Bonus Level ? \nEnter 1 to Yes, 2 to No`, "1");
        if (!continueChoices.includes(choice)) {
            choice=""; //choice not allowed
            window.alert(`Pleae enter 1 to proceed to Bonus Level or 2 to exit`);
        } else {
            break;
        }
    }
    if (choice === "1") {
        return true;
    };
    return false;
}

/*********Main logic*********/
gameBoard.startGame();
gameBoard.playGame();

if (confirmAdvancingToBonusLevel()) {

    console.log(`*****************************************************************************`);
    console.log(`*********************************Bonus Level*********************************`);
    console.log(`*****************************************************************************`);

    bonusGameBoard.startGame();
    bonusGameBoard.playGame();    
}


