/**
 * Created by ChengZheLin on 2019/5/10.
 * Features:
 */

'use strict'
const COS = require('cos-nodejs-sdk-v5')
const BaseAdapter = require('ghost-storage-base')
const RE = /(.*)(?=\/ghost\/content)/


class QCloudCustomAdapter extends BaseAdapter {
  constructor (config) {
    super()
    this.baseParams = {
      Bucket: config.Bucket,
      Region: config.Region
    }
    this.baseUrl = config.baseUrl
    this.cos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey
    })
  }

  exists (fileName, targetDir) {
    const filePath = path.join(targetDir || this.storagePath, fileName)
    const Key = filePath.replace(RE, '')

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

    return `/ghost/content/images/${YY}/${MM}/${file.name.replace(/[^\x00-\xff]/g, '')}`
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
    const Key = options.path.replace(RE, '')

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

module.exports = QCloudCustomAdapter
