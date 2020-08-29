# Api Infrapedia.com

We're using NodeJS version v10.19.0 

# Information
If we have a problem installing the SQLite we can use sudo npm install --unsafe-perm=true --allow-root

## Versions
## V.2
#### 🏁2.0
| Version  | Changes |
| ------------- | ------------- |
|2.2.20200829|- Email elements moved to new folder and reconfigured the function linked to them  |
|2.1.9.20200829|- Create images to share elements in SocialNetworks, change the name of template folder, fix the problems with slug sort,  |
|2.1.2.20200828|- Subsecable slug sort |
|2.1.1.20200828|- Request slug for terrestrial-network and subsea-cable |
|2.1.20200828|- Create slug for each elements, change the map config insertion in the database, create XML in the sitemap |
|2.0.8.20200817|- Sort resolved in cables, get geom facilities by points, update organization information  |
|2.0.5.20200817|- Permanent delete fixed for administrators, ASC and DESC sort for search information, sorting by RFS for subseaCables and organization add or remove connections  |
|2.0.20200817|- Fixed problem with cables with multiples CLS |

## V.1
```
|1.9.9.2.20200816|- Add RgDate and Udate to the search service response |
|1.9.9.1.20200816|- Problem with the endpoints for permanent delete |
|1.9.9.20200816|- Sorting data on search results and property deleted on the list table |
|1.9.8.1.20200816|- Owners: adding name information in features (CLS, Facilities) |
|1.9.8.20200816|- Owners: adding _id information in features (IXPS, Facilities) |
|1.9.7.20200812|- Owners: adding _id information in features (SubSea Cables, Networks Terrestrial, CLS) |
|1.9.6.20200812|- Get information of config (Custom Map) |
|1.9.5.20200810|- Permanent delete for elements |
|1.9.4.20200810|- Send an email when the user makes an offer |
|1.9.3.20200806|- Resolved issue with the search of cables, create endpoints for get data by API for maps, resolved the data of maps using REDIS |
|1.9.0.20200802|- Problems resolved with MongoDb connection |
|1.8.9.20200731|- Adding new functionalities for organizations (Associations to anothers elements), geoms validation with name in properties |
|1.8.5.20200723|- Adding name to the geom properties functions  |
|1.8.4.20200713|- Market place status update and rename the file of MarketPlace  |
|1.8.3.20200712|- Clean the app.js file, Change the label by name, we're using that in the sidebar, Organization "Trusted by" using order name, added the market place endpoint |
|1.7.8.20200708|- Order partners by name |
|1.7.7.20200708|- Resolved problem with the adms verification for IXPS and Facilities |
|1.7.6.1.20200705|- Resolved problem with the adms verification |
|1.7.6.20200703|- Improved function to detect administrators, Added users who use the cable service, List of deleted items added to the service for adms, upload service improved for kmz |
|1.7.2.20200702|- Market place service  |
|1.7.1.20200701|- Remove the possibility of voting  |
|1.7.0.20200626|- Improvements in creating cables layer  |
|1.6.9.1.20200622|- Changed the name style of CLS in the cables views, and the cls views  |
|1.6.9.20200621|- Changed the name style of CLS  |
|1.6.8.20200621|-Changed the style of RFS and it was fixed the problem with the search in subSea cable function  |
|1.6.8.20200621|-Changed the style of RFS |
|1.6.7.20200621|-Fixed the problem with the RFS date of cable |
|1.6.6.20200620|-Fixed the problem with the redCable when the category is unknown |
|1.6.5.20200620|-Update the search function to optimize the result, removed some console.log, It has updated the cls name in the transfer information |
|1.6.2.20200614|-Added the element and date information to the subject mail validating that every message be received like a unique message|
|1.6.1.20200614|-Validate the category|
|1.6.0.20200612|-Infrapedia awards functionality: vote, consult, see results. -Name duplicate validation: IXP, Cable, CLS, Facility, Networks, Organization. -Messages: Validate functionality to send message for Facilities, IXPS, Organizations, Networks. -sendNotificationEmailUsingSendgrid.js: Added BBC field and reply to.|
|1.5.9.20200609|Functionality for infrapedia awards voting  |
|1.5.8.20200602|Fixed the problem with the cls finder  |
|1.5.7.20200529|Connection to the database, Connection to Redis Sessions, eslintRules  |
```

App network: 

    - Organizations:
        - Add
        - Edit
        - List
        - Delete
        - View (owner)
        - view
        - Search
        - Partners
        - TrustedBy
    - Networks:
        - Add
        - Edit
        - List
        - Delete
        - View (owner)
        - view
        - Search
    - CLS    
        - Add
        - Edit
        - List
        - Delete
        - View (owner)
        - view
        - Search
    - Cables
        - Add
        - Edit
        - List
        - Delete
        - View (owner)
        - view  
        - Search
    - Upload
        - Logos
        - KMZ
    - Convert
        - Kmz to GeoJson (Lines)
        - Kmz to GeoJson (Points)    
    - Alerts
        - Sign up in alerts
        - Disabled alerts
        - Providers:
            - Email
    - Issues
        - Report issue
        - Reports of my elements
        - My reports      
        - View report   
        - Delete report
    - Messages
    - Search
        - By Field (Name or ID)
    -Shortner
       - URL
    - Voting
        - Users can vote   

## Documentation

/api-docs



## Environment Variables

```
_ROUTE=
_PROJ_NAME=
_ENV=
_PORT_DEV=
_PORT_PROD=
_CORSURL=
_BASEURL=
#AUTH0
AUTH0_CLIENT_ID=
AUTH0_DOMAIN=
AUTH0_CLIENT_SECRET=
AUTH0_CALLBACK_URL=
#
_JWT_SECRET= 
##RDS
_RDS_DOMAIN=
_RDS_PORT=
_RDS_PASSW=
#POSGRESQL
_PGSQL_user = 
_PGSQL_host = 
_PGSQL_database = 
_PGSQL_password = 
_PGSQL_port = 
#MongoDb
_DB_DOMAIN=
_DB_PORT= 
_DB_NAME= 
#GCLOUD
_CDN_ROUTE_FILES=
_GG_PROJECT_ID=
_GG_CLOUD_BUCKET = 
_GG_CLOUD_BUCKET_FOLDER_LOGOS = 
_GG_CLOUD_BUCKET_FOLDER_KMZ = 
_GG_CLOUD_BUCKET_FOLDER_EEDITED = 
#NEWRELIC
_NR_LICENSE_KEY =
_NR_APP_NAME = 
#ADMS
ADMS =
EMAILNOTIFICATIONS=
MANDRILLAPIKEY=
MANDRILL_EMAIL=
#SENDGRID
CCEMAIL=
EMAILSENDER=
APIKEYSENDGRID=
newsletterList=
#FRESHDESK
FD_APIKEY=
FD_ENDPOINT=
#Sentry
SENTRY=

```

## Databases
- Redis: 
- MongoDB: We use Mongo Atlas

## License

The MIT License (MIT)

Copyright (c) 2019 Infrapedia Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
