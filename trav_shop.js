/* Traveller RPG Shopping DMs - based on Mongoose Traveller 2e - Central Supply Catalog Availability rules */

/*  libraries and base code lifted from the great work by forthekill at: https://github.com/forthekill/travGenJS */


//
// Usage: !trav-shop --uwp B789430-C --tc Ni Ht
//
// Fist: B789430-C  Ni Ht
//
// -----------------------------------  START ----------------------------
//
// Trick from Aaron to fix "Syntax Error: Unexpected Identifier" - put a ";" at top of script
// The API Server concatenates all the scripts together, which can lead to code that isn't
// correct when a programmer relies on automatic semicolon insertion.
;

// Converts a number from 0 to 35 to its base 36 character
function ts_numToHex(n) {
	return "0123456789ABCDEFGHJKLMNOPQRSTUVWXYZ".charAt(n);
}

// Converts a base 36 character to a number
function ts_hexToNum(n) {
	return "0123456789ABCDEFGHJKLMNOPQRSTUVWXYZ".indexOf(n.toUpperCase());
}

on('ready', () => {
    const version = '1.0.0'; // script version
    log('-=> trav_shop v' + version + ' <=-');

    // catch the invocation command (!SW-Dice )
    on('chat:message', function (msg) {

        // Only run when message is an api type and contains call to this script
        if (msg.type === 'api' && msg.content.indexOf('!trav-shop') !== -1) {

            let args = [];

            // clean up command line noise and split on "--"
            args = msg.content
                .replace(/<br\/>\n/g, ' ')
                .replace(/(\{\{(.*?)\}\})/g, " $2 ")
                .split(/\s+--/);

            // bail out if api call is not to this script (tests cmd line cleaner)
            if (args.shift() !== "!trav-shop") {
                // log('-=> trav-shop: command line parsing error - contact developer - exiting ... <=- ');
                return;
            }

            // After shiftign out the api call args array should be
            // [0] uwp B789430-C
            // [1] tc Ni Ht
            if (!(args[0] && args[1])) {
                sendChat("trav-shop", "\nUsage: !trav-shop --uwp B789430-C --tc Ni Ht (system uwp, trade codes)");
                return;
            }
           
            // parse cmd line args
            let cmd_args = []
            cmd_args = args[0].split(/\s+/);
            cmd_args.shift(); // drop switch name
            let cmd_uwp = cmd_args; // get switch value
            cmd_args = args[1].split(/\s+/);
            cmd_args.shift();
            let cmd_trade = cmd_args.join(' '); // system may have multiple trade codes

            // parse uwp
			stp = ts_hexToNum(cmd_uwp.charAt(0)); // Affects Availability
			siz = ts_hexToNum(cmd_uwp.charAt(1));
  	      	atm = ts_hexToNum(cmd_uwp.charAt(2));
  	      	hyd = ts_hexToNum(cmd_uwp.charAt(3));
  	      	pop = ts_hexToNum(cmd_uwp.charAt(4));
			gov = ts_hexToNum(cmd_uwp.charAt(5));
			law = ts_hexToNum(cmd_uwp.charAt(6)); // Affects Availability (Black Market)
  	      	tl  = ts_hexToNum(cmd_uwp.charAt(8)); // Affects Availability
  
        	  // config trade code variables
          	tc_ag = false; //x Agricultural Atm 4-9, Hyg 4-8, Pop 5-7
          	tc_as = false; //x Asteroid Belt Siz & Atm & Hyd 0
          	tc_ba = false; //x Barren Pop & Gov & Law(PGL) 0
          	tc_de = false; //x Desert Atm 2-9, Hyd 0
          	tc_fl = false; //x Fluid Oceans (something other than water) Atm 10+, Hyd 1+
          	tc_ga = false; //x Garden World Siz 6-8, Atm 5,6,8, Hyd 5-7
          	tc_he = false; //x Hell World Siz 3+, Atm 2,4,7,9-C, Hyd 0-2
          	tc_hi = false; //x High Population // Affects Availability Pop 9+
          	tc_ht = false; //x High Tech // Affects Availability TL 12+
          	tc_ic = false; //x Ice Capped Atm 0-1, Hyd 1+
          	tc_in = false; //x Industrialized // Affects Availability Atm 0,1,2,4,7,9-C, Pop 9+
          	tc_lo = false; //x Low Population  Pop 1-3
          	tc_lt = false; //x Low Tech // Affects Availability  TL 5-
          	tc_na = false; //x Non-Agricultural // Affects Availability Atm 3-, Hyd 3-, Pop 6+
          	tc_ni = false; //x Non-Industrial // Affects Availability Pop 4-6
          	tc_po = false; //x Poor // Affects Availability Atm 2-5, Hyd 3-
          	tc_ri = false; //x Rich  // Affects Availability Atm 6,8, Pop 6-8 Gov 4-9
          	tc_va = false; //x Vacuum World (no atmosphere)  Atm 0
          	tc_wa = false; //x Water World  Siz 3-9, Atm 3-9, Hyd A
          
          	// determine trade codes from uwp values
			if ((atm > 3 && atm < 10) && (hyd > 3 && hyd < 9) && (pop > 4 && pop < 8)){	tc_ag = true; } //x
			if (siz === 0 && atm === 0 && hyd === 0){ tc_as = true; } //x
			if (pop === 0 && gov === 0 && law === 0) { tc_ba = true; } //x
			if (hyd === 0 && (atm > 1 && atm < 10)) { tc_de = true; } //x
			if (hyd > 0 && atm > 9) { tc_fl = true; } //x
			if ((siz > 5 && siz < 9 ) && (atm === 5 || atm === 6 || atm === 8) && (hyd > 4 && hyd < 8)) { tc_ga = true; } //x
			if ((siz > 2 ) && (atm === 2 || atm === 4 || atm === 7 || (atm > 8 && atm < 13)) && (hyd < 3)) { tc_he = true; } //x
			if (pop > 8) { tc_hi = true; } //x
			if (tl > 11) { tc_ht = true; } //x
			if (atm < 2 && hyd > 0) { tc_ic = true; } //x
			if ((atm < 3 || atm === 4 || atm === 7 || (atm > 8 && atm < 13)) && pop > 8) { tc_in = true; } //x
			if (pop < 4) { tc_lo = true; } //x
			if (tl < 6) { tc_lt = true; } //x
			if (atm < 4 && hyd < 4 && pop > 5) { tc_na = true; } //x
			if (pop > 3 && pop < 7) { tc_ni = true; } //x
			if ((atm > 1 && atm < 6) && hyd < 4) { tc_po = true; } //x
			if ((atm === 6 || atm === 8) && (pop > 5 && pop < 9) && (gov > 3 && gov < 10)){ tc_ri = true; } //x
			if (atm === 0){ tc_va = true; } //x
			if (((atm > 2 && atm < 10)  || atm > 12 ) && hyd > 9) { tc_wa = true; } //x

            // calculate the shopping DMs
            let DM_gm_fiat  = -2;
            let DM_exotic   = -1;
            let DM_pay_2x   =  1;
			let DM_pay_3x   =  2;

			// World Population 1–2 -2;  3–5 -1;  9 +1,  10+ +2
			let DM_pop = 0;
			if (pop < 3) {DM_pop = -2;} else if (pop < 6) { DM_pop = -1; } else if (pop === 9) { DM_pop = 1; } else if (pop > 9) { DM_pop = 2; }

			// Starport Class A or B +1; Class X -4
			let DM_stp = 0;		
			if (stp === 10 || stp === 11) { DM_stp = 1; } else if (stp > 16) { DM_stp = -4; }

			// World has Hi, Ht, In and/or Ri Trade Codes +2
			// World has Lt, Na, Ni, and/or Po Trade Codes -2
			let DM_tc = 0;
			if (tc_hi || tc_ht || tc_in || tc_ri) { DM_tc = 2; } 
			if (tc_lt || tc_na || tc_ni || tc_po) { DM_tc = DM_tc - 2; } 
 					
			// Law Level 0 +2; 1–3 +1; 7–9 -1; 10+ -2  (Black Market Only) 
			let DM_law = 0;
			if (law === 0) {DM_law = 2;} else if (law < 4) { DM_law = 1; } else if (law < 10) { DM_law = -1; } else if (law > 9) { DM_law = -2; }


			// The black market of any world can be accessed using
			// the Availability rules covered previously but with four
			// additional complications:
			// •	 Only Streetwise checks may be used for availability on the black market, never Broker.
			// •	 A negative Effect of -2 or worse on the Streetwise
			// check will result in attention from law enforcement.
			// The modifiers used on Availability checks using the
			// black market are listed on the Black Market table



            // print out tables of DMs
			//                      norm              -2                  +2                               -1                          -6
			// Item TL  |   Non-Military 1xCr  |  Military 3xCr | Black Market Non-Military 2xCr | Black Market Military 5x | Black Market Prohibited 20xCr
			//    6     |          DM-2        |       DM-3     |        DM-1                    |        DM-2              |    DM-8
            // Loop thru tech levels, calc delta tl of item vs world, print 5 DMs 
			// Item’s TL is greater than the World’s TL -1
			// Item’s TL is 3–4 above the World’s TL -1
			// Item’s TL is 5–9 above the World’s TL -2
			// Item’s TL is 10 or more above the World’s TL -4

			let tl_delta_item_world = 0;
			for (let i = 0; i < 16; i++) {
				tl_delta_item_world = i - tl;  // item tl - world tl
				if (tl_delta >9) {DM_tl = -4;} else if (tl_delta > 4){DM_tl = -2;} else if (tl_delta > 0){DM_tl = -1;} 
	            // market and item type
				DM_normal_market_non_military =  0 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_tl;  // Crx1
				DM_normal_market_military     = -2 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_tl;  // Crx3
				DM_black_market_non_military  =  2 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_law + DM_tl;  // Crx2 
				DM_black_market_military      = -1 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_law + DM_tl;  // Crx5
				DM_black_market_prohibited    = -6 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_law + DM_tl;  // Crx20
				log('-=> trav_shop: item TL:' + i + ' NM Civ Crx1:' + DM_normal_market_non_military + 'NM Mil Crx3:' + DM_normal_market_military + ' BM Civ Crx2' +DM_black_market_non_military + ' BM Mil Crx5:' + DM_black_market_military +' BM Prohib Crx20:' + DM_black_market_prohibited + ' <=-');
			}

		} // end if trav_shop

	}); // end on chat message
}); // end on ready

;