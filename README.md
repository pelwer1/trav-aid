# trav-shop
Roll20 Mod to determine availability DMs, customs DMs, and tradecodes based on planet UWP

**Usage:** 

Show Shopping DM's for a world

* !trav-aid --shop    --uwp B789430-C

Show Customs Targets and DMs for being boarded and smuggling gear thru a checkpoint

* !trav-aid --customs --uwp B789430-C --bases [code|0] --zone [G|A|R]

Show the Trade Codes for a given UWP - good for roll20 Trade tab in character sheet

* !trav-aid --trade   --uwp B789430-C

Show the roll required to buy a single item on a planet

* !trav-aid --buyItem --uwp B789430-C --itemTL 0-15 --difficulty easy|hard  --legality legal|banned
