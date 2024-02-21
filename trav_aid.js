// Traveller RPG GM "Aid" tools - based on Mongoose Traveller 2e - Central Supply Catalog Availability and Companion Law rules 
//
//  libraries and base code lifted from the great work by forthekill at: https://github.com/forthekill/travGenJS 
//
// Usage: !trav-aid --shop --uwp B789430-C
//        !trav-aid --customs --uwp B789435-C -


// Fist: B789430-C  
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
    const version = '1.1.0'; // script version
    log('-=> trav_aid v' + version + ' <=-');

    // catch the invocation command (!SW-Dice )
    on('chat:message', function (msg) {

        // Only run when message is an api type and contains call to this script
        if (msg.type === 'api' && msg.content.indexOf('!trav-aid') !== -1) {
			//sendChat("trav-aid", "\nCmd Line: " + msg.content);

            let args = [];
            // clean up command line noise and split on "--"
            args = msg.content
                .replace(/<br\/>\n/g, ' ')
                .replace(/(\{\{(.*?)\}\})/g, " $2 ")
                .split(/\s+--/);

            // bail out if api call is not to this script (tests cmd line cleaner)
            if (args.shift() !== "!trav-aid") {
                log('-=> trav-aid: command line parsing error - contact developer - exiting ... <=- ');
                return;
            }

            // After shifting out the api call args array should be
            // [0] = shop
            if (!(args[0])) {
                sendChat("trav-aid", "\nUsage: !trav-aid --shop|customs|trade --uwp B789430-C  (system uwp code) --name (system name) --bases string --zone G|A|R");
                return;
            }
           
            // parse cmd line args
            let cmd_args = [];
			let cmd_uwp = "";
			let cmd_name = "";
			let cmd_bases = "";
			let naval_base_present = false;
			let zone_amber = false;
			let zone_red = false;
			let cmd_zone = "";
            let aid_command_name = args[0]; // get command name shop, custome, ...
			args.shift(); // drop command name: args[0] = uwp B789430-C
			cmd_args = args[0].split(/\s+/);
			// sendChat("trav-aid", "\ncmd args[0] post split = " + cmd_args[0]);
			cmd_args.shift(); // drop uwp switch
			// sendChat("trav-aid", "\ncmd args[0] post shift = " + cmd_args[0]);
            if (aid_command_name === 'shop') {
				cmd_uwp = cmd_args[0]; // get uwp value
				args.shift(); // drop command name: args[0] = name pandora
			    cmd_args = args[0].split(/\s+/);
			    cmd_args.shift(); // drop name switch
				cmd_name = cmd_args[0]; // get name value
			}
            else if (aid_command_name === 'trade') {
				cmd_uwp = cmd_args[0]; // get uwp value
			}
            else if (aid_command_name === 'customs') {
				cmd_uwp = cmd_args[0]; // get uwp value
				args.shift(); // drop command name: args[0] = name pandora
			    cmd_args = args[0].split(/\s+/);
			    cmd_args.shift(); // drop name switch
				cmd_name = cmd_args[0]; // get name value
				args.shift(); // drop command name: args[0] = name pandora
			    cmd_args = args[0].split(/\s+/);
			    cmd_args.shift(); // drop name switch
				cmd_bases = cmd_args[0]; // get name value
                // looking for Naval bases 
				if (cmd_bases.indexOf("D") > -1 || cmd_bases.indexOf("K") > -1 || cmd_bases.indexOf("N") > -1 || cmd_bases.indexOf("T") > -1 || cmd_bases.indexOf("C") > -1 || cmd_bases.indexOf("R") > -1 ) {
					naval_base_present = true;
				}
				args.shift(); // drop command name: args[0] = name pandora
			    cmd_args = args[0].split(/\s+/);
			    cmd_args.shift(); // drop name switch
				cmd_zone = cmd_args[0]; // get name value
                // looking for dangerous travel zones 
				if (cmd_zone.indexOf("A") > -1 ) {
					zone_amber=true;
				}
				if (cmd_zone.indexOf("R") > -1 ) {
					zone_red=true;
				}
			}
			else {
				sendChat("trav-aid", "\nUsage: !trav-aid --shop|customs --uwp B789430-C  (system uwp code) --name (system name) --bases string --zone G|A|R  Your command name =" + aid_command_name);
				return;
			}
			// sendChat("trav-aid", "\ncmd_uwp = " + cmd_uwp);

			// parse uwp
			// let letter = text.charAt(1);
			let stp = ts_hexToNum(cmd_uwp.charAt(0)); // Affects Availability
			let siz = ts_hexToNum(cmd_uwp.charAt(1));
			let atm = ts_hexToNum(cmd_uwp.charAt(2));
			let hyd = ts_hexToNum(cmd_uwp.charAt(3));
  	      	let pop = ts_hexToNum(cmd_uwp.charAt(4));
			let gov = ts_hexToNum(cmd_uwp.charAt(5));
			let law = ts_hexToNum(cmd_uwp.charAt(6)); // Affects Availability (Black Market)
			let tl  = ts_hexToNum(cmd_uwp.charAt(8)); // Affects Availability
  
        	  // config trade code variables
          	let tc_ag = false; //x Agricultural Atm 4-9, Hyg 4-8, Pop 5-7
          	let tc_as = false; //x Asteroid Belt Siz & Atm & Hyd 0
          	let tc_ba = false; //x Barren Pop & Gov & Law(PGL) 0
          	let tc_de = false; //x Desert Atm 2-9, Hyd 0
          	let tc_fl = false; //x Fluid Oceans (something other than water) Atm 10+, Hyd 1+
          	let tc_ga = false; //x Garden World Siz 6-8, Atm 5,6,8, Hyd 5-7
          	let tc_he = false; //x Hell World Siz 3+, Atm 2,4,7,9-C, Hyd 0-2
          	let tc_hi = false; //x High Population // Affects Availability Pop 9+
          	let tc_ht = false; //x High Tech // Affects Availability TL 12+
          	let tc_ic = false; //x Ice Capped Atm 0-1, Hyd 1+
          	let tc_in = false; //x Industrialized // Affects Availability Atm 0,1,2,4,7,9-C, Pop 9+
          	let tc_lo = false; //x Low Population  Pop 1-3
          	let tc_lt = false; //x Low Tech // Affects Availability  TL 5-
          	let tc_na = false; //x Non-Agricultural // Affects Availability Atm 3-, Hyd 3-, Pop 6+
          	let tc_ni = false; //x Non-Industrial // Affects Availability Pop 4-6
          	let tc_po = false; //x Poor // Affects Availability Atm 2-5, Hyd 3-
          	let tc_ri = false; //x Rich  // Affects Availability Atm 6,8, Pop 6-8 Gov 4-9
          	let tc_va = false; //x Vacuum World (no atmosphere)  Atm 0
          	let tc_wa = false; //x Water World  Siz 3-9, Atm 3-9, Hyd A
          
          	// determine trade codes from uwp values
			let tc_out = "";  // human readable string of space separated trade codes
			if ((atm > 3 && atm < 10) && (hyd > 3 && hyd < 9) && (pop > 4 && pop < 8)){	tc_ag = true; tc_out = tc_out + " Ag";  } //x
			if (siz === 0 && atm === 0 && hyd === 0){ tc_as = true; tc_out = tc_out + " As"; } //x
			if (pop === 0 && gov === 0 && law === 0) { tc_ba = true; tc_out = tc_out + " Ba"; } //x
			if (hyd === 0 && (atm > 1 && atm < 10)) { tc_de = true; tc_out = tc_out + " De"; } //x
			if (hyd > 0 && atm > 9) { tc_fl = true; tc_out = tc_out + " Fl"; } //x
			if ((siz > 5 && siz < 9 ) && (atm === 5 || atm === 6 || atm === 8) && (hyd > 4 && hyd < 8)) { tc_ga = true; tc_out = tc_out + " Ga"; } //x
			if ((siz > 2 ) && (atm === 2 || atm === 4 || atm === 7 || (atm > 8 && atm < 13)) && (hyd < 3)) { tc_he = true; tc_out = tc_out + " He"; } //x
			if (pop > 8) { tc_hi = true; tc_out = tc_out + " Hi"; } //x
			if (tl > 11) { tc_ht = true; tc_out = tc_out + " Ht"; } //x
			if (atm < 2 && hyd > 0) { tc_ic = true; tc_out = tc_out + " Ic"; } //x
			if ((atm < 3 || atm === 4 || atm === 7 || (atm > 8 && atm < 13)) && pop > 8) { tc_in = true; tc_out = tc_out + " In"; } //x
			if (pop < 4) { tc_lo = true; tc_out = tc_out + " Lo"; } //x
			if (tl < 6) { tc_lt = true; tc_out = tc_out + " Lt"; } //x
			if (atm < 4 && hyd < 4 && pop > 5) { tc_na = true; tc_out = tc_out + " Na"; } //x
			if (pop > 3 && pop < 7) { tc_ni = true; tc_out = tc_out + " Ni"; } //x
			if ((atm > 1 && atm < 6) && hyd < 4) { tc_po = true; tc_out = tc_out + " Po"; } //x
			if ((atm === 6 || atm === 8) && (pop > 5 && pop < 9) && (gov > 3 && gov < 10)){ tc_ri = true; tc_out = tc_out + " Ri"; } //x
			if (atm === 0){ tc_va = true; tc_out = tc_out + " Va"; } //x
			if (((atm > 2 && atm < 10)  || atm > 12 ) && hyd > 9) { tc_wa = true; tc_out = tc_out + " Wa"; } //x

	   
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
	
            // print out tables of DMs by TL
            //    - Loop thru tech levels, calc delta tl of item vs world, print 5 DMs 
			// Item’s TL is greater than the World’s TL -1
			// Item’s TL is 3–4 above the World’s TL -1
			// Item’s TL is 5–9 above the World’s TL -2
			// Item’s TL is 10 or more above the World’s TL -4			
			let th_style = ' style="border-color:#680100;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;font-weight:bold;overflow:hidden;padding:3px 3px;text-align:center;vertical-align:middle;word-break:normal"';
			let th_gray_style = ' style="background-color:#E5E4E2;border-color:#680100;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;font-weight:bold;overflow:hidden;padding:3px 3px;text-align:center;vertical-align:middle;word-break:normal"';
			let td_th_style = ' style="border-color:#680100;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;font-weight:bold;overflow:hidden;padding:3px 3px;text-align:center;vertical-align:middle;word-break:normal;white-space:nowrap;"';
			let td_style = ' style="border-color:#680100;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;overflow:hidden;padding:3px 3px;text-align:center;vertical-align:middle;word-break:normal;white-space:nwrap;"';
			let td_left_style = ' style="border-color:#680100;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;overflow:hidden;padding:3px 3px;text-align:left;vertical-align:middle;word-break:normal;white-space:normal;"';

         	// capture html for the banned items on this planet based on law level
 			let html = ""
			

			 

			for (i = 0; i < law+1; i+=1) {
				switch (i) {
					case 0:
						html = html + '<b>0</b> No restrictions, heavy armor and weapons recommended<br>'; 
						break;
					case 1:
						html = html + '<b>1</b> Poison gas, explosives and grenades, undetectable weapons, WMD; Battle Dress<br>';
						break;
					case 2:
						html = html + '<b>2</b> Portable energy and laser weapons; Combat Armor; Non-Military Drugs: Anagathic, Psi, Recreational<br>';
						break;
					case 3:
						html = html + '<b>3</b> Gauss weapons, advanced combat rifles, portable heavy weapons, any weapon with Destructive trait; Flak and Obvious Armor<br>';
						break;
					case 4:
						html = html + '<b>4</b> Autorifles, assault weapons, submachine guns, specialised ammunition, any weapon with Auto trait; Cloth Armor; Military Drugs: Adrenaliser, Combat, Meta-Performance, Meta-Accelerator, Nervous Dampener<br>';
						break;
					case 5:
						html = html + '<b>5</b> Personal concealable ranged weapons, small arms, pistols, revolvers, semi-automatic rifles; Mesh Armor<br>';
						break;
					case 6:
						html = html + '<b>6</b> All firearms except shotguns and stunners; carrying weapons and armor discouraged<br>';
						break;
					case 7:
						html = html + '<b>7</b> Shotguns and all other firearms; Military Drugs: Starlight Drop, Stim, Fast, Truth Serum<br>'; 
						break;
					case 8:
						html = html + '<b>8</b> All blades and stunners; All visible armor<br>';
						break;
					case 9:
						html = html + '<b>9</b> All weapons; All armor<br>'; 
						break;
					case 10:
						html = html + '<b>A(10)</b> All violations are serious crimes; Non-Military Drugs: Anti-Rad, G-Tol, Psi-Inhib/Null, Rad Emergency, Slow<br>';
						break;
					case 11:
						html = html + '<b>B(11)</b> Random weapon violation sweeps; All Drugs are controlled substances (including Medicinal and Panacea) <br>';
						break;
					default:
						html = html + '<b>C+(12+)</b> Active monitoring for violations<br>';  
						// D Paramilitary law enforcement, thought crimes prosecuted
						// E Full police state, arbitrary executions or disappearances
						// F Rigid control of daily life, gulag state
						// G Thoughts controlled, disproportionate punishments
						// H Legalized oppression
						// J Routine oppression

					} // end switch
			} // end for i
			html = html + '<hr style="border: 1px solid; margin: 1%;"><div style="text-align: center;">Any Weapons/Armor/Ammo not on the list above is available via <u><i>Normal Market:</u></i> <span style="color:red;font-weight: bold;">Hard</span> </div>' ;
			html = html + '</td>' + '</tr> ';
			let html_banned = html;
			html = "";




            if (aid_command_name === 'shop') {

				// tried to stretch output using display:table, block, inline-block, contents, flex, grid, inherit, initial
				html = '<div style="width: 99%; border: 1px solid black; background-color: white; padding: 1px 1px; ">' +
				'<table style="border-collapse:collapse;border-spacing:0; width: 100%; " >' +
				'<thead>' +
					'<tr>' +
						'<th' + th_style + ' colspan="5"><b>Shopping in:</b> ' + cmd_name + "<br>UWP: " + cmd_uwp  + ' (3 Rolls) </th>' + 
					'</tr> ' +
					'<tr>' +
					'<td' + td_style + ' colspan="5"><span style="color:blue">Hire a Shopper with Broker 0 for Cr200 or Streetwise 0 for Cr500</span></td>' + 
					'</tr> ' +
						'<tr>' +
						'<th' + th_style + ' >SHOP<br>DMs</th>' +
						'<th' + th_style + ' colspan="2">Normal Market (Admin, Broker or Streetwise)</th>' +
						'<th' + th_style + ' colspan="2">Black Market<br>(Deception or Streetwise) </th>'+
					'</tr>' +
				'</thead>' +
				'<tbody>' +
					'<tr>' +
						'<td' + td_th_style + ' >Item<br>TL</td>' +
						'<td' + td_th_style + ' ><span style="color:green;font-weight: bold;">Easy</span><br>Crx1</td>' +
						'<td' + td_th_style + ' ><span style="color:red;font-weight: bold;">Hard</span><br>Crx1</td>' +
						'<td' + td_th_style + ' ><span style="color:green;font-weight: bold;">Easy</span><br>Cr<span style="color:orange">x2</span></td>' +
						'<td' + td_th_style + ' ><span style="color:red;font-weight: bold;">Hard</span><br>Cr<span style="color:orange">x5</span></td>' +
					//	'<td' + td_th_style + ' >Pro<br>Cr<span style="color:red">x20</span></td>' +
					'</tr>';
				// calculate the shopping DMs
				let DM_gm_fiat  = -2;
				let tl_delta_item_world = 0;
				let next_tl_delta_item_world = 0;
				let DM_tl = 0;
				let next_DM_tl = 0;
				let i = 0;
				let DM_normal_market_non_military =  0;
				let DM_normal_market_military     =  0;
				let DM_black_market_non_military  =  0;
				let DM_black_market_military      =  0;
				let DM_black_market_prohibited    =  0;
				let printed_DM_tl_0 = 0;
				let printed_DM_tl_n1 = 0;
				let printed_DM_tl_n2 = 0;
				let printed_DM_tl_n3 = 0;
				let printed_DM_tl_n5 = 0;
				let item_tl_start = "";
				for (i = 0; i < tl+11; i+=1) {
					DM_tl = 0;
					tl_delta_item_world = i - tl;  // item tl - world tl
					if      (tl_delta_item_world > 9){DM_tl = -5;} 
					else if (tl_delta_item_world > 4){DM_tl = -3;} 
					else if (tl_delta_item_world > 2){DM_tl = -2;} 
					else if (tl_delta_item_world > 0){DM_tl = -1;} 
					next_tl_delta_item_world = tl_delta_item_world + 1;  // item tl - world tl
					if      (next_tl_delta_item_world > 9){next_DM_tl = -5;} 
					else if (next_tl_delta_item_world > 4){next_DM_tl = -3;} 
					else if (next_tl_delta_item_world > 2){next_DM_tl = -2;} 
					else if (next_tl_delta_item_world > 0){next_DM_tl = -1;} 
					// market and item type          0       -2         -1       1        0   0(upto 12)   -1    // Fist: B789435-C  Ni Ht
					DM_normal_market_non_military =  0 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_tl;            // Crx1
					DM_normal_market_military     = -2 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_tl;            // Crx2
					DM_black_market_non_military  =  2 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_tl + DM_law ;  // Crx2 
					DM_black_market_military      =  0 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_tl + DM_law ;  // Crx5
					DM_black_market_prohibited    = -4 + DM_gm_fiat + DM_pop + DM_stp + DM_tc + DM_tl + DM_law ;  // Crx20
					// log('-=> trav_aid shop: item TL:' + i + ' NM Civ Crx1:' + DM_normal_market_non_military + ' NM Mil Crx3:' + DM_normal_market_military + ' BM Civ Crx2:' +DM_black_market_non_military + ' BM Mil Crx5:' + DM_black_market_military +' BM Prohib Crx20:' + DM_black_market_prohibited + ' <=-');

					if (DM_tl !== next_DM_tl) {
						if ( ! printed_DM_tl_0) {
							html = html +   "<tr>" +  
							"<td" + td_style + " >0-" + (i).toString() + "</td>" +
							"<td" + td_style + " >" + DM_normal_market_non_military + "</td>"  + 
							"<td" + td_style + " >" + DM_normal_market_military     + "</td>"  +
							"<td" + td_style + " >" + DM_black_market_non_military  + "</td>"  +
							"<td" + td_style + " >" + DM_black_market_military      + "</td>"  +
							// "<td" + td_style + " >" + DM_black_market_prohibited    + "</td>"  +
							"</tr>";
						}
						else {
							html = html +   "<tr>" +  
							"<td" + td_style + " >" + item_tl_start + "-" + (i).toString() + "</td>" +
							"<td" + td_style + " >" + DM_normal_market_non_military      + "</td>"  + 
							"<td" + td_style + " >" + DM_normal_market_military          + "</td>"  +
							"<td" + td_style + " >" + DM_black_market_non_military       + "</td>"  +
							"<td" + td_style + " >" + DM_black_market_military           + "</td>"  +
							// "<td" + td_style + " >" + DM_black_market_prohibited         + "</td>"  +
							"</tr>";
						}
					}

					// print 1 line for each uniq item TL range
					if (DM_tl === -1 &&  ! printed_DM_tl_0) {
						printed_DM_tl_0 = 1;
						item_tl_start = i.toString();
					}
					else if (DM_tl === -2 && ! printed_DM_tl_n1) {
						printed_DM_tl_n1 = 1;
						item_tl_start = i.toString();
					}
					else if (DM_tl === -3 &&  ! printed_DM_tl_n2) {
						printed_DM_tl_n2 = 1;
						item_tl_start = i.toString();
					}
					else if (DM_tl === -5 &&  ! printed_DM_tl_n3) {
						printed_DM_tl_n3 = 1;
						item_tl_start = i.toString();
					}
				} // end for
				// print final shopping line after the loop exits
				html = html +   "<tr>" +  
				"<td" + td_style + " >" + item_tl_start + "+"                + "</td>" +
				"<td" + td_style + " >" + DM_normal_market_non_military      + "</td>"  + 
				"<td" + td_style + " >" + DM_normal_market_military          + "</td>"  +
				"<td" + td_style + " >" + DM_black_market_non_military       + "</td>"  +
				"<td" + td_style + " >" + DM_black_market_military           + "</td>"  +
				//"<td" + td_style + " >" + DM_black_market_prohibited         + "</td>"  +
				"</tr>";
				html = html +  
				'<tr>' +
				'<td' + td_style + ' colspan="5"><span style="color:blue">After rolling, add DM+1/+2 if you pay 2x/3x</span></td>' + 
				'</tr> ' +
				'<tr>' +
				'<td' + td_style + ' colspan="5">Use <u><i>Black Market</u></i> for illegal goods. Streetwise/Deception Effect < -1 attacts the Law </td>' + 
				'</tr> ' +
				'<tr>' +
				'<td' + td_left_style + ' colspan="5"><div style="text-align: center;"><b>Law Level [' + law.toString() + '] Banned (Cumulative):</b><br>(Only available via <u><i>Black Market:</u></i> <span style="color:red;font-weight: bold;">Hard</span> )</div><hr style="border: 1px solid; margin: 1%;">' ;
				

				html =  html + html_banned +
				'<tr>' +
				'<td' + td_style + ' colspan="2">Always <span style="color:green;font-weight: bold;">Easy</span> to acquire: Tools, Computers, Software, Drugs(Non-Military), Electronics, Medical Gear, Standard Ammo, Survival Gear</td>' + 
				'<td' + td_style + ' colspan="3">Always <span style="color:red;font-weight: bold;">Hard</span> to acquire: Armor, Armor Mods, Augments, Drugs(Military), Explosives, Grenades, Robots, Shields, Special Ammo, Weapons (Any Type), Weapon Mods</td>' + 
				'</tr> ' +
				'</tbody>' + 
				'</table>' + 
				'</div>';
				sendChat("trav-aid shop", "\n"+html);
			} // end if --shop
			if (aid_command_name === 'customs') {

				// War, Strife, Disease… 	DM+1

				let DM_customs_pop = 0;
				let DM_customs_law = 0;
				let DM_customs_gov = 0;
				let DM_naval_base = 0;
				let DM_zone = 0;
				let DM_customs_tl = -1 * tl; 

				// Population 5- 		DM-2
				if (pop < 6) {DM_customs_pop = -2;} 

				// Law Level 0–2 	DM-2; 3–5 	DM-1; 6–9 	DM+0; A+ 		DM+2 
			 	if (law < 3) { DM_customs_law = -2; } else if (law < 6) { DM_customs_law = -1; } else if (law > 9) { DM_customs_law = +2; }
				
				// Government 7 or A+ 	DM+1 
				if (gov === 7 || gov > 9) { DM_customs_gov = 1; } 

				if (naval_base_present) {DM_naval_base = -1;}
				if (zone_amber) {DM_zone = -2;} else if (zone_red) {DM_zone = -4;}
  

				let customs_ship_check =  8 + DM_customs_pop + DM_customs_law + DM_customs_gov+ DM_naval_base + DM_zone
	
				html = '<div style="width: 99%; border: 1px solid black; background-color: white; padding: 1px 1px; ">' +
				'<table style="border-collapse:collapse;border-spacing:0; width: 100%; " >' +
					'<tr>' +
						'<td' + th_style + ' >System: ' + cmd_name + "<br>UWP: " + cmd_uwp  + '<br>CUSTOMS INSPECTIONS OF</td>' + 
					'</tr> ' +
					'<tr>' +
						'<td' + th_gray_style + ' >The Ship</td>' +
					'</tr>' +
					'<tr>' +
						'<td' + td_style + ' >On GM roll of <span style="color:red;font-weight: bold;">' + customs_ship_check.toString() + '+</span></td>' +
					'</tr>' +
					'<tr>' +
						'<td' + td_left_style + ' ><b>Pull Rank</b> to prevent inspection of the ship: Diplomat (SOC) Opp by Customs Officer Admin<br><b>Hide Something</b> from boarding party: Opp Deception(DEX, INT or SOC depending on how skill is used) vs. Recon (INT).<br><b>Fast Talk</b> them out of reporting something they found: Opp Persuade or Diplomat (SOC) vs. boarding party Leadership (SOC).</td>' +
					'</tr>' +
					'<tr>' +
						'<td' + th_gray_style + ' >The Travellers</td>'+
					'</tr>' +
					'<tr>' +
						'<td' + td_left_style + ' ><b>Avoid Detection or Trouble</b> with<br>Persuade(INT) or<br>Stealth(DEX) or Streetwise(INT)<br>check with <span style="color:red;font-weight:bold;">DM' + DM_customs_tl.toString() + '</span></td>' +
					'</tr>' +
					'<tr>' +
						'<td' + td_left_style + ' >Stealth Weapon DM+TL/2;<br>Disguised or Disassembled DM+2<br>Concealed or Hidden DM+2<br>Knife Sized DM+1 <br>Pistol/Handgun Sized DM-2<br>Long Gun Sized DM-4</td>' +
					'</tr>' +
					'<tr>' +
						'<td' + td_left_style + ' ><b>Getting Caught:</b> Roll on Sentencing Table<br>2D - Advocate Effect + (Planet Law Level(<span style="color:red;font-weight: bold;">'+ law.toString() +'</span>) - Law Level when item first banned)</td>' +
					'</tr>' + 
					'<tr>' +
					'<td' + td_left_style + '><div style="text-align: center;"><b>Law Leved [' + law.toString() + '] Banned (Cumulative):</b><br>(Only available via <u><i>Black Market:</u></i> <span style="color:red;font-weight: bold;">Hard</span> )</div><hr style="border: 1px solid; margin: 1%;">' +
					html_banned +
				'</table>' + 
				'</div>';
				sendChat("trav-aid customs", "\n"+html);
			} // end if customs
			if (aid_command_name === 'trade') {
				sendChat("trav-aid trade", "\n"+cmd_uwp+tc_out);
			}
		} // end if trav_aid

	}); // end on chat message
}); // end on ready


;


