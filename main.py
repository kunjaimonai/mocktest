import json
import csv

data = [
{
    "id": 31,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Right reverse bend",
      "Right hairpin bend",
      "Right \"U\" turn bend",
      "Turn right and go straight"
    ],
    "sign": "/signs/sign_31.png",
    "answerIndex": 0
  },
  {
    "id": 32,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Steep ascent",
      "Steep descent",
      "Gravel road",
      "Towing vehicle"
    ],
    "sign": "/signs/sign_32.png",
    "answerIndex": 0
  },
  {
    "id": 33,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Steep ascent",
      "Gravel road",
      "Slippery road",
      "Steep descent"
    ],
    "sign": "/signs/sign_33.png",
    "answerIndex": 3
  },
  {
    "id": 34,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Narrow road ahead",
      "Tunnel entrance",
      "Roads on both sides ahead",
      "Narrow bridge ahead"
    ],
    "sign": "/signs/sign_34.png",
    "answerIndex": 0
  },
  {
    "id": 35,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Narrow road ahead",
      "Y-intersection",
      "Road widens ahead",
      "Roads on both sides ahead"
    ],
    "sign": "/signs/sign_35.png",
    "answerIndex": 2
  },
  {
    "id": 36,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Roads on both sides ahead",
      "Narrow bridge ahead",
      "Narrow road ahead",
      "Road widens ahead"
    ],
    "sign": "/signs/sign_36.png",
    "answerIndex": 1
  },
  {
    "id": 37,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Slippery road",
      "Gravel road",
      "Towing vehicle",
      "Rough road"
    ],
    "sign": "/signs/sign_37.png",
    "answerIndex": 0
  },
  {
    "id": 38,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Falling rocks",
      "Slippery road",
      "Potholes on the road",
      "Loose gravel"
    ],
    "sign": "/signs/sign_38.png",
    "answerIndex": 3
  },
  {
    "id": 39,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Cycle track",
      "Bicycle crossing prohibited",
      "Bicycle crossing",
      "Motorcycle track"
    ],
    "sign": "/signs/sign_39.png",
    "answerIndex": 0
  },
  {
    "id": 40,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Footpath",
      "Pedestrians may enter",
      "Pedestrians prohibited",
      "Pedestrian crossing"
    ],
    "sign": "/signs/sign_40.png",
    "answerIndex": 3
  },
  {
    "id": 41,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Cattle prohibited",
      "Possibility of cattle on the road",
      "Vehicles carrying cattle prohibited",
      "Vehicles carrying cattle allowed"
    ],
    "sign": "/signs/sign_41.png",
    "answerIndex": 1
  },
  {
    "id": 42,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "School ahead",
      "Pedestrians crossing",
      "Footpath with school children",
      "Pedestrian crossing for school children"
    ],
    "sign": "/signs/sign_42.png",
    "answerIndex": 0
  },
  {
    "id": 43,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Bridge ahead",
      "Ferry",
      "Airport ahead",
      "Seaport ahead"
    ],
    "sign": "/signs/sign_43.png",
    "answerIndex": 1
  },
  {
    "id": 44,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Hilly area",
      "Ghat road",
      "Falling rocks",
      "Quarry/mining area"
    ],
    "sign": "/signs/sign_44.png",
    "answerIndex": 2
  },
  {
    "id": 45,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Cattle prohibited",
      "Possibility of cattle on the road",
      "Vehicles carrying cattle prohibited",
      "Vehicles carrying cattle allowed"
    ],
    "sign": "/signs/sign_45.png",
    "answerIndex": 1
  },
  {
    "id": 46,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "School ahead",
      "Pedestrians crossing",
      "Footpath with school children",
      "Pedestrian crossing for school children"
    ],
    "sign": "/signs/sign_46.png",
    "answerIndex": 0
  },
  {
    "id": 47,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Bridge ahead",
      "Ferry",
      "Airport ahead",
      "Seaport ahead"
    ],
    "sign": "/signs/sign_47.png",
    "answerIndex": 1
  },
  {
    "id": 48,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Hilly area",
      "Ghat road",
      "Falling rocks",
      "Quarry/mining area"
    ],
    "sign": "/signs/sign_48.png",
    "answerIndex": 2
  },
  {
    "id": 49,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Narrow road ahead",
      "Hump or rough road",
      "Tunnel",
      "Dangerous dip"
    ],
    "sign": "/signs/sign_49.png",
    "answerIndex": 3
  },
  {
    "id": 50,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Dangerous dip",
      "Zigzag road",
      "Ghat road",
      "Hump or rough road"
    ],
    "sign": "/signs/sign_50.png",
    "answerIndex": 3
  },
  {
    "id": 51,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Barrier ahead",
      "Railway cross ahead",
      "Suspension bridge ahead",
      "Ferry"
    ],
    "sign": "/signs/sign_51.png",
    "answerIndex": 0
  },
  {
    "id": 52,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Drainage in the middle",
      "Bridge ahead",
      "Gap in  median",
      "Suspension bridge"
    ],
    "sign": "/signs/sign_52.png",
    "answerIndex": 2
  },
  {
    "id": 53,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Do not park",
      "Cross road",
      "Road ends",
      "No entry"
    ],
    "sign": "/signs/sign_53.png",
    "answerIndex": 1
  },
  {
    "id": 54,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Turn to the left side",
      "Junction with a road on the left side",
      "T-road",
      "Compulsory to go straight or turn left"
    ],
    "sign": "/signs/sign_54.png",
    "answerIndex": 1
  },
  {
    "id": 55,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Turn right",
      "Turn right or go straight",
      "T-road",
      "Junction with a road on the right side"
    ],
    "sign": "/signs/sign_55.png",
    "answerIndex": 3
  },
  {
    "id": 56,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Y-intersection left",
      "Junction with a road on the left side",
      "Ascent to the left side ahead",
      "Compulsory to go straight or turn left"
    ],
    "sign": "/signs/sign_56.png",
    "answerIndex": 0
  },
  {
    "id": 57,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Junction with a road on the right side",
      "Y-intersection right",
      "Ascent to the right side ahead",
      "Compulsory to go straight or turn right"
    ],
    "sign": "/signs/sign_57.png",
    "answerIndex": 1
  },
  {
    "id": 58,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Ascent to the right and left ahead",
      "Compulsory to go right or left",
      "Y-intersection",
      "Curves to the right and left ahead"
    ],
    "sign": "/signs/sign_58.png",
    "answerIndex": 2
  },
  {
    "id": 59,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Right and left road splits",
      "Staggered junction ahead",
      "T-intersection",
      "Junction ahead"
    ],
    "sign": "/signs/sign_59.png",
    "answerIndex": 1
  },
  {
    "id": 60,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Junction",
      "Roads from three sides join",
      "Roundabout",
      "Road restricted"
    ],
    "sign": "/signs/sign_60.png",
    "answerIndex": 2
  },
  {
    "id": 61,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Men at work on the road",
      "Children playing",
      "Pedestrian crossing",
      "Mud on the road"
    ],
    "sign": "/signs/sign_61.png",
    "answerIndex": 0
  },
  {
    "id": 62,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Unmanned level cross",
      "Manned level cross",
      "Barrier ahead",
      "Road closed"
    ],
    "sign": "/signs/sign_62.png",
    "answerIndex": 1
  },
  {
    "id": 63,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Railway station nearby",
      "Unmanned level cross",
      "Manned level crossing",
      "Train approaching"
    ],
    "sign": "/signs/sign_63.png",
    "answerIndex": 1
  },
  {
    "id": 64,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Load limit",
      "Prescribed speed limit",
      "Axle weight limit",
      "Height limit"
    ],
    "sign": "/signs/sign_64.png",
    "answerIndex": 2
  },
  {
    "id": 65,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "First aid",
      "Resting place",
      "Hospital",
      "Clinic"
    ],
    "sign": "/signs/sign_65.png",
    "answerIndex": 2
  },
  {
    "id": 66,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "First aid",
      "Resting place",
      "Hospital",
      "Clinic"
    ],
    "sign": "/signs/sign_66.png",
    "answerIndex": 0
  },
  {
    "id": 67,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Hospital",
      "Resting place",
      "First aid post",
      "Clinic"
    ],
    "sign": "/signs/sign_67.png",
    "answerIndex": 1
  },
  {
    "id": 68,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "No side road ahead",
      "Left turn",
      "Bridge ahead",
      "Service road on the left"
    ],
    "sign": "/signs/sign_68.png",
    "answerIndex": 0
  },
  {
    "id": 69,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Service road ahead",
      "Main road ahead",
      "No side road ahead",
      "Bridge ahead"
    ],
    "sign": "/signs/sign_69.png",
    "answerIndex": 2
  },
  {
    "id": 70,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Petrol pump on both sides",
      "Parking on both sides",
      "Police aid post",
      "Service road on both sides"
    ],
    "sign": "/signs/sign_70.png",
    "answerIndex": 1
  },
  {
    "id": 71,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Parking for scooters and motorcycles",
      "Scooters and motorcycles prohibited",
      "Repairing scooters and motorcycles",
      "Fine for parking scooters"
    ],
    "sign": "/signs/sign_71.png",
    "answerIndex": 0
  },
  {
    "id": 72,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "No entry for private vehicles",
      "Parking place Taxi/Taxi stand",
      "Parking for police vehicles",
      "No entry for taxis"
    ],
    "sign": "/signs/sign_72.png",
    "answerIndex": 1
  },
  {
    "id": 73,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Petrol pump",
      "Parking place cycle rickshaws",
      "Autorickshaw parking prohibited",
      "Parking place autorickshaws"
    ],
    "sign": "/signs/sign_73.png",
    "answerIndex": 3
  },
  {
    "id": 70,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Police aid post on the right",
      "Compulsory right turn",
      "Parking allowed on the right",
      "Petrol pump on the right"
    ],
    "sign": "/signs/sign_70.png",
    "answerIndex": 1
  },
  {
    "id": 71,
    "q": "Which light comes after the amber light at a traffic signal?",
    "options": [
      "Red",
      "Green",
      "Green arrow light",
      "Red or Green"
    ],
    "sign": "/signs/sign_71.png",
    "answerIndex": 3
  },
  {
    "id": 72,
    "q": "What should you do when a vehicle approaches with a flashing red or blue light?",
    "options": [
      "Slow down and move the vehicle to the left side of the road",
      "Stop where you are",
      "Ignore the vehicle",
      "Drive as fast as possible"
    ],
    "sign": "/signs/sign_72.png",
    "answerIndex": 0
  },
  {
    "id": 73,
    "q": "When can you safely open the right-side doors of the vehicle?",
    "options": [
      "If there is no other traffic",
      "Immediately after stopping the vehicle",
      "After other cars have signalled to the side",
      "If you can open and close it quickly"
    ],
    "sign": "/signs/sign_73.png",
    "answerIndex": 0
  },
  {
    "id": 74,
    "q": "What should you do when you see a flashing amber traffic light at a junction?",
    "options": [
      "Cross quickly",
      "Stop at the stop line",
      "Proceed through the junction with caution",
      "None of the above"
    ],
    "sign": "/signs/sign_74.png",
    "answerIndex": 2
  },
  {
    "id": 75,
    "q": "What should you do when entering a roundabout?",
    "options": [
      "Enter the roundabout at low speed",
      "Give priority to vehicles coming from the correct direction",
      "Use only the outer lane",
      "Use only the inner lane"
    ],
    "sign": "/signs/sign_75.png",
    "answerIndex": 1
  },
  {
    "id": 76,
    "q": "What should you do when you reach a junction on a main road with no traffic lights, \t\t\tpolicemen, or traffic signals?",
    "options": [
      "Stop the vehicle, get out, check that there are no vehicles on other roads, and then proceed",
      "Stop the vehicle and proceed with caution",
      "If the way is clear, proceed at speed",
      "Slow down and proceed with caution"
    ],
    "sign": "/signs/sign_76.png",
    "answerIndex": 3
  },
  {
    "id": 77,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Requests vehicles coming from the front to stop and let vehicles from the left pass",
      "Requests vehicles from the front to stop and let vehicles from behind pass",
      "Requests vehicles from the front and back to stop",
      "Requests vehicles from the front and back to pass"
    ],
    "sign": "/signs/sign_77.png",
    "answerIndex": 2
  },
  {
    "id": 78,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Requests vehicles coming from the front to stop",
      "Requests vehicles coming from the back to stop",
      "Requests vehicles from the front to pass",
      "Requests vehicles coming from the back to stop"
    ],
    "sign": "/signs/sign_78.png",
    "answerIndex": 0
  },
  {
    "id": 79,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Requests vehicles coming from the back to stop",
      "Requests vehicles coming from the back to pass",
      "Requests vehicles from the front to stop",
      "Requests vehicles from the left to pass"
    ],
    "sign": "/signs/sign_79.png",
    "answerIndex": 0
  },
  {
    "id": 78,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Requests vehicles from the left to stop",
      "Requests vehicles coming from behind to pass",
      "Requests vehicles from the right to stop",
      "Requests vehicles from one side to pass"
    ],
    "sign": "/signs/sign_78.png",
    "answerIndex": 3
  },
  {
    "id": 78,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Requests vehicle to stop at the rear",
      "Requests vehicles from the right and left to pass",
      "Requests vehicles from the right and left to stop",
      "Requests vehicles from the front and back to pass"
    ],
    "sign": "/signs/sign_78.png",
    "answerIndex": 2
  },
  {
    "id": 78,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Requests vehicles from the left to stop",
      "Requests vehicles to start at the T-point",
      "Requests vehicles from the right to stop",
      "Requests vehicles from the left to stop and vehicles from the front to pass"
    ],
    "sign": "/signs/sign_78.png",
    "answerIndex": 1
  },
  {
    "id": 79,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Requests vehicles from the right and left to stop",
      "Requests vehicle to stop at the front and back",
      "Change of sign",
      "Requests vehicles from the right and left to pass"
    ],
    "sign": "/signs/sign_79.png",
    "answerIndex": 2
  },
  {
    "id": 80,
    "q": "What does the traffic sign in this picture indicate?",
    "options": [
      "Requests vehicles from the left to start",
      "Requests vehicles from the right to start",
      "Requests vehicles from the left to pass and vehicles from the front to stop",
      "Requests vehicles from the right and left to pass",
      "Right answer \t\tmark on"
    ],
    "sign": "/signs/sign_80.png",
    "answerIndex": 2
  },
  {
    "id": 81,
    "q": "Over speeding or dangerous driving is……",
    "options": [
      "A stern warning to authorities",
      "A crime and is punishable",
      "Attractive to other road users",
      "A way to reach the destination without delay"
    ],
    "sign": "/signs/sign_81.png",
    "answerIndex": 1
  },
  {
    "id": 82,
    "q": "What does clutch riding mean?",
    "options": [
      "Using the clutch frequently",
      "Driving with your foot on the clutch pedal",
      "Not using the clutch at all",
      "Always disengaging the clutch"
    ],
    "sign": "/signs/sign_82.png",
    "answerIndex": 1
  },
  {
    "id": 83,
    "q": "What is the safe way to stop a vehicle?",
    "options": [
      "Press the clutch and then brake",
      "Press the brake and then the clutch",
      "Press the clutch and brake simultaneously",
      "All of the above are correct"
    ],
    "sign": "/signs/sign_83.png",
    "answerIndex": 1
  },
  {
    "id": 84,
    "q": "The safest way to drive down a steep descent",
    "options": [
      "High torque gear with brakes",
      "Use top gear with brakes",
      "Use brake and clutch simultaneously",
      "Use high torque gear along with brake and clutch"
    ],
    "sign": "/signs/sign_84.png",
    "answerIndex": 0
  },
  {
    "id": 85,
    "q": "If your vehicle breaks down at night",
    "options": [
      "Stop, apply handbrake, turn on park lights",
      "Stop and turn on the red light",
      "Stop, apply handbrake, turn on brake light",
      "Stop and display the hazard warning light"
    ],
    "sign": "/signs/sign_85.png",
    "answerIndex": 3
  },
  {
    "id": 86,
    "q": "When a cow is standing across the road…",
    "options": [
      "Wait until it moves from the road",
      "Pass in front of the cow",
      "Pass behind the cow",
      "Pass on the left side"
    ],
    "sign": "/signs/sign_86.png",
    "answerIndex": 2
  },
  {
    "id": 87,
    "q": "Painting a private motor car with olive green paint is…..",
    "options": [
      "Not allowed",
      "Allowed",
      "Requires special permission",
      "Allowed only for motorcycles"
    ],
    "sign": "/signs/sign_87.png",
    "answerIndex": 0
  },
  {
    "id": 88,
    "q": "When turning right or left, which is safer?",
    "options": [
      "Use indicators only",
      "Show hand signal only",
      "Use both electronic indicators and hand signal",
      "Hand signals are only required for left-hand steering vehicles"
    ],
    "sign": "/signs/sign_88.png",
    "answerIndex": 2
  },
  {
    "id": 89,
    "q": "When a driver is driving on a one-way road………",
    "options": [
      "Can drive only in the direction permitted by the sign board",
      "Can drive in the opposite direction in emergency situations",
      "Can drive in both directions on Sundays",
      "Is not allowed to drive on a one-way street"
    ],
    "sign": "/signs/sign_89.png",
    "answerIndex": 0
  },
  {
    "id": 90,
    "q": "What should a driver do when visibility is very low during the day in rainy season?",
    "options": [
      "Stop the vehicle",
      "Ensure wiper blades are not old",
      "Use the washer to clear the windscreen",
      "Reduce the vehicle's speed and use the headlights"
    ],
    "sign": "/signs/sign_90.png",
    "answerIndex": 3
  },
  {
    "id": 91,
    "q": "On a road with two-way traffic, if not directed by a uniformed police officer or appropriate road signs, a driver should drive their vehicle on the side",
    "options": [
      "Left",
      "Right",
      "Middle",
      "Diagonal"
    ],
    "sign": "/signs/sign_91.png",
    "answerIndex": 0
  },
  {
    "id": 92,
    "q": "What does the hand signal in this picture indicate?",
    "options": [
      "Intends to turn left",
      "Intends to turn right",
      "Intends to slow down the vehicle",
      "Requests all other vehicles to stop"
    ],
    "sign": "/signs/sign_92.png",
    "answerIndex": 0
  },
  {
    "id": 93,
    "q": "What does the hand signal in this picture indicate?",
    "options": [
      "Intends to turn right",
      "Requests oncoming vehicles to stop",
      "Intends to slow down",
      "Intends to turn left"
    ],
    "sign": "/signs/sign_93.png",
    "answerIndex": 2
  },
  {
    "id": 94,
    "q": "What does the hand signal in this picture indicate?",
    "options": [
      "Intends to go straight",
      "Intends to slow down the vehicle",
      "Intends to turn right",
      "Intends to stop the vehicle"
    ],
    "sign": "/signs/sign_94.png",
    "answerIndex": 2
  },
  {
    "id": 95,
    "q": "What does the hand signal in this picture indicate?",
    "options": [
      "Request for the following vehicle to stop",
      "Intends to turn right",
      "Intends to go straight",
      "Intends to stop the vehicle"
    ],
    "sign": "/signs/sign_95.png",
    "answerIndex": 3
  },
  {
    "id": 96,
    "q": "What does the sign on the instrument console indicate?",
    "options": [
      "Warning lamp",
      "Road sign",
      "Hazard lamp",
      "Engine brake"
    ],
    "sign": "/signs/sign_96.png",
    "answerIndex": 0
  },
  {
    "id": 97,
    "q": "What does a continuous yellow line in the middle of the road mean?",
    "options": [
      "Overtake with caution",
      "Overtaking is prohibited",
      "Stop with caution",
      "Not a parking zone"
    ],
    "sign": "/signs/sign_97.png",
    "answerIndex": 1
  },
  {
    "id": 98,
    "q": "What should you do if you encounter an obstruction on your side of the road?",
    "options": [
      "You can use the opposite lane without giving priority to oncoming traffic",
      "Accelerate to move quickly",
      "Give priority to oncoming traffic",
      "Stop the vehicle"
    ],
    "sign": "/signs/sign_98.png",
    "answerIndex": 2
  },
  {
    "id": 99,
    "q": "A white line drawn on the side of the road means?",
    "options": [
      "Means no parking",
      "Means no overtaking",
      "Edge of the carriageway",
      "Do not stop"
    ],
    "sign": "/signs/sign_99.png",
    "answerIndex": 2
  },
  {
    "id": 100,
    "q": "When approaching a road under repair, you must observe the permitted speed limit…..",
    "options": [
      "During daytime and working hours",
      "Only at night",
      "During working hours",
      "At all times"
    ],
    "sign": "/signs/sign_100.png",
    "answerIndex": 3
  },
  {
    "id": 101,
    "q": "When a motorcycle rider sees a \"Restrictions End\" signboard, how fast can he travel afterwards?",
    "options": [
      "More than 50 km per hour",
      "The maximum speed of the vehicle",
      "Not exceeding 50 km per hour",
      "Depends on the speed limit of the specified road"
    ],
    "sign": "/signs/sign_101.png",
    "answerIndex": 3
  },
  {
    "id": 102,
    "q": "If a pedestrian steps onto the zebra line in front of you to cross the road……..?",
    "options": [
      "Stop before the stop line and treat it as a stop signal",
      "You must stop the vehicle at the zebra line and let them cross",
      "If you are in an emergency, honk and increase the speed of the vehicle",
      "If it is a red signal, stop the vehicle for crossing, otherwise it is not necessary"
    ],
    "sign": "/signs/sign_102.png",
    "answerIndex": 0
  },
  {
    "id": 103,
    "q": "When can a free turn be taken at a junction, if permitted by law?",
    "options": [
      "When traveling straight",
      "When turning left",
      "When turning right",
      "All of the above"
    ],
    "sign": "/signs/sign_103.png",
    "answerIndex": 1
  },
  {
    "id": 104,
    "q": "What does the intermittent white line in the middle of the road, as shown in the picture, mean?",
    "options": [
      "There is no restriction on crossing the lines",
      "You can cross the line when it is safe to do so; you must return to your lane after overtaking",
      "You can enter or leave the road",
      "All of the above"
    ],
    "sign": "/signs/sign_104.png",
    "answerIndex": 3
  },
  {
    "id": 105,
    "q": "What does the continuous white line in the middle of the road, as shown in the picture, mean?",
    "options": [
      "There are no restrictions on crossing the lines",
      "You cannot cross the lines under any circumstances",
      "In emergencies, you can cross the lines and drive fast",
      "You can cross the line when it is safe, and must return to your lane after overtaking"
    ],
    "sign": "/signs/sign_105.png",
    "answerIndex": 1
  },
  {
    "id": 106,
    "q": "What do the two continuous white lines in the middle of the road, as shown in the picture, mean?",
    "options": [
      "You cannot cross the lines under any circumstances",
      "They act as a median between the two lanes",
      "These lines are double dividing lines",
      "All of the above"
    ],
    "sign": "/signs/sign_106.png",
    "answerIndex": 3
  },
  {
    "id": 107,
    "q": "What does the continuous yellow line in the middle of the road, as shown in the picture, mean?",
    "options": [
      "No restriction on crossing the line",
      "Stop line",
      "You cannot cross the line under any circumstances",
      "When it is safe, you can cross the line and must return to your lane after overtaking"
    ],
    "sign": "/signs/sign_107.png",
    "answerIndex": 2
  },
  {
    "id": 108,
    "q": "What does \"edge line,\" as shown in the picture, mean?",
    "options": [
      "The edge line marked on the side of the road",
      "Edge lines are continuous white or yellow lines",
      "Helps you see which lane you are in",
      "All of the above"
    ],
    "sign": "/signs/sign_108.png",
    "answerIndex": 3
  },
  {
    "id": 109,
    "q": "What do \"rumble strips,\" as shown in the picture, mean?",
    "options": [
      "Rumble strips are raised surfaces marked across the road",
      "Rumble strips can be placed on edge lines or dividing line",
      "When you drive over rumble strips, they make a rumbling sound and your vehicle vibrates to warn you",
      "All of the above"
    ],
    "sign": "/signs/sign_109.png",
    "answerIndex": 3
  },
  {
    "id": 110,
    "q": "What does the continuous yellow line on the edge of the road, as shown in the picture, mean?",
    "options": [
      "Curb lines indicate stopping restrictions",
      "You can park vehicles there",
      "You can stop vehicles there",
      "All of the above"
    ],
    "sign": "/signs/sign_110.png",
    "answerIndex": 0
  },
  {
    "id": 111,
    "q": "What does the traffic island or median strip marked in the middle of the road, as shown in the picture, mean?",
    "options": [
      "A traffic island is a raised area of the road marked to direct traffic",
      "A median strip is the part that separates vehicles traveling in opposite directions",
      "You should not stop or park on a median strip unless a board says it is a parking area",
      "All of the above"
    ],
    "sign": "/signs/sign_111.png",
    "answerIndex": 3
  },
  {
    "id": 112,
    "q": "What do the white or yellow zigzag lines on the side of the road, as shown in the picture, mean?",
    "options": [
      "Indicates to drivers that stopping or parking in the area with these lines is prohibited for smooth traffic flow",
      "These lines are commonly found near pedestrian crossings and outside important buildings such as schools, police stations, and hospitals",
      "These lines were introduced to prevent accidents and for a safe road culture",
      "All of the above"
    ],
    "sign": "/signs/sign_112.png",
    "answerIndex": 3
  },
  {
    "id": 113,
    "q": "What should you do if the vehicle in front of you stops on a zigzag line?",
    "options": [
      "You should reverse your vehicle",
      "You can overtake if no vehicle is coming from the opposite direction",
      "Wait until the vehicle in front of you moves, as pedestrians may be crossing",
      "You can overtake by honking or giving a signal"
    ],
    "sign": "/signs/sign_113.png",
    "answerIndex": 2
  },
  {
    "id": 114,
    "q": "What does the yellow box junction marked on the road, as shown in the picture, mean?",
    "options": [
      "You can enter a yellow box junction if the exit ahead is clear",
      "Before entering a yellow box junction, ensure that your vehicle has space to cross the junction without stopping in the box",
      "Stopping in a yellow box junction is a punishable offence",
      "All of the above"
    ],
    "sign": "/signs/sign_114.png",
    "answerIndex": 3
  },
  {
    "id": 115,
    "q": "What type of traffic is shown in the picture?",
    "options": [
      "Single lane traffic",
      "Double lane traffic",
      "One-way traffic",
      "Two-way traffic"
    ],
    "sign": "/signs/sign_115.png",
    "answerIndex": 3
  },
  {
    "id": 116,
    "q": "Vehicles next to the continuous yellow line, as shown in the picture….",
    "options": [
      "Cannot cross the intermittent yellow line",
      "Cannot cross the continuous yellow line; overtaking is prohibited",
      "Can cross in case of emergency",
      "Can stop in case of emergency"
    ],
    "sign": "/signs/sign_116.png",
    "answerIndex": 1
  },
  {
    "id": 117,
    "q": "If you want to make a \"U\" turn on this road in the picture, what should you do?",
    "options": [
      "Proceed forward as turning is prohibited",
      "Look in the mirror, signal, and turn",
      "Show a signal for the oncoming vehicle to pass and then turn",
      "If you have an emergency and no vehicle is coming from the opposite direction, you can proceed"
    ],
    "sign": "/signs/sign_117.png",
    "answerIndex": 0
  },
  {
    "id": 118,
    "q": "If you want to change from one lane to another, what should you do?",
    "options": [
      "Check for a safe space through the rearview mirror and change lanes if it is safe",
      "Before you intend to change lanes, check the blind spot and give the correct turn signal",
      "Check twice for a safe space and change lanes gradually with the correct signal",
      "All of the above"
    ],
    "sign": "/signs/sign_118.png",
    "answerIndex": 3
  },
  {
    "id": 119,
    "q": "Which vehicle shown in the picture can cross the road?",
    "options": [
      "Both cars can cross the road with caution",
      "The maroon car on the side of the continuous yellow line can pass with caution",
      "The white car on the side of the broken yellow line can pass with caution",
      "Both cars cannot cross the road due to the yellow line"
    ],
    "sign": "/signs/sign_119.png",
    "answerIndex": 2
  },
  {
    "id": 120,
    "q": "What do the intermittent double white lines across the road mean?",
    "options": [
      "Entering the main road, give priority to vehicles coming from the right",
      "Entering the main road, you can turn left or right",
      "Proceed after stopping",
      "Do not cross the lines"
    ],
    "sign": "/signs/sign_120.png",
    "answerIndex": 0
  },
  {
    "id": 121,
    "q": "What does this directional arrow between the broken lines indicate?",
    "options": [
      "Turn left and move forward",
      "Warns the driver to return to the lane if overtaking",
      "Area where overtaking is permitted",
      "Left road lane"
    ],
    "sign": "/signs/sign_121.png",
    "answerIndex": 1
  },
  {
    "id": 122,
    "q": "What should you do when you reach a junction with limited visibility?",
    "options": [
      "Look both ways and move slowly",
      "Look to the right and move slowly",
      "Move quickly",
      "Move slowly"
    ],
    "sign": "/signs/sign_122.png",
    "answerIndex": 0
  },
  {
    "id": 123,
    "q": "You are driving at night on a well-lit road. You must……..",
    "options": [
      "Use your headlights on high beam",
      "Always use your headlights on low beam",
      "Always use the hazard lights",
      "Always use the fog lamps"
    ],
    "sign": "/signs/sign_123.png",
    "answerIndex": 1
  },
  {
    "id": 124,
    "q": "What should your vehicle's lights be like when traveling on the road behind other vehicles at night?",
    "options": [
      "Hazard warning lights",
      "Low beam headlights",
      "High beam headlights",
      "Use flashlights"
    ],
    "sign": "/signs/sign_124.png",
    "answerIndex": 1
  },
  {
    "id": 125,
    "q": "What should you do when you are about to enter a bridge?",
    "options": [
      "Slow down, do not overtake",
      "Watch out for pedestrians",
      "Turn on headlights",
      "Move the vehicle as fast as possible to cross the bridge quickly"
    ],
    "sign": "/signs/sign_125.png",
    "answerIndex": 0
  },
  {
    "id": 126,
    "q": "Why should you keep to the left on a two-lane road when approaching a right-hand curve?",
    "options": [
      "To improve your view of the road",
      "To avoid skidding",
      "To let vehicles from behind pass",
      "To give space for other vehicles to overtake"
    ],
    "sign": "/signs/sign_126.png",
    "answerIndex": 0
  },
  {
    "id": 127,
    "q": "When driving on a main road, another vehicle reverses onto the road from a side road. What should you do?",
    "options": [
      "Move to the opposite side of the road",
      "Sound your horn and be prepared to stop",
      "Turn on the headlights",
      "Speed up and drive fast"
    ],
    "sign": "/signs/sign_127.png",
    "answerIndex": 1
  },
  {
    "id": 128,
    "q": "When approaching a crossroad, the driver of a long vehicle in front of you signals right and moves to the left. What should you do?",
    "options": [
      "Honk to warn the driver",
      "Wait behind the vehicle",
      "Overtake on the right",
      "You must stop the vehicle"
    ],
    "sign": "/signs/sign_128.png",
    "answerIndex": 1
  },
  {
    "id": 129,
    "q": "What should you consider before making a \"U\" turn?",
    "options": [
      "Use indicator and select neutral gear",
      "Turn on the signal for turning right, look in the rearview mirror and turn slowly",
      "Wait for the signal to turn red",
      "Shift down and turn right"
    ],
    "sign": "/signs/sign_129.png",
    "answerIndex": 1
  },
  {
    "id": 130,
    "q": "If you intend to turn left, where should your vehicle be positioned?",
    "options": [
      "In the middle of the road",
      "At the stop line",
      "On the shoulder line of the road",
      "In the leftmost lane"
    ],
    "sign": "/signs/sign_130.png",
    "answerIndex": 1
  },
  {
    "id": 131,
    "q": "When should you not reverse your vehicle?",
    "options": [
      "On a busy road",
      "On a one-way road",
      "From a side road onto a main road",
      "All of the above"
    ],
    "sign": "/signs/sign_131.png",
    "answerIndex": 3
  },
  {
    "id": 132,
    "q": "What should you do when approaching vehicles stopped in two lanes at a signal from behind?",
    "options": [
      "Pass the entire line of vehicles and stop in front",
      "Stop behind the last vehicle in the appropriate lane",
      "Stop wherever you find space",
      "You should follow other drivers"
    ],
    "sign": "/signs/sign_132.png",
    "answerIndex": 1
  },
  {
    "id": 133,
    "q": "What should you do if you start to feel tired or unable to concentrate while driving?",
    "options": [
      "Stop the vehicle as soon as it is safe and take a rest",
      "Turn on the stereo to help you concentrate",
      "Speed up to reach your destination faster",
      "Make a phone call and try to concentrate"
    ],
    "sign": "/signs/sign_133.png",
    "answerIndex": 0
  },
  {
    "id": 134,
    "q": "What should you do if you feel sick and unable to concentrate while driving a car?",
    "options": [
      "Turn on the stereo to help you concentrate",
      "Continue your journey, keep the windows open",
      "Stop in a safe place, seek medical help if possible",
      "Speed up to reach the destination as soon as possible"
    ],
    "sign": "/signs/sign_134.png",
    "answerIndex": 2
  },
  {
    "id": 135,
    "q": "When stopping on an upward gradient, one should?",
    "options": [
      "Stop the vehicle in clutch",
      "Stop the vehicle on the brake",
      "Put the vehicle in high gear after stopping, then use the parking brake",
      "Hold the vehicle in gear"
    ],
    "sign": "/signs/sign_135.png",
    "answerIndex": 2
  },
  {
    "id": 137,
    "q": "Hazard warning lights should only be used…",
    "options": [
      "to proceed straight at a four-way junction.",
      "to slow down the vehicle behind.",
      "to drive the vehicle faster at a busy junction.",
      "for emergency parking, especially on highways and busy roads."
    ],
    "sign": "/signs/sign_137.png",
    "answerIndex": 3
  },
  {
    "id": 138,
    "q": "What should you do before opening the right-side doors after parking the vehicle?",
    "options": [
      "Make sure no vehicle is passing by",
      "Open the door quickly and get out",
      "You must open your window glass",
      "Do not open the right doors, get out through the left side"
    ],
    "sign": "/signs/sign_138.png",
    "answerIndex": 0
  },
  {
    "id": 139,
    "q": "When loading a vehicle, which of the following is most important?",
    "options": [
      "Load at the back",
      "Distribute the load evenly everywhere",
      "Load in the canter of the vehicle",
      "Load at the front"
    ],
    "sign": "/signs/sign_139.png",
    "answerIndex": 2
  },
  {
    "id": 140,
    "q": "You are driving a tipper vehicle carrying dry sand. Why should you cover this load properly?",
    "options": [
      "To make handling effective",
      "To adjust your rearward view",
      "To prevent sand from blowing into the eyes of other pedestrians",
      "To prevent water from getting in"
    ],
    "sign": "/signs/sign_140.png",
    "answerIndex": 2
  },
  {
    "id": 141,
    "q": "What should be checked first before turning left?",
    "options": [
      "Right-side rearview mirror",
      "Left-side rearview mirror",
      "Look back over your right shoulder",
      "In the interior mirror"
    ],
    "sign": "/signs/sign_141.png",
    "answerIndex": 1
  },
  {
    "id": 142,
    "q": "You are driving a vehicle equipped with a speed governor. What should be noted?",
    "options": [
      "Over speeding",
      "Cornering",
      "Braking",
      "Overtaking another vehicle"
    ],
    "sign": "/signs/sign_142.png",
    "answerIndex": 3
  },
  {
    "id": 143,
    "q": "What is the braking distance a driver of a motor car should maintain when driving behind a long truck?",
    "options": [
      "A safe distance"
    ],
    "sign": "/signs/sign_143.png",
    "answerIndex": 0
  },
  {
    "id": 2,
    "q": "5 meters",
    "options": [
      "About half the length of the truck",
      "The length of the truck"
    ],
    "sign": "/signs/sign_2.png",
    "answerIndex": -1
  },
  {
    "id": 144,
    "q": "Pedestrians should walk on the side of the road",
    "options": [
      "right side",
      "left side",
      "middle",
      "none of the above"
    ],
    "sign": "/signs/sign_144.png",
    "answerIndex": 0
  },
  {
    "id": 145,
    "q": "Mandatory signs that give orders are mostly found in……",
    "options": [
      "Red/blue circles",
      "Red triangles",
      "Blue rectangles",
      "Yellow circles"
    ],
    "sign": "/signs/sign_145.png",
    "answerIndex": 0
  },
  {
    "id": 146,
    "q": "Things to check before a long-distance journey",
    "options": [
      "Fuel, engine oil, brake fluid, coolant level",
      "Tire condition, spare wheel, necessary tools",
      "Condition of brakes, tension of all drive belts",
      "All of the above"
    ],
    "sign": "/signs/sign_146.png",
    "answerIndex": 3
  },
  {
    "id": 147,
    "q": "When is reverse driving allowed?",
    "options": [
      "The minimum distance required to change direction",
      "During night driving",
      "When driving on ghat roads",
      "Only on one-way roads"
    ],
    "sign": "/signs/sign_147.png",
    "answerIndex": 0
  },
  {
    "id": 148,
    "q": "What precautions should be taken during night parking?",
    "options": [
      "Park on the service road, use park light and handbrake",
      "Park off the road, use park light and handbrake",
      "Use a tire jack to prevent rolling",
      "Park the vehicle on the footpath away from traffic"
    ],
    "sign": "/signs/sign_148.png",
    "answerIndex": 1
  },
  {
    "id": 149,
    "q": "You are driving on a four-lane road and the vehicle in front of you is moving slowly in the right lane. If the road ahead is clear, how can you overtake that vehicle?",
    "options": [
      "You should not overtake",
      "Pass the vehicle on the left side",
      "Pass the vehicle on the convenient side",
      "Pass the vehicle on the right side after receiving a signal from the vehicle in front"
    ],
    "sign": "/signs/sign_149.png",
    "answerIndex": 3
  },
  {
    "id": 150,
    "q": "When driving on a wet or slippery road……….",
    "options": [
      "Tire pressure should be reduced",
      "Avoid sudden braking and acceleration",
      "The vehicle should be driven at high speed",
      "Avoid straight driving"
    ],
    "sign": "/signs/sign_150.png",
    "answerIndex": 1
  },
  {
    "id": 151,
    "q": "In which of the following situations should a vehicle not be overtaken?",
    "options": [
      "When the way ahead is not visible",
      "On curves",
      "At junctions",
      "All of the above"
    ],
    "sign": "/signs/sign_151.png",
    "answerIndex": 3
  },
  {
    "id": 152,
    "q": "When riding a motorcycle or autorickshaw, hand signals can be shown using………",
    "options": [
      "Both hands",
      "Right hand only",
      "Left hand only",
      "All of the above"
    ],
    "sign": "/signs/sign_152.png",
    "answerIndex": 1
  },
  {
    "id": 153,
    "q": "When parking a vehicle, you should…….",
    "options": [
      "Park the vehicle on the carriageway and use the park brake",
      "Park the vehicle parallel to the curb",
      "Park the vehicle in such a way that it does not cause obstruction or inconvenience to other road users",
      "Park on the service road using the parking brake"
    ],
    "sign": "/signs/sign_153.png",
    "answerIndex": 2
  },
  {
    "id": 154,
    "q": "Can a vehicle with an expired insurance be driven on a public road?",
    "options": [
      "The vehicle should be driven with care to avoid any accident or loss to a third party",
      "The vehicle should not be driven on a public road",
      "Can drive if the driver has a valid personal life insurance policy",
      "Can drive if all passengers give their consent"
    ],
    "sign": "/signs/sign_154.png",
    "answerIndex": 1
  },
  {
    "id": 155,
    "q": "Before whom does one apply for compensation for a person involved in a vehicle accident?",
    "options": [
      "RTO",
      "Police Station",
      "Driver or owner",
      "Motor Accidents Claims Tribunal"
    ],
    "sign": "/signs/sign_155.png",
    "answerIndex": 3
  },
  {
    "id": 156,
    "q": "How to stop a motorcycle?",
    "options": [
      "Apply the rear brakes, and after slowing down, apply the front brakes",
      "Use front and rear brakes simultaneously",
      "Use only the rear brake",
      "Use only the front brake"
    ],
    "sign": "/signs/sign_156.png",
    "answerIndex": 1
  },
  {
    "id": 157,
    "q": "Driving with worn-out tires is dangerous because…..",
    "options": [
      "The vehicle accelerates faster",
      "It has less road grip",
      "High fuel consumption",
      "High vehicle vibration"
    ],
    "sign": "/signs/sign_157.png",
    "answerIndex": 1
  },
  {
    "id": 158,
    "q": "On ghat roads, when vehicles are coming from opposite directions, the driver going downhill",
    "options": [
      "Drive fast before the opposing vehicle enters",
      "Turn on the headlights",
      "Give priority to vehicles going downhill",
      "Give priority to vehicles going uphill"
    ],
    "sign": "/signs/sign_158.png",
    "answerIndex": 3
  },
  {
    "id": 159,
    "q": "The Anti-lock Braking System prevents the wheels from locking. This prevents the tires from-…….",
    "options": [
      "getting punctured",
      "skidding",
      "wearing out",
      "low tire pressure"
    ],
    "sign": "/signs/sign_159.png",
    "answerIndex": 1
  },
  {
    "id": 160,
    "q": "What is the advantage of the rear mirror being slightly convex?",
    "options": [
      "Provide a wider field of view",
      "Completely cover the blind spot",
      "Determine the speed of the following vehicle",
      "All of the above"
    ],
    "sign": "/signs/sign_160.png",
    "answerIndex": 0
  },
  {
    "id": 161,
    "q": "Fitting multi-tone horns in a motor vehicle is……..",
    "options": [
      "Allowed for emergency purposes only",
      "Permitted only for interstate buses",
      "Allowed for all vehicles",
      "A punishable offence by law as it causes noise pollution"
    ],
    "sign": "/signs/sign_161.png",
    "answerIndex": 3
  },
  {
    "id": 162,
    "q": "What is the common cause of skidding?",
    "options": [
      "Poor condition of tires and road",
      "Driver's fault",
      "Sudden braking",
      "All of the above"
    ],
    "sign": "/signs/sign_162.png",
    "answerIndex": 3
  },
  {
    "id": 163,
    "q": "What is a blind spot?",
    "options": [
      "The area not visible in your rearview mirrors",
      "An area not covered by headlights",
      "An area inside your vehicle not covered by the rearview mirror",
      "An area with a high accident rate"
    ],
    "sign": "/signs/sign_163.png",
    "answerIndex": 0
  },
  {
    "id": 164,
    "q": "How does alcohol affect your driving?",
    "options": [
      "It reduces your attention",
      "It reduces your concentration and attention",
      "It increases your confidence",
      "It reduces your concentration"
    ],
    "sign": "/signs/sign_164.png",
    "answerIndex": 1
  },
  {
    "id": 165,
    "q": "You are driving behind a large vehicle. How can you improve your view?",
    "options": [
      "Overtake as soon as possible",
      "Move to the left",
      "Maintain a greater distance",
      "Increase your speed",
      "\\"
    ],
    "sign": "/signs/sign_165.png",
    "answerIndex": 2
  },
  {
    "id": 166,
    "q": "What is the benefit of power-assisted steering?",
    "options": [
      "Reduce tire wear",
      "Assist in braking",
      "Reduce driving effort",
      "Increase driving effort"
    ],
    "sign": "/signs/sign_166.png",
    "answerIndex": 2
  },
  {
    "id": 167,
    "q": "In which situation does the weight of passengers shift?",
    "options": [
      "Braking",
      "Cornering",
      "Acceleration",
      "All of the above"
    ],
    "sign": "/signs/sign_167.png",
    "answerIndex": 3
  },
  {
    "id": 168,
    "q": "What does laminated safety windscreen glass mean?",
    "options": [
      "Does not shatter",
      "A plastic layer is glued between dual glasses",
      "Not a plain glass",
      "All of the above"
    ],
    "sign": "/signs/sign_168.png",
    "answerIndex": 3
  },
  {
    "id": 169,
    "q": "What should you do if your vehicle is involved in an accident?",
    "options": [
      "Stop at the accident site, provide first aid to the victim if possible, and help get medical assistance",
      "Drive the vehicle to the nearest police station",
      "Inform the insurance authorities as soon as possible",
      "Do not stop the vehicle if there is a crowd"
    ],
    "sign": "/signs/sign_169.png",
    "answerIndex": 0
  },
  {
    "id": 170,
    "q": "Your vehicle hits a parked vehicle. At that time, the owner of that vehicle could not be found. What should you do?",
    "options": [
      "Drive the vehicle away from the accident site and repair the damage as soon as possible",
      "Inform the insurance authorities as soon as possible",
      "Inform the police station within the jurisdiction of the accident site within 24 hours",
      "Inform the locals"
    ],
    "sign": "/signs/sign_170.png",
    "answerIndex": 2
  },
  {
    "id": 171,
    "q": "The wiper fitted on the vehicle's windscreen is for…….",
    "options": [
      "wiping water when washing",
      "cleaning the windshield in any season",
      "as a signal to stop an approaching vehicle",
      "protecting the screen"
    ],
    "sign": "/signs/sign_171.png",
    "answerIndex": 1
  },
  {
    "id": 172,
    "q": "Which safety device fitted in a light motor vehicle protects the driver from injury?",
    "options": [
      "Seat position",
      "Seat belt",
      "Seat tightener",
      "Headrest"
    ],
    "sign": "/signs/sign_172.png",
    "answerIndex": 1
  },
  {
    "id": 173,
    "q": "If a car drives towards you at night with its high beam on, the driver of that car is",
    "options": [
      "driving with bad behaviour as high beams blind others",
      "a safe driver as the high beam illuminates the road",
      "protecting other road users",
      "none of the above."
    ],
    "sign": "/signs/sign_173.png",
    "answerIndex": 0
  },
  {
    "id": 174,
    "q": "How should a vehicle be driven when passing a procession, a group of soldiers, or a work site?",
    "options": [
      "Continue at the usual speed",
      "Stop the vehicle to complete the work",
      "Drive with care and do not exceed a speed of 25 km per hour",
      "Proceed after stopping"
    ],
    "sign": "/signs/sign_174.png",
    "answerIndex": 2
  },
  {
    "id": 175,
    "q": "What is the colour of the registration plate of a motor cab?",
    "options": [
      "Black letters on a white background",
      "White letters on a yellow background",
      "Yellow letters on a black background",
      "Black letters on a yellow background"
    ],
    "sign": "/signs/sign_175.png",
    "answerIndex": 3
  },
  {
    "id": 176,
    "q": "What is the colour of the registration plate of a rent-a-cab?",
    "options": [
      "Black letters on a white background",
      "White letters on a yellow background",
      "Yellow letters on a black background",
      "Black letters on a yellow background"
    ],
    "sign": "/signs/sign_176.png",
    "answerIndex": 2
  },
  {
    "id": 177,
    "q": "What is the colour of the registration plate of an electric non-transport vehicle?",
    "options": [
      "Black letters on a green background",
      "White letters on a green background",
      "Yellow letters on a green background",
      "Green letters on a white background"
    ],
    "sign": "/signs/sign_177.png",
    "answerIndex": 1
  },
  {
    "id": 178,
    "q": "What is the cooler of the registration number plate of an electric transport vehicle?",
    "options": [
      "Black letters on a green background",
      "White letters on a green background",
      "Yellow letters on a green background",
      "Green letters on a white background"
    ],
    "sign": "/signs/sign_178.png",
    "answerIndex": 2
  },
  {
    "id": 179,
    "q": "When pedestrians are waiting to cross the road near a pedestrian crossing, you should?",
    "options": [
      "Honk and move forward",
      "Honk slowly and pass by",
      "Stop the vehicle and wait until the pedestrians cross the road, then proceed",
      "If the pedestrians are on the right, you can pass by keeping to the left, or vice versa"
    ],
    "sign": "/signs/sign_179.png",
    "answerIndex": 2
  },
  {
    "id": 180,
    "q": "When a vehicle approaches an unmanned railway level crossing, before crossing it, the driver….",
    "options": [
      "must stop the vehicle on the left side of the road, get out of the vehicle, go to the railway track, ensure no train or trolley is coming from either side, and then proceed.",
      "Honk and cross the track as fast as possible.",
      "Wait for the train to pass.",
      "Slow down the vehicle, ensure no train or trolley is coming from either side through the crossing, and then proceed."
    ],
    "sign": "/signs/sign_180.png",
    "answerIndex": 0
  },
  {
    "id": 181,
    "q": "How can a transport vehicle be identified?",
    "options": [
      "By looking at the tire size",
      "According to the colour of the vehicle",
      "By looking at the vehicle's number plate",
      "MVD vehicles"
    ],
    "sign": "/signs/sign_181.png",
    "answerIndex": 2
  },
  {
    "id": 182,
    "q": "On a road without a footpath, pedestrians",
    "options": [
      "should walk on the left side of the road.",
      "should walk on the right side of the road.",
      "can walk on either side of the road.",
      "are not allowed to walk on the road."
    ],
    "sign": "/signs/sign_182.png",
    "answerIndex": 1
  },
  {
    "id": 183,
    "q": "To which of the following types of vehicles should right of way be given?",
    "options": [
      "Police vehicles",
      "Ambulance, fire service vehicles",
      "MVD vehicles",
      "Goods vehicles"
    ],
    "sign": "/signs/sign_183.png",
    "answerIndex": 1
  },
  {
    "id": 184,
    "q": "In which of the following situations can a driver of a vehicle overtake?",
    "options": [
      "When descending a hill",
      "If the road is wide enough",
      "When the driver of the vehicle in front shows a signal",
      "If no vehicles are coming from the opposite direction"
    ],
    "sign": "/signs/sign_184.png",
    "answerIndex": 2
  },
  {
    "id": 185,
    "q": "A driver of a motor vehicle should drive",
    "options": [
      "on the right side of the road",
      "on the left side of the road",
      "in the middle of the road",
      "on any side of the road"
    ],
    "sign": "/signs/sign_185.png",
    "answerIndex": 1
  },
  {
    "id": 186,
    "q": "When a vehicle is parked on the roadside at night……",
    "options": [
      "The vehicle must be locked",
      "A person licensed to drive such a vehicle must be in the driving seat",
      "The park light must be on",
      "All of the above"
    ],
    "sign": "/signs/sign_186.png",
    "answerIndex": 2
  },
  {
    "id": 187,
    "q": "When are fog lamps used?",
    "options": [
      "Along with low beam headlamps",
      "When it is foggy",
      "When there is dust, storm, rain, and snow",
      "All of the above"
    ],
    "sign": "/signs/sign_187.png",
    "answerIndex": 3
  },
  {
    "id": 188,
    "q": "Zebra lines are meant for",
    "options": [
      "stopping vehicles",
      "crossing for pedestrians",
      "giving priority to vehicles",
      "slowing down vehicles"
    ],
    "sign": "/signs/sign_188.png",
    "answerIndex": 1
  },
  {
    "id": 189,
    "q": "When an ambulance approaches …….",
    "options": [
      "Allow it to pass if there are no vehicles from the opposite side",
      "No need to give priority",
      "Move the vehicle to the side of the road and allow it to pass freely",
      "You can drive the vehicle faster than the ambulance"
    ],
    "sign": "/signs/sign_189.png",
    "answerIndex": 2
  },
  {
    "id": 190,
    "q": "What does a red traffic light indicate?",
    "options": [
      "The vehicle can proceed with caution",
      "Stop the vehicle",
      "To slow down",
      "All of the above"
    ],
    "sign": "/signs/sign_190.png",
    "answerIndex": 1
  },
  {
    "id": 191,
    "q": "Overtaking is prohibited in the following situations",
    "options": [
      "When it is likely to cause inconvenience or danger to other traffic",
      "When the vehicle in front speeds up",
      "When the driver of the vehicle in front shows a signal",
      "All of the above"
    ],
    "sign": "/signs/sign_191.png",
    "answerIndex": 3
  },
  {
    "id": 192,
    "q": "Overtaking when approaching a curve is",
    "options": [
      "permissible",
      "not permissible",
      "permissible with caution",
      "permissible if no vehicles are coming from the opposite direction"
    ],
    "sign": "/signs/sign_192.png",
    "answerIndex": 1
  },
  {
    "id": 193,
    "q": "Drunk driving…",
    "options": [
      "is allowed in private vehicles.",
      "is allowed at night.",
      "is prohibited in all vehicles.",
      "is allowed in transport vehicles."
    ],
    "sign": "/signs/sign_193.png",
    "answerIndex": 2
  },
  {
    "id": 194,
    "q": "The use of a rearview mirror is for",
    "options": [
      "seeing the blind spot.",
      "monitoring traffic coming from behind.",
      "seeing the rear seat passenger.",
      "none of the above."
    ],
    "sign": "/signs/sign_194.png",
    "answerIndex": 1
  },
  {
    "id": 195,
    "q": "Getting on and off a moving vehicle…",
    "options": [
      "is permissible in a bus.",
      "is permissible in an auto-rickshaw.",
      "is permissible for a pillion rider sitting side-saddle on a motorcycle.",
      "is prohibited in all vehicles."
    ],
    "sign": "/signs/sign_195.png",
    "answerIndex": 3
  },
  {
    "id": 196,
    "q": "Parking is allowed",
    "options": [
      "on turns.",
      "on the footpath.",
      "where parking is not prohibited.",
      "none of the above."
    ],
    "sign": "/signs/sign_196.png",
    "answerIndex": 2
  },
  {
    "id": 197,
    "q": "When refuelling a vehicle…..",
    "options": [
      "do not check the air pressure.",
      "do not smoke.",
      "do not use any lights of the vehicle.",
      "all of the above."
    ],
    "sign": "/signs/sign_197.png",
    "answerIndex": 1
  },
  {
    "id": 198,
    "q": "Pedestrians should not cross the road at sharp bends or near a stopped vehicle. Why?",
    "options": [
      "Inconvenience to other vehicles",
      "Inconvenience to other road users",
      "Drivers of other vehicles coming from a distance do not see the people crossing the road",
      "Inconvenience to stopped vehicles"
    ],
    "sign": "/signs/sign_198.png",
    "answerIndex": 2
  },
  {
    "id": 199,
    "q": "What should you do when turning into a road on the left side of the road you are on?",
    "options": [
      "Show the left turn signal, drive to the centre and turn left",
      "Honk and turn left",
      "If you are on the left side of the road, you can turn left",
      "Show the left turn signal, keep to the left side of the road, and turn left"
    ],
    "sign": "/signs/sign_199.png",
    "answerIndex": 3
  },
  {
    "id": 200,
    "q": "What is the validity of a PUCC certificate?",
    "options": [
      "Six months",
      "One year",
      "Six months for vehicles with pollution standards BS III and below, and one year for those with BS IV and above",
      "One year for vehicles with pollution standards BS III, and six months for those with BS IV and above"
    ],
    "sign": "/signs/sign_200.png",
    "answerIndex": 2
  },
  {
    "id": 201,
    "q": "If you are driving at night with headlights on and a vehicle comes from the opposite direction, what will you do?",
    "options": [
      "Continue on the left side",
      "Dim and brighten the headlights several times",
      "Dim the headlight until the vehicle passes",
      "Always use the bright headlight"
    ],
    "sign": "/signs/sign_201.png",
    "answerIndex": 2
  },
  {
    "id": 202,
    "q": "What is the minimum age to obtain a license for riding a motorcycle without gear?",
    "options": [],
    "sign": "/signs/sign_202.png",
    "answerIndex": -1
  },
  {
    "id": 203,
    "q": "What should you do when you see a \"School\" traffic sign while driving?",
    "options": [
      "Stop the vehicle, honk, and proceed",
      "Slow down and proceed with caution",
      "Honk continuously and proceed",
      "All of the above"
    ],
    "sign": "/signs/sign_203.png",
    "answerIndex": 1
  },
  {
    "id": 204,
    "q": "When turning left, the driver of a two-wheeler should",
    "options": [
      "extend his left hand to the left.",
      "not show a hand signal.",
      "show a signal for left with his right hand.",
      "none of the above."
    ],
    "sign": "/signs/sign_204.png",
    "answerIndex": 2
  },
  {
    "id": 205,
    "q": "What is the signal to be shown when making a “U” turn?",
    "options": [
      "Signal for turning left",
      "Signal for turning right",
      "Signal for slowing down",
      "Slow down while signalling to turn right"
    ],
    "sign": "/signs/sign_205.png",
    "answerIndex": 1
  },
  {
    "id": 206,
    "q": "For how many years is the one-time tax paid for a new car?",
    "options": [
      "Until the registration of the vehicle is canceled",
      "Five years"
    ],
    "sign": "/signs/sign_206.png",
    "answerIndex": -1
  },
  {
    "id": 207,
    "q": "How many people can be carried in the cabin of a goods vehicle?",
    "options": [
      "Five individuals",
      "Enough people to load and unload goods",
      "As many people as recorded in the registration certificate",
      "Individuals are not allowed"
    ],
    "sign": "/signs/sign_207.png",
    "answerIndex": 2
  },
  {
    "id": 208,
    "q": "What should you do when your vehicle is being overtaken?",
    "options": [
      "Stop your vehicle and allow the vehicle to overtake",
      "Do not obstruct the other vehicle from overtaking",
      "Slow down your vehicle and move to the right",
      "Increase the speed of your vehicle"
    ],
    "sign": "/signs/sign_208.png",
    "answerIndex": 1
  },
  {
    "id": 209,
    "q": "Which of the following is a place where parking is prohibited?",
    "options": [
      "Entrance of a hospital",
      "Where parking is prohibited",
      "On the footpath",
      "All of the above"
    ],
    "sign": "/signs/sign_209.png",
    "answerIndex": 3
  },
  {
    "id": 210,
    "q": "What is the use of the hand brake?",
    "options": [
      "To reduce speed",
      "For emergency braking along with the service brake",
      "To park a vehicle",
      "All of the above"
    ],
    "sign": "/signs/sign_210.png",
    "answerIndex": 2
  },
  {
    "id": 211,
    "q": "More than two people travelling on a two-wheeler is……….",
    "options": [
      "permitted in unavoidable circumstances",
      "a violation of the law",
      "permitted when there is less traffic",
      "all of the above"
    ],
    "sign": "/signs/sign_211.png",
    "answerIndex": 1
  },
  {
    "id": 212,
    "q": "The minimum age to obtain a driving license for transport vehicles is….",
    "options": [],
    "sign": "/signs/sign_212.png",
    "answerIndex": -1
  },
  {
    "id": 213,
    "q": "In which of the following situations is overtaking prohibited?",
    "options": [
      "In heavy traffic",
      "When taking a curve",
      "On a narrow bridge",
      "All of the above"
    ],
    "sign": "/signs/sign_213.png",
    "answerIndex": 3
  },
  {
    "id": 214,
    "q": "While you are driving, if a person in charge of an animal requests to stop the vehicle as they are unable to control the animal, what should you do?",
    "options": [
      "The driver must stop the vehicle",
      "The driver should honk and proceed",
      "The driver should slow down",
      "If there is space, the driver can proceed"
    ],
    "sign": "/signs/sign_214.png",
    "answerIndex": 0
  },
  {
    "id": 215,
    "q": "Over speeding…",
    "options": [
      "is an offences that can lead to suspension or cancellation of the driving license",
      "is an offence that leads only to a fine",
      "is not an offence in case of an emergency",
      "is not an offence"
    ],
    "sign": "/signs/sign_215.png",
    "answerIndex": 0
  },
  {
    "id": 216,
    "q": "If a vehicle is involved in an accident…….",
    "options": [
      "it must be reported to the nearest police station immediately",
      "it must be reported to the nearest police station within 12 hours",
      "it must be reported to the nearest police station within 24 hours",
      "it must be reported to the nearest police station within 48 hours"
    ],
    "sign": "/signs/sign_216.png",
    "answerIndex": 2
  },
  {
    "id": 217,
    "q": "Smoking while driving a public service vehicle…..",
    "options": [
      "will result in suspension of the driving license",
      "can only attract a fine",
      "is not an offence",
      "smoking is allowed if passengers permit"
    ],
    "sign": "/signs/sign_217.png",
    "answerIndex": 0
  },
  {
    "id": 218,
    "q": "Overloading a goods vehicle…….",
    "options": [
      "is not legally punishable",
      "only attracts a fine",
      "is legally punishable, including a fine and license suspension",
      "None of the above is the correct answer"
    ],
    "sign": "/signs/sign_218.png",
    "answerIndex": 2
  },
  {
    "id": 219,
    "q": "If a taxi driver refuses to go on a trip because the distance is short…..",
    "options": [
      "it is legally punishable, including a fine and license suspension",
      "only attracts a fine",
      "is legally correct",
      "None of the above is the correct answer"
    ],
    "sign": "/signs/sign_219.png",
    "answerIndex": 0
  },
  {
    "id": 220,
    "q": "Where the road is marked with a continuous yellow line, a vehicle……",
    "options": [
      "must not touch or cross the yellow line",
      "can overtake only on the right side of the yellow line",
      "should cross the line only when overtaking the vehicle in front",
      "None of the above is the correct answer"
    ],
    "sign": "/signs/sign_220.png",
    "answerIndex": 0
  },
  {
    "id": 221,
    "q": "When you are driving on gradient roads, you should….",
    "options": [
      "give priority to vehicles coming downhill",
      "give priority to vehicles going uphill",
      "give priority to overloaded vehicles",
      "give priority to heavy vehicles"
    ],
    "sign": "/signs/sign_221.png",
    "answerIndex": 1
  },
  {
    "id": 222,
    "q": "The driver of a tractor",
    "options": [
      "should not carry any person other than the driver",
      "more than two persons including the driver",
      "more than three persons excluding the driver",
      "None of the above is the correct answer"
    ],
    "sign": "/signs/sign_222.png",
    "answerIndex": 0
  },
  {
    "id": 223,
    "q": "In which situation can you overtake a vehicle from the left?",
    "options": [
      "When the driver of the vehicle in front has indicated their intention to turn right and has moved to the centre of the road",
      "If the vehicle to be overtaken is stationary and it is safe to pass that vehicle from the left",
      "If the vehicle to be overtaken is driving on the right side of a multi-lane road and it is safe to overtake the vehicle in front through the left lane",
      "All of the above"
    ],
    "sign": "/signs/sign_223.png",
    "answerIndex": 3
  },
  {
    "id": 224,
    "q": "In which of the following circumstances can a vehicle be seized by officials?",
    "options": [
      "In a situation where the vehicle does not have a valid registration permit",
      "The vehicle does not have valid insurance coverage",
      "When the vehicle exceeds the speed limit",
      "When the vehicle is carrying excess weight"
    ],
    "sign": "/signs/sign_224.png",
    "answerIndex": 0
  },
  {
    "id": 225,
    "q": "You have a learner's license for a motorcycle, but…..",
    "options": [
      "you can drive when there is less traffic",
      "you should only drive when accompanied by an instructor who holds a driving license to ride a motorcycle",
      "you should not carry any other person on the motorcycle except for the purpose of receiving instructions from an instructor who holds a valid driving license for a motorcycle",
      "None of the above is the correct answer"
    ],
    "sign": "/signs/sign_225.png",
    "answerIndex": 2
  },
  {
    "id": 226,
    "q": "All motor vehicles must be covered by",
    "options": [
      "Life Insurance",
      "Third Party Insurance",
      "Comprehensive Insurance",
      "Full Cover Insurance"
    ],
    "sign": "/signs/sign_226.png",
    "answerIndex": 1
  },
  {
    "id": 227,
    "q": "The number of passengers allowed to be carried in a private vehicle is recorded in the..",
    "options": [
      "Registration Certificate",
      "Tax Token",
      "Permit",
      "Insurance Certificate"
    ],
    "sign": "/signs/sign_227.png",
    "answerIndex": 0
  },
  {
    "id": 228,
    "q": "When is overtaking prohibited?",
    "options": [
      "When the road is marked with a continuous centre line in white or yellow",
      "On a narrow bridge",
      "At junctions, intersections, and pedestrian crossings",
      "All of the above"
    ],
    "sign": "/signs/sign_228.png",
    "answerIndex": 3
  },
  {
    "id": 229,
    "q": "What does a stop line mean?",
    "options": [
      "A line drawn along the edge of the road in white or yellow",
      "A line 5 centimetres wide in white or yellow near a road junction or pedestrian crossing",
      "An intermittent white line in the middle of the road",
      "A line drawn in the middle of the road in yellow"
    ],
    "sign": "/signs/sign_229.png",
    "answerIndex": 1
  },
  {
    "id": 230,
    "q": "Before starting the vehicle's engine",
    "options": [
      "check the coolant level and engine oil level",
      "check the headlight",
      "check the brake",
      "All of the above"
    ],
    "sign": "/signs/sign_230.png",
    "answerIndex": 0
  },
  {
    "id": 231,
    "q": "Which of the following is the only vehicle allowed to be driven at a speed of more than \t\t60 kilometres per hour?",
    "options": [
      "Motorcycle",
      "Motor car",
      "Stage carriage",
      "Tipper lorries"
    ],
    "sign": "/signs/sign_231.png",
    "answerIndex": 1
  },
  {
    "id": 232,
    "q": "What is the maximum permissible distance between towing vehicles?",
    "options": [
      "Seven meters",
      "Three meters"
    ],
    "sign": "/signs/sign_232.png",
    "answerIndex": -1
  },
  {
    "id": 233,
    "q": "What is the maximum permissible weight that can be carried in a goods vehicle?",
    "options": [
      "No limit",
      "As permitted by the Registration Certificate/Permit",
      "As permitted by the Insurance Certificate",
      "No limit"
    ],
    "sign": "/signs/sign_233.png",
    "answerIndex": 1
  },
  {
    "id": 234,
    "q": "According to Section 112 of the Motor Vehicles Act, 1988",
    "options": [
      "Speed limit should not be exceeded",
      "Should not drive after consuming alcohol",
      "Should not use the vehicle on the road without paying tax",
      "The gross weight of the vehicle should not be exceeded"
    ],
    "sign": "/signs/sign_234.png",
    "answerIndex": 0
  },
  {
    "id": 235,
    "q": "According to Section 113 of the Motor Vehicles Act, 1988, a driver should not drive a vehicle….",
    "options": [
      "after consuming alcohol.",
      "exceeding the speed limit.",
      "exceeding the gross vehicle weight.",
      "none of the above."
    ],
    "sign": "/signs/sign_235.png",
    "answerIndex": 2
  },
  {
    "id": 236,
    "q": "What is the height limit of the load of a goods vehicle from the ground level?",
    "options": [],
    "sign": "/signs/sign_236.png",
    "answerIndex": -1
  },
  {
    "id": 3,
    "q": "8 meters",
    "options": [
      "Three meters",
      "No limit",
      "Four meters"
    ],
    "sign": "/signs/sign_3.png",
    "answerIndex": 2
  },
  {
    "id": 237,
    "q": "According to Section 129 of the Motor Vehicles Act, 1988, a person riding a motorcycle must…..",
    "options": [
      "wear a jerkin.",
      "wear a helmet.",
      "wear shoes.",
      "wear gloves."
    ],
    "sign": "/signs/sign_237.png",
    "answerIndex": 1
  },
  {
    "id": 238,
    "q": "Zig-zag driving is…………",
    "options": [
      "dangerous only for two-wheelers.",
      "always dangerous for all vehicles.",
      "a threat to four-wheeled vehicles.",
      "safe when the road is slippery."
    ],
    "sign": "/signs/sign_238.png",
    "answerIndex": 1
  },
  {
    "id": 239,
    "q": "You are on a road with a long downward slope. What should you do to control the speed of your vehicle?",
    "options": [
      "Shift to a low gear",
      "Stop the engine",
      "Select neutral",
      "Apply brakes continuously"
    ],
    "sign": "/signs/sign_239.png",
    "answerIndex": 0
  },
  {
    "id": 240,
    "q": "To supervise a person learning to drive, you must…",
    "options": [
      "be an authorised driving trainer.",
      "hold a driving license.",
      "hold a learner's license.",
      "be an instructor. 990"
    ],
    "sign": "/signs/sign_240.png",
    "answerIndex": 0
  },
  {
    "id": 241,
    "q": "It is essential to wear a helmet when riding a two-wheeler because",
    "options": [
      "it is for your personal safety.",
      "otherwise, you will be caught by the traffic police.",
      "it is necessary for equality on the road.",
      "it is safe for all road users."
    ],
    "sign": "/signs/sign_241.png",
    "answerIndex": 0
  },
  {
    "id": 242,
    "q": "You are overtaking a car at night. What should you be careful about?",
    "options": [
      "You should not dazzle other road users",
      "You should flash your headlamps before overtaking",
      "Your rear fog lights are turned on",
      "Dim your headlight"
    ],
    "sign": "/signs/sign_242.png",
    "answerIndex": 1
  },
  {
    "id": 243,
    "q": "You stop for pedestrians waiting to cross at a zebra crossing. They do not start to cross. What should you do?",
    "options": [
      "Sound your horn",
      "Wait patiently",
      "You start to drive",
      "Ask if they are crossing or not"
    ],
    "sign": "/signs/sign_243.png",
    "answerIndex": 1
  },
  {
    "id": 244,
    "q": "It is essential to dip your lights",
    "options": [
      "near an oncoming vehicle.",
      "when fog lamps are switched on in foggy weather.",
      "when driving immediately behind another vehicle.",
      "All of the above."
    ],
    "sign": "/signs/sign_244.png",
    "answerIndex": 3
  },
  {
    "id": 245,
    "q": "The driver of which vehicle should drive with the headlights on during the day?",
    "options": [
      "Motor car",
      "Construction work vehicles",
      "Hazardous vehicles",
      "Motorcycle"
    ],
    "sign": "/signs/sign_245.png",
    "answerIndex": 3
  },
  {
    "id": 246,
    "q": "While you are driving, a vehicle comes fast behind you flashing its headlights. What should you do?",
    "options": [
      "Speed up to maintain a gap behind you",
      "Touch the brakes to show your brake lights",
      "If it is safe, allow the vehicle to overtake",
      "Stop your vehicle"
    ],
    "sign": "/signs/sign_246.png",
    "answerIndex": 2
  },
  {
    "id": 247,
    "q": "When should you use headlights during the day?",
    "options": [
      "In low visibility areas and on highways",
      "On country roads",
      "Through narrow streets",
      "In an emergency"
    ],
    "sign": "/signs/sign_247.png",
    "answerIndex": 0
  },
  {
    "id": 248,
    "q": "The basic rule of a two-lane road is",
    "options": [
      "stay in the left lane if not overtaking",
      "maintain the lane with the least traffic",
      "always stay in the right lane at high speed",
      "drive in the centre lane"
    ],
    "sign": "/signs/sign_248.png",
    "answerIndex": 0
  },
  {
    "id": 249,
    "q": "Which of the following is a legal requirement for every vehicle?",
    "options": [
      "First aid kit",
      "Spare wheel",
      "Audio system",
      "Seat belt"
    ],
    "sign": "/signs/sign_249.png",
    "answerIndex": 0
  },
  {
    "id": 250,
    "q": "What are the dangerous articles that can be carried in a public service vehicle?",
    "options": [
      "Explosives",
      "Fuel and lubricants for vehicles",
      "Safely packed cartridges for small arms",
      "Gas cylinder"
    ],
    "sign": "/signs/sign_250.png",
    "answerIndex": 1
  }
]


