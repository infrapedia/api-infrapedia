# Api-Infrapedia

## 🚩v.1.0.0

- Connection to the database 
- Connection to Redis Sessions
- eslintRules

App network: 

    - Organizations:
        - Add
        - Edit
        - List
        - Delete
        - View (owner)
        - view
        - Search
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
    - Issues
        - Report issue
        - Reports of my elements
        - My reports      
        - View report   
        - Delete report
    - Messages
    - Search
        - By Field (Name or ID)
        

## Documentation

/api-docs



## Environment Variables

```
_PROJ_NAME = 
_ENV = dev
_PORT_DEV = 
_PORT_PROD = 
_CORSURL=

#AUTH0
AUTH0_CLIENT_ID=
AUTH0_DOMAIN=
AUTH0_CLIENT_SECRET=
AUTH0_CALLBACK_URL=

#
_JWT_SECRET = 

#RDS
_RDS_DOMAIN = 127.0.0.1
_RDS_PORT = 6379
_RDS_PASSW = ''

#Mongo Db
_DB_DOMAIN= 
_DB_PORT = 
_DB_NAME = 

#GCLOUD
_CDN_ROUTE_FILES=
_GG_PROJECT_ID=
_GG_CLOUD_BUCKET=
_GG_CLOUD_BUCKET_FOLDER_LOGOS=
_GG_CLOUD_BUCKET_FOLDER_KMZ=

```

## Databases
- Redis: 
- MongoDB: 


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
