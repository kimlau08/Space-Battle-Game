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
const misslePower=5;  //one missle hit can destroy target alien ship
const missleCount=1;

//alien's bonus weapons
const alienShipCountMin=1; const alienShipCountMax=3;
const megaPodCount=2;
const megaPodFirepower=4;

//Styling variables
const prologMsgStyle="color: orange; font-weight: bold;"
const targetIsHitMsgStyle="color: blue; border: 1px solid grey;"
const targetIsDestroyedMsgStyle="color: red; font-size: 16px;"
const winnerMsgStyle="color: red; font-size: 16px;"
const retreatMsgStyle="color: blue; font-size: 16px;"


//Test utilities
const testRun=false;
function logTestOutput(str) {
    if (testRun) {
        console.log(str);
    }
}

/*******************Global game status*****************/
//First level game board
let gameBoard = {
    alienShipCount:6,   //count used for initializing alien ship array
    myShip:{},
    alienShips:[], //array shrinks as ships are destroyed
    gameWinner: "none",

    //Initialize game board
    createMyShip: function () {
        return new shipObj(myId, myHull, myFirepower, myAccuracy);
    },
    createAlienFleet : function () {
        let fleet=[];
        for (let id=1; id<=this.alienShipCount; id++) {    //id of zero is reserved for myShip
            fleet.push(new randomShip(id));
        }
        return fleet;
    },
    printAlienFleetStatus : function(msg) {
        console.log(msg, 
            prologMsgStyle);
        for (let i=0; i<this.alienShips.length; i++) {
            console.log(`%c   alien ship: ${this.alienShips[i].shipId}. Hull: ${this.alienShips[i].hull} Laser Firepower: ${this.alienShips[i].laser.firepower} Accuracy: ${this.alienShips[i].accuracy}`,
            prologMsgStyle);
        }
    },
    printUSSShipStatus: function(msg) {
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
    playGame: function () {
        logTestOutput(this);
        //console.log(this); 
        console.log("%cThe USS Schwarzenegger is on a mission to destroy every last alien ship. It has encountered an alien fleet. Battle is about to begin...", prologMsgStyle);
        this.printAlienFleetStatus(`%cThe alien fleet has ${this.alienShips.length} ships:`)
        this.printUSSShipStatus("%c");

        if (!confirmAttack()) {
            console.log(`%cRetreating...Game ends`, retreatMsgStyle);
            return;
        }
        console.log(`-----------------------------Game begins-----------------------------`);
        let round=1; 
        while (this.gameWinner==="none") {
            console.log(`-------------------------------Round ${round}-------------------------------`);
            //my ship attacks the alien ship first
            let targetShip=this.findAlienTarget();
            this.myShip.attack(this, targetShip, this.myShip.laser);
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
                this.printAlienFleetStatus(`%cNow, the alien fleet has ${this.alienShips.length} ships remaining:`)
                if (!confirmAttack()) {
                    console.log(`Retreating...Game ends`);
                    return;
                };
                round++;
            }
        }
    },
    findAlienTarget: function () {
        if (this.alienShips.length >= 1) {
            //console.log(`Targeting alien ship: ${this.alienShips[0].shipId}`);
            return this.alienShips[0];
        }
        return null;
    },
    findAdjAlienTarget: function (targetShip) {
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
                    if (isAlienShip(aShip)) {
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


/***********************Functions*********************/
function randomInRange(min, max) {
    //return a random integer between min and max
    return Math.floor(Math.random()*(max-min))+min;
}

function isAlienShip(ship) {
    return (ship.shipId != myId) ;
}

function updateGameWinner(game) {
    if(game.myShip.hull <= 0) {
        game.gameWinner="alien ships"
    } else if (game.alienShips.length ==0) {
        game.gameWinner="USS Schwarzenegger"
    }
    if (game.gameWinner != "none") {
        console.log(`%c*****There are no more alien ships*****`, winnerMsgStyle)
        console.log(`%c*****Winner is ${game.gameWinner}*****`, winnerMsgStyle)
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

/*********Main logic*********/
gameBoard.startGame();
gameBoard.playGame();