csv_file_path = 'output.csv'   # The name of the CSV file to create

# Define the exact headers you want in your CSV file
headers = [
    'id',
    'q',
    'options',
    'sign',
    'answerIndex',
    'created_at',
    'updated_at'
]

try:
    # Open the CSV file for writing
    # newline='' is important to prevent extra blank rows on Windows
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as f_csv:
        # Create a CSV DictWriter, using the headers we defined
        writer = csv.DictWriter(f_csv, fieldnames=headers)
        
        # Write the header row
        writer.writeheader()
        
        # Loop through each JSON object in your data list
        for item in data:
            # Prepare a dictionary for the CSV row
            csv_row = {}
            
            # --- Handle the 'options' field ---
            # Get the 'options' list from the JSON item.
            options_list = item.get('options', [])
            # Convert the Python list back into a JSON formatted string
            csv_row['options'] = json.dumps(options_list)
            
            # --- Handle all other fields ---
            # Use .get() for all other fields to safely handle missing keys
            for header in headers:
                if header != 'options': # We already handled options
                    # Use .get(header, '') to get the value or an empty string
                    csv_row[header] = item.get(header, '')
            
            # Write the prepared row to the CSV file
            writer.writerow(csv_row)

    print(f"Successfully converted data to '{csv_file_path}'")

except Exception as e:
    print(f"An unexpected error occurred: {e}")