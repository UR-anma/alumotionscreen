import logging
from xmlrpc.server import SimpleXMLRPCServer
import json

logger = logging.getLogger(__name__)
logging.basicConfig(format="%(asctime)s %(message)s", filename='logs/opscreenWorker.log', level=logging.DEBUG)
logger.info("XMLRPC script started")

encoder = json.JSONEncoder()
decoder = json.JSONDecoder()

def set_data(data):
    
    logger.info("Data received: " + data)
    try:
        newData = decoder.decode(data)
        formats = newData["formats"]
        drawers = newData["drawers"]
        points = newData["points"]

        with open("data/data.json", "w") as f:
            json.dump({"formats":formats, "drawers":drawers, "points":points}, f)
            logger.info("Data saved correctly")

    except Exception as e:
        logger.error(e)
        logger.info("New data was not saved")
    
def get_data():
    
    data = load_data()
    formats = data["formats"]
    drawers = data["drawers"]
    points = data["points"]

    logger.info("Data requested from front-end")
    logger.info("Data: " + encoder.encode({"formats":formats, "drawers":drawers, "points":points}))
    return encoder.encode({"formats":formats, "drawers":drawers, "points":points})

def load_data():
    try:
        with open("data/data.json", "r") as f:
            dataFromFile = json.load(f)
            formats = dataFromFile["formats"]
            drawers = dataFromFile["drawers"]
            points = dataFromFile["points"]
        logger.info("Data file loaded correctly")
    except Exception as e:
        try:
            with open("data/data.json", "w") as f:
        
                formats = [ {
                    "name": "Nuovo formato",
                    "dx": 50,
                    "dy": 50,
                    "nx": 5,
                    "ny": 5,
                    "mass": 10
                } ]
                drawers = [
                {
                    "number": 1,
                    "abilitato": False
                },
                {
                    "number": 2,
                    "abilitato": False
                },
                {
                    "number": 3,
                    "abilitato": False
                },
                {
                    "number": 4,
                    "abilitato": False
                },
                {
                    "number": 5,
                    "abilitato": False
                },
                {
                    "number": 6,
                    "abilitato": False
                }]
                points = [{}, {}, {}]

                json.dump({"formats":formats, "drawers":drawers, "points":points}, f)
                logger.info("Data file was missing - created correctly")

        except Exception as e:
            logger.info("Data file was missing and could not be created")
            return {}
        
    return {"formats":formats, "drawers":drawers, "points":points}

def get_n_formats():
    logger.info("Data requested from robot - n formats")
    data = load_data()
    return len(data["formats"])

def get_format(n):
    logger.info("Data requested from robot - formats")
    data = load_data()
    return data["formats"][n]

def get_drawer(n):
    logger.info("Data requested from robot - drawers")
    data=load_data()
    return data["drawers"][n]

def get_point(n):
    logger.info("Data requested from robot - points")
    data=load_data()
    p = data["points"][n]
    wp = { "pose":{"x": p["pose"]["position"][0], "y": p["pose"]["position"][1], "z": p["pose"]["position"][2], 
                  "rx": p["pose"]["orientation"][0], "ry": p["pose"]["orientation"][1], 
                  "rz": p["pose"]["orientation"][2]}, "frame":p["frame"]}
    logger.info("waypoint converted: " + str(wp))
    return wp

server = SimpleXMLRPCServer(("", 55510), allow_none=True)
server.RequestHandlerClass.protocol_version = "HTTP/1.1"

server.register_function(get_point, "get_point")
server.register_function(get_format, "get_format")
server.register_function(get_drawer, "get_drawer")
server.register_function(get_n_formats, "get_n_formats")
server.register_function(get_data, "get_data")
server.register_function(set_data, "set_data")
logger.info("XMLRPC server started")
server.serve_forever()