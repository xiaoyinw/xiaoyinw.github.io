from unicodedata import category
from flask import Flask, current_app, request
import ipinfo
import requests


app = Flask(__name__)

@app.route('/')
def index():
    return current_app.send_static_file('business.html')

@app.route('/search', methods=['GET'])
def search():
    geocoding_key = 'AIzaSyC6BmjYYz-rvAScUhwAkiVwAKmxmTpi_Ag'
    args = request.args
    if not args['location']:
        locs = autolocate()
    else:
        locs = args['location'].replace(",", "+").replace(" ", "+")
    geocoding_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + locs + "&key=" +geocoding_key
    r = requests.get(geocoding_url)
    results = r.json()['results'][0]
    lat = results['geometry']['location']['lat']
    lng = results['geometry']['location']['lng']

    yelp_key = "99hBJliiV_Q46JNRIZ4TvnKB6YtGEcnC2Esed0M7jFaQiY4Y8mTS6Kg8mP_Y5e3YwuprV5m0VjXBNziYPK7pyqqvDCU8yg4KTBH9LQdup8Lgh7shPzIoBvUJL4RCY3Yx"
    headers = {'Authorization': 'Bearer %s' % yelp_key}
    yelp_url ='https://api.yelp.com/v3/businesses/search'
    
    meters = int(args['distance']) * 1609.344 if args['distance'] else 10 * 1609.344
    params = {'term': args['keyword'],'latitude': float(lat), 'longitude': float(lng), 'radius': int(meters), 'categories': args['category'] if args['category'] != "Default" else "all", 'limit': 20}
    req=requests.get(yelp_url, params=params, headers=headers)
    return {'businesses': req.json()['businesses']}

@app.route('/searchdetail', methods=["GET"])
def searchdetail():
    args = request.args
    yelp_key = "99hBJliiV_Q46JNRIZ4TvnKB6YtGEcnC2Esed0M7jFaQiY4Y8mTS6Kg8mP_Y5e3YwuprV5m0VjXBNziYPK7pyqqvDCU8yg4KTBH9LQdup8Lgh7shPzIoBvUJL4RCY3Yx"
    headers = {'Authorization': 'Bearer %s' % yelp_key}
    yelp_url = 'https://api.yelp.com/v3/businesses/' + str(args['id'])
    req = requests.get(yelp_url, headers=headers)
    return {'detail': req.json()}

@app.route('/autolocate', methods=["GET"])
def autolocate():
    access_token = 'a95a6e5c58ea06'
    handler = ipinfo.getHandler(access_token)
    details = handler.getDetails().all
    locationInfo = [details['city'], details['region'], details['country'], details['postal']]
    return ",".join(locationInfo)


if __name__ == '__main__':
    app.run(host= '127.0.0.1', port= 8080, debug= True)