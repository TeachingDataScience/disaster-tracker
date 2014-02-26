#!/usr/bin/python

# Import Python Modules 
import os
import sys
import time
import traceback
import csv
import simplejson as json
from datetime import datetime
import requests
from geopy import geocoders

inFile = "em-dat-philippines.csv"
outFile = "ph-disasters-all.json"

# Open csv
emdat = csv.DictReader(open(inFile, 'rb'), delimiter= ',', quotechar = '"')

allDisasters = []

for em in emdat:
	disaster = {}
	disaster["year"] = em["year"]
	disaster["dis_group"] = em["dis_group"]
	disaster["dis_subgroup"] = em["dis_subgroup"]
	disaster["dis_type"] = em["dis_type"]
	disaster["event_name"] = em["event_name"]
	disaster["country_name"] = em["country_name"]
	disaster["iso"] = em["iso"]
	disaster["location"] = em["location"]
	try: 
		disaster["no_killed"] = int(em["no_killed"])
	except:
		disaster["no_killed"] = em["no_killed"]
	try: 
		disaster["total_affected"] = int(em["total_affected"])
	except:
		disaster["total_affected"] = em["total_affected"]
	try: 
		disaster["total_dam"] = int(em["total_dam"])
	except:
		disaster["total_dam"] = em["total_dam"]
	allDisasters.append(disaster)

writeout = json.dumps(allDisasters, sort_keys=True, separators=(',',':'))
f_out = open('../data/ph-disasters-all.json', 'wb')
f_out.writelines(writeout)
f_out.close()
