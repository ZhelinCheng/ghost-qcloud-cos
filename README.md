# Ghost Tencent Cloud COS Storage
This Ghost custom storage module allows you to store media file with Tencent Cloud COS instead of storing at local machine.

## Installation

### Via NPM

- Install COS storage module

  ```
  npm install ghost-qcloud-cos
  ```
  
- Make the storage folder if it doesn't exist yet

  ```
  mkdir -p content/adapters/storage
  ```
  
 - Create a script named "cos-store.js", content as follow:
 
 ```javascript
//  content/adapters/storage/cos-store.js
module.exports = require('ghost-qcloud-cos');
 ```

### Via Git
In order to replace the storage module, the basic requirements are:

- Create a new folder named `storage` inside `content/adapters`
- Clone this repo to `/storage`
```
mkdir -p [ghost/ptah]/content/adapters/storage
cd [ghost/ptah]/content/adapters/storage

git clone https://github.com/ZhelinCheng/ghost-qcloud-cos.git
```
- Install dependencies
```
cd ghost-qcloud-cos
npm i
```

## Configuration

In your `config.[env].json` file, you'll need to add a new storage block to whichever environment you want to change:

### NPM
```json
{
  "storage": {
    "active": "cos-store",
    "cos-store": {
      "baseUrl": "Base Url(Allowed to be empty)",
      "basePath": "图片存放路径，不填写默认为/ghost/content/images/",
      "rename": "是否重命名为MD5文件名，布尔值，默认为false",
      "SecretId": "Secret Id",
      "SecretKey": "Secret Key",
      "Bucket": "xxxx-123456",
      "Region": "ap-chengdu"
    }
  }
}
```

### GIT
```json
{
  "storage": {
    "active": "ghost-qcloud-cos",
    "ghost-qcloud-cos": {
      "baseUrl": "Base Url(Allowed to be empty)",
      "basePath": "图片存放路径，不填写默认为/ghost/content/images/",
      "rename": "是否重命名为MD5文件名，布尔值，默认为false",
      "SecretId": "Secret Id",
      "SecretKey": "Secret Key",
      "Bucket": "xxxx-123456",
      "Region": "ap-chengdu"
    }
  }
}
```
