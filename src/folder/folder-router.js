const express = require('express')
const xss = require('xss')
const path = require('path')
const FolderService = require('./folder-service')

const jsonParser = express.json()
const folderRouter = express.Router()

const serializeFolder = folder => ({
    folder_title: xss(folder.folder_title),
    id: folder.id
})

folderRouter
    .route('/')
    .get((req, res, next) => {
      FolderService.getAllFolders(
          req.app.get('db')
      )
      .then(folders => {
          res
            .status(200)
            .json(folders.map(folder => serializeFolder(folder)))
      })
      .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
      const { folder_title } = req.body
      if (!folder_title){
          res
           .status(400)
           .json({
               error: { message: `'folder_title' is required` }
           })
      }
      const newFolder = serializeFolder({
          folder_title
      })
      FolderService.insertFolder(
          req.app.get('db'),
          newFolder
      )
      .then(folder => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl + `/${folder.id}`))
            .json(serializeFolder(folder))
      })
      .catch(next)
    })

folderRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        FolderService.getFolderById(
            req.app.get('db'),
            req.params.folder_id
        )
        .then(folder => {
            if (!folder){
                return res
                    .status(404)
                    .json({
                        error: { message: 'Folder does not exist' }
                    })
                }
            res.folder = folder
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
          res.status(200).json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
      FolderService.deleteFolder(
          req.app.get('db'),
          req.params.folder_id
      )
      .then(() => {
          res.status(204).end()
      })
      .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
      const { folder_title } = req.body
      if (!folder_title){
          return res
            .status(400)
            .json({
                error: { message: `Request body must contain 'folder_title'` }
            })
      }
      const updatedFolder = {
          folder_title
      }
      FolderService.updateFolder(
          req.app.get('db'),
          req.params.folder_id,
          updatedFolder
      )
      .then(numRowsAffected => {
          res.status(204).end()
      })
      .catch(next)
    })





module.exports = folderRouter