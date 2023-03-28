/**
 * Created by ChengZheLin on 2019/5/10.
 * Features:
 */

'use strict'
const COS = require('cos-nodejs-sdk-v5')
const BaseAdapter = require('ghost-storage-base')
const URL = require('url')
// const RE = /(.*)(?=\/ghost\/content)/

class QCloudCustomAdapter extends BaseAdapter {
  constructor (config) {
    super()

    let cfg = config || {};

    if (!config || !config?.baseUrl) {
      const env = process.env;
      cfg = {
        "baseUrl": env.GHOST_STORAGE_ADAPTER_COS_BASEURL,
        "basePath": env.GHOST_STORAGE_ADAPTER_COS_BASEPATH,
        "rename": env.GHOST_STORAGE_ADAPTER_COS_RENAME === 'true',
        "SecretId": env.GHOST_STORAGE_ADAPTER_COS_SECRETID,
        "SecretKey": env.GHOST_STORAGE_ADAPTER_COS_SECRETKEY,
        "Bucket": env.GHOST_STORAGE_ADAPTER_COS_BUCKET,
        "Region": env.GHOST_STORAGE_ADAPTER_COS_REGION
      }
    }
  
    this.baseParams = {
      Bucket: cfg.Bucket,
      Region: cfg.Region
    }

    this.baseUrl = cfg.baseUrl
    this.basePath = cfg.basePath || '/ghost/content/images/'
    this.rename = cfg.rename || false

    this.cos = new COS({
      SecretId: cfg.SecretId,
      SecretKey: cfg.SecretKey
    })
  }

  exists (fileName, targetDir) {
    const fileUrl = path.join(targetDir || this.storagePath, fileName)

    const url = new URL(fileUrl);
    const Key = url.pathname

    return new Promise((resolve, reject) => {
      this.cos.headObject({
        ...this.baseParams,
        Key
      }, (err, data) => {
        if (err) {
          err.statusCode
            ? resolve(false)
            : reject(err)
        } else {
          data.statusCode === 200
            ? resolve(true)
            : resolve(false)
        }
      })
    })
  }

  save (file) {
    return new Promise((resolve, reject) => {
      this.cos.sliceUploadFile({
        ...this.baseParams,
        Key: this.generatePushKey(file),
        FilePath: file.path
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          let url = this.baseUrl
            ? data.Location.replace(/.*\.com\//, this.baseUrl)
            : '//' + data.Location

          resolve(url)
        }
      })
    })
  }

  generatePushKey (file) {
    const date = new Date()
    let YY = date.getFullYear()
    let MM = date.getMonth() + 1
    if (MM <= 9) { MM = '0' + MM }

    if (this.rename) {
      return `${this.basePath}${YY}/${MM}/${file.filename.replace(/\s+/img, '').substring(0, 16)}${file.ext}`
    } else {
      return `${this.basePath}${YY}/${MM}/${file.name}`
    }
  }

  serve () {
    return function customServe (req, res, next) {
      next()
    }
  }

  delete () {
    return Promise.reject('not implemented')
    /*return new Promise((resolve, reject) => {
      this.cos.deleteObject({
        ...this.bsseParams,
        key
      }, function (err, data) {
        if (err) {
          reject(err)
        } else {
          (data.statusCode < 300 && data.statusCode >= 200)
            ? resolve(true)
            : resolve(false)
        }
      })
    })*/
  }

  read (options) {
    // const Key = options.path.replace(this.baseUrl, '')
    const Key = new URL(options.path).pathname

    return new Promise((resolve, reject) => {
      this.cos.getObject({
        ...this.baseParams,
        Key
      }, (err, data) => {
        if (err || data.error) {
          return reject(new Error(`
          Could not read image \n ${Key}
          error: ${JSON.stringify(err)}
          response: ${JSON.stringify(data)}
          `))
        }
        resolve(data.Body)
      })
    })

  }
}

module.exports = QCloudCustomAdapter;
export default QCloudCustomAdapter
