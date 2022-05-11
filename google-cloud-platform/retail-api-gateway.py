import requests
import json as j

def retail_api(request):

    request_json = request.get_json()
    print(request_json)
    print(request.args)

    if request.args.get('type') == 'write':
        print('Writing')
        r_auth = requests.get('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token?scopes=https://www.googleapis.com/auth/cloud-platform', headers={'Metadata-Flavor': 'Google'})
        access_token = r_auth.json()['access_token']
        auth_header = f'Bearer {access_token}'

        r_api_write = requests.post('', # Insert the URL of your Retail API "write" endpoint 
            data=j.dumps(request_json), headers={
            'Authorization': auth_header,
            'Content-Type': 'application/json'
        })
        print(r_api_write.text)
        return(r_api_write.text, 200)
    elif request.args.get('type') == 'get':
        print('Getting')
        r_auth = requests.get('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token?scopes=https://www.googleapis.com/auth/cloud-platform', headers={'Metadata-Flavor': 'Google'})
        access_token = r_auth.json()['access_token']
        auth_header = f'Bearer {access_token}'

        user_event = {'userEvent': request_json['userEvent']}
        print(user_event)

        r_api_get = requests.post('', # Insert the URL of your Retail API "predict" endpoint 
            data=j.dumps(user_event), headers={
            'Authorization': auth_header,
            'Content-Type': 'application/json'
        })

        r_api_get_json = r_api_get.json()
        
        products = r_api_get_json['results']
        productIdList = []

        for product in products:
            productIdList.append(product['id'])
     
        tealium_payload = {
            'tealium_account': 'defuseddata-sandbox',
            'tealium_profile': 'main',
            'tealium_visitor_id': request_json['userEvent']['visitorId'],
            'tealium_trace_id': request_json['traceId'],
            'tealium_event': 'products_recommendation',
            'product_id_list': productIdList
        }

        r_tealium = requests.post('https://collect.tealiumiq.com/event', data=j.dumps(tealium_payload), headers={
            'Content-Type': 'application/json'
        })

        print('Tealium request sent')
        return('', 200)

    return('', 400)