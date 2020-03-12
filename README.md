# Space-Battle-Game
Space battle 

Features
========
	+ The game has to be played within Chrom Dev tool.
	********Important****** Start game by activating Chrome Dev tool before the game begins. Alert msg at before the game begins has more info.
	
	
	
	+ There are 2 game levels: Level 1 and Bonus level
	
	Level 1 Features
	+ USS Schwarzenegger space ship engages in battle with alien actors:
		+ Alien ships
	+ All ships use lasers.
	+ All ships are rated by 3 metrics: Hull, Firepower (of laser), Accuracy
		+ Hull - represents hit points a ship can withstand
		+ Firepower - represents hit points incurring on opposing ship when target is hit
		+ Accuracy - the lower accuracy rating the less lightly the enemy can hit the ship.
	
	Bonus Level Features
	+ Bonus level game appears after the Level 1 game. It is presented as an advanced game level.
		+ Bonus level game has all features of the Level 1 game a can be played completely on its own.
		
	+ USS Schwarzeneggerspace ship engages in battle with 3 types of actors:
		+ Alien ships  
		+ Megapods
		+ Megaship	
		
	+ Battle engagement:
		+ Battle all alien ships before the weapon pods from the mega alien ship
		+ Battle all weapon pods before the mega alien ships

	+ weaponPods -** megaPodCount set to 2 for ease of testing
		+ Pods are in essence an alien ship with higher firepower (megaPodFirepower set to 6)

	+ missiles -** missleCount set to 1 for testing. (misslePower set to 5)
		+ User can choose missle or laser
		+ When all missles are used, laser is stil available.
		+ Missles can damage more than one alien ship,(whereas laser damage only one ship.)
			+ When the firepower of a missle reduce hull of an alien ship to zero, the residual firepower applies to the adjacent alien ship.
			+ The degree of damage can be increase by tuning the firepower and shipImpact data member of weapon class.

	+ hull(hit point) increase randomly between 1 to fully restoring myHull with original number (20) (hitPtIncreaseMin=1;   const hitPtIncreaseMax=myHull)
		+ Hull increase on my ship happens after each engagement of an alien ship


	+ Mega ship hull is twice as much as USS Schwarzenegger
