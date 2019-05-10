/**
 * Created by ChengZheLin on 2019/5/10.
 * Features:
 */

'use strict'
const COS = require('cos-nodejs-sdk-v5')
const BaseAdapter = require('ghost-storage-base')

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

  exists (fileName) {
    let key = this.baseUrl
      ? fileName.replace(this.baseUrl, '')
      : fileName.replace(/.*\.com\//, '')

    return new Promise((resolve, reject) => {
      this.cos.headObject({
        ...this.baseParams,
        key
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
            : data.Location

          resolve(url)
        }
      })
    })
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
    options.path = (options.path || '').replace(/\/$|\\$/, '')

    return new Promise((resolve, reject) => {
      this.cos.getObject({
        ...this.bsseParams,
        key: options.path
      }, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data.body)
        }
      })
    })
  }
}

module.exports = QCloudCustomAdapter
